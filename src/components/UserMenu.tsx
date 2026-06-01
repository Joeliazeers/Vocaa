"use client";

import { User, Book, Settings, LogOut, Flame, Zap, GraduationCap } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";

export function UserMenu({
  username,
  level,
  xp,
  streak,
}: {
  username: string;
  level: number;
  xp: number;
  streak: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click.
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const seed = encodeURIComponent(username);
  const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${username}`}
        className="flex items-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-2.5 py-1.5 text-sm font-bold transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-ink-600 dark:bg-ink-800 dark:hover:border-brand-700 dark:hover:bg-brand-950"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full border-2 border-brand-200 dark:border-brand-700" />
        <span className="hidden sm:inline text-ink-700 dark:text-ink-200">{username}</span>
        <span className="text-ink-400 dark:text-ink-500 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border-2 border-ink-200 bg-white shadow-xl dark:border-ink-700 dark:bg-ink-900 z-50 animate-slide-up">
          {/* Stats summary */}
          <div className="border-b-2 border-ink-100 bg-gradient-to-r from-brand-50 to-sky-50 px-4 py-3 dark:border-ink-700 dark:from-ink-900 dark:to-ink-900">
            <p className="font-black text-ink-800 dark:text-ink-100">{username}</p>
            <div className="mt-1.5 flex gap-2">
              <span className="badge-level text-[10px]"><GraduationCap className="w-3 h-3 inline-block mr-1 text-brand-500" />Lv.{level}</span>
              <span className="badge-xp text-[10px]"><Zap className="w-3 h-3 inline-block mr-1 text-sun-500" />{xp}</span>
              <span className="badge-streak text-[10px]"><Flame className="w-3 h-3 inline-block mr-1 text-sun-500" />{streak}</span>
            </div>
          </div>

          {/* Navigation items */}
          <ul className="py-1">
            <li>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-ink-700 transition-all hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
              >
                <User className="w-5 h-5 mr-3 inline-block" /> Profile
              </Link>
            </li>
            <li>
              <Link
                href="/journal"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-ink-700 transition-all hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
              >
                <Book className="w-5 h-5 mr-3 inline-block" /> Error Journal
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-ink-700 transition-all hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
              >
                <Settings className="w-5 h-5 mr-3 inline-block" /> Settings
              </Link>
            </li>
          </ul>

          <div className="border-t-2 border-ink-100 py-1 dark:border-ink-700">
            <form action={logoutAction}>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-heart-500 transition-all hover:bg-heart-50 dark:text-heart-400 dark:hover:bg-heart-950">
                <LogOut className="w-5 h-5 mr-3 inline-block" /> Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
