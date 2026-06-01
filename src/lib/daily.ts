import "server-only";
import { prisma } from "./db";
import { dayKey } from "./dates";
import { awardXp, ensureDailyMissions, checkAchievements } from "./gamification";
import { maybeSnapshotJournal } from "./error-journal";

/**
 * Run once per dashboard load: ensure today's missions exist and award the
 * daily-login XP at most once per day (PRD FR-GAM-01 / §16).
 * Also snapshots the weekly error journal.
 */
export async function dailyCheckIn(userId: string, languageId?: string | null) {
  await ensureDailyMissions(userId);

  const today = dayKey();
  const start = new Date(`${today}T00:00:00`);
  const alreadyLoggedIn = await prisma.xPTransaction.findFirst({
    where: { userId, source: "login", createdAt: { gte: start } },
  });

  if (!alreadyLoggedIn) {
    await awardXp(userId, 10, "login", languageId ?? null);
  }

  await checkAchievements(userId);

  // Persist weekly journal snapshot (idempotent - only runs once per week)
  await maybeSnapshotJournal(userId);
}

