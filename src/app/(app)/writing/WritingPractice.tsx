"use client";

import { Eye, Edit3, Eraser, Undo2, Redo2, Trash2, Star, ThumbsUp, Activity } from "lucide-react";

import { useRef, useState, useEffect, useCallback } from "react";
import { AudioButton } from "@/components/AudioButton";
import { saveWritingAttempt } from "./actions";
import { triggerCelebrations } from "@/components/Celebration";
import HanziWriter from "hanzi-writer";

type Character = {
  char: string;
  reading: string;
  meaning: string;
  strokes: number;
};

// Writing characters database for each language
export const WRITING_CHARS: Record<string, Character[]> = {
  ja: [
    { char: "あ", reading: "a", meaning: "vowel 'a'", strokes: 3 },
    { char: "い", reading: "i", meaning: "vowel 'i'", strokes: 2 },
    { char: "う", reading: "u", meaning: "vowel 'u'", strokes: 2 },
    { char: "え", reading: "e", meaning: "vowel 'e'", strokes: 2 },
    { char: "お", reading: "o", meaning: "vowel 'o'", strokes: 3 },
    { char: "か", reading: "ka", meaning: "syllable 'ka'", strokes: 3 },
    { char: "き", reading: "ki", meaning: "syllable 'ki'", strokes: 4 },
    { char: "く", reading: "ku", meaning: "syllable 'ku'", strokes: 1 },
    { char: "け", reading: "ke", meaning: "syllable 'ke'", strokes: 3 },
    { char: "こ", reading: "ko", meaning: "syllable 'ko'", strokes: 2 },
    { char: "さ", reading: "sa", meaning: "syllable 'sa'", strokes: 3 },
    { char: "し", reading: "shi", meaning: "syllable 'shi'", strokes: 1 },
    { char: "す", reading: "su", meaning: "syllable 'su'", strokes: 2 },
    { char: "せ", reading: "se", meaning: "syllable 'se'", strokes: 3 },
    { char: "そ", reading: "so", meaning: "syllable 'so'", strokes: 2 },
    { char: "た", reading: "ta", meaning: "syllable 'ta'", strokes: 4 },
    { char: "な", reading: "na", meaning: "syllable 'na'", strokes: 4 },
    { char: "は", reading: "ha", meaning: "syllable 'ha'", strokes: 3 },
    { char: "ま", reading: "ma", meaning: "syllable 'ma'", strokes: 3 },
    { char: "や", reading: "ya", meaning: "syllable 'ya'", strokes: 3 },
    { char: "ら", reading: "ra", meaning: "syllable 'ra'", strokes: 2 },
    { char: "わ", reading: "wa", meaning: "syllable 'wa'", strokes: 2 },
    { char: "を", reading: "wo", meaning: "object particle", strokes: 3 },
    { char: "ん", reading: "n", meaning: "nasal consonant 'n'", strokes: 1 },
    { char: "ア", reading: "a", meaning: "katakana 'a'", strokes: 2 },
    { char: "イ", reading: "i", meaning: "katakana 'i'", strokes: 2 },
    { char: "ウ", reading: "u", meaning: "katakana 'u'", strokes: 3 },
    { char: "エ", reading: "e", meaning: "katakana 'e'", strokes: 3 },
    { char: "オ", reading: "o", meaning: "katakana 'o'", strokes: 3 },
  ],
  zh: [
    { char: "一", reading: "yī", meaning: "one", strokes: 1 },
    { char: "二", reading: "èr", meaning: "two", strokes: 2 },
    { char: "三", reading: "sān", meaning: "three", strokes: 3 },
    { char: "人", reading: "rén", meaning: "person", strokes: 2 },
    { char: "大", reading: "dà", meaning: "big", strokes: 3 },
    { char: "小", reading: "xiǎo", meaning: "small", strokes: 3 },
    { char: "山", reading: "shān", meaning: "mountain", strokes: 3 },
    { char: "水", reading: "shuǐ", meaning: "water", strokes: 4 },
    { char: "火", reading: "huǒ", meaning: "fire", strokes: 4 },
    { char: "木", reading: "mù", meaning: "tree/wood", strokes: 4 },
    { char: "日", reading: "rì", meaning: "sun/day", strokes: 4 },
    { char: "月", reading: "yuè", meaning: "moon/month", strokes: 4 },
    { char: "田", reading: "tián", meaning: "field/rice paddy", strokes: 5 },
    { char: "口", reading: "kǒu", meaning: "mouth", strokes: 3 },
    { char: "手", reading: "shǒu", meaning: "hand", strokes: 4 },
    { char: "心", reading: "xīn", meaning: "heart/mind", strokes: 4 },
    { char: "中", reading: "zhōng", meaning: "middle/China", strokes: 4 },
    { char: "国", reading: "guó", meaning: "country", strokes: 8 },
    { char: "好", reading: "hǎo", meaning: "good", strokes: 6 },
    { char: "你", reading: "nǐ", meaning: "you", strokes: 7 },
    { char: "我", reading: "wǒ", meaning: "I/me", strokes: 7 },
    { char: "是", reading: "shì", meaning: "to be", strokes: 9 },
    { char: "的", reading: "de", meaning: "possessive particle", strokes: 8 },
    { char: "学", reading: "xué", meaning: "to study/learn", strokes: 8 },
    { char: "语", reading: "yǔ", meaning: "language", strokes: 9 },
  ],
};

