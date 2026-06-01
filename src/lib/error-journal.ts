import "server-only";
import { prisma } from "./db";
import { parseJson } from "./json";

/**
 * Weekly Error Journal logic (PRD §17).
 * Computes summary on demand + persists a weekly snapshot every 7 days.
 */

export type JournalSummary = {
  total: number;
  byCategory: Record<string, number>;
  topErrors: { label: string; count: number; category: string }[];
  focusAreas: string[];
  trend: "improving" | "steady" | "declining" | "no_data";
  prevTotal: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  writing: "Writing",
  conversation: "Conversation",
};

export async function computeWeeklySummary(userId: string): Promise<JournalSummary> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeek, prevWeek] = await Promise.all([
    prisma.errorLog.findMany({ where: { userId, createdAt: { gte: weekAgo } } }),
    prisma.errorLog.findMany({
      where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
  ]);

  const byCategory: Record<string, number> = {};
  const byTag = new Map<string, { count: number; category: string }>();

  for (const e of thisWeek) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
    const detail = parseJson<{ skillTag?: string; issue?: string }>(e.detail, {});
    const label = detail.skillTag || detail.issue || CATEGORY_LABEL[e.category] || e.category;
    const existing = byTag.get(label) ?? { count: 0, category: e.category };
    existing.count += 1;
    byTag.set(label, existing);
  }

  const topErrors = [...byTag.entries()]
    .map(([label, v]) => ({ label, count: v.count, category: v.category }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const focusAreas = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => CATEGORY_LABEL[cat] ?? cat);

  let trend: JournalSummary["trend"] = "no_data";
  if (thisWeek.length === 0 && prevWeek.length === 0) trend = "no_data";
  else if (prevWeek.length === 0) trend = "steady";
  else if (thisWeek.length < prevWeek.length) trend = "improving";
  else if (thisWeek.length > prevWeek.length) trend = "declining";
  else trend = "steady";

  return {
    total: thisWeek.length,
    byCategory,
    topErrors,
    focusAreas,
    trend,
    prevTotal: prevWeek.length,
  };
}

/**
 * Persist a weekly snapshot if no snapshot exists for the current week.
 * Called during daily check-in or on journal page load.
 */
export async function maybeSnapshotJournal(userId: string): Promise<void> {
  const now = new Date();
  // Week key: Monday of current week (YYYY-MM-DD)
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().slice(0, 10);

  // Sunday
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const weekEnd = sunday.toISOString().slice(0, 10);

  // Check if snapshot already exists for this week
  const existing = await prisma.errorJournal.findFirst({
    where: { userId, weekStart },
  });
  if (existing) return;

  // Compute and persist
  const summary = await computeWeeklySummary(userId);
  await prisma.errorJournal.create({
    data: {
      userId,
      weekStart,
      weekEnd,
      summary: JSON.stringify({
        topErrors: summary.topErrors,
        focusAreas: summary.focusAreas,
        trend: summary.trend,
        total: summary.total,
        byCategory: summary.byCategory,
      }),
    },
  });
}

