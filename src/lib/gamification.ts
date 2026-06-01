import "server-only";
import { prisma } from "./db";
import { dayKey, daysBetween } from "./dates";
import { parseJson } from "./json";

/**
 * Gamification engine - PRD §16.
 * Level curve: cumulative XP to reach level L = 100 * L^2  (L >= 2).
 * Level 1 covers [0, 400). level(xp) = max(1, floor(sqrt(xp / 100))).
 */

export type XpSource =
  | "module"
  | "quiz"
  | "mission"
  | "flashcard"
  | "login"
  | "conversation"
  | "writing";

export function computeLevel(totalXp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, totalXp) / 100)));
}

export function levelFloorXp(level: number): number {
  return level <= 1 ? 0 : 100 * level * level;
}

export function levelCeilXp(level: number): number {
  return 100 * (level + 1) * (level + 1);
}

export function levelProgress(totalXp: number) {
  const level = computeLevel(totalXp);
  const floor = levelFloorXp(level);
  const ceil = levelCeilXp(level);
  const into = totalXp - floor;
  const span = ceil - floor;
  return {
    level,
    totalXp,
    intoLevel: into,
    levelSpan: span,
    toNextLevel: ceil - totalXp,
    percent: Math.min(100, Math.round((into / span) * 100)),
  };
}

// ── Mastery system ────────────────────────────────────────────────────────────

export type MasteryTier = {
  label: string;
  emoji: string;
  minPoints: number;
  color: string; // tailwind text color
};

export const MASTERY_TIERS: MasteryTier[] = [
  { label: "Unranked",          emoji: "○",  minPoints: 0,    color: "text-ink-400" },
  { label: "Beginner",          emoji: "🌱", minPoints: 1,    color: "text-green-600" },
  { label: "Elementary",        emoji: "📚", minPoints: 101,  color: "text-sky-600" },
  { label: "Pre-Intermediate",  emoji: "⚡", minPoints: 301,  color: "text-brand-600" },
  { label: "Intermediate",      emoji: "🔥", minPoints: 701,  color: "text-amber-600" },
  { label: "Upper-Intermediate",emoji: "💎", minPoints: 1501, color: "text-amethyst-600" },
  { label: "Advanced",          emoji: "👑", minPoints: 3001, color: "text-heart-500" },
];

export function getMasteryTier(points: number): MasteryTier {
  for (let i = MASTERY_TIERS.length - 1; i >= 0; i--) {
    if (points >= MASTERY_TIERS[i].minPoints) return MASTERY_TIERS[i];
  }
  return MASTERY_TIERS[0];
}

export function masteryProgress(points: number) {
  const tier = getMasteryTier(points);
  const idx = MASTERY_TIERS.indexOf(tier);
  const next = MASTERY_TIERS[idx + 1];
  if (!next) return { tier, points, percent: 100, toNext: 0 };
  const span = next.minPoints - tier.minPoints;
  const into = points - tier.minPoints;
  return { tier, points, percent: Math.min(100, Math.round((into / span) * 100)), toNext: next.minPoints - points };
}

/** Award mastery points to a user's LearningPath for a given language. */
export async function awardMastery(
  userId: string,
  languageId: string,
  points: number,
): Promise<number> {
  if (points <= 0 || !languageId) return 0;
  const path = await prisma.learningPath.findUnique({ where: { userId_languageId: { userId, languageId } } });
  if (!path) return 0;
  const newTotal = path.masteryPoints + points;
  await prisma.learningPath.update({
    where: { id: path.id },
    data: { masteryPoints: newTotal },
  });
  return newTotal;
}

export type AwardResult = {
  amount: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  newLevel?: number;
  achievements: string[];
};

/** Record an XP transaction, update the profile total/level, and refresh streak + missions. */
export async function awardXp(
  userId: string,
  amount: number,
  source: XpSource,
  languageId?: string | null,
): Promise<AwardResult> {
  if (amount <= 0) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    return {
      amount: 0,
      totalXp: profile?.totalXp ?? 0,
      level: profile?.userLevel ?? 1,
      leveledUp: false,
      achievements: [],
    };
  }

  await prisma.xPTransaction.create({
    data: { userId, amount, source, languageId: languageId ?? null },
  });

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
  const prevLevel = profile.userLevel;
  const newTotal = profile.totalXp + amount;
  const newLevel = computeLevel(newTotal);

  await prisma.profile.update({
    where: { userId },
    data: { totalXp: newTotal, userLevel: newLevel },
  });

  await touchStreak(userId);
  await advanceMission(userId, "earn_xp", amount);

  // Auto check achievements whenever XP is awarded
  const newAchievements = await checkAchievements(userId);

  return {
    amount,
    totalXp: newTotal,
    level: newLevel,
    leveledUp: newLevel > prevLevel,
    achievements: newAchievements,
  };
}

/** Update streak based on the day of the latest activity. Idempotent within a day. */
export async function touchStreak(userId: string): Promise<void> {
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
  const today = dayKey();
  if (profile.lastActiveDate === today) return; // already counted today

  let streak = profile.streakCount;
  if (!profile.lastActiveDate) {
    streak = 1;
  } else {
    const gap = daysBetween(profile.lastActiveDate, today);
    streak = gap === 1 ? profile.streakCount + 1 : 1;
  }

  await prisma.profile.update({
    where: { userId },
    data: {
      streakCount: streak,
      longestStreak: Math.max(streak, profile.longestStreak),
      lastActiveDate: today,
    },
  });
}

