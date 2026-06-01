// Spaced repetition - SM-2 algorithm (PRD §6.5 / §8.4).
// Grades: 0=Again, 1=Hard, 2=Good, 3=Easy → mapped to SM-2 quality 0..5.

export type SrsGrade = "again" | "hard" | "good" | "easy";

const QUALITY: Record<SrsGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export type SrsState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export function scheduleNext(state: SrsState, grade: SrsGrade): SrsState & { nextDue: Date } {
  const q = QUALITY[grade];
  let { easeFactor, intervalDays, repetitions } = state;

  if (q < 3) {
    // Lapse: reset repetitions, review again soon.
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  // Update ease factor (clamped to a minimum of 1.3).
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, nextDue };
}
