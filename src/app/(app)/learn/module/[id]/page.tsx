import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { ModulePlayer } from "./ModulePlayer";

export const dynamic = "force-dynamic";

type DialogueLine = { speaker: string; text: string; translation: string };
type PatternEx = { pattern: string; examples: string[] };

export default async function ModulePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prefs = (() => {
    try { return JSON.parse(user.profile?.preferences ?? "{}"); } catch { return {}; }
  })();
  const showFurigana = prefs.showFurigana !== false;

  const module = await prisma.module.findUnique({
    where: { id: params.id },
    include: {
      skill: { include: { language: true } },
      vocabulary: true,
      quiz: { include: { questions: { orderBy: { orderIndex: "asc" } } } },
    },
  });
  if (!module) notFound();

  const langCode = module.skill.language.code;
  const objectives       = parseJson<string[]>(module.objectives, []);
  const canDo            = parseJson<string[]>(module.canDo, []);
  const dialogue         = parseJson<DialogueLine[]>(module.dialogue, []);
  const patternExamples  = parseJson<PatternEx[]>(module.patternExamples, []);
  const questions = (module.quiz?.questions ?? []).map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: parseJson<any>(q.options, []),
    answerData: q.answerData,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/learn" className="text-sm text-ink-400 hover:text-ink-700">← Back to skill tree</Link>
      <div className="mt-2 mb-5">
        <span className="chip bg-ink-100 text-ink-500">{module.skill.title}</span>
        <h1 className="mt-2 text-2xl font-extrabold">{module.title}</h1>
      </div>

      <ModulePlayer
        moduleId={module.id}
        objectives={objectives}
        warmUp={module.warmUp}
        canDo={canDo}
        vocabulary={module.vocabulary.map((v) => ({
          term: v.term,
          reading: v.reading,
          meaning: v.meaning,
          example: v.exampleSentence,
        }))}
        grammar={module.grammar}
        reading={module.reading}
        dialogue={dialogue}
        patternExamples={patternExamples}
        cultureNote={module.cultureNote}
        questions={questions}
        xpReward={module.xpReward}
        langCode={langCode}
        showFurigana={showFurigana}
      />
    </div>
  );
}

