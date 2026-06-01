"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateDailyTargetAction } from "./actions";

const TARGETS = [10, 20, 30, 60];

function SaveBtn() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}

export function DailyTargetForm({ current }: { current: number }) {
  const [state, action] = useFormState(updateDailyTargetAction, undefined);
  const [selected, setSelected] = useState(current);

  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {TARGETS.map((t) => (
          <label
            key={t}
            className={`flex cursor-pointer flex-col items-center rounded-xl border-2 p-3 transition ${
              selected === t
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                : "border-ink-200 bg-white hover:border-ink-300 dark:border-ink-700 dark:bg-ink-800"
            }`}
          >
            <input
              type="radio"
              name="dailyTargetMin"
              value={t}
              className="sr-only"
              checked={selected === t}
              onChange={() => setSelected(t)}
            />
            <span className="text-lg font-bold text-ink-800 dark:text-ink-100">{t}</span>
            <span className="text-xs text-ink-500">min</span>
          </label>
        ))}
      </div>
      <SaveBtn />
    </form>
  );
}
