"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scheduleNext, type SrsGrade } from "@/lib/srs";
import { awardXp, awardMastery, advanceMission } from "@/lib/gamification";

export type ReviewResult = {
  ok: boolean;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel?: number;
  newAchievements: string[];
};

/** Grade a flashcard, reschedule it via SM-2, and award review XP. */
export async function reviewFlashcard(
  vocabularyId: string,
  grade: SrsGrade,
): Promise<ReviewResult> {
  const session = await getSession();
  if (!session) return { ok: false, xpAwarded: 0, leveledUp: false, newAchievements: [] };
  const userId = session.userId;

  const state = await prisma.flashcardState.findUnique({
    where: { userId_vocabularyId: { userId, vocabularyId } },
    include: { vocabulary: true },
  });
  if (!state) return { ok: false, xpAwarded: 0, leveledUp: false, newAchievements: [] };

  const next = scheduleNext(
    { easeFactor: state.easeFactor, intervalDays: state.intervalDays, repetitions: state.repetitions },
    grade,
  );

  await prisma.flashcardState.update({
    where: { id: state.id },
    data: {
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      dueDate: next.nextDue,
      lastReviewed: new Date(),
    },
  });

  const award = await awardXp(userId, 2, "flashcard", state.vocabulary.languageId);
  // good/easy grades earn 1 mastery point per card
  if (grade === "good" || grade === "easy") {
    await awardMastery(userId, state.vocabulary.languageId, 1);
  }
  await advanceMission(userId, "review_flashcards", 1);

  revalidatePath("/dashboard");
  return { 
    ok: true, 
    xpAwarded: award.amount, 
    leveledUp: award.leveledUp, 
    newLevel: award.level,
    newAchievements: award.achievements 
  };
}
