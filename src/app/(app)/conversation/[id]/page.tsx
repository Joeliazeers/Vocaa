import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { SCENARIOS, type Evaluation } from "@/lib/ai";
import { ChatRoom, type ChatMessage } from "./ChatRoom";

export const dynamic = "force-dynamic";

export default async function ConversationSessionPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prefs = (() => { try { return JSON.parse(user.profile?.preferences ?? "{}"); } catch { return {}; } })();
  const showFurigana = prefs.showFurigana !== false;

  const convo = await prisma.conversationSession.findFirst({
    where: { id: params.id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!convo) notFound();

  const scenario = SCENARIOS.find((s) => s.id === convo.scenario);
  const messages: ChatMessage[] = convo.messages.map((m) => ({
    role: m.role as "user" | "ai",
    content: m.content,
    evaluation: m.evaluation ? parseJson<Evaluation | null>(m.evaluation, null) : null,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">{scenario?.emoji}</span>
        <h1 className="text-xl font-extrabold">{scenario?.title ?? convo.scenario}</h1>
        <span className={`chip ml-auto ${convo.status === "ended" ? "bg-ink-100 text-ink-500" : "bg-green-100 text-green-700"}`}>
          {convo.status}
        </span>
      </div>

      <ChatRoom
        sessionId={convo.id}
        initialMessages={messages}
        ended={convo.status === "ended"}
        showFurigana={showFurigana}
      />
    </div>
  );
}
