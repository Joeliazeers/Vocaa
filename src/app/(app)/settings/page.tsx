import { Globe, Clock, Settings, MapPin } from "lucide-react";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ThemeToggle } from "./ThemeToggle";
import { AddLanguageForm } from "./AddLanguageForm";
import { SwitchLanguageForm } from "./SwitchLanguageForm";
import { DailyTargetForm } from "./DailyTargetForm";
import { PreferencesForm } from "./PreferencesForm";
import { CountryForm } from "./CountryForm";

export const dynamic = "force-dynamic";

const FLAGS: Record<string, string> = { id: "🇮🇩", en: "🇬🇧", ja: "🇯🇵", zh: "🇨🇳" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");
  const p = user.profile;

  const [allLanguages, myPaths] = await Promise.all([
    prisma.language.findMany({ orderBy: { name: "asc" } }),
    prisma.learningPath.findMany({ where: { userId: user.id } }),
  ]);

  const studiedIds = new Set(myPaths.map((lp) => lp.languageId));
  const notStudied = allLanguages.filter((l) => !studiedIds.has(l.id));
  const studying = allLanguages.filter((l) => studiedIds.has(l.id));

  // Parse preferences safely
  let preferences = { showFurigana: true, autoplayAudio: true };
  try {
    const parsed = JSON.parse(p.preferences);
    preferences = { ...preferences, ...parsed };
  } catch (e) {
    // Ignore invalid JSON
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20 md:pb-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-ink-900 dark:text-white">Settings</h1>
        <p className="mt-2 font-semibold text-ink-500">Manage your learning journey and preferences.</p>
      </div>

      {/* Languages */}
      <section className="card-fun border-2 border-brand-200 bg-brand-50/30 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="mb-4 text-xl font-black text-brand-700 dark:text-brand-400"><Globe className="w-6 h-6 inline-block mr-2" /> Languages</h2>
        
        {studying.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-400">Currently studying</p>
            <ul className="space-y-2">
              {studying.map((l) => {
                const isActive = l.id === p.currentLanguageId;
                return (
                  <li key={l.id} className="flex items-center justify-between rounded-xl border-2 border-ink-200 bg-white px-4 py-3 shadow-sm dark:border-ink-600 dark:bg-ink-800">
                    <span className="text-base font-bold text-ink-800 dark:text-ink-100">
                      <span className="mr-2 text-xl">{FLAGS[l.code] ?? "🌐"}</span> {l.name}
                    </span>
                    {isActive ? (
                      <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">Active</span>
                    ) : (
                      <SwitchLanguageForm languageId={l.id} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {notStudied.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-400">Add a language</p>
            <div className="rounded-xl border-2 border-ink-200 bg-white p-4 shadow-sm dark:border-ink-600 dark:bg-ink-800">
              <AddLanguageForm languages={notStudied.map((l) => ({ id: l.id, code: l.code, name: l.name }))} />
            </div>
          </div>
        )}
      </section>

      {/* Daily goal */}
      <section className="card-fun border-2 border-sun-200 bg-sun-50/30 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="mb-4 text-xl font-black text-sun-600 dark:text-sun-400"><Clock className="w-6 h-6 inline-block mr-2" /> Daily Goal</h2>
        <DailyTargetForm current={p.dailyTargetMin} />
      </section>

      {/* Preferences & Appearance */}
      <section className="card-fun border-2 border-amethyst-200 bg-amethyst-50/30 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="mb-4 text-xl font-black text-amethyst-600 dark:text-amethyst-400"><Settings className="w-6 h-6 inline-block mr-2" /> Preferences</h2>
        
        <div className="space-y-4">
          <ThemeToggle />
          <PreferencesForm 
            initialFurigana={preferences.showFurigana} 
            initialAutoplay={preferences.autoplayAudio} 
          />
        </div>
      </section>

      {/* Country / Region */}
      <section className="card-fun border-2 border-sky-200 bg-sky-50/30 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="mb-1 text-xl font-black text-sky-600 dark:text-sky-400">
          <MapPin className="w-5 h-5 inline-block mr-2" /> Country / Region
        </h2>
        <p className="mb-4 text-sm font-semibold text-ink-500">
          Used for the local leaderboard. Visible to other users only as your country name.
        </p>
        <CountryForm current={p.country ?? ""} />
      </section>
    </div>
  );
}