interface WritingPracticeProps {
  langCode: string;
  languageId: string;
}

export function WritingPractice({ langCode, languageId }: WritingPracticeProps) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(true); // trace guide on by default - helps beginners & kids
  const [demoKey, setDemoKey] = useState(0); // bump to replay the stroke demo animation
  const [saving, setSaving] = useState(false);
  const [jaSvg, setJaSvg] = useState<string | null>(null);
  const hanziRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  // Drawing Tools State
  const [mode, setMode] = useState<"pencil" | "eraser">("pencil");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const chars = WRITING_CHARS[langCode] ?? [];
  const currentChar = chars[currentIdx];
  const lastPos = useRef({ x: 0, y: 0 });

  // Draw grid on background canvas
  const drawGuide = useCallback(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // Initialize or reset current character
  useEffect(() => {
    drawGuide();
    clearCanvas();
    setScore(null);
    setFeedback("");
    setShowHint(true);
    setDemoKey((k) => k + 1); // auto-play the stroke demo for the new character
    setJaSvg(null);

    // Fetch KanjiVG for Japanese
    if (langCode === "ja" && chars[currentIdx]) {
      const hex = chars[currentIdx].char.charCodeAt(0).toString(16).padStart(5, "0");
      fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`)
        .then((r) => { if (r.ok) return r.text(); throw new Error(); })
        .then((svg) => {
          // Make the SVG adapt to our theme colors
          const modified = svg
            .replace(/stroke: *#000000/g, "stroke:currentColor")
            .replace(/fill: *#000000/g, "fill:currentColor")
            .replace(/<svg/, '<svg style="width:100%;height:100%;"');
          setJaSvg(modified);
        })
        .catch(() => setJaSvg(null));
    }
  }, [currentIdx, drawGuide, chars, langCode]);

  // Save an initial blank state on mount or reset
  useEffect(() => {
    if (historyIndex === -1 && canvasRef.current) {
      const blank = canvasRef.current.toDataURL();
      setHistory([blank]);
      setHistoryIndex(0);
    }
  }, [historyIndex]);

  // Handle HanziWriter animation
  useEffect(() => {
    if (langCode !== "zh" || !hanziRef.current || !currentChar) return;
    
    if (writerRef.current) {
      // Clean up previous
      hanziRef.current.innerHTML = "";
    }
    
    writerRef.current = HanziWriter.create(hanziRef.current, currentChar.char, {
      width: 300,
      height: 300,
      padding: 10,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 50,
      strokeColor: "#c084fc", // amethyst-400
      radicalColor: "#c084fc",
      outlineColor: "#e5e7eb",
    });
    
    if (showHint) {
      writerRef.current.animateCharacter();
    }
  }, [currentChar, langCode, showHint, demoKey]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (score !== null) return; // Prevent drawing after evaluation
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing || score !== null) return;
    
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    
    if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    
    ctx.stroke();
    lastPos.current = pos;
  }

  function stopDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save to history
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const blank = canvas.toDataURL();
      setHistory([blank]);
      setHistoryIndex(0);
    }
    setScore(null);
    setFeedback("");
  }

  function undo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadCanvasImage(history[newIndex]);
      setScore(null);
      setFeedback("");
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadCanvasImage(history[newIndex]);
      setScore(null);
      setFeedback("");
    }
  }

  function loadCanvasImage(dataUrl: string) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }

  /**
   * Compare drawn canvas vs a reference rendering of the expected character.
   * Both are downsampled to 64×64 for speed. Uses soft IoU on grayscale darkness.
   * Returns 0-100. Drawing the wrong character yields a low score (~15-25).
   */
  function pixelCompare(expectedChar: string): { score: number; feedback: string } {
    const SZ = 64;

    // Render reference character at SZ×SZ
    const refCanvas = document.createElement("canvas");
    refCanvas.width = SZ;
    refCanvas.height = SZ;
    const rCtx = refCanvas.getContext("2d")!;
    rCtx.fillStyle = "#ffffff";
    rCtx.fillRect(0, 0, SZ, SZ);
    rCtx.fillStyle = "#000000";
    rCtx.font = `bold ${Math.floor(SZ * 0.70)}px serif`;
    rCtx.textAlign = "center";
    rCtx.textBaseline = "middle";
    rCtx.fillText(expectedChar, SZ / 2, SZ / 2 + 2);
    const refData = rCtx.getImageData(0, 0, SZ, SZ).data;

    // Downsample drawn canvas to SZ×SZ over white background
    const drawnSmall = document.createElement("canvas");
    drawnSmall.width = SZ;
    drawnSmall.height = SZ;
    const dCtx = drawnSmall.getContext("2d")!;
    dCtx.fillStyle = "#ffffff";
    dCtx.fillRect(0, 0, SZ, SZ);
    dCtx.drawImage(canvasRef.current!, 0, 0, SZ, SZ);
    const drawnData = dCtx.getImageData(0, 0, SZ, SZ).data;

    // Soft IoU: treat darkness as a continuous 0–1 value
    let refSum = 0, drawnSum = 0, inter = 0;
    for (let i = 0; i < SZ * SZ; i++) {
      const ri = i * 4;
      const refDark  = 1 - (refData[ri]   + refData[ri+1]   + refData[ri+2])   / (3 * 255);
      const drawnDark = 1 - (drawnData[ri] + drawnData[ri+1] + drawnData[ri+2]) / (3 * 255);
      refSum   += refDark;
      drawnSum += drawnDark;
      inter    += Math.min(refDark, drawnDark);
    }

    const union = refSum + drawnSum - inter;
    const iou = union > 0 ? inter / union : 0;

    // Empty canvas check
    if (drawnSum < 5) return { score: 0, feedback: "Canvas is empty - try drawing the character!" };

    // Scale IoU to score. A well-drawn character typically yields IoU ~0.25–0.50
    const raw = Math.round(Math.min(iou * 220, 100));

    if (raw < 15) return { score: raw, feedback: "That doesn't look like the target character. Check the guide and try again!" };
    if (raw < 35) return { score: raw, feedback: "Getting closer! Follow the stroke direction more carefully." };
    if (raw < 55) return { score: raw, feedback: "Good effort! Focus on matching the overall shape." };
    if (raw < 70) return { score: raw, feedback: "Nearly there! A bit more precision in the strokes." };
    if (raw < 85) return { score: raw, feedback: "Good job! Your strokes are looking right." };
    return              { score: raw, feedback: "Excellent! The character is well-drawn." };
  }

  async function evaluate() {
    if (historyIndex <= 0 || !currentChar) return;
    setSaving(true);
    setFeedback("Evaluating…");

    const result = pixelCompare(currentChar.char);

    setScore(result.score);
    setFeedback(result.feedback);
    setSessionScores((prev) => [...prev, result.score]);

    const saveRes = await saveWritingAttempt(currentChar.char, languageId, result.score);
    triggerCelebrations(saveRes);
    setSaving(false);
  }

  function nextChar() {
    if (currentIdx < chars.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
  }

  function prevChar() {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  }

  if (!currentChar) {
    return (
      <div className="card text-center">
        <p className="text-ink-500">Writing practice is not available for this language yet.</p>
      </div>
    );
  }

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : null;
    
  const hasDrawn = historyIndex > 0;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {sessionScores.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border-2 border-brand-200 bg-brand-50 px-4 py-2 dark:border-brand-800 dark:bg-brand-950">
          <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
            Session: {sessionScores.length} practiced
          </span>
          <span className="badge-xp">Avg: {avgScore}%</span>
        </div>
      )}

      {/* Character picker */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevChar}
          disabled={currentIdx === 0}
          className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-sm font-semibold text-ink-500">
          {currentIdx + 1} / {chars.length}
        </span>
        <button
          onClick={nextChar}
          disabled={currentIdx === chars.length - 1}
          className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {/* Character info */}
      <div className="card-fun flex items-center justify-between gap-3 border-2 border-amethyst-200 bg-amethyst-50 dark:border-ink-700 dark:bg-ink-900">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold sm:text-6xl" style={{ fontFamily: "serif" }}>
              {currentChar.char}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-amethyst-600 dark:text-amethyst-400">
                {currentChar.reading}
              </p>
              <p className="truncate text-xs text-ink-500">{currentChar.meaning}</p>
              <p className="text-xs text-ink-400">~{currentChar.strokes} stroke{currentChar.strokes !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2">
          <AudioButton text={currentChar.char} langCode={langCode} size="md" />
          <div className="flex gap-1.5">
            <button
              onClick={() => { setShowHint(true); setDemoKey((k) => k + 1); }}
              className="rounded-lg border-2 border-amethyst-200 bg-white px-2 py-1 text-xs font-bold text-amethyst-600 hover:bg-amethyst-50 dark:border-amethyst-800 dark:bg-ink-900 dark:text-amethyst-400"
              aria-label="Watch how to write this character"
            >
              ▶ Watch
            </button>
            <button
              onClick={() => setShowHint((h) => !h)}
              className={`rounded-lg border-2 px-2 py-1 text-xs font-bold ${
                showHint
                  ? "border-amethyst-500 bg-amethyst-100 text-amethyst-700 dark:bg-amethyst-900 dark:text-amethyst-300"
                  : "border-ink-200 bg-white text-ink-500 dark:border-ink-700 dark:bg-ink-900"
              }`}
              aria-pressed={showHint}
              aria-label="Toggle the tracing guide overlay"
            >
              <Eye className="w-5 h-5 mr-2 inline-block" /> Trace
            </button>
          </div>
        </div>
      </div>

      {/* Drawing Area + Toolbar - stacks on mobile, side-by-side on larger screens */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center sm:gap-4">
        {/* Canvas container - responsive square, capped at 320px */}
        <div className="relative aspect-square w-full max-w-[320px] shrink-0 touch-none">
          {/* Base border and bg */}
          <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-ink-300 bg-white dark:border-ink-600 dark:bg-ink-900" />

          {/* Grid canvas (Background) */}
          <canvas
            ref={bgCanvasRef}
            width={300}
            height={300}
            className="absolute inset-0 h-full w-full pointer-events-none"
          />

          {/* Trace guide / stroke demo overlay */}
          {showHint && langCode === "zh" && (
            <div
              key={demoKey}
              ref={hanziRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1 }}
            />
          )}

          {showHint && langCode === "ja" && jaSvg && (
            <div
              key={demoKey}
              className="absolute inset-0 pointer-events-none text-amethyst-400 opacity-60 dark:opacity-80"
              style={{ zIndex: 1, padding: '10px' }}
              dangerouslySetInnerHTML={{ __html: jaSvg }}
            />
          )}
          
          {/* Fallback if fetching fails or simple trace is needed */}
          {showHint && langCode === "ja" && !jaSvg && (
            <div
              key={demoKey}
              className="animate-trace pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[55%] font-bold leading-none text-amethyst-400"
              style={{ fontFamily: "serif", zIndex: 1, fontSize: "min(55vw, 176px)" }}
              aria-hidden="true"
            >
              {currentChar.char}
            </div>
          )}

          {/* Drawing canvas (Foreground) */}
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            role="img"
            aria-label={`Drawing area for the character ${currentChar.char} (${currentChar.reading})`}
            className="absolute inset-0 h-full w-full touch-none"
            style={{ cursor: mode === "eraser" ? "cell" : "crosshair", zIndex: 10 }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>

        {/* Toolbar - horizontal under canvas on mobile, vertical beside it on sm+ */}
        <div className="flex flex-row flex-wrap justify-center gap-2 sm:flex-col">
          <button
            onClick={() => setMode("pencil")}
            className={`tool-btn ${mode === "pencil" ? "tool-btn-active" : ""}`}
            title="Pencil" aria-label="Pencil tool" aria-pressed={mode === "pencil"}
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMode("eraser")}
            className={`tool-btn ${mode === "eraser" ? "tool-btn-active" : ""}`}
            title="Eraser" aria-label="Eraser tool" aria-pressed={mode === "eraser"}
          >
            <Eraser className="w-5 h-5" />
          </button>
          <div className="hidden h-px w-full bg-ink-200 dark:bg-ink-700 sm:my-1 sm:block" />
          <button onClick={undo} disabled={historyIndex <= 0} className="tool-btn" title="Undo" aria-label="Undo last stroke">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="tool-btn" title="Redo" aria-label="Redo stroke">
            <Redo2 className="w-5 h-5" />
          </button>
          <div className="hidden h-px w-full bg-ink-200 dark:bg-ink-700 sm:my-1 sm:block" />
          <button
            onClick={clearCanvas}
            disabled={historyIndex <= 0}
            className="tool-btn hover:border-red-300 hover:bg-red-50 dark:hover:border-red-800 dark:hover:bg-red-950"
            title="Clear" aria-label="Clear the canvas"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Score feedback */}
      {(score !== null || feedback) && (
        <div className={`animate-slide-up rounded-xl border-2 p-4 text-center ${
          score === null
            ? "border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900"
            : score >= 70
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : score >= 50
            ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
        }`}>
          {score !== null && (
            <p className="text-3xl font-black mb-1">
              {score >= 80 ? <Star className="w-5 h-5 inline-block text-sun-500" /> : score >= 60 ? <ThumbsUp className="w-5 h-5 inline-block text-green-500" /> : <Activity className="w-5 h-5 inline-block text-brand-500" />} {score}%
            </p>
          )}
          <p className="text-sm font-semibold text-ink-700 dark:text-ink-300">
            {feedback}
          </p>
        </div>
      )}

      {/* Action Button */}
      <div className="flex">
        {!score ? (
          <button
            onClick={evaluate}
            disabled={!hasDrawn || saving}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {saving ? "Checking..." : "✓ Evaluate"}
          </button>
        ) : (
          <button
            onClick={() => { clearCanvas(); if (currentIdx < chars.length - 1) nextChar(); }}
            className="btn-primary w-full py-4 text-lg"
          >
            Next character →
          </button>
        )}
      </div>

      {/* Character grid picker */}
      <div className="mt-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">All characters</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:flex md:flex-wrap">
          {chars.map((c, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              aria-label={`Practice ${c.char}, pronounced ${c.reading}`}
              aria-current={i === currentIdx}
              className={`flex h-11 w-full items-center justify-center rounded-xl border-2 text-lg font-bold transition-all md:w-11 ${
                i === currentIdx
                  ? "border-amethyst-500 bg-amethyst-100 text-amethyst-700 dark:bg-amethyst-900 dark:text-amethyst-300"
                  : "border-ink-200 bg-white hover:border-amethyst-300 hover:bg-amethyst-50 dark:border-ink-700 dark:bg-ink-900"
              }`}
              title={`${c.char} (${c.reading})`}
            >
              {c.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
