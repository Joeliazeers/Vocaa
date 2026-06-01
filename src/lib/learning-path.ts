import "server-only";
import { prisma } from "./db";

/**
 * Generate the initial learning path for a user+language (PRD FR-ONB-06).
 *
 * Skills whose `autoCompleteLevel` contains the user's self-reported level are
 * auto-completed (all modules marked done, skill 100%). This lets intermediate/
 * advanced learners skip foundational writing-system skills (Hiragana, Katakana)
 * they already know.
 */
export async function generateLearningPath(
  userId: string,
  languageId: string,
  userLevel: string = "beginner",
) {
  const skills = await prisma.skill.findMany({
    where: { languageId },
    orderBy: { orderIndex: "asc" },
    include: { modules: true },
  });

  for (const skill of skills) {
    const shouldAutoComplete = skill.autoCompleteLevel
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(userLevel);

    await prisma.skillProgress.upsert({
      where: { userId_skillId: { userId, skillId: skill.id } },
      create: {
        userId,
        skillId: skill.id,
        unlocked: shouldAutoComplete || skill.prerequisiteIds.trim() === "",
        percentComplete: shouldAutoComplete ? 100 : 0,
      },
      update: {},
    });

    if (shouldAutoComplete) {
      for (const mod of skill.modules) {
        await prisma.moduleProgress.upsert({
          where: { userId_moduleId: { userId, moduleId: mod.id } },
          create: { userId, moduleId: mod.id, status: "completed", completedAt: new Date() },
          update: {},
        });
      }
    }
  }

  // After seeding initial state, run unlock propagation so skills whose
  // prerequisites were just auto-completed become available immediately.
  await refreshSkillUnlocks(userId, languageId);
}

/** Recompute a skill's percent complete and unlock dependents if it is finished. */
export async function refreshSkillUnlocks(userId: string, languageId: string) {
  const skills = await prisma.skill.findMany({
    where: { languageId },
    include: { modules: { select: { id: true } } },
  });

  const progressRows = await prisma.moduleProgress.findMany({
    where: { userId, module: { skill: { languageId } } },
    select: { moduleId: true, status: true },
  });
  const completedModules = new Set(
    progressRows.filter((p) => p.status === "completed").map((p) => p.moduleId),
  );

  const skillPercent = new Map<string, number>();
  for (const skill of skills) {
    const total = skill.modules.length || 1;
    const done = skill.modules.filter((m) => completedModules.has(m.id)).length;
    skillPercent.set(skill.id, Math.round((done / total) * 100));
  }

  for (const skill of skills) {
    const prereqs = skill.prerequisiteIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const unlocked =
      prereqs.length === 0 || prereqs.every((id) => (skillPercent.get(id) ?? 0) >= 100);

    await prisma.skillProgress.upsert({
      where: { userId_skillId: { userId, skillId: skill.id } },
      create: {
        userId,
        skillId: skill.id,
        unlocked,
        percentComplete: skillPercent.get(skill.id) ?? 0,
      },
      update: { unlocked, percentComplete: skillPercent.get(skill.id) ?? 0 },
    });
  }
}
