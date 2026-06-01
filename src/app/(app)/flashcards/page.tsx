import { CheckCircle2 } from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FlashcardReview } from "./FlashcardReview";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prefs = (() => { try { return JSON.parse(user.profile?.preferences ?? "{}"); } catch { return {}; } })();
  const showFurigana = prefs.showFurigana !== false;

  const currentLanguageId = user.profile?.currentLanguageId ?? null;

  const language = currentLanguageId
    ? await prisma.language.findUnique({ where: { id: currentLanguageId }, select: { code: true } })
    : null;
  const langCode = language?.code ?? "en";

  const due = await prisma.flashcardState.findMany({
    where: {
      userId: user.id,
      dueDate: { lte: new Date() },
      // Only show flashcards belonging to the active language
      vocabulary: currentLanguageId ? { languageId: currentLanguageId } : undefined,
    },
    include: { vocabulary: true },
    orderBy: { dueDate: "asc" },
    take: 30,
  });

  const cards = due.map((d) => ({
    vocabularyId: d.vocabularyId,
    term: d.vocabulary.term,
    reading: d.vocabulary.reading,
    meaning: d.vocabulary.meaning,
    example: d.vocabulary.exampleSentence,
  }));

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-extrabold">Flashcards</h1>
      <p className="mb-6 text-ink-500">Spaced-repetition review · {cards.length} due</p>

      {cards.length === 0 ? (
        <div className="card text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
          <p className="mt-3 font-semibold">No cards due right now!</p>
          <p className="mt-1 text-sm text-ink-500">
            Complete modules in the <Link href="/learn" className="text-brand-600">skill tree</Link> to add vocabulary,
            or come back later as cards become due.
          </p>
        </div>
      ) : (
        <FlashcardReview cards={cards} langCode={langCode} showFurigana={showFurigana} />
      )}
    </div>
  );
}
