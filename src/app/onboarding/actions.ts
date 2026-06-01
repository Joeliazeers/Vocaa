"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateLearningPath } from "@/lib/learning-path";

const schema = z.object({
  languageId: z.string().min(1),
  goal: z.enum(["travel", "education", "career", "hobby"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  dailyTargetMin: z.coerce.number().int().refine((n) => [10, 20, 30, 60].includes(n)),
});

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = schema.safeParse({
    languageId: formData.get("languageId"),
    goal: formData.get("goal"),
    level: formData.get("level"),
    dailyTargetMin: formData.get("dailyTargetMin"),
  });
  if (!parsed.success) return { error: "Please complete all steps." };

  const { languageId, goal, level, dailyTargetMin } = parsed.data;

  const language = await prisma.language.findUnique({ where: { id: languageId } });
  if (!language) return { error: "Selected language is unavailable." };

  // Clear only THIS language's stale progress (other languages' progress is preserved).
  await prisma.skillProgress.deleteMany({ where: { userId: session.userId, skill: { languageId } } });
  await prisma.moduleProgress.deleteMany({ where: { userId: session.userId, module: { skill: { languageId } } } });
  await prisma.learningPath.deleteMany({ where: { userId: session.userId, languageId } });

  await prisma.learningPath.create({
    data: { userId: session.userId, languageId, goal, level, dailyTargetMinutes: dailyTargetMin },
  });

  await prisma.profile.update({
    where: { userId: session.userId },
    data: { currentLanguageId: languageId, goal, level, dailyTargetMin, onboarded: true },
  });

  await generateLearningPath(session.userId, languageId, level);

  redirect("/dashboard");
}
