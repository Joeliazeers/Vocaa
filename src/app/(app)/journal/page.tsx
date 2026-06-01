import { TrendingDown, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { computeWeeklySummary } from "@/lib/error-journal";
import { ProgressBar } from "@/components/ProgressBar";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  writing: "Writing",
  conversation: "Conversation",
};

const TREND_UI: Record<string, { emoji: React.ReactNode; text: string; color: string }> = {
  improving: { emoji: <TrendingDown className="w-5 h-5" />, text: "Improving - fewer mistakes than last week", color: "text-green-700 dark:text-green-400" },
  declining: { emoji: <TrendingUp className="w-5 h-5" />, text: "More mistakes than last week - keep practicing", color: "text-amber-700 dark:text-amber-400" },
  steady: { emoji: <ArrowRight className="w-5 h-5" />, text: "Steady compared to last week", color: "text-ink-600 dark:text-ink-300" },
  no_data: { emoji: <Sparkles className="w-5 h-5" />, text: "No mistakes logged yet - a clean week!", color: "text-brand-700 dark:text-brand-400" },
};

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const summary = await computeWeeklySummary(user.id);
  const trend = TREND_UI[summary.trend];
  const maxCount = Math.max(1, ...Object.values(summary.byCategory));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-extrabold">Weekly Error Journal</h1>
      <p className="mb-6 text-ink-500">Your mistakes from the last 7 days, turned into a focus list.</p>

      <div className={`card mb-4 ${summary.total === 0 ? "text-center" : ""}`}>
        <p className={`text-lg font-semibold ${trend.color}`}>
          {trend.emoji} {trend.text}
        </p>
        {summary.total > 0 && (
          <p className="mt-1 text-sm text-ink-500">
            {summary.total} issues this week · {summary.prevTotal} last week
          </p>
        )}
      </div>

      {summary.total > 0 && (
        <>
          <div className="card mb-4">
            <h2 className="mb-3 text-lg font-bold">By category</h2>
            <ul className="space-y-2.5">
              {Object.entries(summary.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <li key={cat} className="flex items-center gap-3">
                    <span className="w-28 text-sm font-medium text-ink-700 dark:text-ink-200">
                      {CATEGORY_LABEL[cat] ?? cat}
                    </span>
                    <ProgressBar percent={(count / maxCount) * 100} className="h-2" />
                    <span className="w-8 text-right text-sm text-ink-400">{count}</span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="card mb-4">
            <h2 className="mb-3 text-lg font-bold">Most frequent mistakes</h2>
            <ul className="space-y-2">
              {summary.topErrors.map((e) => (
                <li key={e.label} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-700 dark:text-ink-200">{e.label}</span>
                  <span className="chip bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">{e.count}×</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="mb-2 text-lg font-bold">Focus areas this week</h2>
            <div className="flex flex-wrap gap-2">
              {summary.focusAreas.map((f) => (
                <span key={f} className="chip bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400">{f}</span>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Tip: review related <Link href="/flashcards" className="text-brand-600">flashcards</Link> and
              redo weak <Link href="/learn" className="text-brand-600">modules</Link> to improve these areas.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
