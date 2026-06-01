"use client";

import { HelpCircle, Compass, Target, Book, Edit3, BookOpen, MessageCircle, Brain, PartyPopper, Dumbbell, ArrowUpCircle, Medal, Volume2 } from "lucide-react";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitModuleQuiz, type ModuleResult } from "./actions";
import { triggerCelebrations } from "@/components/Celebration";
import { AudioButton } from "@/components/AudioButton";
import { playSoundSuccess, playSoundWrong } from "@/lib/sounds";

type Vocab = { term: string; reading: string; meaning: string; example: string };
type DialogueLine = { speaker: string; text: string; translation: string };
type Question = { id: string; prompt: string; options: string[]; type?: string; answerData?: string };

const STEPS = ["Objectives", "Vocabulary", "Grammar", "Reading", "Dialogue", "Quiz"] as const;

export function ModulePlayer({
  moduleId,
  objectives,
  vocabulary,
  grammar,
  reading,
  dialogue,
  questions,
  xpReward,
  langCode = "en",
  showFurigana = true,
}: {
  moduleId: string;
  objectives: string[];
  vocabulary: Vocab[];
  grammar: string;
  reading: string;
  dialogue: DialogueLine[];
  questions: Question[];
  xpReward: number;
  langCode?: string;
  showFurigana?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>(Array(questions.length).fill(null));
  const [result, setResult] = useState<ModuleResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [pending, startTransition] = useTransition();

  const isQuiz = step === STEPS.length - 1;
  const allAnswered = answers.every((a, i) => {
    const q = questions[i];
    if (!q) return false;
    if (q.type === "multiple_choice") return typeof a === "number" && a >= 0;
    if (q.type === "fill_blank") return typeof a === "string" && a.trim().length > 0;
    if (q.type === "matching") return Array.isArray(a) && a.length === q.options.length;
    if (q.type === "reorder") return Array.isArray(a) && a.length === q.options.length;
    return false;
  });

  function submit() {
    startTransition(async () => {
      const r = await submitModuleQuiz(moduleId, answers);
      if (r.passed) playSoundSuccess();
      else playSoundWrong();
      triggerCelebrations(r);
      setResult(r);
    });
  }

  if (result) {
    return <ResultView result={result} xpReward={xpReward} onRetry={() => { setResult(null); setAnswers(Array(questions.length).fill(null)); setStep(STEPS.length - 1); }} />;
  }

  return (
    <div>
      {/* Stepper */}
      <div className="mb-2 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-brand-500" : "bg-ink-200 dark:bg-ink-700"}`}
          />
        ))}
      </div>

      {/* Current step name + help toggle */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-ink-500 dark:text-ink-400">
          Step {step + 1} of {STEPS.length} · <span className="text-brand-600 dark:text-brand-400">{STEPS[step]}</span>
        </p>
        <button
          type="button"
          onClick={() => setShowHelp((h) => !h)}
          className="flex items-center gap-1 rounded-lg border-2 border-ink-200 px-2 py-1 text-xs font-bold text-ink-500 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800"
          aria-expanded={showHelp}
          aria-label="How does this lesson work?"
        >
          <HelpCircle className="w-5 h-5 inline-block mr-2" /> How it works
        </button>
      </div>

      {/* Inline help for absolute beginners */}
      {showHelp && (
        <div className="mb-4 rounded-xl border-2 border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-800 dark:bg-sky-950">
          <p className="font-bold text-sky-700 dark:text-sky-300">How a lesson works <Compass className="w-5 h-5 inline-block ml-2" /></p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sky-800 dark:text-sky-200">
            <li>Read through each step: vocabulary, grammar, reading and a dialogue.</li>
            <li>Tap the <Volume2 className="w-4 h-4 inline-block" /> button to hear how words sound.</li>
            <li>At the end, answer the quiz - pick one option per question.</li>
            <li>Pass the quiz to complete the module, earn XP and unlock the next one!</li>
          </ol>
          <p className="mt-2 text-xs font-semibold text-sky-600 dark:text-sky-400">Tip: use “← Back” and “Next →” to move between steps anytime.</p>
        </div>
      )}

      <div className="card min-h-[280px]">
        {step === 0 && (
          <Section title={<><Target className="w-5 h-5 inline-block mr-2" /> Learning objectives</>}>
            <ul className="list-inside list-disc space-y-1.5 text-ink-700 dark:text-ink-300">
              {objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </Section>
        )}

        {step === 1 && (
          <Section title={<><Book className="w-5 h-5 inline-block mr-2" /> Vocabulary</>}>
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {vocabulary.map((v, i) => (
                <li key={i} className="py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{v.term}</span>
                      {showFurigana && v.reading && <span className="text-sm text-ink-400">[{v.reading}]</span>}
                    </div>
                    <AudioButton text={v.term} langCode={langCode} size="sm" />
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-brand-600 dark:text-brand-400">{v.meaning}</p>
                  {v.example && <p className="mt-0.5 text-xs text-ink-400 italic">{v.example}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {step === 2 && (
          <Section title={<><Edit3 className="w-5 h-5 inline-block mr-2" /> Grammar</>}>
            <p className="whitespace-pre-line leading-relaxed text-ink-700 dark:text-ink-300">{grammar}</p>
          </Section>
        )}

        {step === 3 && (
          <Section title={<><BookOpen className="w-5 h-5 inline-block mr-2" /> Reading</>}>
            <p className="whitespace-pre-line leading-relaxed text-ink-700 dark:text-ink-300">{reading}</p>
          </Section>
        )}

        {step === 4 && (
          <Section title={<><MessageCircle className="w-5 h-5 inline-block mr-2" /> Example dialogue</>}>
            <div className="space-y-3">
              {dialogue.map((d, i) => (
                <div key={i} className="rounded-xl bg-ink-50 p-3 dark:bg-ink-800">
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{d.speaker}</p>
                  <p className="font-medium text-ink-800 dark:text-ink-100">{d.text}</p>
                  <p className="text-sm text-ink-400">{d.translation}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {isQuiz && (
          <Section title={<><Brain className="w-5 h-5 inline-block mr-2" /> Quiz</>}>
            <p className="mb-4 text-sm font-semibold text-ink-400">Answer the following questions.</p>
            <div className="space-y-8">
              {questions.map((q, qi) => {
                const ans = answers[qi];
                return (
                  <fieldset key={q.id}>
                    <legend className="mb-2 font-medium">{qi + 1}. {q.prompt}</legend>
                    
                    {q.type === "multiple_choice" && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((opt: string, oi: number) => (
                          <button
                            key={oi}
                            type="button"
                            onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                            aria-pressed={ans === oi}
                            className={`min-h-[48px] rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${
                              ans === oi
                                ? "border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-950 dark:text-brand-200"
                                : "border-ink-200 hover:border-ink-300 dark:border-ink-700 dark:hover:border-ink-500 dark:text-ink-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === "fill_blank" && (
                      <input 
                        className="input w-full"
                        value={ans || ""}
                        onChange={(e) => setAnswers((a) => a.map((v, i) => (i === qi ? e.target.value : v)))}
                        placeholder="Type your answer here..."
                      />
                    )}

                    {q.type === "reorder" && (
                      <div>
                        {/* User's assembled sentence */}
                        <div className="mb-3 flex flex-wrap gap-2 min-h-[48px] rounded-xl border-2 border-dashed border-ink-200 p-2 dark:border-ink-700">
                          {(ans || []).map((idx: number, ai: number) => (
                            <button 
                              key={`ans-${ai}`}
                              onClick={() => setAnswers(a => a.map((v, i) => i === qi ? v.filter((_: any, j: number) => j !== ai) : v))}
                              className="chip bg-brand-500 text-white font-semibold"
                            >
                              {q.options[idx]}
                            </button>
                          ))}
                        </div>
                        {/* Available word bank */}
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt: string, oi: number) => {
                            const isUsed = (ans || []).includes(oi);
                            return (
                              <button
                                key={`opt-${oi}`}
                                disabled={isUsed}
                                onClick={() => setAnswers(a => a.map((v, i) => i === qi ? [...(v || []), oi] : v))}
                                className={`chip border-2 border-ink-200 bg-white font-semibold ${isUsed ? "opacity-30" : "hover:border-brand-300 dark:bg-ink-900"}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {q.type === "matching" && (
                      <MatchingQuestion
                        options={q.options as unknown as [string, string][]}
                        value={ans || []}
                        onChange={(val) => setAnswers(a => a.map((v, i) => i === qi ? val : v))}
                      />
                    )}

                  </fieldset>
                );
              })}
            </div>
          </Section>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="btn-secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ← Back
        </button>
        {isQuiz ? (
          <button className="btn-primary" onClick={submit} disabled={!allAnswered || pending}>
            {pending ? "Checking…" : "Submit quiz"}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>Next →</button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}

function ResultView({
  result,
  xpReward,
  onRetry,
}: {
  result: ModuleResult;
  xpReward: number;
  onRetry: () => void;
}) {
  return (
    <div className="card text-center">
      <div className="text-5xl">{result.passed ? <PartyPopper className="w-12 h-12 text-green-500" /> : <Dumbbell className="w-12 h-12 text-brand-500" />}</div>
      <h2 className="mt-3 text-2xl font-extrabold">
        {result.passed ? "Module complete!" : "Almost there!"}
      </h2>
      <p className="mt-1 text-ink-500">
        You scored {result.score}% ({result.correctCount}/{result.total} correct)
      </p>

      {result.xpAwarded > 0 && (
        <p className="mt-3 inline-block rounded-full bg-brand-100 px-4 py-1.5 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          +{result.xpAwarded} XP {result.leveledUp && <><span className="mx-2">·</span>Level up! <ArrowUpCircle className="w-5 h-5 inline-block ml-1 text-brand-500" /></>}
        </p>
      )}

      {result.newAchievements.length > 0 && (
        <div className="mt-3 space-y-1">
          {result.newAchievements.map((a) => (
            <p key={a} className="text-sm font-medium text-amber-600 dark:text-amber-400"><Medal className="w-4 h-4 inline-block mr-1" /> Achievement unlocked: {a}</p>
          ))}
        </div>
      )}

      {result.wrong.length > 0 && (
        <div className="mt-5 text-left">
          <p className="mb-2 text-sm font-semibold text-ink-600 dark:text-ink-300">Review your mistakes:</p>
          <ul className="space-y-2">
            {result.wrong.map((w, i) => (
              <li key={i} className="rounded-xl bg-red-50 p-3 text-sm dark:bg-red-950">
                <p className="font-medium text-ink-700 dark:text-ink-200">{w.prompt}</p>
                <p className="text-red-600 dark:text-red-400">Your answer: {w.yourAnswer}</p>
                <p className="text-green-700 dark:text-green-400">Correct: {w.correct}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-400">These were added to your Error Journal.</p>
        </div>
      )}

      <div className="mt-6 flex justify-center gap-3">
        {!result.passed && <button className="btn-secondary" onClick={onRetry}>Try again</button>}
        <Link href="/learn" className="btn-secondary">Skill tree</Link>
        <Link href="/dashboard" className="btn-primary">Dashboard</Link>
      </div>
    </div>
  );
}

function MatchingQuestion({ options, value, onChange }: { options: [string, string][]; value: [number, number][]; onChange: (v: [number, number][]) => void }) {
  // Sort alphabetically to scramble the right side
  const rightItems = options.map((pair, i) => ({ text: pair[1], index: i })).sort((a, b) => a.text.localeCompare(b.text));

  return (
    <div className="space-y-3">
      {options.map((pair, leftIndex) => {
        const currentMatch = value.find(v => v[0] === leftIndex);
        const rightIndex = currentMatch ? currentMatch[1] : -1;
        
        return (
          <div key={leftIndex} className="flex items-center gap-3 rounded-xl border-2 border-ink-200 p-3 dark:border-ink-700">
            <span className="flex-1 font-semibold">{pair[0]}</span>
            <span className="text-ink-400">→</span>
            <select 
              className="input flex-1" 
              value={rightIndex}
              onChange={(e) => {
                const newRight = parseInt(e.target.value);
                const newValue = value.filter(v => v[0] !== leftIndex);
                if (newRight !== -1) {
                  newValue.push([leftIndex, newRight]);
                }
                newValue.sort((a, b) => a[0] - b[0]);
                onChange(newValue);
              }}
            >
              <option value="-1">-- Select --</option>
              {rightItems.map(item => (
                <option key={item.index} value={item.index}>{item.text}</option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}
