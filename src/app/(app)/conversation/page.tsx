import { GraduationCap, ShoppingBag, Utensils, Hotel, Plane, Briefcase, Lightbulb } from "lucide-react";
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SCENARIOS } from "@/lib/ai";
import { ScenarioButton } from "./ScenarioButton";

export const dynamic = "force-dynamic";

const IconMap: Record<string, any> = { GraduationCap, ShoppingBag, Utensils, Hotel, Plane, Briefcase };

export default async function ConversationHome() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");

  const languageId = user.profile.currentLanguageId ?? undefined;

  // Count completed skills for this language to determine which scenarios are unlocked.
  const completedSkillCount = languageId
    ? await prisma.skillProgress.count({
        where: { userId: user.id, percentComplete: 100, skill: { languageId } },
      })
    : 0;

  const recent = await prisma.conversationSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-extrabold">AI Conversation</h1>
      <p className="mb-1 text-ink-500 dark:text-ink-400">
        Practice in your target language. The AI plays your conversation partner and corrects your replies.
      </p>
      {completedSkillCount === 0 && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          <Lightbulb className="w-4 h-4 inline-block mr-1" /> Complete skills in the{" "}
          <Link href="/learn" className="underline">skill tree</Link>{" "}
          to unlock more scenarios.
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SCENARIOS.map((s) => {
          const unlocked = completedSkillCount >= s.requiredCompletedSkills;
          return (
            <ScenarioButton
              key={s.id}
              scenario={s.id}
              title={s.title}
              emoji={s.emoji}
              unlocked={unlocked}
              requiredSkills={s.requiredCompletedSkills}
            />
          );
        })}
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold">Recent sessions</h2>
          <ul className="space-y-2">
            {recent.map((r) => {
              const sc = SCENARIOS.find((s) => s.id === r.scenario);
              return (
                <li key={r.id}>
                  <Link
                    href={`/conversation/${r.id}`}
                    className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:hover:bg-ink-800"
                  >
                    <span className="font-medium flex items-center gap-2">{sc && IconMap[sc.emoji] && React.createElement(IconMap[sc.emoji], { className: "w-5 h-5" })} {sc?.title ?? r.scenario}</span>
                    <span className={`chip ${r.status === "ended" ? "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400" : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"}`}>
                      {r.status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
