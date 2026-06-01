"use client";

import { Pause, Volume2 } from "lucide-react";

import { useState } from "react";

// Map language code → BCP-47 locale for SpeechSynthesis
const LANG_LOCALE: Record<string, string> = {
  ja: "ja-JP",
  zh: "zh-CN",
  id: "id-ID",
  en: "en-US",
};

interface AudioButtonProps {
  text: string;
  langCode?: string;
  size?: "sm" | "md";
  className?: string;
}

export function AudioButton({ text, langCode = "en", size = "sm", className = "" }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  async function speak() {
    if (typeof window === "undefined") return;

    // Prevent multiple clicks
    if (speaking) return;
    setSpeaking(true);

    try {
      // 1. Try to use our Premium AI TTS via backend API
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, langCode }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url); // Clean up memory
        };
        audio.onerror = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
          fallbackSpeak(); // If audio playback fails
        };
        
        await audio.play();
        return; // Success!
      }
      
      // If API failed (e.g. 404 because no API Key is set), fallback
      fallbackSpeak();
    } catch (err) {
      console.error("TTS fetch error:", err);
      fallbackSpeak();
    }
  }

  function fallbackSpeak() {
    if (!window.speechSynthesis) {
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_LOCALE[langCode] ?? "en-US";
    utterance.rate = langCode === "zh" || langCode === "ja" ? 0.85 : 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  const sizeClass = size === "sm"
    ? "h-7 w-7 text-sm"
    : "h-9 w-9 text-base";

  return (
    <button
      type="button"
      onClick={speak}
      title={`Play pronunciation: ${text}`}
      className={`inline-flex items-center justify-center rounded-full border-2 border-sky-200 bg-sky-50 text-sky-600 transition-all hover:bg-sky-100 hover:scale-110 active:scale-95 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400 disabled:opacity-40 ${sizeClass} ${speaking ? "animate-pulse border-sky-400 bg-sky-100" : ""} ${className}`}
      disabled={speaking}
      aria-label={`Pronounce: ${text}`}
    >
      {speaking ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
}
