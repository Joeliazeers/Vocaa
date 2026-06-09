"use client";

import {
  HelpCircle, Compass, Target, Book, Edit3, BookOpen, MessageCircle,
  Brain, PartyPopper, Dumbbell, ArrowUpCircle, Medal, Volume2,
  Lightbulb, CheckSquare, Layers, Globe,
} from "lucide-react";
import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { submitModuleQuiz, type ModuleResult } from "./actions";
import { triggerCelebrations } from "@/components/Celebration";
import { AudioButton } from "@/components/AudioButton";
import { playSoundSuccess, playSoundWrong } from "@/lib/sounds";

type Vocab = { term: string; reading: string; meaning: string; example: string };
type DialogueLine = { speaker: string; text: string; translation: string };
type Question = { id: string; prompt: string; options: string[]; type?: string; answerData?: string };
type PatternEx = { pattern: string; examples: string[] };

// Speaker → side + color mapping
const SPEAKER_STYLE: Record<string, { side: "left" | "right"; bubble: string; label: string }> = {
  "ハナ":    { side: "left",  bubble: "bg-brand-50 border-brand-200 dark:bg-brand-950 dark:border-brand-800",  label: "bg-brand-500 text-white" },
  "キム":    { side: "left",  bubble: "bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800",          label: "bg-sky-500 text-white" },
  "サトウ":  { side: "right", bubble: "bg-sun-50 border-sun-200 dark:bg-ink-800 dark:border-sun-800",          label: "bg-sun-500 text-white" },
  "せんせい":{ side: "right", bubble: "bg-amethyst-50 border-amethyst-200 dark:bg-ink-800 dark:border-amethyst-800", label: "bg-amethyst-500 text-white" },
  "A":       { side: "left",  bubble: "bg-brand-50 border-brand-200 dark:bg-brand-950 dark:border-brand-800",  label: "bg-brand-500 text-white" },
  "B":       { side: "right", bubble: "bg-sun-50 border-sun-200 dark:bg-ink-800 dark:border-sun-800",          label: "bg-sun-500 text-white" },
  "Waiter":  { side: "right", bubble: "bg-sun-50 border-sun-200 dark:bg-ink-800 dark:border-sun-800",          label: "bg-sun-500 text-white" },
  "Customer":{ side: "left",  bubble: "bg-brand-50 border-brand-200 dark:bg-brand-950 dark:border-brand-800",  label: "bg-brand-500 text-white" },
};
const DEFAULT_SPEAKER = { side: "left" as const, bubble: "bg-ink-50 border-ink-200 dark:bg-ink-800 dark:border-ink-700", label: "bg-ink-400 text-white" };

function getSpeakerStyle(name: string) {
  return SPEAKER_STYLE[name] ?? DEFAULT_SPEAKER;
}

