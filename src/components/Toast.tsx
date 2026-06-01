"use client";

import { Medal, ArrowUp, CheckCircle2 } from "lucide-react";

import { useEffect, useState } from "react";
import { playSoundMissionComplete, playSoundAchievement, playSoundLevelUp } from "@/lib/sounds";

export type ToastData = {
  id: string;
  type: "achievement" | "levelup" | "mission" | "info";
  message: string;
  emoji?: string;
};

let listeners: Array<(toast: ToastData) => void> = [];

export function fireToast(toast: Omit<ToastData, "id">) {
  const withId = { ...toast, id: Math.random().toString(36).slice(2) };
  listeners.forEach((l) => l(withId));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (toast: ToastData) => {
      // Play matching sound
      if (toast.type === "mission") playSoundMissionComplete();
      else if (toast.type === "achievement") playSoundAchievement();
      else if (toast.type === "levelup") playSoundLevelUp();

      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-2 md:bottom-8">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-up flex items-center gap-3 rounded-2xl border-2 px-5 py-3 text-sm font-bold shadow-xl backdrop-blur-sm ${
            toast.type === "achievement"
              ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : toast.type === "levelup"
              ? "border-amethyst-300 bg-amethyst-50 text-amethyst-800 dark:border-amethyst-700 dark:bg-amethyst-950 dark:text-amethyst-300"
              : toast.type === "mission"
              ? "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-300"
              : "border-ink-300 bg-white text-ink-800 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-200"
          }`}
        >
          <span className="text-xl">{toast.emoji || (toast.type === "achievement" ? <Medal className="w-6 h-6 text-sun-500" /> : toast.type === "levelup" ? <ArrowUp className="w-6 h-6 text-brand-500" /> : <CheckCircle2 className="w-6 h-6 text-green-500" />)}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
