import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export type ConversationScenario =
  | "restaurant" | "airport" | "hotel" | "campus" | "job_interview" | "shopping";

export type GrammarIssue = { issue: string; span: string; fix: string };

export type Evaluation = {
  grammar: GrammarIssue[];
  vocabulary: GrammarIssue[];
  correction: string;
  natural_alternative: string;
  score: { grammar: number; vocabulary: number };
};

export type ChatTurn = { role: "user" | "ai"; content: string };

export type ChatResult = { reply: string; evaluation: Evaluation };

export interface AIService {
  chat(args: {
    scenario: ConversationScenario;
    languageCode: string;
    level: string;
    history: ChatTurn[];
    userMessage: string;
  }): Promise<ChatResult>;
}

// ── Scenario metadata ────────────────────────────────────────────────────────

export const SCENARIOS: {
  id: ConversationScenario;
  title: string;
  emoji: string;
  requiredCompletedSkills: number; // # of skills user must have completed
}[] = [
  { id: "campus",        title: "Campus",        emoji: "GraduationCap", requiredCompletedSkills: 0 },
  { id: "shopping",      title: "Shopping",      emoji: "ShoppingBag", requiredCompletedSkills: 1 },
  { id: "restaurant",    title: "Restaurant",    emoji: "Utensils", requiredCompletedSkills: 2 },
  { id: "hotel",         title: "Hotel",         emoji: "Hotel", requiredCompletedSkills: 3 },
  { id: "airport",       title: "Airport",       emoji: "Plane", requiredCompletedSkills: 4 },
  { id: "job_interview", title: "Job Interview", emoji: "Briefcase", requiredCompletedSkills: 5 },
];

// ── Language-specific openers (what the AI says at the start of a session) ───

const OPENERS: Record<string, Record<ConversationScenario, string>> = {
  ja: {
    restaurant:    "いらっしゃいませ！ご注文はお決まりでしょうか？",
    airport:       "こんにちは。パスポートと搭乗券をお見せください。",
    hotel:         "ようこそ！ご予約はございますか？",
    campus:        "こんにちは！新入生ですか？何かお探しですか？",
    job_interview: "本日はお越しいただきありがとうございます。まず自己紹介をお願いできますか？",
    shopping:      "いらっしゃいませ！何かお手伝いできることはありますか？",
  },
  id: {
    restaurant:    "Selamat datang! Mau pesan apa hari ini?",
    airport:       "Selamat datang. Boleh saya lihat paspor dan tiket Anda?",
    hotel:         "Selamat datang! Apakah Anda memiliki reservasi?",
    campus:        "Halo! Kamu mahasiswa baru ya? Sedang mencari apa?",
    job_interview: "Terima kasih sudah datang. Bisakah Anda memperkenalkan diri terlebih dahulu?",
    shopping:      "Selamat datang! Ada yang bisa saya bantu?",
  },
  zh: {
    restaurant:    "欢迎！请问您想点什么？",
    airport:       "您好。请出示您的护照和登机牌。",
    hotel:         "欢迎！请问您有预订吗？",
    campus:        "你好！你是新生吗？在找什么地方？",
    job_interview: "感谢您今天来面试。请先做一下自我介绍。",
    shopping:      "欢迎光临！有什么可以帮您的？",
  },
  en: {
    restaurant:    "Welcome! Are you ready to order?",
    airport:       "Good day! May I see your passport and boarding pass, please?",
    hotel:         "Welcome to our hotel. Do you have a reservation with us?",
    campus:        "Hi! Are you new here? Looking for a particular building?",
    job_interview: "Thanks for coming in. Could you start by telling me about yourself?",
    shopping:      "Hello! Let me know if you need help finding anything.",
  },
};

// ── Language-specific follow-up replies from the AI ─────────────────────────

