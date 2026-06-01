"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePreferencesAction } from "./actions";
import { useState } from "react";

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary mt-4 w-full" disabled={pending}>
      {pending ? "Saving…" : "Save Preferences"}
    </button>
  );
}

export function PreferencesForm({
  initialFurigana,
  initialAutoplay,
}: {
  initialFurigana: boolean;
  initialAutoplay: boolean;
}) {
  const [state, action] = useFormState(updatePreferencesAction, undefined);
  const [furigana, setFurigana] = useState(initialFurigana);
  const [autoplay, setAutoplay] = useState(initialAutoplay);

  return (
    <form action={action}>
      <div className="space-y-4">
        {/* Furigana Toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-ink-200 p-4 transition-all hover:border-ink-300 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-ink-600">
          <div>
            <p className="font-bold text-ink-800 dark:text-ink-100">Show Furigana / Pinyin</p>
            <p className="text-sm text-ink-500 dark:text-ink-400">Show reading aids for Japanese and Mandarin characters.</p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              name="showFurigana"
              className="sr-only"
              checked={furigana}
              onChange={(e) => setFurigana(e.target.checked)}
            />
            <div className={`block h-7 w-12 rounded-full transition-colors ${furigana ? "bg-brand-500" : "bg-ink-300 dark:bg-ink-600"}`}></div>
            <div className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${furigana ? "translate-x-5" : ""}`}></div>
          </div>
        </label>

        {/* Autoplay Toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-ink-200 p-4 transition-all hover:border-ink-300 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-ink-600">
          <div>
            <p className="font-bold text-ink-800 dark:text-ink-100">Autoplay Audio</p>
            <p className="text-sm text-ink-500 dark:text-ink-400">Automatically play pronunciation audio when learning new words.</p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              name="autoplayAudio"
              className="sr-only"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
            />
            <div className={`block h-7 w-12 rounded-full transition-colors ${autoplay ? "bg-brand-500" : "bg-ink-300 dark:bg-ink-600"}`}></div>
            <div className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${autoplay ? "translate-x-5" : ""}`}></div>
          </div>
        </label>
      </div>
      <SaveBtn />
    </form>
  );
}
