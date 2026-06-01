"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, stringifyJson } from "@/lib/json";
import { awardXp, awardMastery, advanceMission, checkAchievements } from "@/lib/gamification";
import { refreshSkillUnlocks } from "@/lib/learning-path";

export type ModuleResult = {
  ok: boolean;
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel?: number;
  newAchievements: string[];
  wrong: { prompt: string; yourAnswer: string; correct: string }[];
};

/** Score the quiz, log errors, and (if passed & first time) complete the module + award XP. */
export async function submitModuleQuiz(
  moduleId: string,
  answers: any[],
): Promise<ModuleResult> {
  const session = await getSession();
  if (!session) return emptyResult();
  const userId = session.userId;

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      skill: true,
      quiz: { include: { questions: { orderBy: { orderIndex: "asc" } } } },
    },
  });
  if (!module?.quiz) return emptyResult();

  const questions = module.quiz.questions;
  const total = questions.length;
  let correct = 0;
  const wrong: ModuleResult["wrong"] = [];

  for (let i = 0; i < total; i++) {
    const qq = questions[i];
    const chosen = answers[i];
    let isCorrect = false;
    let yourAnswerText = "";
    let correctText = "";

    if (qq.type === "multiple_choice") {
      const options = parseJson<string[]>(qq.options, []);
      isCorrect = (chosen === qq.answer);
      yourAnswerText = options[chosen as number] ?? "(blank)";
      correctText = options[qq.answer] ?? "?";
    } else if (qq.type === "fill_blank") {
      const accepted = parseJson<string[]>(qq.answerData, []);
      const strChosen = typeof chosen === "string" ? chosen.trim().toLowerCase() : "";
      isCorrect = accepted.some(a => a.toLowerCase() === strChosen);
      yourAnswerText = strChosen || "(blank)";
      correctText = accepted[0] ?? "?";
    } else if (qq.type === "matching") {
      const expected = qq.answerData;
      isCorrect = (stringifyJson(chosen) === expected);
      yourAnswerText = isCorrect ? "Correct pairs" : "Incorrect pairs";
      correctText = "Correct pairs";
    } else if (qq.type === "reorder") {
      const expected = qq.answerData;
      isCorrect = (stringifyJson(chosen) === expected);
      const options = parseJson<string[]>(qq.options, []);
      const chosenArr = Array.isArray(chosen) ? chosen : [];
      yourAnswerText = chosenArr.map(idx => options[idx as number]).join(" ");
      const expectedArr = parseJson<number[]>(qq.answerData, []);
      correctText = expectedArr.map(idx => options[idx]).join(" ");
    }

    if (isCorrect) {
      correct++;
    } else {
      wrong.push({
        prompt: qq.prompt,
        yourAnswer: yourAnswerText,
        correct: correctText,
      });
      // Log a grammar/vocabulary error for the Error Journal (PRD §17).
      const category = qq.skillTag.includes("vocab") ? "vocabulary" : "grammar";
      await prisma.errorLog.create({
        data: {
          userId,
          category,
          detail: stringifyJson({ prompt: qq.prompt, skillTag: qq.skillTag, chosen }),
          sourceRef: `quiz:${qq.id}`,
          languageId: module.skill.languageId,
        },
      });
    }
  }

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= module.quiz.passThreshold;

  // Always record the attempt.
  await prisma.quizAttempt.create({
    data: { userId, quizId: module.quiz.id, score, passed, answers: stringifyJson(answers) },
  });

  // Quiz completion XP (small, every attempt that passes).
  let xpAwarded = 0;
  let leveledUp = false;
  let newLevel: number | undefined = undefined;
  let newAchievements: string[] = [];

  const existingProgress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  const alreadyCompleted = existingProgress?.status === "completed";

  if (passed) {
    // Mark module completed (idempotent XP - only award on first completion).
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      create: { userId, moduleId, status: "completed", completedAt: new Date() },
      update: { status: "completed", completedAt: existingProgress?.completedAt ?? new Date() },
    });

    if (!alreadyCompleted) {
      const moduleAward = await awardXp(userId, module.xpReward, "module", module.skill.languageId);
      const quizAward = await awardXp(userId, 50, "quiz", module.skill.languageId);
      xpAwarded = moduleAward.amount + quizAward.amount;
      leveledUp = moduleAward.leveledUp || quizAward.leveledUp;
      newLevel = quizAward.level;
      newAchievements = [...moduleAward.achievements, ...quizAward.achievements];

      // Mastery: 30 base + up to 20 bonus based on quiz score
      const masteryGain = 30 + Math.round((score / 100) * 20);
      await awardMastery(userId, module.skill.languageId, masteryGain);

      await advanceMission(userId, "complete_module", 1);
      await seedFlashcards(userId, moduleId);
      await refreshSkillUnlocks(userId, module.skill.languageId);
    }
  } else if (existingProgress?.status !== "completed") {
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      create: { userId, moduleId, status: "in_progress" },
      update: { status: "in_progress" },
    });
  }

  if (newAchievements.length === 0) {
    newAchievements = await checkAchievements(userId);
  }

  revalidatePath("/dashboard");
  revalidatePath("/learn");

  return { ok: true, score, passed, correctCount: correct, total, xpAwarded, leveledUp, newLevel, newAchievements, wrong };
}

/** Add a module's vocabulary to the user's SRS queue (due immediately). */
async function seedFlashcards(userId: string, moduleId: string) {
  const vocab = await prisma.vocabulary.findMany({ where: { moduleId } });
  for (const v of vocab) {
    await prisma.flashcardState.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId: v.id } },
      create: { userId, vocabularyId: v.id, dueDate: new Date() },
      update: {},
    });
  }
}

function emptyResult(): ModuleResult {
  return {
    ok: false,
    score: 0,
    passed: false,
    correctCount: 0,
    total: 0,
    xpAwarded: 0,
    leveledUp: false,
    newAchievements: [],
    wrong: [],
  };
}