// ---------------------------------------------------------------------------
// Daily missions (PRD §6.8) - randomised pool
// ---------------------------------------------------------------------------

type MissionTemplate = { type: string; target: number; xpReward: number; label: string };

/** Full pool of possible daily missions. 3 are selected per day (seeded by date). */
const MISSION_POOL: MissionTemplate[] = [
  { type: "complete_module", target: 1, xpReward: 30, label: "Complete 1 module" },
  { type: "complete_module", target: 2, xpReward: 50, label: "Complete 2 modules" },
  { type: "review_flashcards", target: 10, xpReward: 20, label: "Review 10 flashcards" },
  { type: "review_flashcards", target: 20, xpReward: 35, label: "Review 20 flashcards" },
  { type: "earn_xp", target: 50, xpReward: 25, label: "Earn 50 XP" },
  { type: "earn_xp", target: 100, xpReward: 40, label: "Earn 100 XP" },
  { type: "complete_quiz", target: 1, xpReward: 25, label: "Pass 1 quiz" },
  { type: "conversation_turn", target: 5, xpReward: 30, label: "Send 5 messages in AI chat" },
  { type: "writing_practice", target: 3, xpReward: 25, label: "Practice 3 characters in writing" },
];

/** Pick 3 missions from the pool using a deterministic date-based seed. */
function pickDailyMissions(date: string): MissionTemplate[] {
  // Simple hash of date string → integer seed
  let seed = 0;
  for (let i = 0; i < date.length; i++) {
    seed = (seed * 31 + date.charCodeAt(i)) % 1_000_000;
  }
  const shuffled = [...MISSION_POOL];
  // Fisher-Yates with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) % 2_147_483_648;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

export function missionLabel(type: string, target: number): string {
  const t = MISSION_POOL.find((m) => m.type === type && m.target === target);
  if (t) return t.label;
  const byType = MISSION_POOL.find((m) => m.type === type);
  return byType ? byType.label : `${type} (${target})`;
}

/** Ensure today's missions exist for the user (randomised per day). */
export async function ensureDailyMissions(userId: string) {
  const date = dayKey();
  const existing = await prisma.dailyMission.findMany({ where: { userId, date } });
  if (existing.length > 0) return existing;

  const templates = pickDailyMissions(date);
  await prisma.$transaction(
    templates.map((m) =>
      prisma.dailyMission.create({
        data: {
          userId,
          date,
          type: m.type,
          target: m.target,
          xpReward: m.xpReward,
        },
      }),
    ),
  );
  return prisma.dailyMission.findMany({ where: { userId, date } });
}


/** Advance progress on today's mission of a given type; award XP on completion. */
export async function advanceMission(userId: string, type: string, increment: number) {
  const date = dayKey();
  const mission = await prisma.dailyMission.findUnique({
    where: { userId_date_type: { userId, date, type } },
  });
  if (!mission || mission.completed) return;

  const progress = Math.min(mission.target, mission.progress + increment);
  const completed = progress >= mission.target;

  await prisma.dailyMission.update({
    where: { id: mission.id },
    data: { progress, completed },
  });

  if (completed) {
    // Award the reward directly (avoid recursion into advanceMission for earn_xp).
    await prisma.xPTransaction.create({
      data: { userId, amount: mission.xpReward, source: "mission" },
    });
    const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
    const newTotal = profile.totalXp + mission.xpReward;
    await prisma.profile.update({
      where: { userId },
      data: { totalXp: newTotal, userLevel: computeLevel(newTotal) },
    });
  }
}

// ---------------------------------------------------------------------------
// Achievements (PRD §6.15)
// ---------------------------------------------------------------------------

/** Evaluate all achievements against the user's current stats; unlock any newly earned. */
export async function checkAchievements(userId: string): Promise<string[]> {
  const [profile, achievements, unlocked, modulesCompleted, flashcardReviews, conversationsEnded] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({ where: { userId } }),
      prisma.moduleProgress.count({ where: { userId, status: "completed" } }),
      prisma.xPTransaction.count({ where: { userId, source: "flashcard" } }),
      prisma.conversationSession.count({ where: { userId, status: "ended" } }),
    ]);

  if (!profile) return [];
  const unlockedCodes = new Set(unlocked.map((u) => u.achievementId));
  const stats: Record<string, number> = {
    modules_completed: modulesCompleted,
    streak: profile.streakCount,
    flashcards_reviewed: flashcardReviews,
    total_xp: profile.totalXp,
    conversations_completed: conversationsEnded,
  };

  const newlyUnlocked: string[] = [];
  for (const a of achievements) {
    if (unlockedCodes.has(a.id)) continue;
    const criteria = parseJson<{ type: string; value: number }>(a.criteria, { type: "", value: 0 });
    if ((stats[criteria.type] ?? 0) >= criteria.value) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: a.id },
      });
      newlyUnlocked.push(a.title);
    }
  }
  return newlyUnlocked;
}
