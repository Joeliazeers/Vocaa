import { Edit3, Star, PenTool } from "lucide-react";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WritingPractice } from "./WritingPractice";

export const dynamic = "force-dynamic";

const WRITING_LANGS = new Set(["ja", "zh"]);

export default async function WritingPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");

  const languageId = user.profile.currentLanguageId;
  const language = languageId
    ? await prisma.language.findUnique({ where: { id: languageId } })
    : null;
  const langCode = language?.code ?? "";

  // Stats
  const [totalAttempts, recentAttempts] = await Promise.all([
    prisma.writingAttempt.count({ where: { userId: user.id } }),
    prisma.writingAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const avgScore = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((a, b) => a + b.score, 0) / recentAttempts.length)
    : null;

  return (
    <div className="mx-auto max-w-lg pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink-900 dark:text-white"><Edit3 className="w-8 h-8 inline-block mr-3" /> Writing Practice</h1>
        <p className="mt-1 font-semibold text-ink-500">
          Practice writing characters for {language?.name ?? "your language"}.
        </p>
      </div>

      {/* Stats */}
      {totalAttempts > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="stat-card border-amethyst-200 dark:border-amethyst-800">
            <div className="stat-icon bg-amethyst-100 text-amethyst-600 dark:bg-ink-800"><Edit3 className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Practiced</p>
              <p className="text-2xl font-black text-amethyst-600 dark:text-amethyst-400">{totalAttempts}</p>
            </div>
          </div>
          <div className="stat-card border-sun-200 dark:border-sun-800">
            <div className="stat-icon bg-sun-100 text-sun-600 dark:bg-ink-800"><Star className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Avg Score</p>
              <p className="text-2xl font-black text-sun-600 dark:text-sun-400">{avgScore ?? "-"}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Not a writing language */}
      {!WRITING_LANGS.has(langCode) ? (
        <div className="card-fun border-2 border-ink-200 text-center dark:border-ink-700">
          <div className="text-4xl"><PenTool className="w-8 h-8" /></div>
          <h2 className="mt-3 text-lg font-black">Not applicable</h2>
          <p className="mt-2 text-sm font-semibold text-ink-500">
            Writing practice is available for <span className="font-bold text-brand-600">Japanese</span> and{" "}
            <span className="font-bold text-brand-600">Mandarin</span>.
          </p>
          <p className="mt-1 text-sm text-ink-400">
            Currently learning:{" "}
            <span className="font-bold">{language?.name ?? "-"}</span>
          </p>
        </div>
      ) : (
        <WritingPractice langCode={langCode} languageId={languageId!} />
      )}
    </div>
  );
}
