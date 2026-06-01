"use client";

import { Hand, Book, MessageCircle, Flame, Rocket } from "lucide-react";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vocaa_tour_done";

type Slide = {
  emoji: React.ReactNode;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    emoji: <Hand className="w-6 h-6" />,
    title: "Welcome to Vocaa!",
    body: "Let's take 20 seconds to show you around. You'll learn a new language a little every day - and have fun doing it.",
  },
  {
    emoji: <Book className="w-6 h-6" />,
    title: "Follow the Skill Tree",
    body: "Open Learn to work through skills one step at a time. Finish a skill to unlock the next - just like a game.",
  },
  {
    emoji: "🃏",
    title: "Review with Flashcards",
    body: "Words you learn turn into flashcards. Quick daily reviews lock them into long-term memory.",
  },
  {
    emoji: <MessageCircle className="w-6 h-6" />,
    title: "Practice by Chatting",
    body: "When you're ready, the Chat tab lets you practice real conversations - the AI replies in your target language and gently corrects you.",
  },
  {
    emoji: <Flame className="w-6 h-6" />,
    title: "Keep your Streak",
    body: "Hit your daily goal to grow your streak, earn XP and climb the ranks. Ready? Let's learn!",
  },
];

export function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      /* localStorage unavailable - skip the tour */
    }
  }, []);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="animate-slide-up w-full max-w-md rounded-3xl border-4 border-brand-300 bg-white p-6 text-center shadow-2xl dark:border-brand-700 dark:bg-ink-900">
        <div className="mb-3 text-6xl">{slide.emoji}</div>
        <h2 id="tour-title" className="text-2xl font-black text-brand-600 dark:text-brand-400">
          {slide.title}
        </h2>
        <p className="mt-2 text-base font-semibold text-ink-600 dark:text-ink-300">{slide.body}</p>

        {/* Progress dots */}
        <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-brand-500" : "w-2.5 bg-ink-200 dark:bg-ink-700"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            className="text-sm font-bold text-ink-400 hover:text-ink-600 dark:hover:text-ink-200"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" className="btn-secondary" onClick={() => setIndex((i) => i - 1)}>
                ← Back
              </button>
            )}
            {isLast ? (
              <button type="button" className="btn-primary px-6" onClick={finish}>
                Start learning! <Rocket className="w-5 h-5 inline-block ml-2" />
              </button>
            ) : (
              <button type="button" className="btn-primary px-6" onClick={() => setIndex((i) => i + 1)}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
