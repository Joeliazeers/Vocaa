"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateLearningPath } from "@/lib/learning-path";

/** Switch the user's active learning language (preserves all progress). */
export async function switchLanguageAction(languageId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const language = await prisma.language.findUnique({ where: { id: languageId } });
  if (!language) return { error: "Language not found." };

  await prisma.profile.update({
    where: { userId: session.userId },
    data: { currentLanguageId: languageId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  redirect("/dashboard");
}

const addSchema = z.object({
  languageId: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

/** Add a new language to the user's learning list and optionally switch to it. */
export async function addLanguageAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = addSchema.safeParse({
    languageId: formData.get("languageId"),
    level: formData.get("level"),
  });
  if (!parsed.success) return { error: "Please fill in all fields." };

  const { languageId, level } = parsed.data;
  const language = await prisma.language.findUnique({ where: { id: languageId } });
  if (!language) return { error: "Language not found." };

  // Check if already studying this language - just switch if so.
  const existing = await prisma.learningPath.findFirst({
    where: { userId: session.userId, languageId },
  });
  if (!existing) {
    // Create path; generate skill progress for this language only.
    await prisma.learningPath.create({
      data: { userId: session.userId, languageId, goal: "hobby", level, dailyTargetMinutes: 20 },
    });
    await generateLearningPath(session.userId, languageId, level);
  }

  await prisma.profile.update({
    where: { userId: session.userId },
    data: { currentLanguageId: languageId },
  });

  revalidatePath("/settings");
  redirect("/dashboard");
}

/** Update daily learning target. */
export async function updateDailyTargetAction(
  _prev: unknown,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) return;

  const min = Number(formData.get("dailyTargetMin"));
  if (![10, 20, 30, 60].includes(min)) return;

  await prisma.profile.update({
    where: { userId: session.userId },
    data: { dailyTargetMin: min },
  });
  revalidatePath("/settings");
}

export async function updateCountryAction(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const country = (formData.get("country") as string | null)?.trim() ?? "";
  await prisma.profile.update({
    where: { userId: session.userId },
    data: { country: country || null },
  });
  revalidatePath("/settings");
  revalidatePath("/leaderboard");
}

export async function updatePreferencesAction(
  _prev: unknown,
  formData: FormData,
) {
  const session = await getSession();
  if (!session) return;

  const showFurigana = formData.get("showFurigana") === "on";
  const autoplayAudio = formData.get("autoplayAudio") === "on";

  const preferences = JSON.stringify({
    showFurigana,
    autoplayAudio,
  });

  await prisma.profile.update({
    where: { userId: session.userId },
    data: { preferences },
  });
  revalidatePath("/settings");
}