const FOLLOW_UPS: Record<string, Record<ConversationScenario, string[]>> = {
  ja: {
    restaurant:    ["かしこまりました。お飲み物はいかがですか？", "本日のおすすめはラーメンとすしです。", "ありがとうございます。少々お待ちください。"],
    airport:       ["ありがとうございます。お荷物はお一つですか？", "搭乗口はB12番です。他にご質問はありますか？", "良いご旅行をお楽しみください！"],
    hotel:         ["ありがとうございます。305号室です。お荷物はいかがですか？", "朝食は7時から10時まです。他に何かございますか？", "ごゆっくりどうぞ。"],
    campus:        ["図書館は食堂の隣にあります。", "授業は9時から始まります。時間割はお持ちですか？", "初日、頑張ってください！"],
    job_interview: ["それは素晴らしいですね。あなたの強みは何ですか？", "なぜ当社を志望されましたか？", "何かご質問はございますか？"],
    shopping:      ["青と緑がございます。どちらがよろしいでしょうか？", "本日セール中です。試着しますか？", "現金とクレジットカード、どちらでお支払いですか？"],
  },
  id: {
    restaurant:    ["Baik, ada yang ingin Anda minum?", "Menu hari ini ada nasi goreng dan soto.", "Silakan tunggu sebentar."],
    airport:       ["Terima kasih. Apakah ini satu-satunya bagasi Anda?", "Gate Anda adalah B12. Ada pertanyaan lain?", "Selamat menikmati penerbangan!"],
    hotel:         ["Baik, kamar Anda adalah 305. Perlu bantuan koper?", "Sarapan mulai jam 7 sampai 10. Ada yang lain?", "Selamat menikmati menginap!"],
    campus:        ["Perpustakaan ada di sebelah kantin.", "Kuliah mulai jam 9. Sudah dapat jadwalnya?", "Selamat hari pertama!"],
    job_interview: ["Menarik. Apa kelebihan Anda?", "Mengapa Anda melamar posisi ini?", "Ada pertanyaan untuk kami?"],
    shopping:      ["Kami punya warna biru dan hijau, mana yang Anda suka?", "Sedang diskon hari ini. Mau dicoba?", "Tunai atau kartu kredit?"],
  },
  zh: {
    restaurant:    ["好的，请问您要喝点什么？", "今天的推荐是炒饭和汤面。", "请稍等。"],
    airport:       ["谢谢。这是您唯一的行李吗？", "您的登机口是B12。还有其他问题吗？", "祝您旅途愉快！"],
    hotel:         ["好的，您的房间是305号。需要帮您拿行李吗？", "早餐是7点到10点。还需要什么吗？", "祝您入住愉快！"],
    campus:        ["图书馆就在食堂旁边。", "课程9点开始。你拿到课表了吗？", "第一天加油！"],
    job_interview: ["很好。您的优势是什么？", "您为什么想加入我们公司？", "您有什么问题想问我们吗？"],
    shopping:      ["我们有蓝色和绿色。您喜欢哪个？", "今天打折。要试穿吗？", "现金还是刷卡？"],
  },
  en: {
    restaurant:    ["Great choice! Anything to drink?", "Would you like that with rice or noodles?", "Shall I bring the bill?"],
    airport:       ["Thank you. Is this your only bag?", "Your gate is B12. Any other questions?", "Have a pleasant flight!"],
    hotel:         ["Perfect, you're in room 305. Need help with luggage?", "Breakfast is from 7 to 10. Anything else?", "Enjoy your stay!"],
    campus:        ["The library is just past the cafeteria.", "Classes start at 9. Do you have your schedule?", "Good luck on your first day!"],
    job_interview: ["Interesting. What are your strengths?", "Why do you want this role?", "Do you have any questions for us?"],
    shopping:      ["We have that in blue and green. Which do you prefer?", "It's on sale today. Want to try it on?", "Will that be cash or card?"],
  },
};

