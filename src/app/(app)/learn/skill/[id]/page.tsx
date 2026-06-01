import { Star, Play, Lock } from "lucide-react";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressBar } from "@/components/ProgressBar";

export const dynamic = "force-dynamic";

export default async function SkillModulesPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skill = await prisma.skill.findUnique({
    where: { id: params.id },
    include: {
      language: true,
      modules: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!skill) notFound();

  // Make sure they have access
  const sp = await prisma.skillProgress.findUnique({
    where: { userId_skillId: { userId: user.id, skillId: skill.id } },
  });
  if (!sp || !sp.unlocked) {
    redirect("/learn");
  }

  const moduleProgress = await prisma.moduleProgress.findMany({
    where: { userId: user.id, moduleId: { in: skill.modules.map(m => m.id) } },
  });

  const completedModules = new Set(
    moduleProgress.filter(m => m.status === "completed").map(m => m.moduleId)
  );

  const zigzag = [0, -1, 0, 1, 0, -1, 0, 1];

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/learn" className="text-sm font-bold text-ink-400 hover:text-ink-600 mb-2 inline-block">
          ← Back to Skills
        </Link>
        <h1 className="text-2xl font-black text-ink-900 dark:text-white">
          {skill.title}
        </h1>
        <p className="mt-1 font-semibold text-ink-500">
          {skill.levelLabel} • {skill.language.name}
        </p>
      </div>

      {/* Modules tree path */}
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center gap-6">
          {skill.modules.map((mod, i) => {
            const isCompleted = completedModules.has(mod.id);
            // Module is unlocked if it's the first one, or if the previous one is completed
            const isUnlocked = i === 0 || completedModules.has(skill.modules[i - 1].id);
            const offset = zigzag[i % zigzag.length];

            return (
              <div key={mod.id} className="relative w-full">
                {/* Connecting line */}
                {i < skill.modules.length - 1 && (
                  <svg className="absolute left-1/2 top-full z-0 h-6 w-full -translate-x-1/2 overflow-visible">
                    <line
                      x1={`calc(50% + ${offset * 50}px)`}
                      y1="0"
                      x2={`calc(50% + ${zigzag[(i + 1) % zigzag.length] * 50}px)`}
                      y2="100%"
                      stroke="currentColor"
                      strokeWidth="4"
                      className={isCompleted ? "text-sun-300 dark:text-sun-600" : isUnlocked ? "text-brand-300 dark:text-brand-700" : "text-ink-200 dark:text-ink-700"}
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Module node */}
                <div
                  className="skill-node relative z-10 animate-slide-up"
                  style={{
                    transform: `translateX(${offset * 50}px)`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <Link
                    href={isUnlocked ? `/learn/module/${mod.id}` : '#'}
                    className={
                      isCompleted
                        ? "skill-circle-done"
                        : isUnlocked
                          ? "skill-circle-active"
                          : "skill-circle-locked"
                    }
                    aria-disabled={!isUnlocked}
                  >
                    {isCompleted ? <Star className="w-10 h-10" /> : isUnlocked ? <Play className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
                  </Link>

                  <div className="mt-2 text-center w-40">
                    <h3 className={`text-sm font-black leading-tight ${
                      isUnlocked ? "text-ink-800 dark:text-white" : "text-ink-400 dark:text-ink-500"
                    }`}>
                      {mod.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
