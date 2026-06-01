"use client";

import { useTransition } from "react";
import { startConversation } from "./actions";
import type { ConversationScenario } from "@/lib/ai";
import { GraduationCap, ShoppingBag, Utensils, Hotel, Plane, Briefcase, Lock } from "lucide-react";

export function ScenarioButton({
  scenario,
  title,
  emoji,
  unlocked,
  requiredSkills,
}: {
  scenario: ConversationScenario;
  title: string;
  emoji: string;
  unlocked: boolean;
  requiredSkills: number;
}) {
  const [pending, startTransition] = useTransition();

  const IconMap: Record<string, any> = { GraduationCap, ShoppingBag, Utensils, Hotel, Plane, Briefcase };
  const Icon = IconMap[emoji] || GraduationCap;

  if (!unlocked) {
    return (
      <div className="card flex flex-col items-center gap-2 py-6 opacity-50 select-none" title={`Complete ${requiredSkills} skill${requiredSkills !== 1 ? "s" : ""} to unlock`}>
        <Icon className="w-8 h-8 grayscale text-ink-500" />
        <span className="font-semibold text-ink-600 dark:text-ink-400">{title}</span>
        <span className="text-xs text-ink-400 dark:text-ink-500"><Lock className="w-3 h-3 inline-block -mt-0.5" /> {requiredSkills} skill{requiredSkills !== 1 ? "s" : ""}</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => startTransition(() => startConversation(scenario))}
      disabled={pending}
      className="card flex flex-col items-center gap-2 py-6 transition hover:border-brand-300 hover:bg-brand-50 dark:hover:border-ink-600 dark:hover:bg-ink-800 disabled:opacity-50"
    >
      <Icon className="w-8 h-8 text-brand-500" />
      <span className="font-semibold">{title}</span>
    </button>
  );
}
