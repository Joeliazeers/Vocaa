import { Sparkles } from "lucide-react";

import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.onboarded) redirect("/dashboard");

  const languages = await prisma.language.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12">
      <div className="mb-6 flex flex-col items-center">
        <Image
          src="/mascot/wave.png"
          alt="Vocaa owl"
          width={100}
          height={100}
          className="mascot-float drop-shadow-lg"
        />
        <h1 className="mt-4 text-3xl font-black text-brand-500">Vocaa</h1>
        <p className="mt-1 font-semibold text-ink-500">Let&apos;s personalize your learning path! <Sparkles className="w-5 h-5 inline-block ml-2 text-brand-500" /></p>
      </div>
      <div className="w-full max-w-lg">
        <OnboardingWizard
          languages={languages.map((l) => ({ id: l.id, code: l.code, name: l.name }))}
        />
      </div>
    </main>
  );
}