export function getScenarioOpener(scenario: ConversationScenario, langCode: string): string {
  return OPENERS[langCode]?.[scenario] ?? OPENERS["en"][scenario];
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const LANG_NAME: Record<string, string> = {
  ja: "Japanese", zh: "Mandarin Chinese", id: "Indonesian", en: "English",
};

function buildSystemPrompt(scenario: ConversationScenario, languageCode: string, level: string): string {
  const scenarioTitle = SCENARIOS.find((s) => s.id === scenario)?.title ?? scenario;
  const lang = LANG_NAME[languageCode] ?? "English";
  return `You are a conversational AI roleplaying a "${scenarioTitle}" scenario to help someone learn ${lang}.
Speak exclusively in ${lang}. User level: ${level}.
Reply naturally in character (1-2 sentences), then evaluate the user's message.

Respond ONLY with valid JSON (no markdown fences):
{
  "reply": "your in-character reply in ${lang}",
  "evaluation": {
    "grammar": [{"issue": "...", "span": "...", "fix": "..."}],
    "vocabulary": [{"issue": "...", "span": "...", "fix": "..."}],
    "correction": "user message corrected (same if no errors)",
    "natural_alternative": "a more natural phrasing",
    "score": { "grammar": 0.9, "vocabulary": 0.9 }
  }
}`;
}

function parseAIJson(raw: string, fallbackEval: Evaluation): ChatResult {
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(clean);
  return {
    reply: parsed.reply || "...",
    evaluation: parsed.evaluation ?? fallbackEval,
  };
}

function mockEvaluate(message: string): Evaluation {
  const grammar: GrammarIssue[] = [];
  const vocabulary: GrammarIssue[] = [];
  const lower = ` ${message.toLowerCase()} `;

  if (/\bi want go\b/.test(lower))
    grammar.push({ issue: "Missing 'to' before the verb", span: "want go", fix: "want to go" });
  if (/\bi am go\b|\bi am eat\b|\bi am want\b/.test(lower))
    grammar.push({ issue: "Incorrect verb form after 'I am'", span: "I am + base verb", fix: "use present or '-ing'" });
  if (/\bmore better\b/.test(lower))
    vocabulary.push({ issue: "Double comparative", span: "more better", fix: "better" });
  if (message.trim().length > 5 && !/[.?!。！？]$/.test(message.trim()))
    grammar.push({ issue: "Missing end punctuation", span: message.trim().slice(-6), fix: "add '.' or '?'" });

  const correction =
    grammar.length === 0 && vocabulary.length === 0
      ? message.trim()
      : message.replace(/\bi want go\b/i, "I want to go").replace(/\bmore better\b/i, "better");

  return {
    grammar,
    vocabulary,
    correction,
    natural_alternative:
      grammar.length || vocabulary.length ? `More natural: "${correction}"` : "Sounds good! Keep going.",
    score: {
      grammar: Number(Math.max(0.4, 1 - grammar.length * 0.2).toFixed(2)),
      vocabulary: Number(Math.max(0.5, 1 - vocabulary.length * 0.25).toFixed(2)),
    },
  };
}

// ── Claude (primary) ──────────────────────────────────────────────────────────

class ClaudeAIService implements AIService {
  private client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async chat(args: {
    scenario: ConversationScenario;
    languageCode: string;
    level: string;
    history: ChatTurn[];
    userMessage: string;
  }): Promise<ChatResult> {
    const systemPrompt = buildSystemPrompt(args.scenario, args.languageCode, args.level);
    const fallback = mockEvaluate(args.userMessage);

    const messages: Anthropic.MessageParam[] = [
      ...args.history.map((h) => ({
        role: (h.role === "ai" ? "assistant" : "user") as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: args.userMessage },
    ];

    const response = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
      ],
      messages,
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    try {
      return parseAIJson(raw, fallback);
    } catch {
      return { reply: raw || "...", evaluation: fallback };
    }
  }
}

// ── OpenAI (secondary fallback) ───────────────────────────────────────────────

class OpenAIService implements AIService {
  async chat(args: {
    scenario: ConversationScenario;
    languageCode: string;
    level: string;
    history: ChatTurn[];
    userMessage: string;
  }): Promise<ChatResult> {
    const systemPrompt = buildSystemPrompt(args.scenario, args.languageCode, args.level);
    const fallback = mockEvaluate(args.userMessage);

    const messages = [
      { role: "system", content: systemPrompt },
      ...args.history.map((h) => ({
        role: h.role === "ai" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: args.userMessage },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.7, max_tokens: 300 }),
    });

    if (!response.ok) {
      console.error("OpenAI error:", await response.text());
      throw new Error("OpenAI request failed");
    }

    const data = await response.json();
    const raw: string = data.choices[0].message.content.trim();
    try {
      return parseAIJson(raw, fallback);
    } catch {
      return { reply: raw || "...", evaluation: fallback };
    }
  }
}

// ── Mock (tertiary fallback) ──────────────────────────────────────────────────

class MockAIService implements AIService {
  async chat(args: {
    scenario: ConversationScenario;
    languageCode: string;
    level: string;
    history: ChatTurn[];
    userMessage: string;
  }): Promise<ChatResult> {
    const evaluation = mockEvaluate(args.userMessage);
    const turnCount = args.history.filter((h) => h.role === "user").length;
    const lang = args.languageCode in FOLLOW_UPS ? args.languageCode : "en";
    const reply = pick(FOLLOW_UPS[lang][args.scenario], turnCount);
    await new Promise((r) => setTimeout(r, 200));
    return { reply, evaluation };
  }
}

// ── Factory: Claude → OpenAI → Mock ──────────────────────────────────────────

function createAIService(): AIService {
  if (process.env.ANTHROPIC_API_KEY) return new ClaudeAIService();
  if (process.env.OPENAI_API_KEY) return new OpenAIService();
  return new MockAIService();
}

export const aiService: AIService = createAIService();
