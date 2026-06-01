import { PrismaClient } from "@prisma/client";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_TOPICS_PER_LANG = 20;

const topics: Record<string, { level: string, title: string, desc: string }[]> = {
  ja: [
    { level: "N5", title: "Daily Routine", desc: "Verbs and time expressions for daily life." },
    { level: "N5", title: "Shopping", desc: "Numbers, prices, and shopping phrases." },
    { level: "N5", title: "Food & Drinks", desc: "Ordering food and describing tastes." },
    { level: "N5", title: "Directions", desc: "Asking for and giving directions." },
    { level: "N5", title: "Family", desc: "Talking about family members." },
    { level: "N5", title: "Hobbies", desc: "Discussing what you like to do." },
    { level: "N5", title: "Weather", desc: "Describing seasons and weather." },
    { level: "N4", title: "Intentions", desc: "Expressing plans and intentions." },
    { level: "N4", title: "Permissions", desc: "Asking for and giving permission." },
    { level: "N4", title: "Comparisons", desc: "Comparing things." },
  ],
  id: [
    { level: "A1", title: "Basic Greetings", desc: "Saying hello and introducing yourself." },
    { level: "A1", title: "Numbers & Time", desc: "Counting and telling time." },
    { level: "A1", title: "Food", desc: "Ordering in a warung." },
    { level: "A1", title: "Transportation", desc: "Taking an ojek or bus." },
    { level: "A2", title: "Work", desc: "Talking about professions." },
  ],
  en: [
    { level: "A1", title: "Introductions", desc: "Meeting new people." },
    { level: "A1", title: "At the Restaurant", desc: "Ordering meals." },
    { level: "A2", title: "Travel", desc: "Booking flights and hotels." },
  ],
  zh: [
    { level: "HSK1", title: "Greetings", desc: "Basic ni hao." },
    { level: "HSK1", title: "Numbers", desc: "Counting 1 to 10." },
    { level: "HSK2", title: "Shopping", desc: "Buying things and bargaining." },
    { level: "HSK2", title: "Directions", desc: "Navigating the city." },
  ]
};

const moduleSchema = z.object({
  objectives: z.array(z.string()).describe("3-4 learning objectives"),
  grammar: z.string().describe("Markdown explanation of grammar rules"),
  reading: z.string().describe("A short reading passage using the vocab and grammar"),
  dialogue: z.array(z.object({
    speaker: z.string(),
    text: z.string(),
    translation: z.string()
  })).describe("A dialogue between two people"),
  vocabulary: z.array(z.object({
    term: z.string(),
    reading: z.string().describe("Furigana or Pinyin if applicable, or empty string"),
    meaning: z.string(),
    exampleSentence: z.string()
  })).describe("10-15 vocabulary words for this topic"),
  questions: z.array(z.object({
    type: z.enum(["multiple_choice", "fill_blank", "matching", "reorder"]),
    prompt: z.string(),
    options: z.array(z.string()).describe("String array for choices/reorder. For matching pairs, use 'left|right' format (e.g. 'apple|ringo')."),
    answer: z.number().describe("Index of correct option (for multiple choice)"),
    answerData: z.string().describe("JSON stringified array of correct choices/indices (for non-multiple-choice types)"),
    skillTag: z.string()
  })).describe("5-10 quiz questions. Include a mix of all question types!").min(5)
});

async function generateSkillContent(langCode: string, level: string, title: string, desc: string) {
  console.log(`Generating content for ${langCode} - ${title}...`);
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: moduleSchema,
      prompt: `Create a comprehensive language learning module for the language code '${langCode}'. 
      Topic: ${title}
      Description: ${desc}
      Level: ${level}
      
      Requirements for questions:
      - Include at least one 'multiple_choice' question. (options: ["A", "B", "C"], answer: index)
      - Include at least one 'fill_blank' question. (options: [], answerData: '["correct_answer_1", "correct_answer_2"]')
      - Include at least one 'matching' question. (options: [["apple", "ringo"], ["water", "mizu"]], answerData: '"[[0,0],[1,1]]"')
      - Include at least one 'reorder' question. (options: ["I", "apples", "eat"], answerData: '"[0,2,1]"')
      `
    });
    return object;
  } catch (e) {
    console.error(`Failed to generate ${title}`, e);
    return null;
  }
}

async function main() {
  for (const [langCode, langTopics] of Object.entries(topics)) {
    const language = await prisma.language.findUnique({ where: { code: langCode } });
    if (!language) continue;

    for (let i = 0; i < langTopics.length; i++) {
      const t = langTopics[i];
      const existing = await prisma.skill.findFirst({ where: { languageId: language.id, title: t.title } });
      if (existing) {
        console.log(`Skipping ${t.title}, already exists.`);
        continue;
      }

      const content = await generateSkillContent(langCode, t.level, t.title, t.desc);
      if (!content) continue;

      const skill = await prisma.skill.create({
        data: {
          languageId: language.id,
          title: t.title,
          description: t.desc,
          levelLabel: t.level,
          orderIndex: (i + 1) * 10,
        }
      });

      const mod = await prisma.module.create({
        data: {
          skillId: skill.id,
          title: `Module: ${t.title}`,
          objectives: JSON.stringify(content.objectives),
          grammar: content.grammar,
          reading: content.reading,
          dialogue: JSON.stringify(content.dialogue),
          xpReward: 50,
        }
      });

      for (const v of content.vocabulary) {
        await prisma.vocabulary.create({
          data: {
            languageId: language.id,
            moduleId: mod.id,
            term: v.term,
            reading: v.reading || "",
            meaning: v.meaning,
            exampleSentence: v.exampleSentence
          }
        });
      }

      const quiz = await prisma.quiz.create({
        data: {
          moduleId: mod.id,
          passThreshold: 60,
        }
      });

      for (let qi = 0; qi < content.questions.length; qi++) {
        const q = content.questions[qi];
        let options = q.options as any[];
        if (q.type === 'matching') {
          options = options.map(opt => opt.split('|').map((s: string) => s.trim()));
        }
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            prompt: q.prompt,
            type: q.type,
            options: JSON.stringify(options),
            answer: q.answer,
            answerData: q.answerData,
            skillTag: q.skillTag,
            orderIndex: qi
          }
        });
      }

      console.log(`Successfully added ${t.title}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
