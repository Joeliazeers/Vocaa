import { Sparkles, Globe, MessageCircle, Target, Book, Star, Flame, Zap, GraduationCap, Rocket } from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const FEATURES = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Skill Tree",
    body: "Master languages step by step with structured, fun-filled lessons.",
    color: "bg-brand-100 border-brand-200 dark:bg-ink-900 dark:border-ink-700",
    iconBg: "bg-brand-500",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "XP & Streaks",
    body: "Earn XP, level up, keep your streak alive, and climb the ranks!",
    color: "bg-sun-100 border-sun-200 dark:bg-ink-900 dark:border-ink-700",
    iconBg: "bg-sun-500",
  },
  {
    icon: "🃏",
    title: "Flashcards",
    body: "Spaced-repetition cards with audio - never forget a word again.",
    color: "bg-sky-100 border-sky-200 dark:bg-ink-900 dark:border-ink-700",
    iconBg: "bg-sky-500",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "AI Chat",
    body: "Practice real conversations with AI that corrects and teaches you.",
    color: "bg-amethyst-100 border-amethyst-200 dark:bg-ink-900 dark:border-ink-700",
    iconBg: "bg-amethyst-500",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Daily Missions",
    body: "Fresh goals every day - complete them for bonus XP rewards!",
    color: "bg-heart-100 border-heart-200 dark:bg-ink-900 dark:border-ink-700",
    iconBg: "bg-heart-400",
  },
  {
    icon: <Book className="w-6 h-6" />,
    title: "Smart Review",
    body: "Your mistakes become your study plan. Learn from every error.",
    color: "bg-brand-100 border-brand-200 dark:bg-ink-900 dark:border-ink-700",
    iconBg: "bg-brand-500",
  },
];

const LANGUAGES = [
  { flag: "🇮🇩", name: "Indonesian", greeting: "Halo!" },
  { flag: "🇬🇧", name: "English", greeting: "Hello!" },
  { flag: "🇯🇵", name: "Japanese", greeting: "こんにちは!" },
  { flag: "🇨🇳", name: "Mandarin", greeting: "你好!" },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Image
            src="/mascot/wave.png"
            alt="Vocaa owl"
            width={40}
            height={40}
            className="mascot"
          />
          <span className="text-2xl font-black tracking-tight text-brand-500">Vocaa</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm">Log in</Link>
          <Link href="/register" className="btn-primary px-5 py-2.5 text-sm">Get started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-brand-200 bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 dark:border-ink-700 dark:bg-ink-900 dark:text-brand-400">
              <Sparkles className="w-5 h-5 inline-block mr-2 text-brand-500" /> Free to learn, fun to master
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl dark:text-white">
              Learn a new{" "}
              <span className="gradient-text">language</span>
              {" "}the fun way!
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg font-semibold text-ink-500 lg:mx-0">
              Vocaa combines a skill tree, gamification, flashcards, and an AI tutor
              to turn your mistakes into a personalized path to fluency.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/register" className="btn-primary px-8 py-4 text-base">
                Start learning - it&apos;s free!
              </Link>
              <Link href="/login" className="btn-secondary px-8 py-4 text-base">
                I have an account
              </Link>
            </div>

            {/* Language badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.name}
                  className="flex items-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-4 py-2 text-sm font-bold transition-all hover:border-brand-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800"
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-ink-700 dark:text-ink-300">{lang.name}</span>
                  <span className="text-xs text-ink-400">{lang.greeting}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mascot */}
          <div className="relative mt-10 flex-shrink-0 lg:mt-0">
            <div className="relative">
              {/* Glow effect behind mascot */}
              <div className="absolute inset-0 -z-10 rounded-full bg-brand-400/20 blur-3xl" />
              <Image
                src="/mascot/wave.png"
                alt="Vocaa mascot owl waving hello"
                width={400}
                height={400}
                className="mascot-float drop-shadow-2xl"
                priority
              />
            </div>
            {/* Floating badges around mascot */}
            <div className="absolute -left-4 top-8 animate-bounce-in rounded-xl border-2 border-sun-300 bg-sun-50 px-3 py-2 shadow-lg">
              <span className="text-sm font-bold text-sun-700"><Zap className="w-4 h-4 inline-block mr-1 text-sun-500" /> +50 XP</span>
            </div>
            <div className="absolute -right-4 bottom-24 animate-bounce-in rounded-xl border-2 border-heart-300 bg-heart-50 px-3 py-2 shadow-lg" style={{ animationDelay: '0.2s' }}>
              <span className="text-sm font-bold text-heart-600"><Flame className="w-4 h-4 inline-block mr-1 text-heart-500" /> 7 day streak!</span>
            </div>
            <div className="absolute -right-2 top-16 animate-bounce-in rounded-xl border-2 border-brand-300 bg-brand-50 px-3 py-2 shadow-lg" style={{ animationDelay: '0.4s' }}>
              <span className="text-sm font-bold text-brand-700"><GraduationCap className="w-4 h-4 inline-block mr-1 text-brand-500" /> Level up!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-ink-100/50 py-20 dark:bg-ink-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-ink-900 dark:text-white">
              Everything you need to{" "}
              <span className="text-brand-500">master</span> a language
            </h2>
            <p className="mt-3 text-lg font-semibold text-ink-500">
              Built with science, powered by AI, designed for fun.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`card-fun ${f.color} border-2 group`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${f.iconBg} text-2xl text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-ink-800 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-sm font-semibold text-ink-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Image
            src="/mascot/study.png"
            alt="Vocaa owl studying"
            width={200}
            height={200}
            className="mx-auto mb-8 drop-shadow-lg"
          />
          <h2 className="text-3xl font-black text-ink-900 dark:text-white">
            Ready to start your language journey?
          </h2>
          <p className="mt-4 text-lg font-semibold text-ink-500">
            Join thousands of learners mastering Indonesian, English, Japanese, and Mandarin.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register" className="btn-primary px-8 py-4 text-base">
              Get started for free <Rocket className="w-5 h-5 inline-block ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-ink-200 py-8 text-center dark:border-ink-700">
        <div className="flex items-center justify-center gap-2">
          <Image src="/mascot/wave.png" alt="" width={24} height={24} />
          <span className="text-sm font-bold text-ink-400">
            Vocaa · Learn languages the fun way
          </span>
        </div>
      </footer>
    </main>
  );
}
