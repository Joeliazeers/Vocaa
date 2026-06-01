"use client";

import { FileText, CheckCircle2, Lock } from "lucide-react";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { sendMessage, endConversation, type EndResult } from "../actions";
import { triggerCelebrations } from "@/components/Celebration";
import type { Evaluation } from "@/lib/ai";

export type ChatMessage = {
  role: "user" | "ai";
  content: string;
  evaluation: Evaluation | null;
};

function EvaluationPanel({ ev, showFurigana }: { ev: Evaluation; showFurigana: boolean }) {
  const hasIssues = ev.grammar.length > 0 || ev.vocabulary.length > 0;
  return (
    <details className="mt-1.5 rounded-xl border border-ink-200 bg-white p-2.5 text-sm dark:border-ink-700 dark:bg-ink-900" open={hasIssues}>
      <summary className="cursor-pointer font-medium text-ink-600 dark:text-ink-300">
        {hasIssues ? (<><FileText className="w-4 h-4 inline-block mr-1" /> {ev.grammar.length + ev.vocabulary.length} suggestion(s)</>) : (<><CheckCircle2 className="w-4 h-4 inline-block mr-1 text-green-500" /> Looks good</>)}
      </summary>
      <div className="mt-2 space-y-1.5">
        {ev.grammar.map((g, i) => (
          <p key={`g${i}`} className="text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Grammar:</span> {g.issue} - <span className="line-through">{g.span}</span> → {g.fix}
          </p>
        ))}
        {ev.vocabulary.map((v, i) => (
          <p key={`v${i}`} className="text-purple-700 dark:text-purple-400">
            <span className="font-semibold">Vocab:</span> {v.issue} → {v.fix}
          </p>
        ))}
        {showFurigana && (
          <>
            <p className="text-green-700 dark:text-green-400"><span className="font-semibold">Correction:</span> {ev.correction}</p>
            <p className="text-brand-700 dark:text-brand-400"><span className="font-semibold">More natural:</span> {ev.natural_alternative}</p>
          </>
        )}
      </div>
    </details>
  );
}

export function ChatRoom({
  sessionId,
  initialMessages,
  ended,
  showFurigana = true,
}: {
  sessionId: string;
  initialMessages: ChatMessage[];
  ended: boolean;
  showFurigana?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isEnded, setIsEnded] = useState(ended);
  const [endResult, setEndResult] = useState<EndResult | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  function send() {
    const content = input.trim();
    if (!content || pending || isEnded) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content, evaluation: null }]);
    startTransition(async () => {
      const r = await sendMessage(sessionId, content);
      if (r.ok) {
        setMessages((m) => {
          const copy = [...m];
          // attach evaluation to the last user message
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === "user" && !copy[i].evaluation) {
              copy[i] = { ...copy[i], evaluation: r.evaluation };
              break;
            }
          }
          return [...copy, { role: "ai", content: r.reply, evaluation: null }];
        });
      }
    });
  }

  function finish() {
    startTransition(async () => {
      const r = await endConversation(sessionId);
      triggerCelebrations(r);
      setIsEnded(true);
      setEndResult(r);
    });
  }

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-700 dark:bg-ink-950">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                m.role === "user" ? "bg-brand-600 text-white" : "border border-ink-200 bg-white text-ink-800 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && m.evaluation && (
              <div className="w-[80%]"><EvaluationPanel ev={m.evaluation} showFurigana={showFurigana} /></div>
            )}
          </div>
        ))}
        {pending && !isEnded && (
          <div className="flex items-center gap-1 text-ink-400">
            <span className="animate-pulse">● ● ●</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {endResult && (
        <div className="mt-3 rounded-xl bg-brand-50 p-3 text-center text-sm dark:bg-ink-800">
          <p className="font-semibold text-brand-700 dark:text-brand-400">
            Session ended · +{endResult.xpAwarded} XP
          </p>
          <p className="text-ink-500">
            {endResult.messageCount} messages · {endResult.issuesFound} issues logged to your Error Journal
          </p>
        </div>
      )}

      {!isEnded ? (
        <div className="mt-3 flex gap-2">
          <input
            className="input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your reply…"
            aria-label="Type your reply"
            disabled={pending}
          />
          <button className="btn-primary px-3 sm:px-4" onClick={send} disabled={pending || !input.trim()} aria-label="Send message">Send</button>
          <button className="btn-secondary px-3 sm:px-4" onClick={finish} disabled={pending} aria-label="End conversation">End</button>
        </div>
      ) : (
        <div className="mt-3 flex justify-center gap-3">
          <Link href="/conversation" className="btn-secondary">New conversation</Link>
          <Link href="/dashboard" className="btn-primary">Dashboard</Link>
        </div>
      )}
    </div>
  );
}
