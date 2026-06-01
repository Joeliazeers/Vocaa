// Programmatic sound effects via Web Audio API - no files, no deps, no cost.
// All sounds are synthesized on the fly and respect prefers-reduced-motion.

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

function motionOk(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Play a single oscillator note. */
function playNote(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  gain = 0.3,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.connect(amp);
  amp.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);

  amp.gain.setValueAtTime(0, startAt);
  amp.gain.linearRampToValueAtTime(gain, startAt + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

// ── Public sound functions ──────────────────────────────────────────────────

/** Level up - triumphant ascending fanfare: C4→E4→G4→C5 */
export function playSoundLevelUp() {
  const ctx = getCtx();
  if (!ctx || !motionOk()) return;
  const t = ctx.currentTime;
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
  notes.forEach((freq, i) => {
    playNote(ctx, freq, t + i * 0.15, 0.35, 0.35, "triangle");
    // add a subtle fifth harmony on the last note
    if (i === notes.length - 1) {
      playNote(ctx, freq * 1.5, t + i * 0.15, 0.5, 0.15, "sine");
    }
  });
}

/** Achievement - bright two-tone chime */
export function playSoundAchievement() {
  const ctx = getCtx();
  if (!ctx || !motionOk()) return;
  const t = ctx.currentTime;
  playNote(ctx, 880, t, 0.3, 0.3, "sine");       // A5
  playNote(ctx, 1108.73, t + 0.18, 0.45, 0.25, "sine"); // C#6
}

/** Mission / daily task complete - short positive ding */
export function playSoundMissionComplete() {
  const ctx = getCtx();
  if (!ctx || !motionOk()) return;
  const t = ctx.currentTime;
  playNote(ctx, 659.25, t, 0.12, 0.25, "sine");  // E5
  playNote(ctx, 783.99, t + 0.1, 0.2, 0.2, "sine"); // G5
}

/** Quiz pass / module complete - upbeat jingle */
export function playSoundSuccess() {
  const ctx = getCtx();
  if (!ctx || !motionOk()) return;
  const t = ctx.currentTime;
  // C5 → E5 → G5 quick
  playNote(ctx, 523.25, t, 0.15, 0.28, "triangle");
  playNote(ctx, 659.25, t + 0.12, 0.15, 0.28, "triangle");
  playNote(ctx, 783.99, t + 0.24, 0.3, 0.28, "triangle");
}

/** Wrong answer - low soft thud */
export function playSoundWrong() {
  const ctx = getCtx();
  if (!ctx || !motionOk()) return;
  const t = ctx.currentTime;
  playNote(ctx, 196, t, 0.25, 0.2, "sine");  // G3 low
}

/** Streak milestone - quick rising sweep */
export function playSoundStreak() {
  const ctx = getCtx();
  if (!ctx || !motionOk()) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.3);
  amp.gain.setValueAtTime(0.25, t);
  amp.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.start(t);
  osc.stop(t + 0.4);
}
