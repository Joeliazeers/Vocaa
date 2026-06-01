"use client";

import { Home, BookOpen, Layers, MessageCircle, PenTool, Target, Trophy, Medal, Flame, Zap, GraduationCap, MoreHorizontal } from "lucide-react";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

const MAIN_LINKS = [
  { href: "/dashboard", label: "Home", icon: <Home className="w-5 h-5" /> },
  { href: "/learn", label: "Learn", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/flashcards", label: "Cards", icon: <Layers className="w-5 h-5" /> },
  { href: "/conversation", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
];

const MORE_LINKS = [
  { href: "/writing", label: "Writing", icon: <PenTool className="w-5 h-5" /> },
  { href: "/remedial", label: "Remedial", icon: <Target className="w-5 h-5" /> },
  { href: "/leaderboard", label: "Ranks", icon: <Trophy className="w-5 h-5" /> },
  { href: "/achievements", label: "Awards", icon: <Medal className="w-5 h-5" /> },
];

function MoreMenuDesktop({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = MORE_LINKS.some(
    (l) => currentPath === l.href || currentPath.startsWith(l.href + "/")
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 ${
          isActive || open
            ? "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            : "text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-200"
        }`}
      >
        <MoreHorizontal className="w-4 h-4 mr-1 inline-block" />
        More
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 animate-slide-up rounded-2xl border-2 border-ink-200 bg-white p-2 shadow-xl dark:border-ink-700 dark:bg-ink-900">
          {MORE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-700 transition-all hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MoreMenuMobile({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isActive = MORE_LINKS.some(
    (l) => currentPath === l.href || currentPath.startsWith(l.href + "/")
  );

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <button
        onClick={() => setOpen(!open)}
        className={isActive || open ? "nav-pill-active" : "nav-pill-idle"}
      >
        <MoreHorizontal className="w-5 h-5 inline-block" />
        <span>More</span>
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-48 animate-slide-up rounded-2xl border-2 border-ink-200 bg-white p-2 shadow-xl dark:border-ink-700 dark:bg-ink-900">
          {MORE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-700 transition-all hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function NavBar({
  username,
  level,
  xp,
  streak,
  languageName,
}: {
  username: string;
  level: number;
  xp: number;
  streak: number;
  languageName?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b-2 border-ink-200 bg-white/95 backdrop-blur-md dark:border-ink-700 dark:bg-ink-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/mascot/wave.png" alt="Vocaa" width={32} height={32} className="mascot" />
              <span className="text-xl font-black tracking-tight text-brand-500">Vocaa</span>
            </Link>
            {languageName && (
              <Link
                href="/settings"
                className="flex items-center gap-1 rounded-xl border-2 border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-bold text-ink-600 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-brand-700"
                title="Change language in Settings"
              >
                {languageName} ▾
              </Link>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {MAIN_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 ${
                    active
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-200"
                  }`}
                >
                  {l.icon}
                  <span>{l.label}</span>
                </Link>
              );
            })}
            <MoreMenuDesktop currentPath={pathname} />
          </nav>

          {/* Stats & menu */}
          <div className="flex items-center gap-2">
            <UserMenu username={username} level={level} xp={xp} streak={streak} />
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t-2 border-ink-200 bg-white/95 backdrop-blur-md dark:border-ink-700 dark:bg-ink-950/95 md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {MAIN_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "nav-pill-active" : "nav-pill-idle"}
              >
                {l.icon}
                <span>{l.label}</span>
              </Link>
            );
          })}
          <MoreMenuMobile currentPath={pathname} />
        </div>
      </nav>
    </>
  );
}
