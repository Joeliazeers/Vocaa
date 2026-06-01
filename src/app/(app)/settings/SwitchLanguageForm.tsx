"use client";

import { useTransition } from "react";
import { switchLanguageAction } from "./actions";

export function SwitchLanguageForm({ languageId }: { languageId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await switchLanguageAction(languageId); })}
      disabled={pending}
      className="chip bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-200 dark:hover:bg-ink-600 transition"
    >
      {pending ? "Switching…" : "Switch to"}
    </button>
  );
}
