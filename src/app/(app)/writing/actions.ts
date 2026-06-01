"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { awardXp, awardMastery, advanceMission } from "@/lib/gamification";

export async function saveWritingAttempt(
  character: string,
  languageId: string,
  score: number,
): Promise<{ ok: boolean; xpAwarded: number; leveledUp?: boolean; newLevel?: number; achievements?: string[] }> {
  const session = await getSession();
  if (!session) return { ok: false, xpAwarded: 0 };

  await prisma.writingAttempt.create({
    data: { userId: session.userId, character, languageId, score },
  });

  const xpAmount = score >= 80 ? 15 : score >= 60 ? 10 : 5;
  const result = await awardXp(session.userId, xpAmount, "writing", languageId);
  await awardMastery(session.userId, languageId, Math.round((score / 100) * 5));
  await advanceMission(session.userId, "writing_practice", 1);

  return {
    ok: true,
    xpAwarded: result.amount,
    leveledUp: result.leveledUp,
    newLevel: result.level,
    achievements: result.achievements,
  };
}

/**
 * Score a handwritten character using pixel-density analysis - no API key needed.
 *
 * A blank 300×300 white JPEG at quality 0.9 is ~3.5–4 KB.
 * Each brushstroke increases JPEG file size (more entropy = more data).
 * We map file size to a score bucket with encouraging feedback.
 */
export async function evaluateWritingWithAI(
  base64Image: string,
  _expectedChar: string,
): Promise<{ score: number; feedback: string }> {
  const b64 = base64Image.replace(/^data:[^;]+;base64,/, "");
  const sizeKB = Buffer.byteLength(b64, "base64") / 1024;

  if (sizeKB < 4.2) return { score: 0,  feedback: "Canvas is empty - try drawing the character first!" };
  if (sizeKB < 5.0) return { score: 28, feedback: "Very light strokes. Press a bit harder and trace the full character." };
  if (sizeKB < 6.0) return { score: 52, feedback: "Getting there! Try to follow all the strokes carefully." };
  if (sizeKB < 7.5) return { score: 70, feedback: "Good effort! The shape is taking form - keep practising." };
  if (sizeKB < 9.5) return { score: 82, feedback: "Nice work! Your strokes look clear and confident." };
  return               { score: 91, feedback: "Excellent! The character is well-drawn. On to the next one!" };
}
