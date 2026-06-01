import { Flame, Book, Medal, PenTool, Target } from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { levelProgress } from "@/lib/gamification";
import { ProgressBar } from "@/components/ProgressBar";
import { UsernameForm } from "./UsernameForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");
  const p = user.profile;

  const [language, modulesCompleted, flashcardReviews, conversations, achievementsCount, quizAttempts] =
    await Promise.all([
      p.currentLanguageId ? prisma.language.findUnique({ where: { id: p.currentLanguageId } }) : null,
      prisma.moduleProgress.count({ where: { userId: user.id, status: "completed" } }),
      prisma.xPTransaction.count({ where: { userId: user.id, source: "flashcard" } }),
      prisma.conversationSession.count({ where: { userId: user.id, status: "ended" } }),
      prisma.userAchievement.count({ where: { userId: user.id } }),
      prisma.quizAttempt.count({ where: { userId: user.id } }),
    ]);

  const lp = levelProgress(p.totalXp);
  const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(p.avatarSeed + p.username)}`;

  const stats = [
    { label: "Modules completed", value: modulesCompleted },
    { label: "Flashcards reviewed", value: flashcardReviews },
    { label: "Conversations", value: conversations },
    { label: "Quiz attempts", value: quizAttempts },
    { label: "Achievements", value: achievementsCount },
    { label: "Longest streak", value: <>{p.longestStreak} <Flame className="w-5 h-5 inline-block text-heart-500" /></> },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="avatar" className="h-20 w-20 rounded-full border border-ink-200 bg-ink-50" />
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{p.username}</h1>
          <p className="text-ink-500">{user.email}</p>
          <p className="mt-1 text-sm text-ink-400">
            Learning {language?.name ?? "-"} · {p.goal} · {p.level}
          </p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-extrabold text-brand-600">Lv {lp.level}</p>
          <p className="text-xs text-ink-400">{p.totalXp} XP</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-ink-600">Level progress</span>
          <span className="text-ink-400">{lp.toNextLevel} XP to Lv {lp.level + 1}</span>
        </div>
        <ProgressBar percent={lp.percent} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">Learning statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <p className="text-2xl font-extrabold text-brand-600">{s.value}</p>
              <p className="text-xs text-ink-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/journal" className="btn-secondary flex-1"><Book className="w-5 h-5 inline-block mr-2" /> Error Journal</Link>
        <Link href="/achievements" className="btn-secondary flex-1"><Medal className="w-5 h-5 inline-block mr-2" /> Achievements</Link>
        <Link href="/writing" className="btn-secondary flex-1"><PenTool className="w-5 h-5 inline-block mr-2" /> Writing</Link>
        <Link href="/remedial" className="btn-secondary flex-1"><Target className="w-5 h-5 inline-block mr-2" /> Remedial</Link>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-bold">Edit profile</h2>
        <UsernameForm current={p.username} />
      </div>
    </div>
  );
}
