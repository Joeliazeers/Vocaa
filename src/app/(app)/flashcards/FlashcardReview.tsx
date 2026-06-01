"use client";

import { XCircle, Frown, Smile, Star, ArrowUp, Sparkles, PartyPopper } from "lucide-react";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { reviewFlashcard } from "./actions";
import { triggerCelebrations } from "@/components/Celebration";
import type { SrsGrade } from "@/lib/srs";
import { AudioButton } from "@/components/AudioButton";

type Card = {
  vocabularyId: string;
  term: string;
  reading: string;
  meaning: string;
  example: string;
};

const GRADES: { grade: SrsGrade; label: string; color: string; emoji: React.ReactNode }[] = [
  { grade: "again", label: "Again", color: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800", emoji: <XCircle className="w-5 h-5" /> },
  { grade: "hard", label: "Hard", color: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800", emoji: <Frown className="w-5 h-5" /> },
  { grade: "good", label: "Good", color: "bg-brand-100 text-brand-700 hover:bg-brand-200 border-brand-200 dark:bg-brand-950 dark:text-brand-400 dark:border-brand-800", emoji: <Smile className="w-5 h-5" /> },
  { grade: "easy", label: "Easy", color: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800", emoji: <Star className="w-5 h-5" /> },
];

export function FlashcardReview({ cards, langCode = "en", showFurigana = true }: { cards: Card[]; langCode?: string; showFurigana?: boolean }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [xp, setXp] = useState(0);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  // Load autoplay preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("vocaa_autoplay_audio");
    if (stored === "true") setAutoplay(true);
  }, []);

  const card = cards[index];
  const done = index >= cards.length;

  function grade(g: SrsGrade) {
    if (!card || pending) return;
    startTransition(async () => {
      const r = await reviewFlashcard(card.vocabularyId, g);
      if (r.ok) {
        setReviewed((n) => n + 1);
        setXp((x) => x + r.xpAwarded);
        triggerCelebrations(r);
      }
      setFlipped(false);
      setIndex((i) => i + 1);
    });
  }

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (done) {
    return (
      <div className="card-fun border-2 border-brand-200 text-center dark:border-ink-700">
        <PartyPopper className="w-12 h-12 text-brand-500" />
        <p className="mt-3 text-xl font-black">Review complete!</p>
        <p className="mt-1 text-ink-500">{reviewed} cards reviewed · <span className="badge-xp">+{xp} XP</span></p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          <Link href="/learn" className="btn-secondary">Keep learning</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-ink-400">
        <span>Card {index + 1} of {cards.length}</span>
        <span className="badge-xp text-xs">+{xp} XP</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="card-fun group relative flex min-h-[240px] w-full flex-col items-center justify-center border-2 border-ink-200 text-center transition-all hover:border-brand-300 dark:border-ink-700"
      >
        {/* Term + audio */}
        <div className="flex items-center gap-3">
          <p className="text-4xl font-black tracking-tight">{card.term}</p>
          <AudioButton text={card.term} langCode={langCode} size="md" />
        </div>

        {flipped ? (
          <div className="mt-4 space-y-2 animate-slide-up">
            {showFurigana && card.reading && (
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg font-semibold text-ink-400">{card.reading}</p>
                {card.reading !== card.term && (
                  <AudioButton text={card.reading} langCode={langCode} size="sm" />
                )}
              </div>
            )}
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{card.meaning}</p>
            {card.example && (
              <p className="mt-2 text-sm text-ink-500 italic">"{card.example}"</p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-ink-400">Tap to reveal · <span className="text-xs">auto-read pronunciation</span></p>
        )}

        {!flipped && (
          <div className="absolute bottom-4 right-4 opacity-30 text-2xl group-hover:opacity-60 transition-opacity">
            <ArrowUp className="w-4 h-4 inline-block ml-1" />
          </div>
        )}
      </button>

      {/* Grade buttons */}
      {flipped ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.grade}
              onClick={() => grade(g.grade)}
              disabled={pending}
              className={`flex flex-col items-center rounded-xl border-2 border-b-4 px-2 py-3 text-xs font-bold transition-all active:border-b-2 active:translate-y-[1px] disabled:opacity-50 ${g.color}`}
            >
              <span className="text-lg">{g.emoji}</span>
              {g.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="btn-primary mt-4 w-full py-3 text-base"
        >
          Reveal answer <Sparkles className="w-5 h-5 inline-block ml-2" />
        </button>
      )}

      {/* Achievement toast */}
      {toast && (
        <div className="mt-4 animate-slide-up rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
          {toast}
        </div>
      )}
    </div>
  );
}
