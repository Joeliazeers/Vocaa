import { Star, BookOpen, Lock, Trophy } from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressBar } from "@/components/ProgressBar";

export const dynamic = "force-dynamic";

export default async function SkillTreePage() {
  const user = await getCurrentUser();
  if (!user?.profile?.currentLanguageId) redirect("/onboarding");
  const languageId = user.profile.currentLanguageId;

  // Guard: language ID may be stale after a re-seed (new IDs are generated).
  // Reset the profile so the user can pick their language again cleanly.
  const languageExists = await prisma.language.findUnique({ where: { id: languageId }, select: { id: true } });
  if (!languageExists) {
    await prisma.profile.update({
      where: { userId: user.id },
      data: { onboarded: false, currentLanguageId: null },
    });
    redirect("/onboarding");
  }

  const [language, skills, progress, moduleProgress] = await Promise.all([
    prisma.language.findUnique({ where: { id: languageId } }),
    prisma.skill.findMany({
      where: { languageId },
      orderBy: { orderIndex: "asc" },
      include: { modules: { orderBy: { orderIndex: "asc" } } },
    }),
    prisma.skillProgress.findMany({ where: { userId: user.id, skill: { languageId } } }),
    prisma.moduleProgress.findMany({ where: { userId: user.id, status: "completed" } }),
  ]);

  const progressBySkill = new Map(progress.map((p) => [p.skillId, p]));
  const completedModules = new Set(moduleProgress.map((m) => m.moduleId));

  // Zigzag pattern offsets for Duolingo-style path
  const zigzag = [0, -1, 0, 1, 0, -1, 0, 1];

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-ink-900 dark:text-white">
          {language?.name} Skill Tree
        </h1>
        <p className="mt-1 font-semibold text-ink-500">
          Complete a skill to unlock the next one!
        </p>
      </div>

      {/* Skill tree path */}
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center gap-6">
          {skills.map((skill, i) => {
            const sp = progressBySkill.get(skill.id);
            const unlocked = sp?.unlocked ?? false;
            const percent = sp?.percentComplete ?? 0;
            const completed = percent >= 100;
            const offset = zigzag[i % zigzag.length];
            const totalModules = skill.modules.length;
            const completedCount = skill.modules.filter(m => completedModules.has(m.id)).length;

            return (
              <div key={skill.id} className="relative w-full">
                {/* Connecting line */}
                {i < skills.length - 1 && (
                  <svg className="absolute left-1/2 top-full z-0 h-6 w-full -translate-x-1/2 overflow-visible">
                    <line
                      x1={`calc(50% + ${offset * 50}px)`}
                      y1="0"
                      x2={`calc(50% + ${zigzag[(i + 1) % zigzag.length] * 50}px)`}
                      y2="100%"
                      stroke="currentColor"
                      strokeWidth="4"
                      className={completed ? "text-sun-300 dark:text-sun-600" : unlocked ? "text-brand-300 dark:text-brand-700" : "text-ink-200 dark:text-ink-700"}
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Skill node */}
                <div
                  className="skill-node relative z-10 animate-slide-up"
                  style={{
                    transform: `translateX(${offset * 50}px)`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  {/* Circle */}
                  <Link
                    href={unlocked ? `/learn/skill/${skill.id}` : '#'}
                    className={
                      completed
                        ? "skill-circle-done"
                        : unlocked
                          ? "skill-circle-active"
                          : "skill-circle-locked"
                    }
                    aria-disabled={!unlocked}
                  >
                    {completed ? <Star className="w-10 h-10" /> : unlocked ? <BookOpen className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
                  </Link>

                  {/* Label */}
                  <div className="mt-2 text-center w-40">
                    <div className="flex items-center justify-center gap-1">
                      <span className="chip bg-ink-100 text-ink-500 text-[10px] dark:bg-ink-700 dark:text-ink-400">
                        {skill.levelLabel}
                      </span>
                    </div>
                    <h3 className={`mt-1 text-sm font-black leading-tight ${
                      unlocked ? "text-ink-800 dark:text-white" : "text-ink-400 dark:text-ink-500"
                    }`}>
                      {skill.title}
                    </h3>
                    <p className="text-xs font-semibold text-ink-400 mt-0.5">
                      {completedCount}/{totalModules} lessons
                    </p>
                  </div>

                  {/* Progress ring (visual indicator) */}
                  {unlocked && !completed && (
                    <div className="mt-2 w-32">
                      <ProgressBar percent={percent} className="h-2" color="brand" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* End of tree */}
        <div className="mt-8 flex flex-col items-center">
          <Image
            src="/mascot/celebrate.png"
            alt="Finish"
            width={100}
            height={100}
            className="opacity-30 dark:opacity-20"
          />
          <p className="mt-2 text-sm font-bold text-ink-300 dark:text-ink-600">
            Complete all skills to finish! <Trophy className="w-6 h-6 inline-block ml-2 text-sun-500" />
          </p>
        </div>
      </div>
    </div>
  );
}
