"use client";

import { Globe } from "lucide-react";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addLanguageAction } from "./actions";

type Lang = { id: string; code: string; name: string };
const FLAGS: Record<string, string> = { id: "🇮🇩", en: "🇬🇧", ja: "🇯🇵", zh: "🇨🇳" };
const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full" disabled={pending}>
      {pending ? "Adding…" : "Add & switch →"}
    </button>
  );
}

export function AddLanguageForm({ languages }: { languages: Lang[] }) {
  const [state, action] = useFormState(addLanguageAction, undefined);
  const [selected, setSelected] = useState("");

  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {languages.map((l) => (
          <label
            key={l.id}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 transition ${
              selected === l.id
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                : "border-ink-200 bg-white hover:border-ink-300 dark:border-ink-700 dark:bg-ink-800"
            }`}
          >
            <input
              type="radio"
              name="languageId"
              value={l.id}
              className="sr-only"
              onChange={() => setSelected(l.id)}
              checked={selected === l.id}
            />
              <span className="text-xl">{FLAGS[l.code] ?? "🌐"}</span>
            <span className="font-medium text-ink-800 dark:text-ink-100">{l.name}</span>
          </label>
        ))}
      </div>

      <select name="level" className="input">
        <option value="">Select your level…</option>
        {LEVELS.map((lv) => (
          <option key={lv.value} value={lv.value}>{lv.label}</option>
        ))}
      </select>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitBtn />
    </form>
  );
}
