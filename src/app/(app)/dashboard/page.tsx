import { Book, CheckCircle2, Target, Hand, MessageCircle, PenTool, Sparkles, Trophy, BookOpen, Star, Lock, Clock, Zap, Flame, GraduationCap, FileText, ArrowRight, Activity, Calendar } from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dailyCheckIn } from "@/lib/daily";
import { levelProgress, missionLabel, masteryProgress, getMasteryTier } from "@/lib/gamification";
import { ProgressBar } from "@/components/ProgressBar";
import { dayKey, addDays } from "@/lib/dates";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  module: "Completed a module",
  quiz: "Finished a quiz",
  mission: "Daily mission reward",
  flashcard: "Reviewed flashcards",
  login: "Daily login bonus",
  conversation: "AI conversation",
  writing: "Writing practice",
};

const SOURCE_ICON: Record<string, React.ReactNode> = {
  module: <Book className="w-4 h-4" />,
  quiz: <CheckCircle2 className="w-4 h-4" />,
  mission: <Target className="w-4 h-4" />,
  flashcard: "🃏",
  login: <Hand className="w-4 h-4" />,
  conversation: <MessageCircle className="w-4 h-4" />,
  writing: <PenTool className="w-4 h-4" />,
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");
  const p = user.profile;
  const languageId = p.currentLanguageId ?? undefined;

  // Detect stale language ID after a re-seed and reset so user re-onboards.
  if (languageId) {
    const langExists = await prisma.language.findUnique({ where: { id: languageId }, select: { id: true } });
    if (!langExists) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { onboarded: false, currentLanguageId: null },
      });
      redirect("/onboarding");
    }
  }

  await dailyCheckIn(user.id, languageId);

  const today = dayKey();
  const weekAgo = addDays(today, -7);
  const weekStart = new Date(`${weekAgo}T00:00:00`);

  const [
    freshProfile,
    language,
    missions,
    skillProgress,
    weekXp,
    weekModules,
    weekFlashcards,
    recent,
    nextSkill,
  ] = await Promise.all([
    prisma.profile.findUniqueOrThrow({ where: { userId: user.id } }),
    languageId ? prisma.language.findUnique({ where: { id: languageId } }) : null,
    prisma.dailyMission.findMany({ where: { userId: user.id, date: today } }),
    prisma.skillProgress.findMany({
      where: { userId: user.id, skill: { languageId } },
      include: { skill: true },
      orderBy: { skill: { orderIndex: "asc" } },
    }),
    prisma.xPTransaction.aggregate({
      where: { userId: user.id, createdAt: { gte: weekStart } },
      _sum: { amount: true },
    }),
    prisma.moduleProgress.count({
      where: { userId: user.id, status: "completed", completedAt: { gte: weekStart } },
    }),
    prisma.xPTransaction.count({
      where: { userId: user.id, source: "flashcard", createdAt: { gte: weekStart } },
    }),
    prisma.xPTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    // First unlocked, not-yet-complete skill for "recommended".
    prisma.skillProgress.findFirst({
      where: { userId: user.id, unlocked: true, percentComplete: { lt: 100 }, skill: { languageId } },
      include: { skill: { include: { modules: { orderBy: { orderIndex: "asc" } } } } },
      orderBy: { skill: { orderIndex: "asc" } },
    }),
  ]);

  // Fetch all active learning paths for mastery display
  const learningPaths = await prisma.learningPath.findMany({
    where: { userId: user.id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  const allLanguages = await prisma.language.findMany({ select: { id: true, name: true, code: true } });
  const langMap = new Map(allLanguages.map((l) => [l.id, l]));

  const lp = levelProgress(freshProfile.totalXp);
  const skillsDone = skillProgress.filter((s) => s.percentComplete >= 100).length;

  // Recommended module = first incomplete module in the next skill.
  let recommendedModule: { id: string; title: string } | null = null;
  if (nextSkill) {
    const completed = await prisma.moduleProgress.findMany({
      where: { userId: user.id, status: "completed", moduleId: { in: nextSkill.skill.modules.map((m) => m.id) } },
      select: { moduleId: true },
    });
    const doneSet = new Set(completed.map((c) => c.moduleId));
    const m = nextSkill.skill.modules.find((mm) => !doneSet.has(mm.id)) ?? nextSkill.skill.modules[0];
    if (m) recommendedModule = { id: m.id, title: m.title };
  }

  const missionsCompleted = missions.filter(m => m.completed).length;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 via-white to-sky-50 p-6 dark:border-ink-700 dark:bg-ink-900 dark:from-ink-900 dark:via-ink-900 dark:to-ink-900">
        <div className="flex items-center gap-4">
          <Image
            src="/mascot/wave.png"
            alt="Vocaa owl"
            width={80}
            height={80}
            className="mascot drop-shadow-md"
          />
          <div>
            <h1 className="text-2xl font-black text-ink-900 dark:text-white">
              Hi, {p.username}! <Hand className="w-6 h-6 inline-block" />
            </h1>
            <p className="mt-1 font-semibold text-ink-500">
              Learning{" "}
              <span className="font-bold text-brand-600">{language?.name ?? "-"}</span>
              {" · "}
              {p.dailyTargetMin} min/day goal
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-200/30 dark:bg-brand-800/20" />
        <div className="absolute -bottom-4 right-12 h-20 w-20 rounded-full bg-sky-200/30 dark:bg-sky-800/20" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Level */}
        <div className="stat-card border-amethyst-200 dark:border-amethyst-800">
          <div className="stat-icon bg-amethyst-100 text-amethyst-600 dark:bg-ink-800">
            <GraduationCap className="w-6 h-6 inline-block text-brand-500" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Level</p>
            <p className="text-2xl font-black text-amethyst-600 dark:text-amethyst-400">{lp.level}</p>
          </div>
        </div>
        {/* XP */}
        <div className="stat-card border-sun-200 dark:border-sun-800">
          <div className="stat-icon bg-sun-100 text-sun-600 dark:bg-ink-800">
            <Zap className="w-6 h-6 inline-block text-sun-500" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Total XP</p>
            <p className="text-2xl font-black text-sun-600 dark:text-sun-400">{freshProfile.totalXp}</p>
          </div>
        </div>
        {/* Streak */}
        <div className="stat-card border-heart-200 dark:border-heart-800">
          <div className="stat-icon bg-heart-100 text-heart-500 dark:bg-ink-800">
            <Flame className="w-6 h-6 inline-block text-heart-500" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Streak</p>
            <p className="text-2xl font-black text-heart-500 dark:text-heart-400">{freshProfile.streakCount}</p>
          </div>
        </div>
        {/* Skills */}
        <div className="stat-card border-brand-200 dark:border-brand-800">
          <div className="stat-icon bg-brand-100 text-brand-600 dark:bg-ink-800">
            <Star className="w-6 h-6 inline-block text-yellow-500" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Skills</p>
            <p className="text-2xl font-black text-brand-600 dark:text-brand-400">{skillsDone}/{skillProgress.length}</p>
          </div>
        </div>
      </div>

      {/* Language Mastery cards */}
      {learningPaths.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold">
            <Trophy className="w-5 h-5 text-amethyst-500" /> Language Mastery
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {learningPaths.map((path) => {
              const lang = langMap.get(path.languageId);
              if (!lang) return null;
              const mp = masteryProgress(path.masteryPoints);
              const isCurrent = path.languageId === languageId;
              return (
                <Link key={path.id} href={`/leaderboard?scope=mastery:${path.languageId}`}>
                  <div className={`card-fun border-2 transition hover:shadow-md ${isCurrent ? "border-amethyst-300 dark:border-amethyst-700" : "border-ink-200 dark:border-ink-700"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mp.tier.emoji}</span>
                        <div>
                          <p className="font-extrabold text-ink-800 dark:text-ink-100">{lang.name}</p>
                          <p className={`text-xs font-bold ${mp.tier.color}`}>{mp.tier.label}</p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-amethyst-600 dark:text-amethyst-400">
                        {path.masteryPoints.toLocaleString()} MP
                      </span>
                    </div>
                    <ProgressBar percent={mp.percent} color="amethyst" />
                    {mp.toNext > 0 && (
                      <p className="mt-1.5 text-xs font-semibold text-ink-400">
                        {mp.toNext} MP to next tier
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* XP Progress bar */}
      <div className="card-fun border-2 border-amethyst-200 bg-amethyst-50/50 dark:border-ink-700 dark:bg-ink-900">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-amethyst-700 dark:text-amethyst-300">Level {lp.level} Progress</span>
          <span className="text-xs font-bold text-ink-400">{lp.intoLevel} / {lp.levelSpan} XP</span>
        </div>
        <ProgressBar percent={lp.percent} color="amethyst" showLabel />
        <p className="mt-2 text-xs font-semibold text-ink-400">
          <Target className="w-4 h-4 inline-block mr-1 text-brand-500" /> {lp.toNextLevel} XP to level {lp.level + 1}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily missions */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Target className="w-6 h-6 inline-block mr-2" /> Daily Missions
              <span className="chip bg-brand-100 text-brand-700 text-xs dark:bg-ink-800 dark:text-brand-400">
                {missionsCompleted}/{missions.length}
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            {missions.map((m) => (
              <div key={m.id} className={m.completed ? "mission-done" : "mission-item"}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                  m.completed
                    ? "bg-brand-100 text-brand-600 dark:bg-ink-800 dark:text-brand-400"
                    : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500"
                }`}>
                  {m.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 border-2 rounded text-ink-300" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${
                      m.completed
                        ? "text-brand-600 line-through dark:text-brand-400"
                        : "text-ink-700 dark:text-ink-200"
                    }`}>
                      {missionLabel(m.type, m.target)}
                    </span>
                    <span className="badge-xp text-[10px]">+{m.xpReward} XP</span>
                  </div>
                  <ProgressBar
                    percent={(m.progress / m.target) * 100}
                    className="mt-2 h-2.5"
                    color={m.completed ? "brand" : "sky"}
                    showLabel
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended */}
        <section>
          <h2 className="mb-3 text-lg font-black"><Sparkles className="w-6 h-6 inline-block mr-2 text-brand-500" /> Up Next</h2>
          {recommendedModule ? (
            <Link
              href={`/learn/module/${recommendedModule.id}`}
              className="group block overflow-hidden rounded-2xl border-2 border-b-4 border-brand-300 bg-gradient-to-br from-brand-50 to-brand-100 p-5 transition-all hover:border-brand-400 hover:shadow-lg active:border-b-2 active:translate-y-[2px] dark:border-ink-600 dark:from-ink-800 dark:to-ink-900"
            >
              <Image
                src="/mascot/study.png"
                alt=""
                width={60}
                height={60}
                className="mb-3 transition-transform group-hover:scale-110"
              />
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {nextSkill?.skill.title}
              </p>
              <p className="mt-1 text-lg font-black text-ink-800 dark:text-white">
                {recommendedModule.title}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400">
                Continue learning →
              </div>
            </Link>
          ) : (
            <div className="card-fun border-2 border-brand-200 bg-brand-50/50 p-5 text-center dark:border-ink-700 dark:bg-ink-900">
              <Image
                src="/mascot/celebrate.png"
                alt=""
                width={80}
                height={80}
                className="mx-auto mb-3"
              />
              <p className="font-bold text-ink-600 dark:text-ink-300">
                All caught up! <Trophy className="w-6 h-6 inline-block ml-2 text-sun-500" />
              </p>
              <Link href="/learn" className="mt-2 inline-block text-sm font-bold text-brand-600">
                Explore the skill tree →
              </Link>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Skill progress */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black"><BookOpen className="w-6 h-6 inline-block mr-2" /> Skill Tree</h2>
            <Link href="/learn" className="text-sm font-bold text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {skillProgress.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  s.percentComplete >= 100
                    ? "border-sun-200 bg-sun-50/50 dark:border-ink-600 dark:bg-ink-800"
                    : s.unlocked
                      ? "border-brand-200 bg-white dark:border-ink-700 dark:bg-ink-900"
                      : "border-ink-200 bg-ink-50 opacity-60 dark:border-ink-700 dark:bg-ink-900"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                  s.percentComplete >= 100
                    ? "bg-sun-100 text-sun-600"
                    : s.unlocked
                      ? "bg-brand-100 text-brand-600"
                      : "bg-ink-200 text-ink-400"
                }`}>
                  {s.percentComplete >= 100 ? <Star className="w-5 h-5 text-sun-500" /> : s.unlocked ? <Book className="w-5 h-5 text-brand-500" /> : <Lock className="w-5 h-5 text-ink-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink-700 dark:text-ink-200">{s.skill.title}</span>
                    <span className="text-xs font-bold text-ink-400">{s.percentComplete}%</span>
                  </div>
                  <ProgressBar
                    percent={s.percentComplete}
                    className="mt-1.5 h-2"
                    color={s.percentComplete >= 100 ? "sun" : "brand"}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly stats + recent */}
        <section className="space-y-4">
          <div>
            <h2 className="mb-3 text-lg font-black"><Activity className="w-6 h-6 inline-block mr-2" /> This Week</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="card-fun border-2 border-sun-200 bg-sun-50/50 p-3 text-center dark:border-ink-700 dark:bg-ink-900">
                <p className="text-xl font-black text-sun-600 dark:text-sun-400">{weekXp._sum.amount ?? 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">XP</p>
              </div>
              <div className="card-fun border-2 border-sky-200 bg-sky-50/50 p-3 text-center dark:border-ink-700 dark:bg-ink-900">
                <p className="text-xl font-black text-sky-600 dark:text-sky-400">{weekModules}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Modules</p>
              </div>
              <div className="card-fun border-2 border-amethyst-200 bg-amethyst-50/50 p-3 text-center dark:border-ink-700 dark:bg-ink-900">
                <p className="text-xl font-black text-amethyst-600 dark:text-amethyst-400">{weekFlashcards}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Cards</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-black"><Clock className="w-6 h-6 inline-block mr-2" /> Recent Activity</h2>
            {recent.length === 0 ? (
              <div className="card-fun border-2 border-ink-200 p-4 text-center">
                <p className="text-sm font-bold text-ink-400">Nothing yet - start a lesson! <ArrowRight className="w-4 h-4 inline-block ml-1" /></p>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border-2 border-ink-200 bg-white p-3 dark:border-ink-700 dark:bg-ink-900"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SOURCE_ICON[r.source] ?? <FileText className="w-5 h-5" />}</span>
                      <span className="text-xs font-bold text-ink-600 dark:text-ink-300">
                        {SOURCE_LABEL[r.source] ?? r.source}
                      </span>
                    </div>
                    <span className="badge-xp text-[10px]">+{r.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/writing" className="card-fun flex items-center gap-3 border-2 border-amethyst-200 bg-amethyst-50/50 p-4 transition-all hover:border-amethyst-400 hover:shadow dark:border-ink-700 dark:bg-ink-900">
          <PenTool className="w-6 h-6" />
          <div>
            <p className="text-sm font-black text-amethyst-700 dark:text-amethyst-400">Writing</p>
            <p className="text-xs font-semibold text-ink-400">Character practice</p>
          </div>
        </Link>
        <Link href="/remedial" className="card-fun flex items-center gap-3 border-2 border-sun-200 bg-sun-50/50 p-4 transition-all hover:border-sun-400 hover:shadow dark:border-ink-700 dark:bg-ink-900">
          <Target className="w-6 h-6" />
          <div>
            <p className="text-sm font-black text-sun-700 dark:text-sun-400">Remedial</p>
            <p className="text-xs font-semibold text-ink-400">Fix weak spots</p>
          </div>
        </Link>
        <Link href="/journal" className="card-fun flex items-center gap-3 border-2 border-heart-200 bg-heart-50/50 p-4 transition-all hover:border-heart-400 hover:shadow dark:border-ink-700 dark:bg-ink-900">
          <Book className="w-6 h-6" />
          <div>
            <p className="text-sm font-black text-heart-700 dark:text-heart-400">Journal</p>
            <p className="text-xs font-semibold text-ink-400">Error tracking</p>
          </div>
        </Link>
        <Link href="/achievements" className="card-fun flex items-center gap-3 border-2 border-brand-200 bg-brand-50/50 p-4 transition-all hover:border-brand-400 hover:shadow dark:border-ink-700 dark:bg-ink-900">
          <Trophy className="w-6 h-6" />
          <div>
            <p className="text-sm font-black text-brand-700 dark:text-brand-400">Achievements</p>
            <p className="text-xs font-semibold text-ink-400">Your badges</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
