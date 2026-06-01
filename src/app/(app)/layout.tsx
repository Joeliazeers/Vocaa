import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavBar } from "@/components/NavBar";
import { ToastContainer } from "@/components/Toast";
import { CelebrationContainer } from "@/components/Celebration";
import { WelcomeTour } from "@/components/WelcomeTour";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.onboarded) redirect("/onboarding");

  const p = user.profile;
  const language = p.currentLanguageId
    ? await prisma.language.findUnique({ where: { id: p.currentLanguageId }, select: { name: true } })
    : null;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <NavBar
        username={p.username}
        level={p.userLevel}
        xp={p.totalXp}
        streak={p.streakCount}
        languageName={language?.name}
      />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      <ToastContainer />
      <CelebrationContainer />
      <WelcomeTour />
    </div>
  );
}

