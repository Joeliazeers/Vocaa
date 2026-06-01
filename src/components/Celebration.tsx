"use client";

import { GraduationCap, Trophy } from "lucide-react";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { playSoundLevelUp, playSoundAchievement } from "@/lib/sounds";

type CelebrationData =
  | { type: "levelup"; level: number }
  | { type: "achievement"; title: string };

export function CelebrationContainer() {
  const [queue, setQueue] = useState<CelebrationData[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const data = e.detail as CelebrationData;
      setQueue((q) => [...q, data]);
    };
    window.addEventListener("celebration", handler);
    return () => window.removeEventListener("celebration", handler);
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
      // Play sound effect for the current celebration type
      if (queue[0].type === "levelup") playSoundLevelUp();
      else playSoundAchievement();

      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#a855f7', '#fbbf24']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#a855f7', '#fbbf24']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [queue.length]);

  if (queue.length === 0) return null;

  const current = queue[0];
  const close = () => setQueue((q) => q.slice(1));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="animate-bounce-in bg-white dark:bg-ink-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-brand-300 relative overflow-hidden">
        <div className="text-6xl mb-4">
          {current.type === "levelup" ? <GraduationCap className="w-12 h-12 inline-block" /> : <Trophy className="w-12 h-12 inline-block" />}
        </div>
        <h2 className="text-3xl font-black text-brand-600 dark:text-brand-400 mb-2">
          {current.type === "levelup" ? "Level Up!" : "Achievement Unlocked!"}
        </h2>
        <p className="text-xl font-bold text-ink-700 dark:text-ink-200">
          {current.type === "levelup" ? `You reached Level ${current.level}` : current.title}
        </p>
        <button onClick={close} className="btn-primary mt-6 w-full text-lg py-3">
          Awesome!
        </button>
      </div>
    </div>
  );
}

export function triggerCelebrations(result: { leveledUp?: boolean; newLevel?: number; achievements?: string[]; newAchievements?: string[] }) {
  if (result.leveledUp && result.newLevel) {
    window.dispatchEvent(new CustomEvent("celebration", { detail: { type: "levelup", level: result.newLevel } }));
  }
  const achs = result.achievements || result.newAchievements;
  if (achs && achs.length > 0) {
    achs.forEach((title) => {
      window.dispatchEvent(new CustomEvent("celebration", { detail: { type: "achievement", title } }));
    });
  }
}
