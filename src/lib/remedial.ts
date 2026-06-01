import "server-only";
import { prisma } from "./db";
import { parseJson } from "./json";

export type RemedialItem =
  | { type: "module"; moduleId: string; title: string; reason: string }
  | { type: "flashcard_session"; skillTag: string; reason: string }
  | { type: "quiz_retry"; moduleId: string; title: string; reason: string };

export type RemedialPlanData = {
  items: RemedialItem[];
  generatedAt: string;
  source: "journal" | "quiz" | "combined";
};

/**
 * Generate a personalized remedial plan for a user.
 * Uses: ErrorLog (last 14 days) + recent failed QuizAttempts + SkillProgress
 */
export async function generateRemedialPlan(userId: string): Promise<RemedialPlanData> {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [errorLogs, failedQuizzes, skillProgress] = await Promise.all([
    prisma.errorLog.findMany({
      where: { userId, createdAt: { gte: twoWeeksAgo } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, passed: false },
      include: { quiz: { include: { module: { include: { skill: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.skillProgress.findMany({
      where: { userId, unlocked: true, percentComplete: { lt: 100 } },
      include: { skill: { include: { modules: { orderBy: { orderIndex: "asc" } } } } },
      orderBy: { percentComplete: "asc" },
      take: 5,
    }),
  ]);

  const items: RemedialItem[] = [];

  // --- From error logs: find top skill tags ---
  const tagCount = new Map<string, number>();
  for (const e of errorLogs) {
    const detail = parseJson<{ skillTag?: string; issue?: string }>(e.detail, {});
    const tag = detail.skillTag || e.category;
    tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
  }
  const topTags = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  for (const [tag, count] of topTags) {
    items.push({
      type: "flashcard_session",
      skillTag: tag,
      reason: `You made ${count} mistake${count > 1 ? "s" : ""} related to "${tag}" recently.`,
    });
  }

  // --- From failed quizzes: suggest module retries ---
  const seenModules = new Set<string>();
  for (const attempt of failedQuizzes) {
    const moduleId = attempt.quiz.moduleId;
    if (seenModules.has(moduleId)) continue;
    seenModules.add(moduleId);
    items.push({
      type: "quiz_retry",
      moduleId,
      title: attempt.quiz.module.title,
      reason: `You scored ${attempt.score}% (needed ${attempt.quiz.passThreshold}%) on "${attempt.quiz.module.title}".`,
    });
  }

  // --- From incomplete skills: suggest weakest modules ---
  for (const sp of skillProgress) {
    const incompleteMod = sp.skill.modules.find((m) => true); // first module
    if (incompleteMod && !seenModules.has(incompleteMod.id)) {
      seenModules.add(incompleteMod.id);
      items.push({
        type: "module",
        moduleId: incompleteMod.id,
        title: incompleteMod.title,
        reason: `"${sp.skill.title}" is only ${sp.percentComplete}% complete.`,
      });
    }
  }

  const source: RemedialPlanData["source"] =
    errorLogs.length > 0 && failedQuizzes.length > 0
      ? "combined"
      : errorLogs.length > 0
      ? "journal"
      : "quiz";

  return { items: items.slice(0, 8), generatedAt: new Date().toISOString(), source };
}

/** Save or refresh the active remedial plan for a user. */
export async function refreshRemedialPlan(userId: string): Promise<void> {
  const plan = await generateRemedialPlan(userId);

  // Mark old plans inactive
  await prisma.remedialPlan.updateMany({
    where: { userId, status: "active" },
    data: { status: "completed" },
  });

  await prisma.remedialPlan.create({
    data: {
      userId,
      source: plan.source,
      items: JSON.stringify(plan.items),
      status: "active",
    },
  });
}
