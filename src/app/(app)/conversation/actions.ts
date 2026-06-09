"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, stringifyJson } from "@/lib/json";
import { aiService, getScenarioOpener, type ConversationScenario, type Evaluation, type ChatTurn } from "@/lib/ai";
import { awardXp, awardMastery, checkAchievements, advanceMission } from "@/lib/gamification";

export async function startConversation(scenario: ConversationScenario) {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: session.userId } });
  const languageId = profile.currentLanguageId ?? "";

  // Resolve the language code to drive the language-specific opener.
  const language = languageId
    ? await prisma.language.findUnique({ where: { id: languageId }, select: { code: true } })
    : null;
  const langCode = language?.code ?? "en";
  const intro = getScenarioOpener(scenario, langCode);

  const created = await prisma.conversationSession.create({
    data: {
      userId: session.userId,
      scenario,
      languageId,
      status: "active",
      messages: { create: { role: "ai", content: intro } },
    },
  });

  redirect(`/conversation/${created.id}`);
}

export type SendResult = {
  ok: boolean;
  reply: string;
  evaluation: Evaluation | null;
};

export async function sendMessage(sessionId: string, content: string, showFurigana = false): Promise<SendResult> {
  const session = await getSession();
  if (!session) return { ok: false, reply: "", evaluation: null };

  const convo = await prisma.conversationSession.findFirst({
    where: { id: sessionId, userId: session.userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!convo || convo.status !== "active") return { ok: false, reply: "", evaluation: null };

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: session.userId } });
  const history: ChatTurn[] = convo.messages.map((m) => ({
    role: m.role as "user" | "ai",
    content: m.content,
  }));

  // Resolve language code for correct language-specific responses.
  const language = convo.languageId
    ? await prisma.language.findUnique({ where: { id: convo.languageId }, select: { code: true } })
    : null;
  const langCode = language?.code ?? "en";

  const result = await aiService.chat({
    scenario: convo.scenario as ConversationScenario,
    languageCode: langCode,
    level: profile.level ?? "beginner",
    history,
    userMessage: content,
    showFurigana,
  });

  // Persist user message (with evaluation) and AI reply.
  await prisma.conversationMessage.create({
    data: { sessionId, role: "user", content, evaluation: stringifyJson(result.evaluation) },
  });
  await prisma.conversationMessage.create({
    data: { sessionId, role: "ai", content: result.reply },
  });

  // Log conversation errors to the Error Journal (PRD §17).
  const issues = [
    ...result.evaluation.grammar.map((g) => ({ category: "grammar", g })),
    ...result.evaluation.vocabulary.map((v) => ({ category: "vocabulary", g: v })),
  ];
  for (const it of issues) {
    await prisma.errorLog.create({
      data: {
        userId: session.userId,
        category: it.category,
        detail: stringifyJson(it.g),
        sourceRef: `conversation:${sessionId}`,
        languageId: convo.languageId || null,
      },
    });
  }

  // Advance "conversation_turn" daily mission
  await advanceMission(session.userId, "conversation_turn", 1);

  revalidatePath(`/conversation/${sessionId}`);
  return { ok: true, reply: result.reply, evaluation: result.evaluation };
}

export type EndResult = {
  ok: boolean;
  xpAwarded: number;
  messageCount: number;
  issuesFound: number;
  leveledUp: boolean;
  newLevel?: number;
  newAchievements: string[];
};

export async function endConversation(sessionId: string): Promise<EndResult> {
  const session = await getSession();
  if (!session) return { ok: false, xpAwarded: 0, messageCount: 0, issuesFound: 0, leveledUp: false, newAchievements: [] };

  const convo = await prisma.conversationSession.findFirst({
    where: { id: sessionId, userId: session.userId },
    include: { messages: true },
  });
  if (!convo || convo.status === "ended") {
    return { ok: false, xpAwarded: 0, messageCount: 0, issuesFound: 0, leveledUp: false, newAchievements: [] };
  }

  const userMessages = convo.messages.filter((m) => m.role === "user");
  let issues = 0;
  for (const m of userMessages) {
    const ev = parseJson<Evaluation | null>(m.evaluation, null);
    if (ev) issues += ev.grammar.length + ev.vocabulary.length;
  }

  await prisma.conversationSession.update({
    where: { id: sessionId },
    data: {
      status: "ended",
      summary: stringifyJson({ messageCount: userMessages.length, issuesFound: issues }),
    },
  });

  const award = await awardXp(session.userId, 30, "conversation", convo.languageId || null);
  await checkAchievements(session.userId);

  // 20 mastery points per completed conversation
  if (convo.languageId) {
    await awardMastery(session.userId, convo.languageId, 20);
  }

  revalidatePath("/dashboard");
  return { 
    ok: true, 
    xpAwarded: award.amount, 
    messageCount: userMessages.length, 
    issuesFound: issues,
    leveledUp: award.leveledUp,
    newLevel: award.level,
    newAchievements: award.achievements
  };
}
