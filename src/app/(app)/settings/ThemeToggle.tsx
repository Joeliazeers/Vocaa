"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-ink-200 p-4 transition-all hover:border-ink-300 dark:border-ink-700 dark:bg-ink-800 dark:hover:border-ink-600">
      <div>
        <p className="font-bold text-ink-800 dark:text-ink-100">Dark Mode</p>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {isDark ? "Dark mode is on" : "Light mode is on"}
        </p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={isDark}
          onChange={toggle}
        />
        <div className={`block h-7 w-12 rounded-full transition-colors ${isDark ? "bg-brand-500" : "bg-ink-300 dark:bg-ink-600"}`}></div>
        <div className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${isDark ? "translate-x-5" : ""}`}></div>
      </div>
    </label>
  );
}
