import { Book, RefreshCw, FileText, Target, PartyPopper, BookOpen } from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { generateRemedialPlan, type RemedialItem } from "@/lib/remedial";

export const dynamic = "force-dynamic";

function ItemIcon({ type }: { type: RemedialItem["type"] }) {
  switch (type) {
    case "module": return <Book className="w-6 h-6 text-brand-500" />;
    case "quiz_retry": return <RefreshCw className="w-6 h-6 text-sun-500" />;
    case "flashcard_session": return <span className="text-2xl">🃏</span>;
    default: return <FileText className="w-6 h-6 text-ink-500" />;
  }
}

function ItemLabel({ item }: { item: RemedialItem }) {
  switch (item.type) {
    case "module":
      return (
        <Link
          href={`/learn/module/${item.moduleId}`}
          className="text-sm font-black text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
        >
          Study: {item.title} →
        </Link>
      );
    case "quiz_retry":
      return (
        <Link
          href={`/learn/module/${item.moduleId}`}
          className="text-sm font-black text-heart-600 underline hover:text-heart-700 dark:text-heart-400"
        >
          Retry quiz: {item.title} →
        </Link>
      );
    case "flashcard_session":
      return (
        <Link
          href="/flashcards"
          className="text-sm font-black text-amethyst-600 underline hover:text-amethyst-700 dark:text-amethyst-400"
        >
          Review flashcards: {item.skillTag} →
        </Link>
      );
  }
}

function TypeBadge({ type }: { type: RemedialItem["type"] }) {
  const map: Record<RemedialItem["type"], { label: string; color: string }> = {
    module: { label: "Study", color: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400" },
    quiz_retry: { label: "Retry Quiz", color: "bg-heart-100 text-heart-700 dark:bg-heart-950 dark:text-heart-400" },
    flashcard_session: { label: "Flashcards", color: "bg-amethyst-100 text-amethyst-700 dark:bg-amethyst-950 dark:text-amethyst-400" },
  };
  const { label, color } = map[type];
  return <span className={`chip text-[10px] font-black uppercase tracking-wider ${color}`}>{label}</span>;
}

export default async function RemedialPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");

  const plan = await generateRemedialPlan(user.id);

  return (
    <div className="mx-auto max-w-2xl pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink-900 dark:text-white"><Target className="w-8 h-8 inline-block mr-3 text-brand-500" /> Remedial Learning</h1>
        <p className="mt-1 font-semibold text-ink-500">
          Personalized suggestions based on your mistakes and progress.
        </p>
      </div>

      {/* Source badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="chip bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-400">
          {plan.source === "combined"
            ? "Based on: Error Journal + Quiz results"
            : plan.source === "journal"
            ? "Based on: Error Journal"
            : "Based on: Quiz results & skill progress"}
        </span>
      </div>

      {plan.items.length === 0 ? (
        <div className="card-fun border-2 border-brand-200 bg-brand-50 text-center dark:border-ink-700 dark:bg-ink-900">
          <PartyPopper className="w-12 h-12 text-brand-500" />
          <h2 className="mt-3 text-xl font-black">You&apos;re on track!</h2>
          <p className="mt-2 font-semibold text-ink-500">
            No remedial items right now. Keep completing lessons and we&apos;ll identify areas to strengthen.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/learn" className="btn-primary">Continue learning</Link>
            <Link href="/flashcards" className="btn-secondary">Review flashcards</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {plan.items.map((item, i) => (
            <div
              key={i}
              className="card-fun flex items-start gap-4 border-2 border-ink-200 dark:border-ink-700 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
                <ItemIcon type={item.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TypeBadge type={item.type} />
                </div>
                <ItemLabel item={item} />
                <p className="mt-1 text-xs font-semibold text-ink-400">{item.reason}</p>
              </div>
              <span className="shrink-0 text-lg font-black text-ink-200 dark:text-ink-700">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="mt-6 flex gap-3">
        <Link href="/journal" className="btn-secondary flex-1"><Book className="w-5 h-5 inline-block mr-2" /> Error Journal</Link>
        <Link href="/learn" className="btn-secondary flex-1"><BookOpen className="w-5 h-5 inline-block mr-2" /> Skill Tree</Link>
      </div>
    </div>
  );
}
