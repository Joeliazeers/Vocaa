import { Sprout, Flame, Star, MessageCircle, Trophy, Check, Lock } from "lucide-react";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/json";

export const dynamic = "force-dynamic";

const ICONS: Record<string, React.ReactNode> = {
  sprout: <Sprout className="w-6 h-6 text-green-500" />,
  flame: <Flame className="w-6 h-6 text-orange-500" />,
  cards: "🃏",
  star: <Star className="w-6 h-6 text-yellow-500" />,
  chat: <MessageCircle className="w-6 h-6 text-blue-500" />,
  trophy: <Trophy className="w-6 h-6 text-amber-500" />,
};

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [achievements, unlocked] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId: user.id } }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-extrabold">Achievements</h1>
      <p className="mb-6 text-ink-500">
        {unlockedIds.size} of {achievements.length} unlocked
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {achievements.map((a) => {
          const isUnlocked = unlockedIds.has(a.id);
          const criteria = parseJson<{ type: string; value: number }>(a.criteria, { type: "", value: 0 });
          return (
            <div
              key={a.id}
              className={`card flex items-center gap-4 ${isUnlocked ? "" : "opacity-60"}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                  isUnlocked ? "bg-amber-100" : "bg-ink-100 grayscale"
                }`}
              >
                {ICONS[a.icon] ?? <Trophy className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <p className="font-bold">{a.title}</p>
                <p className="text-sm text-ink-500">{a.description}</p>
              </div>
              {isUnlocked ? (
                <span className="chip bg-green-100 text-green-700"><Check className="w-4 h-4" /></span>
              ) : (
                <span className="chip bg-ink-100 text-ink-400"><Lock className="w-4 h-4" /></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