export function ModulePlayer({
  moduleId, objectives, warmUp, canDo, vocabulary, grammar, reading,
  dialogue, patternExamples, cultureNote, questions, langCode = "en", showFurigana = true,
}: {
  moduleId: string;
  objectives: string[];
  warmUp: string;
  canDo: string[];
  vocabulary: Vocab[];
  grammar: string;
  reading: string;
  dialogue: DialogueLine[];
  patternExamples: PatternEx[];
  cultureNote: string;
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

  // Build dynamic step list based on available content
  const steps = useMemo(() => {
    const s: Array<{ key: string; label: string }> = [];
    if (warmUp)                  s.push({ key: "warmup",   label: "Warm-up" });
    if (canDo.length > 0)        s.push({ key: "cando",    label: "Can-do" });
    if (dialogue.length > 0)     s.push({ key: "dialogue", label: "Dialogue" });
    if (vocabulary.length > 0)   s.push({ key: "vocab",    label: "Vocabulary" });
    if (patternExamples.length > 0) s.push({ key: "pattern", label: "Pattern" });
    if (grammar)                 s.push({ key: "grammar",  label: "Grammar" });
    if (reading)                 s.push({ key: "reading",  label: "Reading" });
    if (cultureNote)             s.push({ key: "culture",  label: "Culture" });
    s.push({ key: "quiz", label: "Quiz" });
    // Fallback: if nothing before quiz, add objectives
    if (s.length === 1 && objectives.length > 0) s.unshift({ key: "objectives", label: "Objectives" });
    return s;
  }, [warmUp, canDo, dialogue, vocabulary, patternExamples, grammar, reading, cultureNote, objectives]);

  const currentStep = steps[step];
  const isQuiz = currentStep?.key === "quiz";

  const allAnswered = answers.every((a, i) => {
    const q = questions[i];
    if (!q) return false;
    if (!q.type || q.type === "multiple_choice") return typeof a === "number" && a >= 0;
    if (q.type === "fill_blank") return typeof a === "string" && a.trim().length > 0;
    if (q.type === "matching") return Array.isArray(a) && a.length === q.options.length;
    if (q.type === "reorder") return Array.isArray(a) && a.length === q.options.length;
    return false;
  });

  function submit() {
    startTransition(async () => {
      const r = await submitModuleQuiz(moduleId, answers);
      if (r.passed) playSoundSuccess(); else playSoundWrong();
      triggerCelebrations(r);
      setResult(r);
    });
  }

  if (result) {
    return <ResultView result={result} onRetry={() => { setResult(null); setAnswers(Array(questions.length).fill(null)); setStep(steps.length - 1); }} />;
  }

  return (
    <div>
      {/* Stepper */}
      <div className="mb-2 flex gap-1">
        {steps.map((s, i) => (
          <div
            key={s.key}
            title={s.label}
            className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-brand-500" : "bg-ink-200 dark:bg-ink-700"}`}
          />
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-ink-500 dark:text-ink-400">
          {step + 1}/{steps.length} · <span className="text-brand-600 dark:text-brand-400">{currentStep?.label}</span>
        </p>
        <button
          type="button"
          onClick={() => setShowHelp(h => !h)}
          className="flex items-center gap-1 rounded-lg border-2 border-ink-200 px-2 py-1 text-xs font-bold text-ink-500 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800"
          aria-expanded={showHelp}
        >
          <HelpCircle className="w-4 h-4" /> How it works
        </button>
      </div>

      {showHelp && (
        <div className="mb-4 rounded-xl border-2 border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-800 dark:bg-sky-950">
          <p className="font-bold text-sky-700 dark:text-sky-300">Lesson flow <Compass className="w-4 h-4 inline-block ml-1" /></p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sky-800 dark:text-sky-200">
            <li>Warm-up activates what you already know.</li>
            <li>Can-do shows what you'll be able to do today.</li>
            <li>Dialogue introduces vocabulary in real context — listen first!</li>
            <li>Vocabulary & Pattern help you understand the building blocks.</li>
            <li>Culture gives you the "why" behind the language.</li>
            <li>Quiz checks what you've learned. 60%+ to pass!</li>
          </ol>
        </div>
      )}

      <div className="card min-h-[300px]">

        {/* ── Warm-up ─────────────────────────────────────────────── */}
        {currentStep?.key === "warmup" && (
          <Section title={<><Lightbulb className="w-5 h-5 inline-block mr-2 text-sun-500" />Warm-up</>}>
            <div className="rounded-xl border-2 border-sun-200 bg-sun-50 p-4 dark:border-sun-800 dark:bg-ink-800">
              <p className="text-sm font-semibold text-sun-700 dark:text-sun-300 mb-3">Think about this before we start:</p>
              <p className="text-base font-medium text-ink-800 dark:text-ink-100 leading-relaxed">{warmUp}</p>
            </div>
            <p className="mt-4 text-sm text-ink-400 italic">There's no right or wrong answer — just get your thoughts flowing!</p>
          </Section>
        )}

        {/* ── Can-do ──────────────────────────────────────────────── */}
        {currentStep?.key === "cando" && (
          <Section title={<><CheckSquare className="w-5 h-5 inline-block mr-2 text-green-500" />Today's Goals</>}>
            <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">After this lesson, you will be able to:</p>
            <ul className="space-y-3">
              {canDo.map((item, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">{i + 1}</span>
                  <span className="font-medium text-green-800 dark:text-green-200">{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Dialogue ────────────────────────────────────────────── */}
        {currentStep?.key === "dialogue" && (
          <Section title={<><MessageCircle className="w-5 h-5 inline-block mr-2" />Dialogue</>}>
            <p className="mb-4 text-xs text-ink-400 dark:text-ink-500 italic">Read the conversation — tap <Volume2 className="w-3.5 h-3.5 inline-block" /> to hear each line.</p>
            <div className="space-y-3">
              {dialogue.map((d, i) => {
                const style = getSpeakerStyle(d.speaker);
                return (
                  <div
                    key={i}
                    className={`flex flex-col gap-0.5 ${style.side === "right" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${style.label}`}>{d.speaker}</span>
                      <AudioButton text={d.text} langCode={langCode} size="sm" />
                    </div>
                    <div className={`max-w-[85%] rounded-2xl border-2 px-4 py-2.5 ${style.bubble}`}>
                      <p className="font-semibold text-ink-800 dark:text-ink-100 text-sm sm:text-base">{d.text}</p>
                      {d.translation && (
                        <p className="mt-1 text-xs text-ink-400 dark:text-ink-500 italic">{d.translation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Vocabulary ──────────────────────────────────────────── */}
        {currentStep?.key === "vocab" && (
          <Section title={<><Book className="w-5 h-5 inline-block mr-2" />Vocabulary</>}>
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {vocabulary.map((v, i) => (
                <li key={i} className="py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{v.term}</span>
                      {showFurigana && v.reading && (
                        <span className="text-sm text-ink-400 dark:text-ink-500">[{v.reading}]</span>
                      )}
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

        {/* ── Pattern ─────────────────────────────────────────────── */}
        {currentStep?.key === "pattern" && (
          <Section title={<><Layers className="w-5 h-5 inline-block mr-2 text-amethyst-500" />Grammar Pattern</>}>
            <div className="space-y-5">
              {patternExamples.map((p, i) => (
                <div key={i}>
                  <div className="rounded-xl border-2 border-amethyst-300 bg-amethyst-50 px-4 py-3 dark:border-amethyst-700 dark:bg-ink-800">
                    <code className="font-mono text-base font-bold text-amethyst-700 dark:text-amethyst-300 whitespace-pre-wrap">{p.pattern}</code>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {p.examples.map((ex, j) => (
                      <li key={j} className="flex items-start gap-2 rounded-lg bg-ink-50 px-3 py-2 dark:bg-ink-800">
                        <span className="mt-0.5 text-amethyst-400">→</span>
                        <span className="text-sm text-ink-700 dark:text-ink-200">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Grammar ─────────────────────────────────────────────── */}
        {currentStep?.key === "grammar" && (
          <Section title={<><Edit3 className="w-5 h-5 inline-block mr-2" />Grammar Notes</>}>
            <p className="whitespace-pre-line leading-relaxed text-ink-700 dark:text-ink-300">{grammar}</p>
          </Section>
        )}

        {/* ── Reading ─────────────────────────────────────────────── */}
        {currentStep?.key === "reading" && (
          <Section title={<><BookOpen className="w-5 h-5 inline-block mr-2" />Reading</>}>
            <p className="whitespace-pre-line leading-relaxed text-ink-700 dark:text-ink-300">{reading}</p>
          </Section>
        )}

        {/* ── Culture Note ────────────────────────────────────────── */}
        {currentStep?.key === "culture" && (
          <Section title={<><Globe className="w-5 h-5 inline-block mr-2 text-sky-500" />Culture Note</>}>
            <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950">
              <p className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed whitespace-pre-line">{cultureNote}</p>
            </div>
          </Section>
        )}

        {/* ── Objectives fallback ──────────────────────────────────── */}
        {currentStep?.key === "objectives" && (
          <Section title={<><Target className="w-5 h-5 inline-block mr-2" />Learning Objectives</>}>
            <ul className="list-inside list-disc space-y-1.5 text-ink-700 dark:text-ink-300">
              {objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </Section>
        )}

        {/* ── Quiz ────────────────────────────────────────────────── */}
        {isQuiz && (
          <Section title={<><Brain className="w-5 h-5 inline-block mr-2" />Quiz</>}>
            <p className="mb-4 text-sm font-semibold text-ink-400">Answer all questions to submit.</p>
            <div className="space-y-8">
              {questions.map((q, qi) => {
                const ans = answers[qi];
                const qtype = q.type ?? "multiple_choice";
                return (
                  <fieldset key={q.id}>
                    <legend className="mb-2 font-medium">{qi + 1}. {q.prompt}</legend>

                    {qtype === "multiple_choice" && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((opt: string, oi: number) => (
                          <button
                            key={oi} type="button"
                            onClick={() => setAnswers(a => a.map((v, i) => i === qi ? oi : v))}
                            aria-pressed={ans === oi}
                            className={`min-h-[48px] rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${
                              ans === oi
                                ? "border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-950 dark:text-brand-200"
                                : "border-ink-200 hover:border-ink-300 dark:border-ink-700 dark:hover:border-ink-500 dark:text-ink-200"
                            }`}
                          >{opt}</button>
                        ))}
                      </div>
                    )}

                    {qtype === "fill_blank" && (
                      <input
                        className="input w-full"
                        value={ans || ""}
                        onChange={e => setAnswers(a => a.map((v, i) => i === qi ? e.target.value : v))}
                        placeholder="Type your answer…"
                      />
                    )}

                    {qtype === "reorder" && (
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2 min-h-[48px] rounded-xl border-2 border-dashed border-ink-200 p-2 dark:border-ink-700">
                          {(ans || []).map((idx: number, ai: number) => (
                            <button key={`ans-${ai}`}
                              onClick={() => setAnswers(a => a.map((v, i) => i === qi ? v.filter((_: any, j: number) => j !== ai) : v))}
                              className="chip bg-brand-500 text-white font-semibold">
                              {q.options[idx]}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt: string, oi: number) => {
                            const isUsed = (ans || []).includes(oi);
                            return (
                              <button key={`opt-${oi}`} disabled={isUsed}
                                onClick={() => setAnswers(a => a.map((v, i) => i === qi ? [...(v || []), oi] : v))}
                                className={`chip border-2 border-ink-200 bg-white font-semibold ${isUsed ? "opacity-30" : "hover:border-brand-300 dark:bg-ink-900"}`}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {qtype === "matching" && (
                      <MatchingQuestion
                        options={q.options as unknown as [string, string][]}
                        value={ans || []}
                        onChange={val => setAnswers(a => a.map((v, i) => i === qi ? val : v))}
                      />
                    )}
                  </fieldset>
                );
              })}
            </div>
          </Section>
        )}
      </div>

      {/* Nav */}
      <div className="mt-4 flex items-center justify-between">
        <button className="btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
          ← Back
        </button>
        {isQuiz ? (
          <button className="btn-primary" onClick={submit} disabled={!allAnswered || pending}>
            {pending ? "Checking…" : "Submit quiz"}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
            Next →
          </button>
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

function ResultView({ result, onRetry }: { result: ModuleResult; onRetry: () => void }) {
  return (
    <div className="card text-center">
      <div className="text-5xl">{result.passed ? <PartyPopper className="w-12 h-12 text-green-500" /> : <Dumbbell className="w-12 h-12 text-brand-500" />}</div>
      <h2 className="mt-3 text-2xl font-extrabold">{result.passed ? "Module complete!" : "Almost there!"}</h2>
      <p className="mt-1 text-ink-500">Score: {result.score}% ({result.correctCount}/{result.total})</p>

      {result.xpAwarded > 0 && (
        <p className="mt-3 inline-block rounded-full bg-brand-100 px-4 py-1.5 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          +{result.xpAwarded} XP {result.leveledUp && <><span className="mx-2">·</span>Level up! <ArrowUpCircle className="w-5 h-5 inline-block ml-1 text-brand-500" /></>}
        </p>
      )}

      {result.newAchievements.length > 0 && (
        <div className="mt-3 space-y-1">
          {result.newAchievements.map(a => (
            <p key={a} className="text-sm font-medium text-amber-600 dark:text-amber-400"><Medal className="w-4 h-4 inline-block mr-1" />Achievement: {a}</p>
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
          <p className="mt-2 text-xs text-ink-400">Added to your Error Journal.</p>
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
            <select className="input flex-1" value={rightIndex}
              onChange={e => {
                const newRight = parseInt(e.target.value);
                const newValue = value.filter(v => v[0] !== leftIndex);
                if (newRight !== -1) newValue.push([leftIndex, newRight]);
                newValue.sort((a, b) => a[0] - b[0]);
                onChange(newValue);
              }}
            >
              <option value="-1">-- Select --</option>
              {rightItems.map(item => <option key={item.index} value={item.index}>{item.text}</option>)}
            </select>
          </div>
        );
      })}
    </div>
  );
}
