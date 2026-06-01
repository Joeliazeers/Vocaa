import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMasteryTier } from "@/lib/gamification";
import { Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

type XpRow  = { userId: string; username: string; country: string | null; xp: number; level: number };
type MasteryRow = { userId: string; username: string; country: string | null; mastery: number; tier: string; tierEmoji: string };

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function globalXpBoard(): Promise<XpRow[]> {
  const profiles = await prisma.profile.findMany({ orderBy: { totalXp: "desc" }, take: 50 });
  return profiles.map((p) => ({ userId: p.userId, username: p.username, country: p.country ?? null, xp: p.totalXp, level: p.userLevel }));
}

async function countryXpBoard(country: string): Promise<XpRow[]> {
  const profiles = await prisma.profile.findMany({
    where: { country },
    orderBy: { totalXp: "desc" },
    take: 50,
  });
  return profiles.map((p) => ({ userId: p.userId, username: p.username, country: p.country ?? null, xp: p.totalXp, level: p.userLevel }));
}

async function masteryBoard(languageId: string): Promise<MasteryRow[]> {
  const paths = await prisma.learningPath.findMany({
    where: { languageId },
    orderBy: { masteryPoints: "desc" },
    take: 50,
    include: { user: { include: { profile: true } } },
  });
  return paths.map((lp) => {
    const tier = getMasteryTier(lp.masteryPoints);
    return {
      userId: lp.userId,
      username: lp.user.profile?.username ?? "Learner",
      country: lp.user.profile?.country ?? null,
      mastery: lp.masteryPoints,
      tier: tier.label,
      tierEmoji: tier.emoji,
    };
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { scope?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const myCountry = user.profile?.country ?? null;
  const languages = await prisma.language.findMany({ orderBy: { name: "asc" } });
  const scope = searchParams.scope ?? "global";

  const currentLanguageId = user.profile?.currentLanguageId;
  const currentLanguage = languages.find(l => l.id === currentLanguageId);

  // Build tab list
  const tabs = [
    { key: "global",  label: "Global",   kind: "xp"      },
    ...(myCountry ? [{ key: `country:${myCountry}`, label: "Local", kind: "xp" }] : []),
    ...(currentLanguage ? [{ key: `mastery:${currentLanguage.id}`, label: `${currentLanguage.name} Mastery`, kind: "mastery", langId: currentLanguage.id, langName: currentLanguage.name }] : []),
  ];

  // Fetch the right data
  let xpRows:     XpRow[]     = [];
  let masteryRows: MasteryRow[] = [];
  let isMastery = false;

  if (scope === "global") {
    xpRows = await globalXpBoard();
  } else if (scope.startsWith("country:")) {
    xpRows = await countryXpBoard(scope.slice(8));
  } else if (scope.startsWith("mastery:")) {
    isMastery = true;
    masteryRows = await masteryBoard(scope.slice(8));
  }

  const myXpRank     = xpRows.findIndex((r) => r.userId === user.id);
  const myMasteryRank = masteryRows.findIndex((r) => r.userId === user.id);

  const medal = (i: number) => String(i + 1);

  return (
    <div className="mx-auto max-w-2xl pb-20 md:pb-6">
      <h1 className="mb-1 text-2xl font-extrabold">Leaderboard</h1>
      <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
        Compare your progress globally, locally, or by language mastery.
      </p>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/leaderboard?scope=${t.key}`}
            className={`chip transition ${
              scope === t.key
                ? "bg-brand-600 text-white"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!myCountry && (
        <div className="mb-4 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
          <Lightbulb className="w-5 h-5 inline-block mr-1 -mt-1" /> Set your country in{" "}
          <Link href="/settings" className="underline">Settings</Link>{" "}
          to unlock the local leaderboard.
        </div>
      )}

      {/* XP Board */}
      {!isMastery && (
        <div className="card p-0 overflow-hidden">
          {xpRows.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-400">No data for this board yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {xpRows.map((r, i) => {
                const isMe = r.userId === user.id;
                return (
                  <li key={r.userId} className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-brand-50 dark:bg-brand-950" : ""}`}>
                    <span className="w-8 shrink-0 text-center font-bold text-ink-400">{medal(i)}</span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold">
                        {r.username}
                        {isMe && <span className="ml-1.5 text-xs text-brand-600 dark:text-brand-400">(you)</span>}
                      </span>
                      {r.country && (
                        <span className="text-xs text-ink-400">{r.country}</span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-ink-400">Lv {r.level}</span>
                    <span className="w-20 shrink-0 text-right font-bold text-brand-600 dark:text-brand-400">
                      {r.xp.toLocaleString()} XP
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Mastery Board */}
      {isMastery && (
        <div className="card p-0 overflow-hidden">
          {masteryRows.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-400">No one has started this language yet. Be the first!</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {masteryRows.map((r, i) => {
                const isMe = r.userId === user.id;
                return (
                  <li key={r.userId} className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-brand-50 dark:bg-brand-950" : ""}`}>
                    <span className="w-8 shrink-0 text-center font-bold text-ink-400">{medal(i)}</span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold">
                        {r.username}
                        {isMe && <span className="ml-1.5 text-xs text-brand-600 dark:text-brand-400">(you)</span>}
                      </span>
                      {r.country && (
                        <span className="text-xs text-ink-400">{r.country}</span>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-bold dark:bg-ink-800">
                      {r.tier}
                    </span>
                    <span className="w-20 shrink-0 text-right font-bold text-amethyst-600 dark:text-amethyst-400">
                      {r.mastery.toLocaleString()} MP
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Not ranked hint */}
      {!isMastery && myXpRank === -1 && xpRows.length > 0 && (
        <p className="mt-3 text-center text-sm text-ink-400">
          You&apos;re not ranked here yet - earn XP to appear!
        </p>
      )}
      {isMastery && myMasteryRank === -1 && masteryRows.length > 0 && (
        <p className="mt-3 text-center text-sm text-ink-400">
          Start studying this language to appear on the mastery board!
        </p>
      )}
    </div>
  );
}
