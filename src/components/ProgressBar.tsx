"use client";

export function ProgressBar({
  percent,
  className = "",
  color = "brand",
  showLabel = false,
}: {
  percent: number;
  className?: string;
  color?: "brand" | "sun" | "sky" | "heart" | "amethyst";
  showLabel?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  
  const colorMap = {
    brand: "from-brand-400 to-brand-500",
    sun: "from-sun-400 to-sun-500",
    sky: "from-sky-400 to-sky-500",
    heart: "from-heart-400 to-heart-500",
    amethyst: "from-amethyst-400 to-amethyst-500",
  };

  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700 ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-700 ease-out`}
        style={{ width: `${clamped}%` }}
      />
      {/* Shine overlay */}
      {clamped > 0 && (
        <div
          className="absolute left-0 top-0 h-1/2 rounded-full bg-white/20"
          style={{ width: `${clamped}%` }}
        />
      )}
      {showLabel && clamped > 10 && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
