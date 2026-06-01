"use client";

import { Globe, Plane, GraduationCap, Briefcase, Palette, Sprout, Leaf, TreeDeciduous, Coffee, BookOpen, Dumbbell, Flame, Sparkles, Rocket, AlertTriangle } from "lucide-react";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { completeOnboarding, type OnboardingState } from "./actions";

type Lang = { id: string; code: string; name: string };

const FLAGS: Record<string, string> = { id: "🇮🇩", en: "🇬🇧", ja: "🇯🇵", zh: "🇨🇳" };

const GOALS = [
  { value: "travel", label: "Traveling", emoji: <Plane className="w-6 h-6" />, desc: "For adventures abroad" },
  { value: "education", label: "Education", emoji: <GraduationCap className="w-6 h-6" />, desc: "Academic purposes" },
  { value: "career", label: "Career / Work", emoji: <Briefcase className="w-6 h-6" />, desc: "Professional growth" },
  { value: "hobby", label: "Hobby", emoji: <Palette className="w-6 h-6" />, desc: "Just for fun!" },
];

const LEVELS = [
  { value: "beginner", label: "Beginner", desc: "Just starting out", emoji: <Sprout className="w-6 h-6" /> },
  { value: "intermediate", label: "Intermediate", desc: "I know the basics", emoji: <Leaf className="w-6 h-6" /> },
  { value: "advanced", label: "Advanced", desc: "I'm fairly confident", emoji: <TreeDeciduous className="w-6 h-6" /> },
];

const TARGETS = [
  { min: 10, label: "Casual", emoji: <Coffee className="w-6 h-6" />, desc: "10 min / day" },
  { min: 20, label: "Regular", emoji: <BookOpen className="w-6 h-6" />, desc: "20 min / day" },
  { min: 30, label: "Serious", emoji: <Dumbbell className="w-6 h-6" />, desc: "30 min / day" },
  { min: 60, label: "Intense", emoji: <Flame className="w-6 h-6" />, desc: "60 min / day" },
];

const STEP_TITLES = [
  "Which language do you want to learn?",
  "What's your goal?",
  "What's your current level?",
  "How much time per day?",
];

const STEP_SUBTITLES = [
  "Choose the language you'd like to master",
  "This helps us customize your content",
  "We'll adjust the difficulty for you",
  "Set a daily goal that works for you",
];

function Option({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 border-b-4 p-4 text-left transition-all active:border-b-2 active:translate-y-[1px] ${
        active
          ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950"
          : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50 dark:border-ink-600 dark:bg-ink-800 dark:hover:border-ink-500"
      }`}
    >
      {children}
    </button>
  );
}

function FinishButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary px-8 py-3" disabled={pending}>
      {pending ? <><span className="mr-2">Building your path…</span><Sparkles className="w-5 h-5 inline-block" /></> : <><span className="mr-2">Start learning!</span><Rocket className="w-5 h-5 inline-block" /></>}
    </button>
  );
}

export function OnboardingWizard({ languages }: { languages: Lang[] }) {
  const [state, formAction] = useFormState<OnboardingState, FormData>(completeOnboarding, undefined);
  const [step, setStep] = useState(0);
  const [languageId, setLanguageId] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [target, setTarget] = useState(0);

  const canNext = [Boolean(languageId), Boolean(goal), Boolean(level), target > 0][step];
  const isLast = step === 3;

  return (
    <form action={formAction} className="card-fun border-2 border-ink-200 dark:border-ink-700">
      {/* Step progress */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
          Step {step + 1} of 4
        </span>
        <span className="text-xs font-bold text-brand-500">
          {Math.round(((step + 1) / 4) * 100)}%
        </span>
      </div>
      <div className="mb-6 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? "bg-brand-500" : "bg-ink-200 dark:bg-ink-700"
            }`}
          />
        ))}
      </div>

      {/* Step title */}
      <h2 className="mb-1 text-xl font-black text-ink-800 dark:text-white">
        {STEP_TITLES[step]}
      </h2>
      <p className="mb-5 text-sm font-semibold text-ink-400">
        {STEP_SUBTITLES[step]}
      </p>

      {/* hidden fields carry the selection into the server action */}
      <input type="hidden" name="languageId" value={languageId} />
      <input type="hidden" name="goal" value={goal} />
      <input type="hidden" name="level" value={level} />
      <input type="hidden" name="dailyTargetMin" value={target || ""} />

      {step === 0 && (
        <div className="grid grid-cols-2 gap-3">
          {languages.map((l) => (
            <Option key={l.id} active={languageId === l.id} onClick={() => setLanguageId(l.id)}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{FLAGS[l.code] ?? "🌐"}</span>
                <span className="text-base font-black">{l.name}</span>
              </div>
            </Option>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((g) => (
            <Option key={g.value} active={goal === g.value} onClick={() => setGoal(g.value)}>
              <div className="text-center">
                <span className="text-3xl">{g.emoji}</span>
                <div className="mt-2 text-sm font-black">{g.label}</div>
                <div className="text-xs font-semibold text-ink-400">{g.desc}</div>
              </div>
            </Option>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {LEVELS.map((lv) => (
            <Option key={lv.value} active={level === lv.value} onClick={() => setLevel(lv.value)}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lv.emoji}</span>
                <div>
                  <div className="font-black">{lv.label}</div>
                  <div className="text-sm font-semibold text-ink-500">{lv.desc}</div>
                </div>
              </div>
            </Option>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-2 gap-3">
          {TARGETS.map((t) => (
            <Option key={t.min} active={target === t.min} onClick={() => setTarget(t.min)}>
              <div className="text-center">
                <span className="text-3xl">{t.emoji}</span>
                <div className="mt-2 text-sm font-black">{t.label}</div>
                <div className="text-xs font-semibold text-ink-400">{t.desc}</div>
              </div>
            </Option>
          ))}
        </div>
      )}

      {state?.error && (
        <div className="mt-4 rounded-xl border-2 border-heart-200 bg-heart-50 p-3 text-sm font-bold text-heart-600 dark:border-heart-800 dark:bg-heart-950 dark:text-heart-400">
          <AlertTriangle className="w-5 h-5 inline-block mr-2" /> {state.error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          ← Back
        </button>
        {isLast ? (
          <FinishButton />
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
          >
            Next →
          </button>
        )}
      </div>
    </form>
  );
}
