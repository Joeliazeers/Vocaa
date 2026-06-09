/**
 * Vocaa seed — comprehensive content.
 * Japanese: full Hiragana (11 modules) + full Katakana (8 modules) + N5 skills.
 * English: Greetings, Present / Past tense, Questions.
 * Indonesian: Greetings, Numbers.
 * Mandarin: Pinyin + Greetings, Numbers.
 *
 * Skills tagged `autoCompleteLevel: "intermediate,advanced"` are auto-completed
 * at onboarding for users who already know the writing system.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────

type V = { term: string; reading?: string; meaning: string; example?: string };
type D = { speaker: string; text: string; translation: string };
type Q = {
  type: "multiple_choice" | "fill_blank" | "matching" | "reorder";
  prompt: string;
  options: any[]; // string[] for mc/reorder; [string,string][] for matching; [] for fill_blank
  answer: number; // mc only
  answerData: string; // JSON: accepted[] for fill_blank; [[l,r]...] for matching; [idx...] for reorder
  skillTag: string;
};
type PatternEx = { pattern: string; examples: string[] };
type ModSeed = {
  title: string;
  objectives: string[];
  warmUp?: string;
  canDo?: string[];
  grammar: string;
  reading: string;
  dialogue: D[];
  patternExamples?: PatternEx[];
  cultureNote?: string;
  vocab: V[];
  quiz: Q[];
};
type SkillSeed = {
  title: string;
  levelLabel: string;
  description: string;
  prereqTitles: string[];
  autoCompleteLevel: string;
  modules: ModSeed[];
};

/** Multiple choice question */
const q = (prompt: string, options: string[], answer: number, skillTag: string): Q => ({
  type: "multiple_choice", prompt, options, answer, answerData: "", skillTag,
});

/** Fill in the blank — accepted is a list of correct spellings (case-insensitive) */
const qFill = (prompt: string, accepted: string[], skillTag: string): Q => ({
  type: "fill_blank", prompt, options: [], answer: 0,
  answerData: JSON.stringify(accepted), skillTag,
});

/** Matching pairs — pairs is [[left,right], ...]; correct match is left[i] → right[i] */
const qMatch = (prompt: string, pairs: [string, string][], skillTag: string): Q => ({
  type: "matching", prompt, options: pairs, answer: 0,
  answerData: JSON.stringify(pairs.map((_, i) => [i, i])), skillTag,
});

/**
 * Sentence reorder — words is the scrambled word bank; correctOrder is the list of
 * word-bank indices that spell the correct sentence (e.g. [2,0,3,1]).
 */
const qReorder = (prompt: string, words: string[], correctOrder: number[], skillTag: string): Q => ({
  type: "reorder", prompt, options: words, answer: 0,
  answerData: JSON.stringify(correctOrder), skillTag,
});

// ─── JAPANESE ─────────────────────────────────────────────────────────────────

const japaneseSkills: SkillSeed[] = [
  // ── Hiragana ──────────────────────────────────────────────────────────────
  {
    title: "Hiragana",
    levelLabel: "N5",
    description: "Master all 46 hiragana characters across 11 lessons.",
    prereqTitles: [],
    autoCompleteLevel: "intermediate,advanced",
    modules: [
      {
        title: "Vowels — あいうえお",
        objectives: ["Read the 5 Japanese vowels", "Recognize them in simple words"],
        warmUp: "Think of a Japanese word you already know. Can you guess what sounds are in it?",
        canDo: ["Read and write the 5 hiragana vowels: あいうえお", "Recognize these vowels in simple Japanese words"],
        grammar: `Hiragana is a phonetic syllabary — each character is one sound.
The 5 vowels are the foundation:

あ (a) — like "ah"   い (i) — like "ee"   う (u) — lips forward, unrounded
え (e) — like "eh"   お (o) — like "oh"`,
        reading: `Tip: learn to write each character as you learn its sound.
あ → い → う → え → お is the order found in every Japanese dictionary.`,
        dialogue: [
          { speaker: "ハナ", text: "あ、いいえき！", translation: "Oh, a nice station!" },
          { speaker: "サトウ", text: "うん、おおきいね。", translation: "Yeah, it's big, isn't it." },
        ],
        patternExamples: [],
        cultureNote: "Hiragana was developed in the 9th century by Japanese women at court who were forbidden from using kanji. It's now the first script all Japanese children learn.",
        vocab: [
          { term: "あお", reading: "ao", meaning: "blue", example: "そらはあおい。(The sky is blue.)" },
          { term: "いえ", reading: "ie", meaning: "house", example: "おおきいいえ。(A big house.)" },
          { term: "うえ", reading: "ue", meaning: "above / top", example: "うえをみて。(Look up.)" },
          { term: "えき", reading: "eki", meaning: "train station", example: "えきはどこ？(Where is the station?)" },
          { term: "おかし", reading: "okashi", meaning: "sweets", example: "おかしがすき。(I like sweets.)" },
        ],
        quiz: [
          q("'い' is pronounced…", ["ah","ee","oh","eh"], 1, "hiragana-vowels"),
          qFill("Type the hiragana vowel that sounds like 'oh':", ["お"], "hiragana-vowels"),
          qMatch("Match each hiragana to its reading:", [["あ","a"],["い","i"],["う","u"],["え","e"]], "hiragana-vowels"),
          q("'えき' means…", ["snacks","house","train station","above"], 2, "vocab"),
        ],
      },
      {
        title: "K-row — かきくけこ",
        objectives: ["Read か・き・く・け・こ", "Use common K-row vocabulary"],
        warmUp: "Say the English word 'cat' slowly. What sound does it start with? That's the 'ka' sound!",
        canDo: ["Read and write か・き・く・け・こ", "Use K-row characters in common words"],
        grammar: `K-row: か(ka) き(ki) く(ku) け(ke) こ(ko)
Note: き slightly resembles the number 4 with a flag.`,
        reading: `Common words: かわ(river) きく(listen) くも(cloud) けさ(this morning) こども(child)
Practice: こどもがかわでさかなをみた。(A child saw a fish in the river.)`,
        dialogue: [
          { speaker: "ハナ", text: "けさはくもがおおい。", translation: "There are many clouds this morning." },
          { speaker: "サトウ", text: "こどもはかわにいる？", translation: "Are the kids at the river?" },
        ],
        patternExamples: [],
        cultureNote: "Japanese dictionaries (and vocabulary lists) follow the order of the hiragana chart: あかさたなはまやらわ. Knowing this order helps you look things up!",
        vocab: [
          { term: "かわ", reading: "kawa", meaning: "river", example: "かわでおよぐ。" },
          { term: "きく", reading: "kiku", meaning: "to listen", example: "おんがくをきく。" },
          { term: "くも", reading: "kumo", meaning: "cloud", example: "くもがおおい。" },
          { term: "けさ", reading: "kesa", meaning: "this morning", example: "けさはさむい。" },
          { term: "こども", reading: "kodomo", meaning: "child", example: "こどもがわらう。" },
        ],
        quiz: [
          q("'か' reads as…", ["ga","ka","ko","ki"], 1, "hiragana-k"),
          qFill("Write the hiragana for 'ku':", ["く"], "hiragana-k"),
          qMatch("Match hiragana to meaning:", [["かわ","river"],["きく","to listen"],["こども","child"]], "vocab"),
          qReorder("Put in dictionary order:", ["こ","か","き","け","く"], [1,2,4,3,0], "hiragana-k"),
        ],
      },
      {
        title: "S-row — さしすせそ",
        objectives: ["Read さ・し・す・せ・そ", "Note that し = 'shi' not 'si'"],
        warmUp: "You already know the word 'sushi'. Can you find the hiragana for it once you learn this row?",
        canDo: ["Read and write さ・し・す・せ・そ", "Spell the word すし (sushi) in hiragana"],
        grammar: `S-row: さ(sa) し(shi) す(su) せ(se) そ(so)
⚠ Important: し = 'shi' not 'si'. そ looks like the number 3.`,
        reading: `Key vocabulary: さかな(fish) しごと(work) すし(sushi) せかい(world) そら(sky)`,
        dialogue: [
          { speaker: "キム", text: "しごとはどう？", translation: "How's work?" },
          { speaker: "ハナ", text: "いそがしい。でも、すしをたべた！", translation: "Busy. But I ate sushi!" },
        ],
        patternExamples: [],
        cultureNote: "Sushi (すし) originally meant vinegared rice. The fish on top is called 'neta'. In Japan, sushi chefs train for years just to learn proper rice preparation.",
        vocab: [
          { term: "さかな", reading: "sakana", meaning: "fish", example: "さかなをたべる。" },
          { term: "しごと", reading: "shigoto", meaning: "work / job", example: "しごとがある。" },
          { term: "すし", reading: "sushi", meaning: "sushi", example: "すしがすき！" },
          { term: "せかい", reading: "sekai", meaning: "world", example: "せかいはひろい。" },
          { term: "そら", reading: "sora", meaning: "sky", example: "そらがあおい。" },
        ],
        quiz: [
          q("'し' is pronounced…", ["si","su","shi","se"], 2, "hiragana-s"),
          q("'すし' in romaji is…", ["susi","shushi","sushi","soshi"], 2, "vocab"),
          q("'せかい' means…", ["sushi","sky","world","fish"], 2, "vocab"),
          q("Which S-row character looks like '3'?", ["さ","し","せ","そ"], 3, "hiragana-s"),
        ],
      },
      {
        title: "T-row — たちつてと",
        objectives: ["Read た・ち・つ・て・と", "Note ち='chi' and つ='tsu'"],
        warmUp: "The word 'tsunami' comes from Japanese. Can you guess which hiragana characters are in it?",
        canDo: ["Read and write た・ち・つ・て・と", "Spot the irregular pronunciations ち(chi) and つ(tsu)"],
        grammar: `T-row: た(ta) ち(chi) つ(tsu) て(te) と(to)
⚠ ち = 'chi' (not 'ti')   つ = 'tsu' (not 'tu')
て is one of the most-used characters — it forms the て-form of verbs.`,
        reading: `Words: たべもの(food) ちず(map) つき(moon) てがみ(letter) とり(bird)`,
        dialogue: [
          { speaker: "サトウ", text: "てがみをかいた？", translation: "Did you write a letter?" },
          { speaker: "ハナ", text: "うん、ちずもかいた！", translation: "Yes, I drew a map too!" },
        ],
        patternExamples: [],
        cultureNote: "The word 'tsunami' (つなみ) is now used worldwide. It means 'harbor wave' — つ(tsu) + なみ(nami = wave). Japanese has contributed many words to international use.",
        vocab: [
          { term: "たべもの", reading: "tabemono", meaning: "food", example: "たべものがすき。" },
          { term: "ちず", reading: "chizu", meaning: "map", example: "ちずをみる。" },
          { term: "つき", reading: "tsuki", meaning: "moon", example: "つきがきれい。" },
          { term: "てがみ", reading: "tegami", meaning: "letter", example: "てがみをかく。" },
          { term: "とり", reading: "tori", meaning: "bird", example: "とりがとぶ。" },
        ],
        quiz: [
          q("'ち' is read as…", ["ti","chi","tchi","tsi"], 1, "hiragana-t"),
          q("'つ' is read as…", ["tu","tsu","chu","su"], 1, "hiragana-t"),
          q("'たべもの' means…", ["map","letter","food","bird"], 2, "vocab"),
          qFill("Write hiragana for 'te':", ["て"], "hiragana-t"),
        ],
      },
      {
        title: "N-row — なにぬねの",
        objectives: ["Read な・に・ぬ・ね・の", "Use の as a connecting particle"],
        warmUp: "In English we say 'my book', 'his car'. How do you think Japanese connects nouns?",
        canDo: ["Read and write な・に・ぬ・ね・の", "Use の to connect two nouns (e.g. わたしのなまえ = my name)"],
        grammar: `N-row: な(na) に(ni) ぬ(nu) ね(ne) の(no)
の = possessive particle: わたしのほん (my book), にほんのたべもの (Japanese food)`,
        reading: `の is one of the most common hiragana — it connects nouns.
にほん(Japan) + の + たべもの(food) = にほんのたべもの (Japanese food)`,
        dialogue: [
          { speaker: "ハナ", text: "これはだれのほん？", translation: "Whose book is this?" },
          { speaker: "サトウ", text: "わたしのほんです。", translation: "It's my book." },
        ],
        patternExamples: [
          { pattern: "[A]の[B]", examples: ["わたしのほん (my book)", "にほんのたべもの (Japanese food)", "サトウさんのかばん (Mr. Sato's bag)"] },
        ],
        cultureNote: "の is one of the most frequently written hiragana in Japanese. Some Japanese people even use の alone informally as a question particle at the end of a sentence.",
        vocab: [
          { term: "なまえ", reading: "namae", meaning: "name", example: "なまえはなんですか。" },
          { term: "にほん", reading: "nihon", meaning: "Japan", example: "にほんにいきたい。" },
          { term: "ねこ", reading: "neko", meaning: "cat", example: "ねこがかわいい。" },
          { term: "の", reading: "no", meaning: "possessive particle", example: "わたしのほん。" },
          { term: "なに", reading: "nani", meaning: "what", example: "なにをたべる？" },
        ],
        quiz: [
          q("の is used to…", ["end a sentence","connect nouns (possessive)","make questions","mark the subject"], 1, "particle-no"),
          q("'わたしのほん' means…", ["I read a book","my book","a Japanese book","this book"], 1, "particle-no"),
          qFill("Write the hiragana for 'ne':", ["ね"], "hiragana-n"),
          q("'なまえ' means…", ["number","name","country","Japan"], 1, "vocab"),
        ],
      },
      {
        title: "H-row — はひふへほ",
        objectives: ["Read は・ひ・ふ・へ・ほ", "Know that は can be read 'wa' as a particle"],
        warmUp: "You've probably seen 'は' before — it appears in おはよう! Can you hear the 'ha' sound?",
        canDo: ["Read and write は・ひ・ふ・へ・ほ", "Recognize は as the topic particle (read as 'wa')"],
        grammar: `H-row: は(ha) ひ(hi) ふ(fu) へ(he) ほ(ho)
⚠ ふ = 'fu' not 'hu'
⚠ は = 'wa' when used as the topic particle: わたし**は**ハナです。`,
        reading: `は marks the topic of a sentence.
わたしはハナです。(I am Hana.)  にほんはきれいです。(Japan is beautiful.)`,
        dialogue: [
          { speaker: "ハナ", text: "わたしはハナです。", translation: "I am Hana." },
          { speaker: "サトウ", text: "はじめまして！わたしはサトウです。", translation: "Nice to meet you! I am Sato." },
        ],
        patternExamples: [
          { pattern: "[topic]は[comment]です。", examples: ["わたしはハナです。(I am Hana.)", "これはほんです。(This is a book.)", "にほんはきれいです。(Japan is beautiful.)"] },
        ],
        cultureNote: "は as a topic particle is one of the most important building blocks of Japanese grammar. Unlike English 'is/am/are', it doesn't say anything about the subject's existence — it just sets the topic for discussion.",
        vocab: [
          { term: "はな", reading: "hana", meaning: "flower / nose", example: "はながきれい。(The flower is beautiful.)" },
          { term: "ひと", reading: "hito", meaning: "person", example: "いいひとです。(He is a good person.)" },
          { term: "ふゆ", reading: "fuyu", meaning: "winter", example: "ふゆはさむい。(Winter is cold.)" },
          { term: "ほん", reading: "hon", meaning: "book", example: "ほんをよむ。(Read a book.)" },
          { term: "は", reading: "wa", meaning: "topic particle", example: "わたしはがくせいです。" },
        ],
        quiz: [
          q("'ふ' is read as…", ["hu","fu","pu","bu"], 1, "hiragana-h"),
          q("は as a particle is read…", ["ha","ho","wa","hi"], 2, "particle-wa"),
          q("'わたしはハナです' means…", ["Where is Hana?","I am Hana.","Hana is here.","Is this Hana?"], 1, "particle-wa"),
          qFill("Write the hiragana for 'ho':", ["ほ"], "hiragana-h"),
        ],
      },
      {
        title: "M / Y / R / W rows + ん",
        objectives: ["Read ま・み・む・め・も, や・ゆ・よ, ら・り・る・れ・ろ, わ・を, ん"],
        warmUp: "Almost done with hiragana! How many characters have you learned so far?",
        canDo: ["Read all remaining hiragana rows", "Use ん as a syllable-final nasal sound", "Use を as the object particle"],
        grammar: `M-row: ま(ma) み(mi) む(mu) め(me) も(mo)
Y-row: や(ya) ゆ(yu) よ(yo)
R-row: ら(ra) り(ri) る(ru) れ(re) ろ(ro)
W-row: わ(wa) を(wo/o) ん(n)

を = object particle (marks the direct object): ほんをよむ (read a book)
ん = standalone 'n': きん(gold), みんな(everyone)`,
        reading: `You now know all 46 base hiragana! Practice with: まいにちにほんごをよみます。(I read Japanese every day.)`,
        dialogue: [
          { speaker: "キム", text: "まいにちにほんごをよみますか？", translation: "Do you read Japanese every day?" },
          { speaker: "ハナ", text: "はい、まいあさよみます！", translation: "Yes, I read every morning!" },
        ],
        patternExamples: [
          { pattern: "[object]を[verb]", examples: ["ほんをよむ (read a book)", "みずをのむ (drink water)", "おんがくをきく (listen to music)"] },
        ],
        cultureNote: "Congratulations! You now know all 46 hiragana. Japanese children spend their first year of school mastering these characters. You've just achieved what takes Japanese 6-year-olds months to learn.",
        vocab: [
          { term: "まいにち", reading: "mainichi", meaning: "every day", example: "まいにちべんきょうします。" },
          { term: "みんな", reading: "minna", meaning: "everyone", example: "みんなげんき？" },
          { term: "よむ", reading: "yomu", meaning: "to read", example: "ほんをよむ。" },
          { term: "を", reading: "wo/o", meaning: "object particle", example: "みずをのむ。" },
          { term: "ん", reading: "n", meaning: "syllabic n", example: "にほん(Japan)、みんな(everyone)" },
        ],
        quiz: [
          q("を is used to mark…", ["the subject","the topic","the direct object","the location"], 2, "particle-wo"),
          q("ん is…", ["a vowel","a standalone consonant n","always silent","only at the start of words"], 1, "hiragana-n"),
          qFill("Write hiragana for 'mu':", ["む"], "hiragana-m"),
          qMatch("Match rows to characters:", [["M-row","も"],["Y-row","よ"],["R-row","る"]], "hiragana-rows"),
        ],
      },
      {
        title: "Dakuten & Combo Characters",
        objectives: ["Read voiced characters (ga, za, da, ba, pa)", "Read combo characters (kya, sha, etc.)"],
        warmUp: "You know か(ka). What do you think adding two small dots changes it to?",
        canDo: ["Read dakuten characters: が・ざ・だ・ば and handakuten: ぱ", "Read combination characters like きゃ・しゃ・ちょ"],
        grammar: `Dakuten (゛): makes consonant voiced
か→が(ga)  き→ぎ(gi)  さ→ざ(za)  た→だ(da)  は→ば(ba)

Handakuten (゜): only on H-row, makes 'p'
は→ぱ(pa)  ひ→ぴ(pi)

Combo characters: small や/ゆ/よ after い-row
き+ゃ = きゃ(kya)  し+ゃ = しゃ(sha)  ち+ょ = ちょ(cho)`,
        reading: `Words with dakuten: がくせい(student) ざっし(magazine) でんしゃ(train) ばんごはん(dinner)
Combos: きゃく(guest) しゃしん(photo) ちょっと(a little)`,
        dialogue: [
          { speaker: "ハナ", text: "しゃしんをとってもいいですか？", translation: "May I take a photo?" },
          { speaker: "サトウ", text: "ちょっとまって！じゅんびします。", translation: "Wait a moment! I'll get ready." },
        ],
        patternExamples: [],
        cultureNote: "Dakuten characters roughly double the size of the hiragana set. The handakuten (circle) only appears on the H-row — a historical quirk because the H-row originally had a 'p' sound that shifted to 'h' over centuries.",
        vocab: [
          { term: "がくせい", reading: "gakusei", meaning: "student", example: "わたしはがくせいです。" },
          { term: "でんしゃ", reading: "densha", meaning: "train", example: "でんしゃにのる。" },
          { term: "しゃしん", reading: "shashin", meaning: "photo", example: "しゃしんをとる。" },
          { term: "ちょっと", reading: "chotto", meaning: "a little / just a moment", example: "ちょっとまって。" },
          { term: "ざっし", reading: "zasshi", meaning: "magazine", example: "ざっしをよむ。" },
        ],
        quiz: [
          q("か + dakuten becomes…", ["が","ば","さ","ざ"], 0, "dakuten"),
          q("は + handakuten becomes…", ["ぱ","ば","ひ","ぺ"], 0, "handakuten"),
          q("きゃ is read as…", ["kiya","kya","gia","kia"], 1, "combo"),
          q("'でんしゃ' means…", ["airplane","bus","train","bicycle"], 2, "vocab"),
        ],
      },
      {
        title: "Long Vowels & Small つ",
        objectives: ["Read long vowels (おかあさん, おにいさん)", "Read double consonants with small っ"],
        warmUp: "Say 'rock' and 'lock' slowly. Now say them with a tiny pause before the final consonant. That's what っ does!",
        canDo: ["Distinguish long vs short vowels in hiragana", "Read double consonants written with small っ"],
        grammar: `Long vowels: hold the vowel for 2 beats
おかあさん(mother): お-か-あ-さ-ん — the あ extends か
おにいさん(older brother): に is held 2 beats

Small っ = geminate consonant (double it):
きって(stamp): き-っ-て → ki-t-te
ざっし(magazine): ざ-っ-し → za-s-shi`,
        reading: `Long vowels change meaning:
おじさん(uncle) vs おじいさん(grandfather)
おばさん(aunt) vs おばあさん(grandmother)`,
        dialogue: [
          { speaker: "キム", text: "おかあさんはおげんきですか？", translation: "Is your mother doing well?" },
          { speaker: "ハナ", text: "はい、げんきです。きってをあつめています。", translation: "Yes, she's fine. She collects stamps." },
        ],
        patternExamples: [],
        cultureNote: "Long vowels are critically important in Japanese — a short vs. long vowel can completely change meaning. Learners who ignore them often get confused. Train your ear carefully!",
        vocab: [
          { term: "おかあさん", reading: "okaasan", meaning: "mother (polite)", example: "おかあさんはどこ？" },
          { term: "おにいさん", reading: "oniisan", meaning: "older brother (polite)", example: "おにいさんはがくせいです。" },
          { term: "きって", reading: "kitte", meaning: "stamp", example: "きってをはる。" },
          { term: "ざっし", reading: "zasshi", meaning: "magazine", example: "ざっしをよむ。" },
          { term: "きっぷ", reading: "kippu", meaning: "ticket", example: "きっぷをかう。" },
        ],
        quiz: [
          q("Small っ indicates…", ["a long vowel","a silent vowel","a double consonant","a question mark"], 2, "small-tsu"),
          q("'おじいさん' means…", ["uncle","grandfather","father","older brother"], 1, "long-vowels"),
          q("'きっぷ' is read as…", ["kipu","kippu","kibu","kibbu"], 1, "small-tsu"),
          qFill("What doubles in ざっし?", ["s","ss"], "small-tsu"),
        ],
      },
      {
        title: "Hiragana Reading Practice",
        objectives: ["Read natural hiragana sentences", "Build reading fluency"],
        warmUp: "You know all the hiragana! Let's see how quickly you can read a full sentence.",
        canDo: ["Read short Japanese sentences written entirely in hiragana", "Recognize common patterns from all hiragana rows"],
        grammar: `Review of key particles:
は (topic)  を (object)  に (location/time)  で (location of action)  が (subject)
わたしはがくせいです。/ えきにいきます。/ こうえんでたべます。`,
        reading: `はなはインドネシアからきました。まいにちにほんごをべんきょうしています。
サトウさんはにほんじんです。やさしいひとです。
キムさんはかんこくからきました。さかなとすしがすきです。`,
        dialogue: [
          { speaker: "ハナ", text: "にほんごはむずかしいですか？", translation: "Is Japanese difficult?" },
          { speaker: "サトウ", text: "むずかしいけど、たのしいですよ！", translation: "It's difficult, but it's fun!" },
          { speaker: "キム", text: "わたしもそうおもいます。", translation: "I think so too." },
        ],
        patternExamples: [
          { pattern: "[place]に いきます", examples: ["えきにいきます (I'm going to the station)", "がっこうにいきます (I'm going to school)"] },
          { pattern: "[place]で [action]します", examples: ["こうえんでたべます (I eat in the park)", "うちでべんきょうします (I study at home)"] },
        ],
        cultureNote: "Young children's books in Japan are written entirely in hiragana. Once you can read this script fluently, you can start enjoying children's literature like 'はじめてのおつかい' (My First Errand).",
        vocab: [
          { term: "むずかしい", reading: "muzukashii", meaning: "difficult", example: "にほんごはむずかしい。" },
          { term: "たのしい", reading: "tanoshii", meaning: "fun", example: "がっこうはたのしい。" },
          { term: "べんきょう", reading: "benkyou", meaning: "study", example: "まいにちべんきょうする。" },
          { term: "にほんじん", reading: "nihonjin", meaning: "Japanese person", example: "サトウさんはにほんじんです。" },
          { term: "かんこく", reading: "kankoku", meaning: "South Korea", example: "キムさんはかんこくからです。" },
        ],
        quiz: [
          qReorder("Build: 'I study Japanese every day':", ["にほんごを","まいにち","べんきょうします","わたしは"], [3,1,0,2], "hiragana-practice"),
          q("'むずかしい' means…", ["easy","fun","difficult","interesting"], 2, "vocab"),
          qMatch("Match the particle to its use:", [["は","topic"],["を","object"],["に","location/direction"]], "particles"),
          q("'にほんじん' means…", ["Japanese language","Japanese person","Japan","Japanese food"], 1, "vocab"),
        ],
      },
    ],
  },

  // ── Katakana ──────────────────────────────────────────────────────────────
  {
    title: "Katakana",
    levelLabel: "N5",
    description: "Master all 46 katakana characters — essential for reading loanwords.",
    prereqTitles: ["Hiragana"],
    autoCompleteLevel: "intermediate,advanced",
    modules: [
      {
        title: "Vowels & A-K rows — ア行～カ行",
        objectives: ["Read ア・イ・ウ・エ・オ and カ・キ・ク・ケ・コ", "Recognize katakana in loanwords"],
        warmUp: "Look at a Japanese menu or product label. Can you spot any angular-looking characters? Those are katakana!",
        canDo: ["Read katakana vowels and K-row", "Identify loanwords written in katakana"],
        grammar: `Katakana vowels: ア(a) イ(i) ウ(u) エ(e) オ(o)
K-row: カ(ka) キ(ki) ク(ku) ケ(ke) コ(ko)

Katakana is used for: loanwords, foreign names, emphasis, onomatopoeia.
Long vowel in katakana uses ー: コーヒー(coffee) ケーキ(cake)`,
        reading: `Loanwords: アイスクリーム(ice cream) エアコン(air conditioner) コーヒー(coffee) ケーキ(cake)`,
        dialogue: [
          { speaker: "ハナ", text: "コーヒーとケーキ、ください。", translation: "Coffee and cake, please." },
          { speaker: "サトウ", text: "アイスクリームはどうですか？", translation: "How about ice cream?" },
        ],
        patternExamples: [],
        cultureNote: "Japanese borrows heavily from English, French, and German. Modern Japanese has tens of thousands of loanwords (外来語 gaikokugo). Reading katakana unlocks menus, products, and modern Japanese media.",
        vocab: [
          { term: "コーヒー", reading: "koohii", meaning: "coffee", example: "コーヒーをのむ。" },
          { term: "ケーキ", reading: "keeki", meaning: "cake", example: "ケーキをたべる。" },
          { term: "アイスクリーム", reading: "aisukuriimu", meaning: "ice cream", example: "アイスクリームがすき。" },
          { term: "エアコン", reading: "eakon", meaning: "air conditioner", example: "エアコンをつける。" },
          { term: "カメラ", reading: "kamera", meaning: "camera", example: "カメラをかう。" },
        ],
        quiz: [
          q("ア reads as…", ["i","u","a","e"], 2, "katakana-vowels"),
          q("Long vowel ー in コーヒー extends…", ["the previous vowel","the next vowel","the consonant","nothing"], 0, "long-vowel"),
          q("'ケーキ' means…", ["coffee","cake","camera","car"], 1, "vocab"),
          qMatch("Match katakana to hiragana equivalent:", [["ア","あ"],["イ","い"],["コ","こ"]], "katakana-match"),
        ],
      },
      {
        title: "S & T rows — サ行・タ行",
        objectives: ["Read サ・シ・ス・セ・ソ and タ・チ・ツ・テ・ト", "Spot irregular sounds シ・チ・ツ"],
        warmUp: "Can you guess what テレビ (terebi) means? It's a loanword you definitely know!",
        canDo: ["Read S-row and T-row katakana", "Decode common loanwords using these rows"],
        grammar: `S-row: サ(sa) シ(shi) ス(su) セ(se) ソ(so)
T-row: タ(ta) チ(chi) ツ(tsu) テ(te) ト(to)

Double consonants with ッ: テスト→テッスト? No — テスト(test) is fine.
ッ doubles the next consonant: ベッド(bed), ポット(pot)`,
        reading: `Loanwords: テレビ(TV) スーパー(supermarket) タクシー(taxi) チケット(ticket)`,
        dialogue: [
          { speaker: "キム", text: "スーパーでテレビをみた？", translation: "Did you see the TV at the supermarket?" },
          { speaker: "ハナ", text: "タクシーでいったの？チケットはかった？", translation: "Did you go by taxi? Did you buy a ticket?" },
        ],
        patternExamples: [],
        cultureNote: "テレビ (terebi) comes from 'television'. Japanese often shortens loanwords: テレビジョン→テレビ, アパートメント→アパート. These shortened forms are uniquely Japanese!",
        vocab: [
          { term: "テレビ", reading: "terebi", meaning: "television", example: "テレビをみる。" },
          { term: "スーパー", reading: "suupaa", meaning: "supermarket", example: "スーパーでかう。" },
          { term: "タクシー", reading: "takushii", meaning: "taxi", example: "タクシーにのる。" },
          { term: "チケット", reading: "chiketto", meaning: "ticket", example: "チケットをかう。" },
          { term: "テスト", reading: "tesuto", meaning: "test / exam", example: "テストはむずかしい。" },
        ],
        quiz: [
          q("テレビ means…", ["telephone","telescope","television","terminal"], 2, "vocab"),
          q("ッ (small tsu) indicates…", ["a long vowel","a double consonant","silence","question"], 1, "small-tsu"),
          q("スーパー means…", ["super hero","supervisor","supermarket","super fast"], 2, "vocab"),
          qFill("Write the katakana for 'te':", ["テ"], "katakana-t"),
        ],
      },
      {
        title: "N & H rows — ナ行・ハ行",
        objectives: ["Read ナ・ニ・ヌ・ネ・ノ and ハ・ヒ・フ・ヘ・ホ"],
        warmUp: "ハンバーガー — can you read this katakana word? What do you think it means?",
        canDo: ["Read N-row and H-row katakana", "Read food-related loanwords"],
        grammar: `N-row: ナ(na) ニ(ni) ヌ(nu) ネ(ne) ノ(no)
H-row: ハ(ha) ヒ(hi) フ(fu) ヘ(he) ホ(ho)

Note: フ = 'fu' (same as hiragana ふ)`,
        reading: `Food loanwords: ハンバーガー(hamburger) ホットドッグ(hot dog) フライドポテト(french fries) ノート(notebook)`,
        dialogue: [
          { speaker: "ハナ", text: "ハンバーガーとフライドポテトをください。", translation: "A hamburger and french fries, please." },
          { speaker: "サトウ", text: "ホットドッグはどうですか？", translation: "How about a hot dog?" },
        ],
        patternExamples: [],
        cultureNote: "Japan's fast food culture blends loanwords with Japanese: マクドナルド (McDonald's) is called 'Makudo' by locals. Japanese fast food menus are a great resource for katakana reading practice!",
        vocab: [
          { term: "ハンバーガー", reading: "hanbaagaa", meaning: "hamburger", example: "ハンバーガーをたべる。" },
          { term: "ホットドッグ", reading: "hottodoggu", meaning: "hot dog", example: "ホットドッグがすき。" },
          { term: "フライドポテト", reading: "furaidopoteto", meaning: "french fries", example: "フライドポテトをたのむ。" },
          { term: "ノート", reading: "nooto", meaning: "notebook", example: "ノートにかく。" },
          { term: "ニュース", reading: "nyuusu", meaning: "news", example: "ニュースをきく。" },
        ],
        quiz: [
          q("ハンバーガー means…", ["hot dog","hamburger","sandwich","pizza"], 1, "vocab"),
          q("フ reads as…", ["hu","fu","pu","bu"], 1, "katakana-h"),
          q("ノート means…", ["note","notebook","noodle","novel"], 1, "vocab"),
          qFill("Write katakana for 'na':", ["ナ"], "katakana-n"),
        ],
      },
      {
        title: "M & Y rows — マ行・ヤ行",
        objectives: ["Read マ・ミ・ム・メ・モ and ヤ・ユ・ヨ"],
        warmUp: "メニュー — you've seen this word before. What does it mean?",
        canDo: ["Read M-row and Y-row katakana", "Read restaurant and daily-life loanwords"],
        grammar: `M-row: マ(ma) ミ(mi) ム(mu) メ(me) モ(mo)
Y-row: ヤ(ya) ユ(yu) ヨ(yo)

ヨーグルト(yogurt), メニュー(menu), ミルク(milk)`,
        reading: `Cafe vocabulary: メニュー(menu) ミルク(milk) ヨーグルト(yogurt) マヨネーズ(mayonnaise)`,
        dialogue: [
          { speaker: "キム", text: "メニューをみてもいいですか？", translation: "May I look at the menu?" },
          { speaker: "サトウ", text: "どうぞ。ヨーグルトとミルクがおすすめです。", translation: "Please go ahead. The yogurt and milk are recommended." },
        ],
        patternExamples: [],
        cultureNote: "Japanese cafes (カフェ) are beloved — Japan has the highest density of cafes in Asia. Ordering in katakana is your first real-world Japanese skill!",
        vocab: [
          { term: "メニュー", reading: "menyuu", meaning: "menu", example: "メニューをください。" },
          { term: "ミルク", reading: "miruku", meaning: "milk", example: "ミルクをのむ。" },
          { term: "ヨーグルト", reading: "yooguruto", meaning: "yogurt", example: "ヨーグルトをたべる。" },
          { term: "マスク", reading: "masuku", meaning: "mask", example: "マスクをつける。" },
          { term: "ユニフォーム", reading: "yunifoomu", meaning: "uniform", example: "ユニフォームをきる。" },
        ],
        quiz: [
          q("ユ reads as…", ["ma","mi","yu","yo"], 2, "katakana-y"),
          q("'ミルク' means…", ["mask","milk","menu","map"], 1, "vocab"),
          q("'メニュー' means…", ["menu","milk","yogurt","mask"], 0, "vocab"),
          q("The Y-row has how many characters?", ["5","4","3","2"], 2, "katakana-y"),
        ],
      },
      {
        title: "R & W rows + ン — ラ行・ワ行・ン",
        objectives: ["Complete all katakana rows", "Read ン (n) at end of syllables"],
        warmUp: "レストラン — can you decode this word? It's somewhere you eat!",
        canDo: ["Read all 46 base katakana characters", "Read standalone ン at the end of syllables"],
        grammar: `R-row: ラ(ra) リ(ri) ル(ru) レ(re) ロ(ro)
W-row: ワ(wa) ヲ(wo) — ヲ is very rare in loanwords
ン = standalone 'n': レストラン(restaurant), ワイン(wine)`,
        reading: `Loanwords: ラジオ(radio) リモコン(remote control) レストラン(restaurant) ロボット(robot) ワイン(wine)`,
        dialogue: [
          { speaker: "ハナ", text: "レストランでワインをのんだ。", translation: "I drank wine at the restaurant." },
          { speaker: "キム", text: "ラジオでロボットのニュースをきいた。", translation: "I heard robot news on the radio." },
        ],
        patternExamples: [],
        cultureNote: "You now know all 46 basic katakana! Japanese wine culture (ワイン文化) has exploded since the 1990s. Many Japanese wine words are French loanwords written in katakana.",
        vocab: [
          { term: "ラジオ", reading: "rajio", meaning: "radio", example: "ラジオをきく。" },
          { term: "リモコン", reading: "rimokon", meaning: "remote control", example: "リモコンはどこ？" },
          { term: "レストラン", reading: "resutoran", meaning: "restaurant", example: "レストランにいく。" },
          { term: "ロボット", reading: "robotto", meaning: "robot", example: "ロボットがいる。" },
          { term: "ワイン", reading: "wain", meaning: "wine", example: "ワインをのむ。" },
        ],
        quiz: [
          q("ン is…", ["a vowel","a standalone 'n' consonant","a particle","a verb ending"], 1, "katakana-n"),
          q("'レストラン' means…", ["radio","robot","restaurant","remote"], 2, "vocab"),
          q("'ワイン' means…", ["wine","radio","robot","water"], 0, "vocab"),
          q("After this lesson, how many base katakana do you know?", ["40","44","46","50"], 2, "katakana-complete"),
        ],
      },
      {
        title: "Dakuten & Extended Sounds",
        objectives: ["Read voiced katakana", "Read extended katakana: ファ, ティ, ウィ"],
        warmUp: "You know ファッション means 'fashion'. Can you figure out what sound ファ makes?",
        canDo: ["Read dakuten katakana: ガ・ザ・ダ・バ", "Read extended sounds ファ・ティ・ウィ for foreign names"],
        grammar: `Dakuten: カ→ガ(ga) サ→ザ(za) タ→ダ(da) ハ→バ(ba) ハ→パ(pa)
Extended: ファ(fa) フィ(fi) フェ(fe) フォ(fo) ティ(ti) ディ(di) ウィ(wi)`,
        reading: `Fashion vocabulary: ファッション(fashion) ティッシュ(tissue) ディスカウント(discount) バッグ(bag)`,
        dialogue: [
          { speaker: "ハナ", text: "ファッションのバッグをチェックして。", translation: "Check out the fashion bag." },
          { speaker: "キム", text: "ティッシュもディスカウントだ！", translation: "The tissues are discounted too!" },
        ],
        patternExamples: [],
        cultureNote: "Extended katakana sounds like ファ and ティ were created to write foreign words more accurately. As Japan globalized, the katakana system expanded to handle sounds not native to Japanese.",
        vocab: [
          { term: "ファッション", reading: "fasshon", meaning: "fashion", example: "ファッションがすき。" },
          { term: "ティッシュ", reading: "tisshu", meaning: "tissue", example: "ティッシュをとる。" },
          { term: "バッグ", reading: "baggu", meaning: "bag", example: "バッグをかう。" },
          { term: "チェック", reading: "chekku", meaning: "check", example: "チェックする。" },
          { term: "ディスカウント", reading: "disukaunto", meaning: "discount", example: "ディスカウントセール！" },
        ],
        quiz: [
          q("ファ represents which sound?", ["ha","pa","fa","ba"], 2, "katakana-extended"),
          q("'ティッシュ' means…", ["tissue","fashion","window","bag"], 0, "vocab"),
          q("ガ is formed by adding dakuten to…", ["カ","サ","タ","ハ"], 0, "katakana-dakuten"),
          q("'バッグ' means…", ["fashion","check","bag","tissue"], 2, "vocab"),
        ],
      },
    ],
  },

  // ── N5 Content Skills (Marugoto A1 redesign) ──────────────────────────────
  {
    title: "はじめまして",
    levelLabel: "N5",
    description: "Greet people, introduce yourself, and exchange basic personal information.",
    prereqTitles: ["Hiragana"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "はじめまして — Nice to Meet You",
        objectives: ["Introduce yourself in Japanese", "Ask and answer 'what is your name?'"],
        warmUp: "Imagine you're meeting a Japanese person for the first time. What information would you want to share about yourself?",
        canDo: [
          "Introduce yourself: なまえ、くに、しごと",
          "Respond to はじめまして with はじめまして・どうぞよろしく",
          "Ask someone's name politely: おなまえは？",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "ハナ", text: "はじめまして。わたしはハナです。インドネシアからきました。", translation: "Nice to meet you. I'm Hana. I came from Indonesia." },
          { speaker: "サトウ", text: "はじめまして、サトウです。にほんじんです。どうぞよろしく。", translation: "Nice to meet you, I'm Sato. I'm Japanese. Pleased to meet you." },
          { speaker: "ハナ", text: "こちらこそ、よろしくおねがいします。", translation: "Likewise, pleased to meet you." },
          { speaker: "キム", text: "わたしはキムです。かんこくからです。よろしく！", translation: "I'm Kim. I'm from Korea. Nice to meet you!" },
        ],
        patternExamples: [
          { pattern: "わたしは[なまえ]です。", examples: ["わたしはハナです。(I am Hana.)", "わたしはサトウです。(I am Sato.)"] },
          { pattern: "[くに]からきました。", examples: ["インドネシアからきました。(I came from Indonesia.)", "かんこくからきました。(I came from Korea.)"] },
          { pattern: "はじめまして。どうぞよろしく。", examples: ["A: はじめまして！B: はじめまして、どうぞよろしく。"] },
        ],
        cultureNote: "In Japan, the first meeting (初対面 shote-imen) follows a specific ritual: bow, exchange names, say はじめまして, then どうぞよろしく. Business cards (名刺 meishi) are given and received with two hands and a bow — never written on or stuffed in a pocket!",
        vocab: [
          { term: "はじめまして", reading: "hajimemashite", meaning: "nice to meet you (first meeting)", example: "はじめまして、ハナです。" },
          { term: "どうぞよろしく", reading: "douzo yoroshiku", meaning: "pleased to meet you", example: "どうぞよろしくおねがいします。" },
          { term: "わたし", reading: "watashi", meaning: "I / me", example: "わたしはがくせいです。" },
          { term: "からきました", reading: "kara kimashita", meaning: "came from", example: "インドネシアからきました。" },
          { term: "にほんじん", reading: "nihonjin", meaning: "Japanese person", example: "サトウさんはにほんじんです。" },
        ],
        quiz: [
          q("はじめまして is used when…", ["you see a friend","you meet someone for the first time","you say goodbye","you thank someone"], 1, "greetings"),
          q("'わたしはハナです' means…", ["Where is Hana?","Hana is here.","I am Hana.","This is Hana."], 2, "self-intro"),
          qFill("Complete: 'インドネシア___ きました' (came from Indonesia):", ["から"], "particles"),
          qMatch("Match to meaning:", [["はじめまして","nice to meet you"],["どうぞよろしく","pleased to meet you"],["わたし","I/me"]], "vocab"),
        ],
      },
      {
        title: "しごとはなんですか — What Do You Do?",
        objectives: ["Say your job or student status", "Ask and answer questions about occupation"],
        warmUp: "In Japan, people often ask about your job when first meeting. How do you feel about that? Is it the same in your country?",
        canDo: [
          "Say your occupation: ～です / ～をしています",
          "Ask someone's job politely: しごとはなんですか？",
          "Respond to questions about yourself",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "サトウ", text: "ハナさん、しごとはなんですか？", translation: "Hana, what is your job?" },
          { speaker: "ハナ", text: "わたしはがくせいです。にほんごをべんきょうしています。", translation: "I'm a student. I'm studying Japanese." },
          { speaker: "サトウ", text: "そうですか。どこのがっこうですか？", translation: "Is that so? Which school?" },
          { speaker: "ハナ", text: "とうきょうのにほんごがっこうです。", translation: "A Japanese language school in Tokyo." },
          { speaker: "キム", text: "わたしもがくせいです。かんこくごのきょうしです。", translation: "I'm a student too. I'm also a Korean language teacher." },
        ],
        patternExamples: [
          { pattern: "わたしは[しごと]です。", examples: ["わたしはがくせいです。(I am a student.)", "わたしはきょうしです。(I am a teacher.)", "わたしはかいしゃいんです。(I am a company employee.)"] },
          { pattern: "[subject]をしています。", examples: ["にほんごをべんきょうしています。(I am studying Japanese.)", "しごとをしています。(I am working.)"] },
        ],
        cultureNote: "In Japan, people often introduce themselves by their company rather than their job title: '○○会社のサトウです' (I'm Sato from ○○ Company). Group identity (所属 shozoku) is very important in Japanese culture.",
        vocab: [
          { term: "がくせい", reading: "gakusei", meaning: "student", example: "わたしはがくせいです。" },
          { term: "きょうし", reading: "kyoushi", meaning: "teacher", example: "きょうしをしています。" },
          { term: "かいしゃいん", reading: "kaishain", meaning: "company employee", example: "かいしゃいんです。" },
          { term: "しごと", reading: "shigoto", meaning: "work / job", example: "しごとはなんですか？" },
          { term: "べんきょう", reading: "benkyou", meaning: "study", example: "にほんごをべんきょうします。" },
        ],
        quiz: [
          q("'がくせい' means…", ["teacher","student","employee","doctor"], 1, "occupations"),
          q("'しごとはなんですか' asks…", ["where are you from?","what is your job?","do you like your work?","where do you work?"], 1, "questions"),
          qFill("Complete: 'にほんごを___しています' (studying):", ["べんきょう"], "vocab"),
          qReorder("Build: 'I am a company employee':", ["です","わたし","かいしゃいん","は"], [1,3,2,0], "sentence"),
        ],
      },
    ],
  },

  {
    title: "これはなんですか",
    levelLabel: "N5",
    description: "Ask what things are, use demonstratives, and talk about objects around you.",
    prereqTitles: ["はじめまして"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "これ・それ・あれ — This, That, That over there",
        objectives: ["Use これ/それ/あれ to refer to objects", "Ask 'what is this?' and understand the answer"],
        warmUp: "Look around you right now. Pick up an object near you and one far away. How would you talk about each in Japanese?",
        canDo: [
          "Point to nearby objects: これはなんですか？",
          "Point to objects near listener: それは～です",
          "Point to distant objects: あれは～です",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "ハナ", text: "すみません、これはなんですか？", translation: "Excuse me, what is this?" },
          { speaker: "サトウ", text: "ああ、それはおみやげです。きょうとのおかしですよ。", translation: "Oh, that's a souvenir. It's sweets from Kyoto." },
          { speaker: "ハナ", text: "おいしそう！あれもおみやげですか？", translation: "Looks delicious! Is that over there also a souvenir?" },
          { speaker: "サトウ", text: "いいえ、あれはわたしのかばんです。", translation: "No, that over there is my bag." },
        ],
        patternExamples: [
          { pattern: "これ / それ / あれ は [noun] です。", examples: ["これはほんです。(This is a book.)", "それはおみやげです。(That is a souvenir.)", "あれはわたしのかばんです。(That over there is my bag.)"] },
          { pattern: "この / その / あの [noun]", examples: ["このほんはおもしろい。(This book is interesting.)", "そのバッグはだれのですか？(Whose is that bag?)"] },
        ],
        cultureNote: "Souvenirs (お土産 omiyage) are deeply important in Japanese culture. When you travel or return from a trip, you're expected to bring back sweets or treats for everyone. Failing to do so is considered rude!",
        vocab: [
          { term: "これ", reading: "kore", meaning: "this (near speaker)", example: "これはなんですか？" },
          { term: "それ", reading: "sore", meaning: "that (near listener)", example: "それはわたしのです。" },
          { term: "あれ", reading: "are", meaning: "that (far from both)", example: "あれはなんですか？" },
          { term: "おみやげ", reading: "omiyage", meaning: "souvenir / gift from travel", example: "おみやげをかいました。" },
          { term: "なんですか", reading: "nan desu ka", meaning: "what is it?", example: "これはなんですか？" },
        ],
        quiz: [
          q("これ is used for…", ["objects near the listener","objects far from both","objects near the speaker","any object"], 2, "demonstratives"),
          q("'それはなんですか' means…", ["What is this?","What is that (near you)?","Is that yours?","Where is that?"], 1, "demonstratives"),
          qMatch("Match demonstrative to location:", [["これ","near speaker"],["それ","near listener"],["あれ","far from both"]], "demonstratives"),
          q("'おみやげ' means…", ["food","souvenir","bag","gift shop"], 1, "vocab"),
        ],
      },
      {
        title: "いくらですか — How Much Is It?",
        objectives: ["Count money in Japanese", "Ask prices and respond"],
        warmUp: "Have you ever been to a Japanese convenience store? What was surprising about the shopping experience?",
        canDo: [
          "Say numbers up to 10,000 yen",
          "Ask the price: いくらですか？",
          "Respond: ～えんです",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "ハナ", text: "すみません、このおかしはいくらですか？", translation: "Excuse me, how much are these sweets?" },
          { speaker: "サトウ", text: "それは300えんです。", translation: "Those are 300 yen." },
          { speaker: "ハナ", text: "じゃあ、ふたつください。600えんですね。", translation: "Then, two please. That's 600 yen, right?" },
          { speaker: "サトウ", text: "はい、そうです。ありがとうございます。", translation: "Yes, that's right. Thank you very much." },
        ],
        patternExamples: [
          { pattern: "[item]はいくらですか？", examples: ["このほんはいくらですか？(How much is this book?)", "そのバッグはいくらですか？(How much is that bag?)"] },
          { pattern: "～えんです。", examples: ["300えんです。(It's 300 yen.)", "2000えんです。(It's 2,000 yen.)"] },
          { pattern: "[counter]ください。", examples: ["ひとつください。(One please.)", "みっつください。(Three please.)"] },
        ],
        cultureNote: "Japan is famous for its convenience stores (コンビニ). With over 50,000 locations, コンビニ sell everything from onigiri to hot meals. Prices are always clearly marked and consumption tax (消費税) is added at checkout.",
        vocab: [
          { term: "いくら", reading: "ikura", meaning: "how much?", example: "これはいくらですか？" },
          { term: "えん", reading: "en", meaning: "yen (Japanese currency)", example: "500えんです。" },
          { term: "ください", reading: "kudasai", meaning: "please give me", example: "みずをください。" },
          { term: "ひとつ", reading: "hitotsu", meaning: "one (item)", example: "ひとつください。" },
          { term: "ふたつ", reading: "futatsu", meaning: "two (items)", example: "ふたつください。" },
        ],
        quiz: [
          q("'いくらですか' asks…", ["what is this?","how much is it?","do you have it?","is it delicious?"], 1, "shopping"),
          q("500えん = ___", ["50 yen","500 yen","5,000 yen","5 yen"], 1, "numbers"),
          qFill("Complete: 'ふたつ___ ' (two please):", ["ください"], "shopping"),
          qReorder("Ask: 'How much is this book?':", ["いくら","この","ですか？","ほんは"], [1,3,0,2], "shopping"),
        ],
      },
    ],
  },

  {
    title: "まいにちのせいかつ",
    levelLabel: "N5",
    description: "Talk about daily routines, times, and what you do each day.",
    prereqTitles: ["これはなんですか"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "なんじですか — What Time Is It?",
        objectives: ["Tell the time in Japanese", "Ask and answer time-related questions"],
        warmUp: "What time do you usually wake up? What time do Japanese people typically start work?",
        canDo: [
          "Say what time it is: いまなんじですか？",
          "Read times up to the half hour: ～じ、～じはん",
          "Say AM/PM: ごぜん / ごご",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "キム", text: "すみません、いまなんじですか？", translation: "Excuse me, what time is it now?" },
          { speaker: "サトウ", text: "えーと、くじはんです。", translation: "Let me see, it's 9:30." },
          { speaker: "キム", text: "じゅぎょうはなんじからですか？", translation: "What time does class start?" },
          { speaker: "ハナ", text: "じゅうじからです。あと30ぷんあります！", translation: "It starts at 10. There are 30 more minutes!" },
        ],
        patternExamples: [
          { pattern: "いまなんじですか？ → ～じ(はん)です。", examples: ["いまくじです。(It's 9 o'clock now.)", "いまさんじはんです。(It's 3:30 now.)"] },
          { pattern: "～じから～じまで", examples: ["くじからじゅうじまでべんきょうします。(I study from 9 to 10.)", "かいしゃはくじからごじまでです。(The office is from 9 to 5.)"] },
        ],
        cultureNote: "Japan runs on precise time. Trains are famously on-time — delays of even 1 minute prompt official apologies. Being late to a meeting is considered very rude. The phrase 時間を守る (jikan wo mamoru — keep time) is a core Japanese value.",
        vocab: [
          { term: "なんじ", reading: "nanji", meaning: "what time?", example: "いまなんじですか？" },
          { term: "じ", reading: "ji", meaning: "o'clock", example: "くじです。(It's 9 o'clock.)" },
          { term: "はん", reading: "han", meaning: "half (past)", example: "さんじはんです。(It's 3:30.)" },
          { term: "ごぜん", reading: "gozen", meaning: "AM", example: "ごぜんくじ (9 AM)" },
          { term: "ごご", reading: "gogo", meaning: "PM", example: "ごごさんじ (3 PM)" },
        ],
        quiz: [
          q("'なんじ' means…", ["what day","what time","how long","which hour"], 1, "time"),
          q("'さんじはん' means…", ["3 hours","3:15","3:30","3:00"], 2, "time"),
          qFill("Complete: 'いまくじ___です' (it's 9:30):", ["はん"], "time"),
          qMatch("Match to meaning:", [["ごぜん","AM"],["ごご","PM"],["はん","half past"]], "time-vocab"),
        ],
      },
      {
        title: "まいにちなにをしますか — Daily Activities",
        objectives: ["Describe your daily routine in Japanese", "Use time expressions with activity verbs"],
        warmUp: "Think about your typical weekday. From waking up to going to bed — what happens in between?",
        canDo: [
          "Describe daily activities: おきます、たべます、いきます",
          "Say when you do things: ～じに～します",
          "Talk about morning/evening routines",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "ハナ", text: "まいにち、なんじにおきますか？", translation: "What time do you wake up every day?" },
          { speaker: "サトウ", text: "しちじにおきます。それからシャワーをあびて、あさごはんをたべます。", translation: "I wake up at 7. Then I take a shower and eat breakfast." },
          { speaker: "ハナ", text: "しごとはなんじからですか？", translation: "What time does work start?" },
          { speaker: "サトウ", text: "くじからです。まいあさでんしゃでかいしゃにいきます。", translation: "From 9 o'clock. Every morning I go to work by train." },
          { speaker: "キム", text: "わたしはきょうごじにがっこうがおわります。そのあとじゅくにいきます。", translation: "My school finishes at 5 today. After that I go to cram school." },
        ],
        patternExamples: [
          { pattern: "～じに～ます。", examples: ["しちじにおきます。(I wake up at 7.)", "はちじにがっこうにいきます。(I go to school at 8.)"] },
          { pattern: "それから〜ます。", examples: ["シャワーをあびます。それからあさごはんをたべます。(I take a shower. Then I eat breakfast.)"] },
          { pattern: "[vehicle]で[place]にいきます。", examples: ["でんしゃでかいしゃにいきます。(I go to work by train.)", "バスでがっこうにいきます。(I go to school by bus.)"] },
        ],
        cultureNote: "Japanese people commute an average of 48 minutes each way — one of the longest in the world. Many use this time to read, study apps, or sleep. 'Standing sleep' (立ち寝 tachineri) on trains is a famous phenomenon!",
        vocab: [
          { term: "おきます", reading: "okimasu", meaning: "to wake up / get up", example: "まいあさしちじにおきます。" },
          { term: "たべます", reading: "tabemasu", meaning: "to eat", example: "あさごはんをたべます。" },
          { term: "いきます", reading: "ikimasu", meaning: "to go", example: "がっこうにいきます。" },
          { term: "でんしゃ", reading: "densha", meaning: "train", example: "でんしゃでいきます。" },
          { term: "まいあさ", reading: "maiasa", meaning: "every morning", example: "まいあさシャワーをあびます。" },
        ],
        quiz: [
          q("'おきます' means…", ["to sleep","to wake up","to eat","to go"], 1, "verbs"),
          q("'でんしゃで' uses で to mean…", ["at the train station","by train (means of transport)","to the train","from the train"], 1, "particles"),
          qFill("Complete: 'くじに___にいきます' (go to school at 9):", ["がっこう"], "daily-routine"),
          qReorder("Build: 'I eat breakfast every morning':", ["たべます","まいあさ","あさごはんを","わたしは"], [3,1,2,0], "daily-routine"),
        ],
      },
    ],
  },

  {
    title: "わたしのすきなもの",
    levelLabel: "N5",
    description: "Talk about likes and dislikes, food preferences, and hobbies.",
    prereqTitles: ["まいにちのせいかつ"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "すきですか — Do You Like It?",
        objectives: ["Express likes and dislikes in Japanese", "Ask about preferences politely"],
        warmUp: "What's your favorite food? Your least favorite? How do people express preferences in your language?",
        canDo: [
          "Say what you like: ～がすきです",
          "Say what you dislike: ～がきらいです / ～はにがてです",
          "Ask about preferences: ～はすきですか？",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "サトウ", text: "ハナさんはにほんりょうりはすきですか？", translation: "Hana, do you like Japanese cuisine?" },
          { speaker: "ハナ", text: "はい、だいすきです！とくにすしとラーメンがすきです。", translation: "Yes, I love it! I especially like sushi and ramen." },
          { speaker: "サトウ", text: "なっとうはどうですか？", translation: "How about natto?" },
          { speaker: "ハナ", text: "うーん、ちょっとにがてです…においが…", translation: "Hmm, I'm not good with it... the smell..." },
          { speaker: "キム", text: "わたしはなっとうがすきです！からいたべものもすきです。", translation: "I like natto! I also like spicy food." },
        ],
        patternExamples: [
          { pattern: "～がすきです / きらいです / にがてです", examples: ["すしがすきです。(I like sushi.)", "なっとうがきらいです。(I dislike natto.)", "からいものはにがてです。(I'm bad with spicy food.)"] },
          { pattern: "とくに～がすきです。", examples: ["とくにすしがすきです。(I especially like sushi.)", "とくにきょうとがすきです。(I especially like Kyoto.)"] },
        ],
        cultureNote: "Natto (納豆) — fermented soybeans — divides even Japanese people. Many Japanese from western Japan dislike it, while it's a breakfast staple in the east. It's a classic test for foreign visitors and often comes up in early conversations!",
        vocab: [
          { term: "すきです", reading: "suki desu", meaning: "to like", example: "すしがすきです。" },
          { term: "だいすき", reading: "daisuki", meaning: "to love (really like)", example: "にほんがだいすきです。" },
          { term: "きらい", reading: "kirai", meaning: "to dislike", example: "なっとうがきらいです。" },
          { term: "にがて", reading: "nigate", meaning: "not good at / not fond of", example: "からいものはにがてです。" },
          { term: "とくに", reading: "tokuni", meaning: "especially / particularly", example: "とくにすしがすきです。" },
        ],
        quiz: [
          q("'すきです' means…", ["to dislike","to like","to eat","to want"], 1, "likes"),
          q("'きらいです' means…", ["to love","to dislike","to prefer","to be bad at"], 1, "likes"),
          q("'にがてです' means…", ["it's bitter","I'm not good at it / not fond of it","it's difficult","I hate it"], 1, "likes"),
          qFill("Complete: 'とくにすし___ すきです' (I especially like sushi):", ["が"], "particles"),
        ],
      },
      {
        title: "しゅみはなんですか — What Are Your Hobbies?",
        objectives: ["Talk about hobbies and free time activities", "Use frequency adverbs: よく、ときどき、あまり"],
        warmUp: "What do you do in your free time? How often? Think about the last weekend — what activities did you do?",
        canDo: [
          "Name common hobbies in Japanese",
          "Say how often you do things: よく・ときどき・あまり～ない",
          "Ask about someone's hobbies: しゅみはなんですか？",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "ハナ", text: "キムさん、しゅみはなんですか？", translation: "Kim, what are your hobbies?" },
          { speaker: "キム", text: "しゃしんをとることです。よくこうえんでとります。ハナさんは？", translation: "It's taking photos. I often take them in the park. What about Hana?" },
          { speaker: "ハナ", text: "わたしはりょうりがすきです。でも、うたをうたうこともすきです！", translation: "I like cooking. But I also like singing!" },
          { speaker: "サトウ", text: "わたしはどくしょです。まいばんほんをよみます。ときどきまんがも。", translation: "Mine is reading. I read books every evening. Sometimes manga too." },
        ],
        patternExamples: [
          { pattern: "しゅみは[verb-こと]です。", examples: ["しゅみはしゃしんをとることです。(My hobby is taking photos.)", "しゅみはりょうりをすることです。(My hobby is cooking.)"] },
          { pattern: "よく / ときどき / あまり～ません", examples: ["よくえいがをみます。(I often watch movies.)", "ときどきうたをうたいます。(I sometimes sing.)", "あまりテレビをみません。(I don't watch TV much.)"] },
        ],
        cultureNote: "Manga (漫画) is Japan's most beloved art form — Japan publishes more comics than any other country. Weekly manga magazines sell millions of copies. Reading manga is a great way to practice Japanese because the dialogue uses natural, conversational speech!",
        vocab: [
          { term: "しゅみ", reading: "shumi", meaning: "hobby", example: "しゅみはなんですか？" },
          { term: "よく", reading: "yoku", meaning: "often", example: "よくえいがをみます。" },
          { term: "ときどき", reading: "tokidoki", meaning: "sometimes", example: "ときどきうたをうたいます。" },
          { term: "どくしょ", reading: "dokusho", meaning: "reading (books)", example: "どくしょがすきです。" },
          { term: "りょうり", reading: "ryouri", meaning: "cooking / cuisine", example: "りょうりをします。" },
        ],
        quiz: [
          q("'しゅみ' means…", ["free time","hobby","sports","favorite thing"], 1, "vocab"),
          q("'よく' means…", ["sometimes","rarely","often","always"], 2, "frequency"),
          q("'ときどき' means…", ["often","always","sometimes","never"], 2, "frequency"),
          qFill("Complete: 'あまりテレビを___ ません' (don't watch TV much):", ["み"], "negation"),
        ],
      },
    ],
  },

  {
    title: "わたしのまち",
    levelLabel: "N5",
    description: "Ask for and give directions, describe your town, and navigate locations.",
    prereqTitles: ["わたしのすきなもの"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "どこですか — Where Is It?",
        objectives: ["Ask where places are", "Describe location using に・で・の"],
        warmUp: "Think about your neighborhood. If someone was lost, what landmarks would you use to give directions?",
        canDo: [
          "Ask where something is: ～はどこですか？",
          "Answer with location words: みぎ・ひだり・まっすぐ・ちかく",
          "Use に and で for location",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "ハナ", text: "すみません、ゆうびんきょくはどこですか？", translation: "Excuse me, where is the post office?" },
          { speaker: "サトウ", text: "あのかどをみぎにまがってください。まっすぐいくと、ひだりにあります。", translation: "Please turn right at that corner. If you go straight, it's on the left." },
          { speaker: "ハナ", text: "とおいですか？", translation: "Is it far?" },
          { speaker: "サトウ", text: "いいえ、ちかいです。あるいて5ふんくらいです。", translation: "No, it's close. About 5 minutes on foot." },
        ],
        patternExamples: [
          { pattern: "～はどこですか？", examples: ["えきはどこですか？(Where is the station?)", "トイレはどこですか？(Where is the toilet?)"] },
          { pattern: "[direction]に[verb]てください。", examples: ["みぎにまがってください。(Please turn right.)", "まっすぐいってください。(Please go straight.)"] },
          { pattern: "あるいて～ふん", examples: ["あるいて5ふんです。(5 minutes on foot.)", "えきからあるいて10ぷんです。(10 minutes on foot from the station.)"] },
        ],
        cultureNote: "Japanese streets were historically laid out for defense — they're maze-like on purpose. Most Japanese addresses describe the block number, not the street name. Japanese people often give directions using landmarks: 'コンビニのとなりです' (next to the convenience store).",
        vocab: [
          { term: "どこ", reading: "doko", meaning: "where", example: "えきはどこですか？" },
          { term: "みぎ", reading: "migi", meaning: "right", example: "みぎにまがる。" },
          { term: "ひだり", reading: "hidari", meaning: "left", example: "ひだりにある。" },
          { term: "まっすぐ", reading: "massugu", meaning: "straight ahead", example: "まっすぐいく。" },
          { term: "ちかい", reading: "chikai", meaning: "near / close", example: "えきからちかい。" },
        ],
        quiz: [
          q("'どこ' means…", ["what","when","where","who"], 2, "questions"),
          q("'みぎにまがってください' means…", ["Go straight","Turn left","Turn right","Stop here"], 2, "directions"),
          q("'ちかい' means…", ["far","near","expensive","easy"], 1, "vocab"),
          qReorder("Ask: 'Where is the station?':", ["えきは","ですか？","どこ"], [0,2,1], "directions"),
        ],
      },
      {
        title: "こうつう — Getting Around",
        objectives: ["Use transportation vocabulary", "Buy tickets and use public transit"],
        warmUp: "How do you usually travel in your city? Have you ever used a subway or bullet train?",
        canDo: [
          "Name common transport: でんしゃ・バス・しんかんせん",
          "Ask how to get somewhere: どうやっていきますか？",
          "Buy a ticket: きっぷをかいます",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "キム", text: "とうきょうからきょうとまでどうやっていきますか？", translation: "How do you get from Tokyo to Kyoto?" },
          { speaker: "サトウ", text: "しんかんせんでいきます。2じかんくらいです。", translation: "You go by Shinkansen. It's about 2 hours." },
          { speaker: "キム", text: "きっぷはどこでかいますか？", translation: "Where do you buy tickets?" },
          { speaker: "サトウ", text: "えきのじどうけんばいきでかえます。またはアプリでも。", translation: "You can buy them at the station vending machine. Or also on an app." },
          { speaker: "ハナ", text: "しんかんせんにのりたいです！はやいですよね？", translation: "I want to ride the Shinkansen! It's fast, right?" },
        ],
        patternExamples: [
          { pattern: "[vehicle]で[place]にいきます。", examples: ["しんかんせんできょうとにいきます。(I go to Kyoto by Shinkansen.)", "バスでえきにいきます。(I go to the station by bus.)"] },
          { pattern: "[place A]から[place B]まで", examples: ["とうきょうからきょうとまで(from Tokyo to Kyoto)", "えきからがっこうまで(from the station to school)"] },
        ],
        cultureNote: "The Shinkansen (新幹線 bullet train) has been running since 1964 with zero passenger fatalities. Its average delay is under 1 minute per year. It's not just fast transport — it's a symbol of Japanese precision and engineering pride.",
        vocab: [
          { term: "しんかんせん", reading: "shinkansen", meaning: "bullet train", example: "しんかんせんにのる。" },
          { term: "バス", reading: "basu", meaning: "bus", example: "バスでいく。" },
          { term: "きっぷ", reading: "kippu", meaning: "ticket", example: "きっぷをかう。" },
          { term: "のる", reading: "noru", meaning: "to ride / board", example: "でんしゃにのる。" },
          { term: "から～まで", reading: "kara~made", meaning: "from ~ to ~", example: "えきからあるいて5ふん。" },
        ],
        quiz: [
          q("'しんかんせん' is…", ["a local train","a bullet train","a bus","an airplane"], 1, "transport"),
          q("'のる' means…", ["to walk","to run","to ride/board","to stop"], 2, "verbs"),
          q("'きっぷをかいます' means…", ["I buy a ticket","I look at the map","I board the train","I use an app"], 0, "shopping"),
          qFill("Complete: 'とうきょう___きょうとまで' (from Tokyo to Kyoto):", ["から"], "particles"),
        ],
      },
    ],
  },

  {
    title: "たべもの",
    levelLabel: "N5",
    description: "Order food, talk about meals, and discuss Japanese food culture.",
    prereqTitles: ["わたしのまち"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "レストランで — At the Restaurant",
        objectives: ["Order food and drinks at a restaurant", "Use polite request expressions"],
        warmUp: "Have you ever been to a Japanese restaurant? What did you order? What was challenging about it?",
        canDo: [
          "Call a waiter: すみません！",
          "Order politely: ～をください / ～をおねがいします",
          "Ask what's recommended: おすすめはなんですか？",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "ハナ", text: "すみません！", translation: "Excuse me!" },
          { speaker: "サトウ", text: "はい、ごちゅうもんはおきまりですか？", translation: "Yes, have you decided on your order?" },
          { speaker: "ハナ", text: "えーと、おすすめはなんですか？", translation: "Hmm, what do you recommend?" },
          { speaker: "サトウ", text: "てんぷらていしょくがにんきです。", translation: "The tempura set meal is popular." },
          { speaker: "ハナ", text: "じゃあ、それをひとつおねがいします。あと、おみずもください。", translation: "Then, one of that please. Also, some water please." },
          { speaker: "サトウ", text: "かしこまりました。しょうしょうおまちください。", translation: "Certainly. Please wait a moment." },
        ],
        patternExamples: [
          { pattern: "～をください / ～をおねがいします", examples: ["みずをください。(Water please.)", "てんぷらをおねがいします。(Tempura please.)", "これをひとつください。(One of this please.)"] },
          { pattern: "おすすめはなんですか？", examples: ["このおみせのおすすめはなんですか？(What is this restaurant's recommendation?)"] },
        ],
        cultureNote: "In Japanese restaurants, you shout 'すみません!' to get attention — it's not rude! Many restaurants now use tablets for ordering. A set meal (定食 teishoku) typically includes a main dish, rice, miso soup, and pickles — excellent value and very filling.",
        vocab: [
          { term: "ていしょく", reading: "teishoku", meaning: "set meal", example: "てんぷらていしょくをください。" },
          { term: "おすすめ", reading: "osusume", meaning: "recommendation", example: "おすすめはなんですか？" },
          { term: "おねがいします", reading: "onegaishimasu", meaning: "please (requesting)", example: "みずをおねがいします。" },
          { term: "ごちゅうもん", reading: "gochuumon", meaning: "your order (polite)", example: "ごちゅうもんはおきまりですか？" },
          { term: "にんき", reading: "ninki", meaning: "popular", example: "このりょうりはにんきです。" },
        ],
        quiz: [
          q("To call a waiter in Japanese you say…", ["おねがいします","ありがとう","すみません","ください"], 2, "restaurant"),
          q("'おすすめ' means…", ["order","recommendation","menu","popular dish"], 1, "vocab"),
          q("'ていしょく' is…", ["a dessert","a set meal","a side dish","a buffet"], 1, "vocab"),
          qReorder("Order: 'Tempura, please':", ["おねがいします","てんぷらを"], [1,0], "ordering"),
        ],
      },
    ],
  },
];


// ─── ENGLISH ──────────────────────────────────────────────────────────────────

const englishSkills: SkillSeed[] = [
  {
    title: "Greetings & Introductions",
    levelLabel: "Beginner",
    description: "Meet people, introduce yourself, and exchange basic personal information.",
    prereqTitles: [],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Nice to Meet You",
        objectives: ["Greet people in English", "Introduce yourself with name, country, and job"],
        warmUp: "Imagine meeting someone new at an international event. What's the first thing you'd say to break the ice?",
        canDo: [
          "Greet someone: Hi / Hello / Nice to meet you",
          "Introduce yourself: My name is… / I'm from… / I work as…",
          "Respond to 'How are you?'",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Andi", text: "Hi! I'm Andi. Nice to meet you!", translation: "Halo! Saya Andi. Senang bertemu kamu!" },
          { speaker: "Sarah", text: "Nice to meet you too! I'm Sarah. Are you from Indonesia?", translation: "Senang bertemu kamu juga! Saya Sarah. Kamu dari Indonesia?" },
          { speaker: "Andi", text: "Yes, I'm from Jakarta. What about you?", translation: "Ya, saya dari Jakarta. Kalau kamu?" },
          { speaker: "Sarah", text: "I'm from Sydney, Australia. So, what do you do?", translation: "Saya dari Sydney, Australia. Jadi, apa pekerjaanmu?" },
          { speaker: "Andi", text: "I'm a software engineer. I'm here for a conference.", translation: "Saya insinyur perangkat lunak. Saya di sini untuk konferensi." },
        ],
        patternExamples: [
          { pattern: "I'm [name] / I'm from [place] / I work as [job]", examples: ["I'm Andi. (introduction)", "I'm from Jakarta, Indonesia. (origin)", "I work as a teacher. / I'm a teacher. (job)"] },
          { pattern: "Nice to meet you → Nice to meet you too!", examples: ["A: Nice to meet you! B: Nice to meet you too!", "A: Pleased to meet you! B: Likewise!"] },
        ],
        cultureNote: "In English-speaking cultures, small talk is important when meeting new people. Common topics: weather, jobs, where you're from. It's normal to ask 'What do you do?' early on — it's not considered rude, unlike in some cultures.",
        vocab: [
          { term: "nice to meet you", meaning: "polite greeting when meeting someone new", example: "Nice to meet you! I'm Andi." },
          { term: "I'm from…", meaning: "used to say your country or city", example: "I'm from Jakarta, Indonesia." },
          { term: "what do you do?", meaning: "asking about someone's job", example: "So, what do you do for work?" },
          { term: "likewise", meaning: "the same; used to return a compliment", example: "A: Nice to meet you! B: Likewise!" },
          { term: "conference", meaning: "a large professional meeting", example: "I'm here for a business conference." },
        ],
        quiz: [
          q("Someone says 'Nice to meet you!' You reply…", ["Yes, I do!","Nice to meet you too!","I'm fine, thanks.","See you later!"], 1, "greetings"),
          q("'What do you do?' is asking about your…", ["hobby","health","job","plans"], 2, "introductions"),
          qFill("Complete: 'I'm ___ Jakarta, Indonesia.'", ["from"], "grammar"),
          qReorder("Build: 'Nice to meet you, I'm Andi from Jakarta.'", ["I'm","Nice to meet you,","from Jakarta.","Andi"], [1,0,3,2], "introductions"),
        ],
      },
      {
        title: "How Are You? — Small Talk",
        objectives: ["Ask how someone is doing", "Give natural responses beyond 'I'm fine'"],
        warmUp: "When someone asks 'How are you?' in your language, what do people really say? Is it always honest?",
        canDo: [
          "Ask and answer: How are you? / How's it going?",
          "Give natural replies: Great! / Not bad. / Could be better.",
          "Keep a short conversation going with follow-up questions",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Maya", text: "Hey Andi! How are you doing?", translation: "Hei Andi! Apa kabar?" },
          { speaker: "Andi", text: "Pretty good, thanks! Just a bit tired from the flight. How about you?", translation: "Lumayan baik, terima kasih! Cuma agak lelah dari penerbangan. Kamu sendiri?" },
          { speaker: "Maya", text: "I'm great, actually! I just got some good news.", translation: "Saya baik sekali! Saya baru dapat kabar baik." },
          { speaker: "Andi", text: "Oh really? What happened?", translation: "Oh ya? Ada apa?" },
          { speaker: "Maya", text: "I got into the graduate program I applied for!", translation: "Saya diterima di program pascasarjana yang saya daftar!" },
        ],
        patternExamples: [
          { pattern: "How are you? / How's it going? / How are things?", examples: ["A: How are you? B: Pretty good, thanks!", "A: How's it going? B: Not bad! / Could be better."] },
          { pattern: "Returning the question: How about you? / And you?", examples: ["I'm good, thanks. How about you?", "Not bad! And you?"] },
        ],
        cultureNote: "'How are you?' in English is often a greeting, not a real question. A short positive reply is expected. If you give a long detailed answer, it can feel unusual in casual encounters. Save the details for close friends!",
        vocab: [
          { term: "pretty good", meaning: "fairly good; quite well", example: "I'm pretty good, thanks." },
          { term: "not bad", meaning: "okay; acceptable (informal)", example: "Not bad, could be better!" },
          { term: "could be better", meaning: "not great but polite way to say so", example: "Honestly? Could be better — rough week." },
          { term: "How about you?", meaning: "returning the same question", example: "I'm fine, thanks. How about you?" },
          { term: "actually", meaning: "used to add emphasis or mild surprise", example: "I'm great, actually!" },
        ],
        quiz: [
          q("'How are you?' in casual English is usually…", ["a deep personal question","a medical inquiry","a friendly greeting ritual","rude to ask"], 2, "small-talk"),
          q("The most natural reply to 'How are you?'", ["Yes, I am.","I'm fine, thanks! And you?","Nice to meet you.","Not at all."], 1, "responses"),
          qFill("Complete: 'I'm good, thanks. How ___ you?'", ["about"], "small-talk"),
          qMatch("Match the reply to its tone:", [["Not bad!","neutral/okay"],["I'm great!","very positive"],["Could be better.","slightly negative"]], "responses"),
        ],
      },
    ],
  },

  {
    title: "My Daily Life",
    levelLabel: "Beginner",
    description: "Describe your daily routine, talk about time, and discuss habits.",
    prereqTitles: ["Greetings & Introductions"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "My Morning Routine",
        objectives: ["Describe daily activities using the present simple", "Use time expressions: in the morning, at night, every day"],
        warmUp: "What does your typical morning look like? From the moment your alarm goes off — what happens next?",
        canDo: [
          "Describe your morning routine: I wake up at…, I have breakfast…",
          "Use present simple for habits and routines",
          "Use time expressions: at 7 AM, in the morning, every day",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Sarah", text: "Andi, you look exhausted. What time did you get up this morning?", translation: "Andi, kamu terlihat kelelahan. Jam berapa kamu bangun pagi ini?" },
          { speaker: "Andi", text: "I got up at 5:30. I always wake up early — I go running every morning.", translation: "Saya bangun jam 5:30. Saya selalu bangun pagi — saya lari setiap pagi." },
          { speaker: "Sarah", text: "Wow! I could never do that. I'm not a morning person at all.", translation: "Wow! Saya tidak pernah bisa melakukan itu. Saya sama sekali bukan orang yang suka pagi." },
          { speaker: "Andi", text: "It was hard at first! But now I love it. After running I have a shower, then breakfast.", translation: "Awalnya sulit! Tapi sekarang saya suka. Setelah lari, saya mandi, lalu sarapan." },
          { speaker: "Maya", text: "I usually skip breakfast. I just grab a coffee on the way to class.", translation: "Saya biasanya melewatkan sarapan. Saya cuma ambil kopi dalam perjalanan ke kelas." },
        ],
        patternExamples: [
          { pattern: "I [verb] at [time] / every [day/morning/etc.]", examples: ["I wake up at 6 AM every day.", "I have lunch at noon.", "I go to the gym every Monday."] },
          { pattern: "I always / usually / sometimes / never [verb]", examples: ["I always brush my teeth before bed.", "I usually have coffee in the morning.", "I never skip breakfast."] },
        ],
        cultureNote: "In English-speaking countries, breakfast habits vary widely. In Australia and the UK, a 'proper breakfast' might mean eggs, toast, and beans. In the US, cereal or pancakes are common. In many Asian countries, locals find Western breakfast food unusual — and vice versa!",
        vocab: [
          { term: "wake up", meaning: "to stop sleeping and become conscious", example: "I wake up at 6 every morning." },
          { term: "get up", meaning: "to physically get out of bed (slightly different from wake up)", example: "I wake up at 6 but I don't get up until 6:30." },
          { term: "skip", meaning: "to miss or not do something on purpose", example: "I often skip breakfast when I'm in a hurry." },
          { term: "grab", meaning: "to take something quickly (informal)", example: "I grab a coffee before work." },
          { term: "on the way to", meaning: "while travelling toward somewhere", example: "I listen to podcasts on the way to work." },
        ],
        quiz: [
          q("'I always wake up early' uses the present simple because…", ["it happened once","it's a habit","it happened yesterday","it will happen tomorrow"], 1, "present-simple"),
          q("What's the difference between 'wake up' and 'get up'?", ["They're the same","Wake up = open eyes; get up = leave bed","Get up is formal","Wake up is past tense"], 1, "vocabulary"),
          qFill("Complete: 'I ___ skip breakfast — I'm always in a hurry.' (negative habit)", ["usually","often","sometimes"], "frequency"),
          qReorder("Build: 'I always have coffee on the way to work.'", ["on the way to work.","I","always","have coffee"], [1,2,3,0], "daily-routine"),
        ],
      },
      {
        title: "Talking About the Weekend",
        objectives: ["Use past simple to describe completed activities", "Talk about plans using 'going to'"],
        warmUp: "What did you do last weekend? Was it relaxing, busy, or something in between?",
        canDo: [
          "Talk about past activities: I went to…, I watched…, I met…",
          "Ask about someone's weekend: How was your weekend?",
          "Share plans: I'm going to… this weekend",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Sarah", text: "Hey Maya! How was your weekend?", translation: "Hai Maya! Apa kabar akhir pekanmu?" },
          { speaker: "Maya", text: "It was great! I went to a food festival on Saturday. The food was amazing.", translation: "Sangat menyenangkan! Saya pergi ke festival makanan hari Sabtu. Makanannya luar biasa." },
          { speaker: "Sarah", text: "Oh nice! Did you try anything unusual?", translation: "Wah bagus! Apakah kamu mencoba sesuatu yang tidak biasa?" },
          { speaker: "Maya", text: "Yes! I tried a crocodile burger. It tasted like chicken, honestly.", translation: "Ya! Saya mencoba burger buaya. Rasanya seperti ayam, jujur saja." },
          { speaker: "Andi", text: "What are you going to do this coming weekend?", translation: "Apa yang akan kamu lakukan akhir pekan ini?" },
          { speaker: "Maya", text: "I'm going to visit the botanical gardens. Want to join?", translation: "Saya akan mengunjungi kebun raya. Mau ikut?" },
        ],
        patternExamples: [
          { pattern: "I went / I tried / I saw / I ate [past simple]", examples: ["I went to a food festival on Saturday.", "I tried a crocodile burger — it tasted like chicken!", "I saw a great movie last night."] },
          { pattern: "How was [noun]? → It was [adjective]!", examples: ["How was your weekend? → It was great!", "How was the food? → It was amazing!", "How was the movie? → It was boring, actually."] },
          { pattern: "I'm going to [verb] this [time]", examples: ["I'm going to visit the gardens this weekend.", "I'm going to cook dinner tonight."] },
        ],
        cultureNote: "Food festivals are hugely popular in Australia, the UK, and the US. They're a way communities celebrate diversity. You'll find everything from gourmet burgers to exotic meats — trying unusual foods is considered adventurous, not rude!",
        vocab: [
          { term: "food festival", meaning: "an event with many food stalls and vendors", example: "I went to a food festival last weekend." },
          { term: "unusual", meaning: "not common; different from normal", example: "Did you try anything unusual?" },
          { term: "honestly", meaning: "used when saying something surprising but true", example: "It tasted like chicken, honestly." },
          { term: "botanical gardens", meaning: "a park with collections of plants and flowers", example: "The botanical gardens are beautiful in spring." },
          { term: "join", meaning: "to come with someone; to participate", example: "We're going to the park — want to join?" },
        ],
        quiz: [
          q("'How was your weekend?' expects a reply about…", ["the coming weekend","your job","the past weekend","your health"], 2, "past-simple"),
          q("'I'm going to visit the gardens' describes…", ["a past event","a habit","a future plan","an obligation"], 2, "future"),
          qFill("Complete: 'I ___ to a food festival on Saturday.' (past of go)", ["went"], "past-simple"),
          qMatch("Match the tense to its use:", [["I went to…","completed past action"],["I'm going to…","future plan"],["I always go to…","habit/routine"]], "tenses"),
        ],
      },
    ],
  },

  {
    title: "Food & Eating Out",
    levelLabel: "Beginner",
    description: "Order food confidently, express preferences, and navigate a restaurant in English.",
    prereqTitles: ["My Daily Life"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "At a Restaurant",
        objectives: ["Order food and drinks politely", "Ask for recommendations and handle requests"],
        warmUp: "Think of the last time you ate at a restaurant. How did you order? Was there anything on the menu you didn't understand?",
        canDo: [
          "Get a waiter's attention: Excuse me!",
          "Order politely: I'd like… / Could I have… / I'll have…",
          "Ask questions: What do you recommend? / Does this contain…?",
          "Handle the bill: Could we have the check, please?",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Waiter", text: "Good evening! Are you ready to order?", translation: "Selamat malam! Apakah Anda siap memesan?" },
          { speaker: "Andi", text: "Almost! Could you tell me what the special is today?", translation: "Hampir siap! Bisakah Anda memberi tahu apa menu spesial hari ini?" },
          { speaker: "Waiter", text: "Today's special is grilled salmon with lemon butter sauce. It's very popular.", translation: "Menu spesial hari ini adalah salmon panggang dengan saus mentega lemon. Sangat populer." },
          { speaker: "Andi", text: "That sounds great. I'll have that. And a glass of sparkling water, please.", translation: "Kedengarannya enak. Saya mau itu. Dan segelas air sparkling, tolong." },
          { speaker: "Maya", text: "I'd like the pasta, please. Is it vegetarian?", translation: "Saya ingin pasta, tolong. Apakah itu vegetarian?" },
          { speaker: "Waiter", text: "Yes, it is! No meat at all. Shall I bring some bread while you wait?", translation: "Ya! Tidak ada daging sama sekali. Haruskah saya bawakan roti sementara Anda menunggu?" },
        ],
        patternExamples: [
          { pattern: "I'd like… / I'll have… / Could I have…", examples: ["I'd like the salmon, please. (polite, most common)", "I'll have the pasta. (casual but acceptable)", "Could I have a glass of water? (very polite)"] },
          { pattern: "Does this contain [ingredient]? / Is this [dietary requirement]?", examples: ["Does this contain nuts? I'm allergic.", "Is the pasta vegetarian?", "Is this dish gluten-free?"] },
        ],
        cultureNote: "Tipping culture varies across English-speaking countries. In the US, 15-20% is expected. In Australia and New Zealand, tipping is optional. In the UK, 10-12.5% service charge is often already added. Always check the bill before tipping!",
        vocab: [
          { term: "I'd like", meaning: "polite form of 'I want' — use when ordering", example: "I'd like the grilled salmon, please." },
          { term: "Could I have…?", meaning: "very polite way to request something", example: "Could I have the check, please?" },
          { term: "the special", meaning: "today's featured dish, often not on the regular menu", example: "What's the special today?" },
          { term: "sparkling water", meaning: "fizzy water with bubbles (vs. still water)", example: "Still or sparkling water?" },
          { term: "vegetarian", meaning: "contains no meat or fish", example: "Is this dish vegetarian?" },
        ],
        quiz: [
          q("The most polite way to order is…", ["I want the pasta.","Give me the pasta.","I'd like the pasta, please.","Pasta!"], 2, "ordering"),
          q("'Does this contain nuts?' is asked because…", ["nuts are expensive","the person may be allergic","nuts don't taste good","the dish looks unusual"], 1, "dietary"),
          qFill("Complete: 'Could I ___ the check, please?'", ["have"], "polite-requests"),
          qMatch("Match to politeness level:", [["I want","direct/informal"],["I'd like","polite"],["Could I have","very polite"]], "politeness"),
        ],
      },
    ],
  },

  {
    title: "Getting Around",
    levelLabel: "Beginner",
    description: "Ask for and give directions, use public transport, and navigate a new city.",
    prereqTitles: ["Food & Eating Out"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Asking for Directions",
        objectives: ["Ask for and give directions in English", "Use prepositions of place: next to, opposite, on the left"],
        warmUp: "You're in a new city with no internet. A stranger asks you for directions to the nearest supermarket. What do you say?",
        canDo: [
          "Ask for directions: Excuse me, how do I get to…?",
          "Give directions: Turn left/right at… / Go straight… / It's next to…",
          "Describe distance: It's about a 5-minute walk",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Andi", text: "Excuse me! I'm looking for the City Library. Am I going the right way?", translation: "Permisi! Saya mencari Perpustakaan Kota. Apakah saya menuju arah yang benar?" },
          { speaker: "Sarah", text: "Hmm, not quite. You need to go back one block and turn left on Queen Street.", translation: "Hmm, belum tepat. Kamu perlu kembali satu blok dan belok kiri di Queen Street." },
          { speaker: "Andi", text: "Turn left on Queen Street — okay. Then what?", translation: "Belok kiri di Queen Street — oke. Lalu?" },
          { speaker: "Sarah", text: "Walk straight for about two blocks. The library is on the right, opposite the park.", translation: "Jalan lurus sekitar dua blok. Perpustakaannya ada di kanan, di seberang taman." },
          { speaker: "Andi", text: "Perfect, thank you so much! Is it far?", translation: "Sempurna, terima kasih banyak! Apakah itu jauh?" },
          { speaker: "Sarah", text: "Not at all — maybe a 10-minute walk.", translation: "Tidak sama sekali — mungkin jalan kaki 10 menit." },
        ],
        patternExamples: [
          { pattern: "Turn left/right at [place/street]", examples: ["Turn left at the traffic lights.", "Turn right at the corner.", "Turn left on Queen Street."] },
          { pattern: "It's [location] the [landmark]", examples: ["It's next to the bank.", "It's opposite the park.", "It's on the corner of Main and Queen Street."] },
          { pattern: "It's about a [time]-minute walk/drive", examples: ["It's about a 10-minute walk.", "It's about a 5-minute drive.", "It's only 2 minutes from here."] },
        ],
        cultureNote: "In Australia, Canada, and the US, city blocks are standard direction units ('go two blocks'). In the UK, people more often use landmarks. In many Asian cities, GPS apps have replaced asking strangers — but knowing how to ask is still a vital travel skill!",
        vocab: [
          { term: "Excuse me!", meaning: "used to get someone's attention politely", example: "Excuse me! Do you know where the station is?" },
          { term: "go straight", meaning: "continue in the same direction without turning", example: "Go straight for two blocks." },
          { term: "on the right / left", meaning: "located to the right / left side", example: "The library is on the right." },
          { term: "opposite", meaning: "directly across from something", example: "It's opposite the park." },
          { term: "next to", meaning: "immediately beside something", example: "The cafe is next to the bookshop." },
        ],
        quiz: [
          q("'It's opposite the park' means…", ["beside the park","behind the park","in front of the park, across the street","inside the park"], 2, "prepositions"),
          q("You want polite attention from a stranger. You say…", ["Hey you!","Hello there.","Excuse me!","Sorry sorry!"], 2, "polite-english"),
          qFill("Complete: 'Turn ___ at the traffic lights, then go straight.'", ["left","right"], "directions"),
          qReorder("Give directions: 'Go straight for two blocks, then turn right.'", ["then turn right.","Go straight","for two blocks,"], [1,2,0], "directions"),
        ],
      },
    ],
  },

  {
    title: "Shopping",
    levelLabel: "Beginner",
    description: "Shop confidently — ask about prices, sizes, and availability in English.",
    prereqTitles: ["Getting Around"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "At a Shop",
        objectives: ["Ask about prices and availability", "Describe what you're looking for"],
        warmUp: "Describe something you recently bought. How did you decide to buy it? Was price, quality, or brand the deciding factor?",
        canDo: [
          "Ask for help: I'm looking for… / Do you have…?",
          "Ask about price: How much is this? / How much does this cost?",
          "Ask about size/colour: Do you have this in a medium? / Do you have it in blue?",
          "Complete the purchase: I'll take it. / I'll leave it, thanks.",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Andi", text: "Excuse me, I'm looking for a gift for my friend. Something around $30?", translation: "Permisi, saya mencari hadiah untuk teman saya. Sekitar $30?" },
          { speaker: "Sarah", text: "Sure! How about these scented candles? They're very popular.", translation: "Tentu! Bagaimana dengan lilin beraroma ini? Sangat populer." },
          { speaker: "Andi", text: "Oh, they look nice! How much are they?", translation: "Oh, terlihat bagus! Berapa harganya?" },
          { speaker: "Sarah", text: "These ones are $25 each. We also have gift sets for $45.", translation: "Yang ini $25 per buah. Kami juga punya set hadiah seharga $45." },
          { speaker: "Andi", text: "I'll go with the $25 one. Do you gift-wrap?", translation: "Saya ambil yang $25. Apakah Anda memberikan pembungkus kado?" },
          { speaker: "Sarah", text: "Absolutely! Free of charge. I'll wrap it beautifully for you.", translation: "Tentu saja! Gratis. Saya akan membungkusnya dengan indah untuk Anda." },
        ],
        patternExamples: [
          { pattern: "I'm looking for [item] / something [description]", examples: ["I'm looking for a blue shirt.", "I'm looking for something around $30.", "I'm looking for a gift for my friend."] },
          { pattern: "How much is/are [item]?", examples: ["How much is this candle?", "How much are these shoes?", "How much does this cost?"] },
          { pattern: "Do you have this in [size/colour]?", examples: ["Do you have this in a medium?", "Do you have it in black?", "Do you have a smaller size?"] },
        ],
        cultureNote: "Sales tax (GST, VAT) varies across countries. In Australia and Canada, the price on the tag usually doesn't include tax — you find out the real price at the register. In Japan, tax is included in the displayed price. In the US, it varies by state!",
        vocab: [
          { term: "I'm looking for…", meaning: "used to describe what you want to buy or find", example: "I'm looking for a pair of running shoes." },
          { term: "How much is/are…?", meaning: "asking about price", example: "How much is this jacket?" },
          { term: "gift-wrap", meaning: "to wrap a purchase as a gift with decorative paper", example: "Could you gift-wrap this for me?" },
          { term: "free of charge", meaning: "at no cost; for free", example: "Gift-wrapping is free of charge." },
          { term: "I'll take it.", meaning: "I'll buy it; I've decided to purchase it", example: "It's perfect — I'll take it!" },
        ],
        quiz: [
          q("'How much are these shoes?' is asking about…", ["the size","the colour","the price","the brand"], 2, "shopping"),
          q("'Do you have this in a medium?' is asking about…", ["colour","price","size","material"], 2, "shopping"),
          q("'I'll take it' means…", ["I'll think about it","I want to buy it","Can I try it on?","Too expensive"], 1, "shopping"),
          qFill("Complete: 'I'm ___ for a gift for my friend.'", ["looking"], "shopping"),
        ],
      },
    ],
  },

  {
    title: "Work & Study",
    levelLabel: "Beginner",
    description: "Talk about your job or studies, express ability, and discuss plans.",
    prereqTitles: ["Shopping"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "What Do You Do?",
        objectives: ["Talk about jobs and studies in English", "Use can/can't for ability and permission"],
        warmUp: "If you could have any job in the world, what would it be? What skills would you need?",
        canDo: [
          "Describe your job or studies in English",
          "Say what you can do: I can… / I'm good at…",
          "Talk about career goals: I want to / I'm planning to…",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Maya", text: "So Andi, how long have you been working as an engineer?", translation: "Jadi Andi, sudah berapa lama kamu bekerja sebagai insinyur?" },
          { speaker: "Andi", text: "About three years now. I work for a startup in Jakarta. We build mobile apps.", translation: "Sekitar tiga tahun. Saya bekerja untuk startup di Jakarta. Kami membangun aplikasi mobile." },
          { speaker: "Maya", text: "That's cool! What kind of apps?", translation: "Keren! Aplikasi jenis apa?" },
          { speaker: "Andi", text: "Mainly fintech — payment and banking apps. I'm good at backend development.", translation: "Terutama fintech — aplikasi pembayaran dan perbankan. Saya mahir dalam pengembangan backend." },
          { speaker: "Sarah", text: "I wish I could code! I studied marketing, so I'm more of a people person.", translation: "Saya berharap bisa coding! Saya belajar pemasaran, jadi saya lebih ke tipe orang yang suka berinteraksi." },
          { speaker: "Andi", text: "You can learn! There are great online courses. I taught myself Python in six months.", translation: "Kamu bisa belajar! Ada kursus online yang bagus. Saya otodidak Python dalam enam bulan." },
        ],
        patternExamples: [
          { pattern: "I work for / at [company] / as a [job]", examples: ["I work for a startup in Jakarta.", "I work at a hospital as a nurse.", "I work as a software engineer."] },
          { pattern: "I'm good at [noun/verb-ing]", examples: ["I'm good at backend development.", "I'm good at speaking in public.", "I'm not very good at cooking, honestly."] },
          { pattern: "I can / can't [verb]", examples: ["I can speak three languages.", "I can't drive — I never learned.", "Can you help me with this?"] },
        ],
        cultureNote: "The gig economy and remote work have transformed how people in English-speaking countries describe their jobs. 'I freelance as a designer' or 'I work remotely for a US company' are now common answers to 'What do you do?'",
        vocab: [
          { term: "startup", meaning: "a newly established business, usually in tech", example: "I work for a startup — we have 20 employees." },
          { term: "I'm good at…", meaning: "skilled or talented in something", example: "I'm good at problem-solving." },
          { term: "taught myself", meaning: "learned something without formal training", example: "I taught myself to play guitar." },
          { term: "mainly", meaning: "mostly; for the most part", example: "We mainly work on mobile apps." },
          { term: "people person", meaning: "someone who enjoys and is good with people", example: "I'm a people person — I love networking." },
        ],
        quiz: [
          q("'I'm good at backend development' means…", ["I like backend development","I am skilled at backend development","I want to learn backend","I work in backend"], 1, "ability"),
          q("'I taught myself Python' means…", ["someone taught me Python","I learned Python on my own","I studied Python at school","Python is easy"], 1, "vocabulary"),
          qFill("Complete: 'I work ___ a startup in Jakarta.'", ["for"], "prepositions"),
          qReorder("Build: 'I work as a software engineer for a startup.'", ["for a startup.","I work","as a software engineer"], [1,2,0], "work"),
        ],
      },
    ],
  },

  {
    title: "Describing People & Places",
    levelLabel: "Beginner",
    description: "Use adjectives to describe people, places, and things in detail.",
    prereqTitles: ["Work & Study"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "What's It Like?",
        objectives: ["Use adjectives to describe places and experiences", "Compare things using comparatives"],
        warmUp: "Think of a place you've visited that really impressed you. What three words would you use to describe it?",
        canDo: [
          "Describe places with adjectives: beautiful, crowded, expensive",
          "Compare two things: Tokyo is bigger than Sydney",
          "Give opinions: I think… / In my opinion… / Personally, I feel…",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Sarah", text: "Andi, how would you describe Jakarta to someone who's never been?", translation: "Andi, bagaimana kamu menggambarkan Jakarta kepada seseorang yang belum pernah ke sana?" },
          { speaker: "Andi", text: "Hmm, it's massive — one of the biggest cities in the world. Very lively, always something happening.", translation: "Hmm, kota ini sangat besar — salah satu kota terbesar di dunia. Sangat hidup, selalu ada sesuatu yang terjadi." },
          { speaker: "Maya", text: "Is it expensive to live there?", translation: "Apakah mahal untuk tinggal di sana?" },
          { speaker: "Andi", text: "It depends. Street food is super cheap, but rent is getting more expensive. It's more affordable than Tokyo, I think.", translation: "Tergantung. Makanan kaki lima sangat murah, tapi sewa makin mahal. Lebih terjangkau dari Tokyo, menurut saya." },
          { speaker: "Sarah", text: "I've heard the traffic is terrible though?", translation: "Saya dengar lalu lintasnya sangat parah?" },
          { speaker: "Andi", text: "Ha! Yes, honestly the traffic is the worst thing about it. But the food makes up for everything!", translation: "Ha! Ya, jujur saja lalu lintas adalah hal terburuk dari kota ini. Tapi makanannya mengcompensasi segalanya!" },
        ],
        patternExamples: [
          { pattern: "[City/place] is [adjective]", examples: ["Jakarta is massive and lively.", "London is expensive but fascinating.", "Bali is beautiful and very relaxing."] },
          { pattern: "[A] is [comparative adjective] than [B]", examples: ["Jakarta is bigger than Sydney.", "Street food is cheaper than restaurant food.", "The traffic is worse in the morning."] },
          { pattern: "I think… / In my opinion… / Personally, I feel…", examples: ["I think Jakarta is more affordable than Tokyo.", "In my opinion, the food scene is the best part.", "Personally, I find the traffic stressful."] },
        ],
        cultureNote: "English uses comparatives constantly in conversation. '-er' for short adjectives (bigger, cheaper, worse), 'more' for longer ones (more expensive, more beautiful). Irregular forms: good→better→best, bad→worse→worst.",
        vocab: [
          { term: "massive", meaning: "extremely large", example: "Jakarta is a massive city." },
          { term: "lively", meaning: "full of life and energy", example: "The night market is very lively." },
          { term: "it depends", meaning: "the answer varies according to the situation", example: "Is it expensive? It depends on the area." },
          { term: "affordable", meaning: "reasonably priced; not too expensive", example: "Street food is very affordable." },
          { term: "make up for", meaning: "to compensate for something negative", example: "The food makes up for the traffic." },
        ],
        quiz: [
          q("'Jakarta is bigger than Sydney' uses a…", ["superlative","comparative","adjective","adverb"], 1, "comparatives"),
          q("'More expensive' vs 'cheaper' — which is a comparative?", ["Neither","Both","Only 'cheaper'","Only 'more expensive'"], 1, "grammar"),
          qFill("Complete: 'The traffic is ___ in the morning than in the evening.' (bad→worse)", ["worse"], "comparatives"),
          qReorder("Build: 'In my opinion, Jakarta is more affordable than Tokyo.'", ["In my opinion,","than Tokyo.","Jakarta is","more affordable"], [0,2,3,1], "comparatives"),
        ],
      },
    ],
  },
];


// ─── INDONESIAN ────────────────────────────────────────────────────────────────

const indonesianSkills: SkillSeed[] = [
  {
    title: "Salam & Perkenalan",
    levelLabel: "Beginner",
    description: "Menyapa orang, memperkenalkan diri, dan berbasa-basi dasar.",
    prereqTitles: [],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Halo! Nama Saya…",
        objectives: ["Memperkenalkan diri dalam Bahasa Indonesia", "Menanyakan dan menjawab tentang nama, asal, dan pekerjaan"],
        warmUp: "Bayangkan kamu bertemu orang baru dari Indonesia. Apa yang pertama kali ingin kamu katakan?",
        canDo: [
          "Menyapa: Halo! / Selamat pagi! / Apa kabar?",
          "Memperkenalkan diri: Nama saya… / Saya dari… / Saya bekerja sebagai…",
          "Mengakhiri perkenalan dengan sopan: Senang berkenalan!",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Tom", text: "Halo! Nama saya Tom. Saya dari Australia.", translation: "Hi! My name is Tom. I'm from Australia." },
          { speaker: "Sari", text: "Halo Tom! Saya Sari. Senang berkenalan! Kamu bisa berbicara Bahasa Indonesia?", translation: "Hi Tom! I'm Sari. Nice to meet you! Can you speak Indonesian?" },
          { speaker: "Tom", text: "Sedikit — saya masih belajar! Sudah tiga bulan.", translation: "A little — I'm still learning! Three months already." },
          { speaker: "Sari", text: "Wah, bagus sekali! Bahasa Indonesiamu sudah lancar.", translation: "Wow, that's great! Your Indonesian is already fluent." },
          { speaker: "Tom", text: "Terima kasih! Terlalu baik. Kamu kerja di mana, Sari?", translation: "Thank you! Too kind. Where do you work, Sari?" },
          { speaker: "Sari", text: "Saya guru Bahasa Indonesia di sekolah menengah. Kamu?", translation: "I'm an Indonesian language teacher at a high school. You?" },
        ],
        patternExamples: [
          { pattern: "Nama saya [nama]. / Saya [nama].", examples: ["Nama saya Tom. (My name is Tom.)", "Saya Sari. (I'm Sari.)"] },
          { pattern: "Saya dari [kota/negara].", examples: ["Saya dari Australia. (I'm from Australia.)", "Saya dari Jakarta. (I'm from Jakarta.)"] },
          { pattern: "Senang berkenalan! / Senang bertemu (dengan) kamu!", examples: ["A: Nama saya Tom. B: Saya Sari. Senang berkenalan!"] },
        ],
        cultureNote: "Di Indonesia, sapaan bergantung pada waktu: Selamat pagi (pagi), Selamat siang (siang), Selamat sore (sore), Selamat malam (malam). Orang Indonesia sangat ramah pada orang asing yang mencoba berbicara Bahasa Indonesia — usahamu pasti diapresiasi!",
        vocab: [
          { term: "nama saya", meaning: "my name is", example: "Nama saya Tom." },
          { term: "senang berkenalan", meaning: "nice to meet you", example: "Senang berkenalan, Sari!" },
          { term: "sedikit", meaning: "a little", example: "Saya bisa berbicara sedikit Bahasa Indonesia." },
          { term: "masih belajar", meaning: "still learning", example: "Saya masih belajar Bahasa Indonesia." },
          { term: "sudah", meaning: "already / have (completed action)", example: "Sudah tiga bulan saya belajar." },
        ],
        quiz: [
          q("'Nama saya Tom' artinya…", ["Where is Tom?","My name is Tom.","Tom is here.","This is Tom."], 1, "intro"),
          q("Sapaan pada jam 8 pagi adalah…", ["Selamat siang","Selamat sore","Selamat malam","Selamat pagi"], 3, "greetings"),
          qFill("Lengkapi: 'Senang ___ !' (nice to meet you)", ["berkenalan"], "vocab"),
          qReorder("Susun: 'Nama saya Sari. Saya dari Jakarta.'", ["Saya dari Jakarta.","Nama saya Sari."], [1,0], "intro"),
        ],
      },
      {
        title: "Apa Kabar? — Berbasa-basi",
        objectives: ["Menanyakan dan menjawab 'apa kabar'", "Menjaga percakapan dengan pertanyaan lanjutan"],
        warmUp: "Di negara kamu, apa yang biasanya ditanyakan saat bertemu orang baru? Apakah sama dengan 'apa kabar' di Indonesia?",
        canDo: [
          "Menanyakan keadaan: Apa kabar? / Bagaimana kabarnya?",
          "Menjawab dengan alami: Baik-baik saja / Lumayan / Luar biasa!",
          "Mengembalikan pertanyaan: Dan kamu? / Bagaimana denganmu?",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Wei", text: "Selamat pagi, Sari! Apa kabar?", translation: "Good morning, Sari! How are you?" },
          { speaker: "Sari", text: "Baik sekali, terima kasih! Kamu sendiri, Wei?", translation: "Very well, thank you! And you, Wei?" },
          { speaker: "Wei", text: "Lumayan, agak capek. Kemarin ada ujian.", translation: "Not bad, a bit tired. I had an exam yesterday." },
          { speaker: "Sari", text: "Oh ya? Gimana hasilnya?", translation: "Oh really? How did it go?" },
          { speaker: "Wei", text: "Mudah-mudahan bagus! Saya rasa saya bisa mengerjakan soalnya.", translation: "Hopefully good! I think I managed the questions." },
        ],
        patternExamples: [
          { pattern: "Apa kabar? → Baik(-baik saja) / Lumayan / Luar biasa!", examples: ["Apa kabar? — Baik-baik saja, terima kasih! (Fine, thanks!)", "Apa kabar? — Lumayan. (Not bad.)", "Apa kabar? — Luar biasa! (Fantastic!)"] },
          { pattern: "Dan kamu? / Kamu sendiri?", examples: ["Saya baik. Dan kamu? (I'm fine. And you?)", "Baik sekali! Kamu sendiri? (Very well! What about you?)"] },
        ],
        cultureNote: "Bahasa Indonesia memiliki dua register: formal dan informal (gaul). 'Kamu' adalah informal; 'Anda' formal. Di antara teman, 'lo/gue' (bahasa gaul Jakarta) sering digunakan. Sebagai pelajar baru, fokus pada register formal/netral dulu.",
        vocab: [
          { term: "apa kabar?", meaning: "how are you?", example: "Halo! Apa kabar?" },
          { term: "baik-baik saja", meaning: "fine / doing well", example: "Saya baik-baik saja, terima kasih." },
          { term: "lumayan", meaning: "not bad / fairly good", example: "Lumayan, sedikit capek." },
          { term: "capek", meaning: "tired", example: "Saya capek setelah belajar semalam." },
          { term: "mudah-mudahan", meaning: "hopefully", example: "Mudah-mudahan lulus ujian!" },
        ],
        quiz: [
          q("Jawaban paling umum untuk 'apa kabar?' adalah…", ["Selamat pagi","Baik-baik saja, terima kasih","Nama saya Sari","Saya dari Jakarta"], 1, "responses"),
          q("'Lumayan' artinya…", ["very good","terrible","not bad / fairly good","I don't know"], 2, "vocab"),
          qFill("Lengkapi: 'Saya baik. Dan ___?' (And you?)", ["kamu"], "conversation"),
          qMatch("Cocokkan jawaban dengan nuansanya:", [["Luar biasa!","very positive"],["Baik-baik saja.","neutral/fine"],["Lumayan.","mildly okay"]], "responses"),
        ],
      },
    ],
  },

  {
    title: "Kehidupan Sehari-hari",
    levelLabel: "Beginner",
    description: "Bercerita tentang rutinitas harian, waktu, dan aktivitas sehari-hari.",
    prereqTitles: ["Salam & Perkenalan"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Rutinitasku",
        objectives: ["Mendeskripsikan rutinitas harian", "Menggunakan kata keterangan waktu: setiap pagi, biasanya, selalu"],
        warmUp: "Ceritakan hari kamu dari bangun tidur sampai tidur lagi. Aktivitas apa yang paling kamu nikmati?",
        canDo: [
          "Menceritakan rutinitas: Saya bangun jam…, Saya sarapan…",
          "Menggunakan kata frekuensi: selalu, biasanya, kadang-kadang, jarang, tidak pernah",
          "Menanyakan rutinitas orang lain: Kamu biasanya ngapain di pagi hari?",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Tom", text: "Sari, kamu biasanya bangun jam berapa?", translation: "Sari, what time do you usually wake up?" },
          { speaker: "Sari", text: "Saya selalu bangun jam setengah enam. Habis itu olahraga dulu.", translation: "I always wake up at 5:30. After that I exercise first." },
          { speaker: "Tom", text: "Wah, pagi sekali! Saya biasanya bangun jam tujuh.", translation: "Wow, very early! I usually wake up at 7." },
          { speaker: "Sari", text: "Terus ngapain habis bangun?", translation: "Then what do you do after waking up?" },
          { speaker: "Tom", text: "Mandi, sarapan, lalu berangkat ke kampus. Saya kuliah di sini.", translation: "Shower, breakfast, then go to campus. I'm studying here." },
          { speaker: "Sari", text: "Oh, jurusan apa?", translation: "Oh, what major?" },
          { speaker: "Tom", text: "Bahasa dan Sastra Indonesia. Makanya saya belajar Bahasa Indonesia!", translation: "Indonesian Language and Literature. That's why I'm learning Indonesian!" },
        ],
        patternExamples: [
          { pattern: "Saya [frekuensi] [aktivitas].", examples: ["Saya selalu sarapan. (I always have breakfast.)", "Saya biasanya mandi pagi. (I usually shower in the morning.)", "Saya jarang makan siang di luar. (I rarely eat lunch outside.)"] },
          { pattern: "Habis itu / Lalu / Kemudian [aktivitas].", examples: ["Habis olahraga, saya mandi. (After exercising, I shower.)", "Saya sarapan, lalu berangkat kerja. (I eat breakfast, then go to work.)"] },
        ],
        cultureNote: "Orang Indonesia sering menggunakan 'habis itu' atau 'terus' sebagai penghubung cerita — lebih santai dari 'kemudian' yang formal. Di Indonesia, mandi pagi adalah ritual harian yang hampir universal, bahkan sebelum aktivitas apa pun!",
        vocab: [
          { term: "bangun", meaning: "to wake up / get up", example: "Saya bangun jam enam pagi." },
          { term: "sarapan", meaning: "breakfast", example: "Jangan lupa sarapan!" },
          { term: "biasanya", meaning: "usually", example: "Saya biasanya minum kopi pagi hari." },
          { term: "berangkat", meaning: "to leave / depart (to go somewhere)", example: "Saya berangkat ke kantor jam delapan." },
          { term: "habis itu", meaning: "after that (informal)", example: "Mandi dulu, habis itu sarapan." },
        ],
        quiz: [
          q("'Biasanya' artinya…", ["always","never","usually","sometimes"], 2, "frequency"),
          q("'Saya berangkat ke kampus' artinya…", ["I arrived at campus","I left for campus","I study at campus","I'm at campus"], 1, "vocab"),
          qFill("Lengkapi: 'Habis mandi, saya ___.' (sarapan)", ["sarapan"], "daily-routine"),
          qReorder("Susun: 'Saya selalu bangun jam enam pagi.'", ["jam enam pagi.","Saya","selalu bangun"], [1,2,0], "daily-routine"),
        ],
      },
    ],
  },

  {
    title: "Makanan & Memesan",
    levelLabel: "Beginner",
    description: "Memesan makanan dan minuman, memahami menu, dan berbicara di warung/restoran.",
    prereqTitles: ["Kehidupan Sehari-hari"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Di Warung Makan",
        objectives: ["Memesan makanan dan minuman", "Menanyakan rekomendasi dan informasi menu"],
        warmUp: "Apa makanan Indonesia favoritmu? Pernahkah kamu memesan makanan di warung atau restoran Indonesia?",
        canDo: [
          "Memesan: Saya mau pesan… / Bisa minta…?",
          "Menanyakan rekomendasi: Apa yang enak di sini? / Apa menu andalannya?",
          "Menanyakan harga dan membayar: Berapa totalnya? / Minta bon-nya.",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Tom", text: "Mbak, permisi! Boleh saya lihat menunya?", translation: "Excuse me, miss! May I see the menu?" },
          { speaker: "Sari", text: "Ini menunya. Mau pesan apa dulu, minuman atau makanannya?", translation: "Here's the menu. Do you want to order drinks or food first?" },
          { speaker: "Tom", text: "Minumannya dulu — es teh manis, satu ya. Terus, apa yang paling enak di sini?", translation: "Drinks first — one sweet iced tea please. Then, what's the most delicious thing here?" },
          { speaker: "Sari", text: "Kalau mau saya saranin, ayam goreng kunyitnya juara. Orang-orang suka banget.", translation: "If I may suggest, the turmeric fried chicken is the best. People love it a lot." },
          { speaker: "Tom", text: "Oke, ayam goreng kunyit satu, nasi putih juga ya. Pedas atau nggak?", translation: "Okay, one turmeric fried chicken, white rice too please. Is it spicy or not?" },
          { speaker: "Sari", text: "Bisa request nggak pedas kok. Sebentar ya, saya panggilkan yang masak.", translation: "You can request non-spicy. One moment, I'll call the cook." },
        ],
        patternExamples: [
          { pattern: "Saya mau pesan [makanan/minuman].", examples: ["Saya mau pesan nasi goreng satu. (I'd like to order one fried rice.)", "Bisa minta es jeruk? (Can I have iced orange juice?)", "Satu ayam goreng, nasi putih juga ya. (One fried chicken, white rice too please.)"] },
          { pattern: "Apa yang paling enak / Apa andalannya?", examples: ["Apa yang paling enak di sini? (What's the most delicious here?)", "Apa menu andalan restoran ini? (What's this restaurant's specialty?)"] },
        ],
        cultureNote: "Warung adalah restoran kecil yang sangat khas Indonesia — biasanya murah, enak, dan penuh kehangatan. Kata sapaan untuk pelayan bisa 'Mbak' (perempuan) atau 'Mas' (laki-laki) — jauh lebih hangat dari 'Excuse me'! Di warung, kamu bayar belakangan setelah makan.",
        vocab: [
          { term: "mau pesan", meaning: "want to order", example: "Saya mau pesan nasi goreng." },
          { term: "es teh manis", meaning: "sweet iced tea", example: "Satu es teh manis, ya." },
          { term: "juara", meaning: "the best / champion (informal)", example: "Ayam gorengnya juara!" },
          { term: "pedas", meaning: "spicy", example: "Apakah ini pedas?" },
          { term: "Mbak / Mas", meaning: "Miss / Mr (used to address strangers politely)", example: "Mbak, boleh minta bonnya?" },
        ],
        quiz: [
          q("'Mau pesan apa?' artinya…", ["Are you hungry?","What would you like to order?","Is the food ready?","Where is the menu?"], 1, "ordering"),
          q("'Juara' dalam konteks makanan artinya…", ["spicy","cheap","the best / amazing","too salty"], 2, "slang"),
          qFill("Lengkapi: 'Saya mau ___ nasi goreng satu.' (order)", ["pesan"], "ordering"),
          qMatch("Cocokkan sapaan dengan orangnya:", [["Mbak","young woman"],["Mas","young man"],["Pak","older man"]], "address"),
        ],
      },
    ],
  },

  {
    title: "Belanja",
    levelLabel: "Beginner",
    description: "Berbelanja di pasar atau toko, tawar-menawar, dan menanyakan harga.",
    prereqTitles: ["Makanan & Memesan"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Di Pasar & Toko",
        objectives: ["Menanyakan harga dan ketersediaan barang", "Tawar-menawar dengan sopan"],
        warmUp: "Pernahkah kamu menawar harga di pasar? Di negara kamu, apakah harga barang bisa ditawar?",
        canDo: [
          "Menanyakan harga: Berapa harganya? / Ini berapa?",
          "Menawar: Boleh kurang? / Mahal banget, bisa lebih murah?",
          "Membeli: Saya ambil ini. / Bisa bungkus?",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Wei", text: "Permisi, Pak. Ini batiknya berapa?", translation: "Excuse me, sir. How much is this batik?" },
          { speaker: "Penjual", text: "Yang itu tiga ratus ribu, Mas.", translation: "That one is three hundred thousand, sir." },
          { speaker: "Wei", text: "Wah, mahal juga ya. Boleh kurang nggak? Saya mau beli dua.", translation: "Wow, that's quite expensive. Can I get a discount? I want to buy two." },
          { speaker: "Penjual", text: "Kalau dua, saya kasih dua ratus lima puluh ribu per lembar. Gimana?", translation: "If two, I'll give you two hundred fifty thousand each. How's that?" },
          { speaker: "Wei", text: "Hmm, dua ratus aja bisa nggak, Pak?", translation: "Hmm, can you do two hundred only, sir?" },
          { speaker: "Penjual", text: "Dua ratus dua puluh, final ya. Rugi saya kalau kurang dari itu.", translation: "Two hundred twenty, final price. I'll lose money if it's less than that." },
          { speaker: "Wei", text: "Oke deh, deal! Bisa dibungkus yang bagus?", translation: "Okay then, deal! Can it be nicely wrapped?" },
        ],
        patternExamples: [
          { pattern: "Berapa harganya? / Ini berapa?", examples: ["Berapa harganya? (How much is it?)", "Ini berapa, Pak? (How much is this, sir?)", "Yang itu berapa? (How much is that one?)"] },
          { pattern: "Boleh kurang? / Bisa lebih murah?", examples: ["Boleh kurang, Pak? (Can it be less?)", "Mahal banget, bisa lebih murah? (Too expensive, can it be cheaper?)", "Kalau beli dua, bisa diskon? (If I buy two, can I get a discount?)"] },
        ],
        cultureNote: "Tawar-menawar (bargaining) adalah bagian dari budaya pasar tradisional Indonesia. Di mal atau toko modern, harga sudah tetap. Di pasar, pedagang biasanya menaikkan harga awal karena mengharapkan negosiasi. Tawar dengan sopan dan senyum — ini adalah interaksi sosial yang menyenangkan, bukan konfrontasi!",
        vocab: [
          { term: "berapa harganya?", meaning: "how much does it cost?", example: "Berapa harganya, Mbak?" },
          { term: "mahal", meaning: "expensive", example: "Ini mahal banget!" },
          { term: "murah", meaning: "cheap / inexpensive", example: "Harganya murah sekali." },
          { term: "boleh kurang?", meaning: "can it be less? (bargaining)", example: "Boleh kurang, Pak? Saya mahasiswa." },
          { term: "deal", meaning: "agreed! (used in bargaining)", example: "Deal! Saya ambil dua." },
        ],
        quiz: [
          q("'Boleh kurang?' digunakan saat…", ["memesan makanan","menawar harga","meminta arah","menyapa orang"], 1, "shopping"),
          q("'Mahal' artinya…", ["cheap","free","expensive","medium-priced"], 2, "vocab"),
          qFill("Lengkapi: 'Berapa ___ ?' (how much is it?)", ["harganya"], "shopping"),
          qMatch("Cocokkan dengan artinya:", [["mahal","expensive"],["murah","cheap"],["gratis","free"]], "vocab"),
        ],
      },
    ],
  },

  {
    title: "Keluarga & Hubungan",
    levelLabel: "Beginner",
    description: "Memperkenalkan keluarga, mendeskripsikan hubungan, dan berbicara tentang orang-orang terdekat.",
    prereqTitles: ["Belanja"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Keluargaku",
        objectives: ["Menyebutkan anggota keluarga", "Memperkenalkan keluarga kepada orang lain"],
        warmUp: "Di Indonesia, keluarga besar sangat penting. Berapa orang dalam keluargamu? Siapa yang paling dekat denganmu?",
        canDo: [
          "Menyebut anggota keluarga: ayah, ibu, kakak, adik",
          "Memperkenalkan keluarga: Ini kakak saya, namanya…",
          "Mendeskripsikan anggota keluarga: Ayah saya bekerja sebagai…",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Tom", text: "Sari, ini foto keluargamu?", translation: "Sari, is this a photo of your family?" },
          { speaker: "Sari", text: "Iya! Ini ayah dan ibu saya. Yang di sebelah ibu, itu kakak perempuan saya, Dewi.", translation: "Yes! This is my father and mother. The one next to my mother, that's my older sister, Dewi." },
          { speaker: "Tom", text: "Dewi tinggal di mana?", translation: "Where does Dewi live?" },
          { speaker: "Sari", text: "Di Surabaya. Sudah menikah, punya dua anak. Ini adik laki-laki saya, Budi — masih SMA.", translation: "In Surabaya. Already married, has two children. This is my younger brother, Budi — still in high school." },
          { speaker: "Tom", text: "Keluargamu besar ya! Di Australia, rata-rata keluarga kecil — dua sampai tiga anak.", translation: "Your family is big! In Australia, families are usually small — two to three children." },
          { speaker: "Sari", text: "Di Indonesia juga sekarang makin kecil. Tapi keluarga besar itu hangat!", translation: "In Indonesia it's also getting smaller now. But a big family is warm!" },
        ],
        patternExamples: [
          { pattern: "Ini [hubungan] saya, namanya [nama].", examples: ["Ini kakak saya, namanya Dewi. (This is my older sister, her name is Dewi.)", "Ini ayah saya, namanya Bapak Hendra. (This is my father, his name is Mr. Hendra.)"] },
          { pattern: "[Anggota keluarga] saya [deskripsi].", examples: ["Kakak saya sudah menikah. (My older sister is already married.)", "Adik saya masih sekolah. (My younger sibling is still in school.)"] },
        ],
        cultureNote: "Budaya Indonesia sangat mementingkan keluarga besar (extended family). Kakek-nenek sering tinggal serumah dengan cucu. Memanggil orang yang lebih tua dengan 'Bapak/Pak' atau 'Ibu/Bu' adalah bentuk penghormatan — bahkan untuk orang yang tidak dikenal!",
        vocab: [
          { term: "ayah / bapak", meaning: "father", example: "Ayah saya seorang dokter." },
          { term: "ibu", meaning: "mother", example: "Ibu saya pandai memasak." },
          { term: "kakak", meaning: "older sibling", example: "Kakak perempuan saya tinggal di Surabaya." },
          { term: "adik", meaning: "younger sibling", example: "Adik laki-laki saya masih SMA." },
          { term: "sudah menikah", meaning: "already married", example: "Kakak saya sudah menikah." },
        ],
        quiz: [
          q("'Kakak' artinya…", ["younger sibling","older sibling","cousin","uncle"], 1, "family"),
          q("'Adik laki-laki' artinya…", ["older brother","younger sister","younger brother","older sister"], 2, "family"),
          qFill("Lengkapi: 'Ini ___ saya, namanya Dewi.' (kakak/adik, untuk saudara perempuan yang lebih tua)", ["kakak"], "family"),
          qMatch("Cocokkan dengan artinya:", [["ayah","father"],["ibu","mother"],["adik","younger sibling"],["kakak","older sibling"]], "family"),
        ],
      },
    ],
  },

  {
    title: "Tempat & Arah",
    levelLabel: "Beginner",
    description: "Menanyakan dan memberikan petunjuk arah, menyebutkan tempat-tempat penting.",
    prereqTitles: ["Keluarga & Hubungan"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Di Mana…?",
        objectives: ["Menanyakan letak suatu tempat", "Memberikan petunjuk arah sederhana"],
        warmUp: "Bayangkan kamu sedang berada di kota asing. Seseorang bertanya arah ke kamu — dalam Bahasa Indonesia! Apa yang akan kamu katakan?",
        canDo: [
          "Menanyakan lokasi: Di mana…? / Ke mana…?",
          "Memberikan arah: Belok kiri/kanan, lurus terus, di sebelah…",
          "Menjelaskan jarak: Dekat / Jauh / Sekitar 10 menit jalan kaki",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Wei", text: "Permisi, stasiun kereta ada di mana ya?", translation: "Excuse me, where is the train station?" },
          { speaker: "Tom", text: "Oh, lumayan dekat kok. Lurus terus dari sini, terus belok kanan di perempatan.", translation: "Oh, it's quite close actually. Go straight from here, then turn right at the intersection." },
          { speaker: "Wei", text: "Belok kanan di perempatan — oke. Terus?", translation: "Turn right at the intersection — okay. Then?" },
          { speaker: "Tom", text: "Habis belok kanan, jalan kira-kira 200 meter. Stasiunnya ada di sebelah kiri, di depan mal besar.", translation: "After turning right, walk about 200 meters. The station is on the left, in front of the big mall." },
          { speaker: "Wei", text: "Kira-kira berapa menit jalan kaki?", translation: "About how many minutes on foot?" },
          { speaker: "Tom", text: "Sekitar sepuluh menit. Nggak terlalu jauh.", translation: "About ten minutes. Not too far." },
        ],
        patternExamples: [
          { pattern: "[Tempat] ada di mana? / Di mana [tempat]?", examples: ["Stasiun ada di mana? (Where is the station?)", "Di mana toilet? (Where is the toilet?)", "Rumah sakit ada di mana, Pak? (Where is the hospital, sir?)"] },
          { pattern: "Lurus terus, lalu belok [kiri/kanan] di [landmark].", examples: ["Lurus terus, lalu belok kanan di perempatan. (Go straight, then turn right at the intersection.)", "Belok kiri di lampu merah. (Turn left at the traffic light.)"] },
          { pattern: "Sekitar [angka] menit [jalan kaki/naik motor].", examples: ["Sekitar 10 menit jalan kaki. (About 10 minutes on foot.)", "Sekitar 5 menit naik ojek. (About 5 minutes by ojek.)"] },
        ],
        cultureNote: "Di Indonesia, ojek (ojol) — ojek online seperti Gojek dan Grab — adalah transportasi paling umum untuk jarak pendek di kota. Lebih cepat dari taksi di kemacetan. Banyak orang Indonesia lebih suka bilang 'naik Gojek' daripada menjelaskan arah panjang-lebar!",
        vocab: [
          { term: "di mana", meaning: "where (asking for location)", example: "Stasiun ada di mana?" },
          { term: "lurus terus", meaning: "go straight", example: "Lurus terus sampai perempatan." },
          { term: "belok kiri/kanan", meaning: "turn left/right", example: "Belok kanan di lampu merah." },
          { term: "di sebelah", meaning: "next to / beside", example: "Di sebelah apotek." },
          { term: "kira-kira", meaning: "approximately / about", example: "Kira-kira 10 menit jalannya." },
        ],
        quiz: [
          q("'Di mana stasiun?' menanyakan tentang…", ["distance","time","location","price"], 2, "directions"),
          q("'Belok kiri' artinya…", ["go straight","turn right","turn left","go back"], 2, "directions"),
          qFill("Lengkapi: 'Lurus ___ dari sini.' (go straight from here)", ["terus"], "directions"),
          qReorder("Tanya arah: 'Permisi, stasiun ada di mana?'", ["ada di mana?","Permisi,","stasiun"], [1,2,0], "directions"),
        ],
      },
    ],
  },

  {
    title: "Angka, Waktu & Tanggal",
    levelLabel: "Beginner",
    description: "Angka 1–1000, jam, hari, dan tanggal dalam Bahasa Indonesia.",
    prereqTitles: ["Tempat & Arah"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Jam Berapa? Hari Apa?",
        objectives: ["Menyebutkan jam dan hari dalam Bahasa Indonesia", "Menanyakan dan menjawab pertanyaan tentang waktu"],
        warmUp: "Sekarang jam berapa di kotamu? Hari apa sekarang? Bisakah kamu mengatakannya dalam Bahasa Indonesia?",
        canDo: [
          "Menanyakan waktu: Jam berapa sekarang?",
          "Menjawab: Jam [angka] / Jam [angka] lebih [menit] menit",
          "Menyebutkan hari: Senin, Selasa… Minggu",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Sari", text: "Tom, sekarang jam berapa?", translation: "Tom, what time is it now?" },
          { speaker: "Tom", text: "Hmm, sekarang jam setengah dua belas.", translation: "Hmm, it's now half past eleven (11:30)." },
          { speaker: "Sari", text: "Wah, bentar lagi zuhur dong. Kamu sudah makan siang?", translation: "Wow, almost noon then. Have you had lunch?" },
          { speaker: "Tom", text: "Belum. Mau makan di mana? Hari ini hari apa?", translation: "Not yet. Where shall we eat? What day is today?" },
          { speaker: "Sari", text: "Hari Kamis. Kalau Kamis biasanya ada pasar sore di alun-alun.", translation: "Thursday. On Thursdays there's usually an evening market at the town square." },
          { speaker: "Tom", text: "Wah, seru! Jam berapa mulainya?", translation: "Oh, fun! What time does it start?" },
          { speaker: "Sari", text: "Jam tiga sore. Kita bisa ke sana setelah makan.", translation: "3 PM. We can go there after eating." },
        ],
        patternExamples: [
          { pattern: "Jam [angka] / Jam setengah [angka+1] / Jam [angka] lebih [menit] menit", examples: ["Jam delapan. (8 o'clock)", "Jam setengah sembilan. (8:30 — literally 'half nine')", "Jam delapan lebih lima belas menit. (8:15)"] },
          { pattern: "Hari [nama hari], tanggal [angka]", examples: ["Hari ini hari Senin. (Today is Monday.)", "Besok hari Selasa, tanggal 10. (Tomorrow is Tuesday, the 10th.)"] },
        ],
        cultureNote: "Cara menyebut waktu di Indonesia unik: 'jam setengah sembilan' artinya 8:30, bukan 9:30! 'Setengah' berarti setengah perjalanan menuju angka berikutnya — konsep yang sama dengan bahasa Belanda (Belanda pernah menjajah Indonesia selama 350 tahun).",
        vocab: [
          { term: "jam berapa?", meaning: "what time is it?", example: "Sekarang jam berapa?" },
          { term: "jam setengah", meaning: "half past (the previous hour)", example: "Jam setengah delapan = 7:30" },
          { term: "hari ini", meaning: "today", example: "Hari ini hari Senin." },
          { term: "besok", meaning: "tomorrow", example: "Besok ada ujian." },
          { term: "sore", meaning: "late afternoon (around 3–6 PM)", example: "Saya pulang jam lima sore." },
        ],
        quiz: [
          q("'Jam setengah sembilan' artinya…", ["9:30","8:30","9:00","8:00"], 1, "time"),
          q("Hari setelah Rabu adalah…", ["Selasa","Jumat","Kamis","Minggu"], 2, "days"),
          qFill("Lengkapi: '___ berapa sekarang?' (what time is it?)", ["Jam"], "time"),
          qMatch("Cocokkan hari dengan urutan:", [["Senin","Monday"],["Rabu","Wednesday"],["Jumat","Friday"]], "days"),
        ],
      },
    ],
  },
];


// ─── MANDARIN ─────────────────────────────────────────────────────────────────

const mandarinSkills: SkillSeed[] = [
  {
    title: "拼音 Pīnyīn",
    levelLabel: "Beginner",
    description: "Master the Pinyin phonetic system — your key to reading and pronouncing all Mandarin.",
    prereqTitles: [],
    autoCompleteLevel: "intermediate,advanced",
    modules: [
      {
        title: "Initials & Finals — The Building Blocks",
        objectives: ["Understand how Pinyin syllables are built", "Read basic initials and finals"],
        warmUp: "Think about how you learned the alphabet. Pinyin is like a phonetic alphabet for Mandarin — but every syllable has a tone. Ready to explore?",
        canDo: [
          "Understand how Pinyin syllables = initial + final",
          "Read common finals: a, o, e, i, u, ü",
          "Read common initials: b, p, m, f, d, t, n, l",
        ],
        grammar: `Pinyin syllable = Initial (consonant) + Final (vowel/vowel cluster)
b + a = ba (爸 bà = father)
m + a = ma (妈 mā = mother)
n + i = ni (你 nǐ = you)
h + ǎo = hǎo (好 = good)

Pinyin is NOT English pronunciation — common traps:
x = like 'sh' in 'she'
q = like 'ch' in 'cheese'
zh = like 'j' in 'jump' (retroflexed)
c = like 'ts' in 'cats'`,
        reading: `Pinyin is used in dictionaries, learning materials, and phone keyboards.
Once you learn the tones, you can pronounce any Chinese word from Pinyin alone.
Goal: use Pinyin as a tool to reach Chinese characters — not a permanent crutch!`,
        dialogue: [
          { speaker: "Li Wei", text: "nǐ hǎo!", translation: "Hello!" },
          { speaker: "Emma", text: "nǐ hǎo! wǒ shì Emma.", translation: "Hello! I'm Emma." },
        ],
        patternExamples: [
          { pattern: "Initial + Final = Syllable", examples: ["b + ā = bā (八 eight)", "m + ā = mā (妈 mother)", "n + ǐ = nǐ (你 you)", "h + ǎo = hǎo (好 good)"] },
        ],
        cultureNote: "Pinyin was developed in the 1950s by linguists in China to standardize pronunciation across China's many dialects. Today it's essential for phone input — Chinese people type in Pinyin and select the character they want. Learning Pinyin is not just for foreigners — it's built into every Chinese phone!",
        vocab: [
          { term: "nǐ (你)", reading: "nǐ", meaning: "you", example: "nǐ hǎo! (你好! Hello!)" },
          { term: "wǒ (我)", reading: "wǒ", meaning: "I / me", example: "wǒ shì Emma. (我是Emma. I am Emma.)" },
          { term: "hǎo (好)", reading: "hǎo", meaning: "good", example: "hěn hǎo! (很好! Very good!)" },
          { term: "shì (是)", reading: "shì", meaning: "to be (am/is/are)", example: "wǒ shì xuésheng. (I am a student.)" },
          { term: "bù (不)", reading: "bù", meaning: "not / no", example: "wǒ bù zhīdào. (I don't know.)" },
        ],
        quiz: [
          q("In Pinyin, 'x' is pronounced like…", ["ks (like 'fox')","sh in 'she'","z in 'zoo'","s in 'sun'"], 1, "pinyin-sounds"),
          q("A Pinyin syllable is made of…", ["only a vowel","an initial + a final","only a consonant","two initials"], 1, "pinyin-structure"),
          q("'妈 mā' means…", ["father","horse","scold","mother"], 3, "vocab"),
          qFill("The Pinyin for 'you' (你) is:", ["nǐ","ni"], "pinyin-vocab"),
        ],
      },
      {
        title: "The Four Tones — 声调",
        objectives: ["Identify all four tones + neutral tone", "Pronounce the same syllable in different tones"],
        warmUp: "The word 'ma' in Mandarin has four completely different meanings depending on how you say it. Can you believe one syllable can mean 'mother', 'hemp', 'horse', AND 'to scold'?",
        canDo: [
          "Produce the 4 tones: high flat (1st), rising (2nd), dip-and-rise (3rd), falling (4th)",
          "Distinguish between tones by ear and in writing",
          "Avoid common tone mistakes that change meaning",
        ],
        grammar: `1st tone (ā): high and flat — like a sustained musical note → 妈 mā (mother)
2nd tone (á): rising — like asking "Really?" → 麻 má (hemp/trouble)
3rd tone (ǎ): dip then rise — like a doubtful "hmm?" → 马 mǎ (horse)
4th tone (à): short and falling — like a firm "No!" → 骂 mà (to scold)
Neutral tone: short and unstressed — used in particles like 吗 ma (question)`,
        reading: `Tones MUST be memorized with vocabulary — not added later.
mā má mǎ mà = 妈 麻 马 骂 — four different words, one pronunciation!
Tip: exaggerate tones when practicing. Natives will still understand you.`,
        dialogue: [
          { speaker: "Li Wei", text: "nǐ māma shì lǎoshī ma?", translation: "Is your mother a teacher?" },
          { speaker: "Hana", text: "shì de! tā hěn máng.", translation: "Yes she is! She's very busy." },
        ],
        patternExamples: [
          { pattern: "Same syllable, 4 tones = 4 different words (ma example)", examples: ["mā (妈) = mother — HIGH FLAT", "má (麻) = hemp / trouble — RISING", "mǎ (马) = horse — DIP-RISE", "mà (骂) = to scold — FALLING"] },
        ],
        cultureNote: "Getting tones wrong can cause misunderstandings — and funny ones! Saying 'wǒ xiǎng wèn nǐ' (我想问你 I want to ask you) with wrong tones might sound like something very different. Don't be embarrassed — tonal errors are universal for beginners. Laugh and keep practicing!",
        vocab: [
          { term: "māma (妈妈)", reading: "māma", meaning: "mother / mom", example: "wǒ māma shì lǎoshī. (My mother is a teacher.)" },
          { term: "lǎoshī (老师)", reading: "lǎoshī", meaning: "teacher", example: "tā shì wǒ de lǎoshī. (She is my teacher.)" },
          { term: "máng (忙)", reading: "máng", meaning: "busy", example: "nǐ máng ma? (Are you busy?)" },
          { term: "hěn (很)", reading: "hěn", meaning: "very", example: "tā hěn máng. (She is very busy.)" },
          { term: "ma (吗)", reading: "ma", meaning: "question particle (neutral tone)", example: "nǐ hǎo ma? (Are you well?)" },
        ],
        quiz: [
          q("The 2nd tone (á) sounds like…", ["a sustained flat note","a falling note","a rising note","a dipping then rising note"], 2, "tones"),
          q("'mǎ' (马) means…", ["mother","hemp","horse","to scold"], 2, "tones"),
          q("The neutral tone is…", ["always stressed","short and unstressed","always 1st tone","the same as 4th tone"], 1, "tones"),
          qMatch("Match the tone mark to its description:", [["ā","1st — high flat"],["á","2nd — rising"],["ǎ","3rd — dip-rise"],["à","4th — falling"]], "tones"),
        ],
      },
    ],
  },

  {
    title: "你好 Nǐ Hǎo",
    levelLabel: "Beginner",
    description: "Greet people, introduce yourself, and exchange basic personal information in Mandarin.",
    prereqTitles: ["拼音 Pīnyīn"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "你好！— Hello!",
        objectives: ["Greet people in Mandarin", "Introduce yourself: name, country, occupation"],
        warmUp: "你好 (nǐ hǎo) literally means 'you good'. What do you think the literal meaning of your language's greeting is?",
        canDo: [
          "Greet: nǐ hǎo / nǐ hǎo ma?",
          "Introduce yourself: wǒ shì… / wǒ jiào… / wǒ cóng…lái",
          "Respond to introductions: rènshi nǐ hěn gāoxìng!",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Hana", text: "你好！我叫Hana。你叫什么名字？", translation: "nǐ hǎo! wǒ jiào Hana. nǐ jiào shénme míngzì? / Hello! My name is Hana. What's your name?" },
          { speaker: "Li Wei", text: "你好，Hana！我叫李伟。认识你很高兴！", translation: "nǐ hǎo, Hana! wǒ jiào Lǐ Wěi. rènshi nǐ hěn gāoxìng! / Hello Hana! I'm Li Wei. Nice to meet you!" },
          { speaker: "Emma", text: "我也是！我叫Emma，我是美国人。", translation: "wǒ yě shì! wǒ jiào Emma, wǒ shì Měiguórén. / Me too! I'm Emma, I'm American." },
          { speaker: "Li Wei", text: "Hana，你是哪国人？", translation: "Hana, nǐ shì nǎ guó rén? / Hana, what nationality are you?" },
          { speaker: "Hana", text: "我是日本人，我从大阪来。", translation: "wǒ shì Rìběnrén, wǒ cóng Dàbǎn lái. / I'm Japanese, I come from Osaka." },
        ],
        patternExamples: [
          { pattern: "我叫[name] / 我是[name]", examples: ["我叫Hana。(wǒ jiào Hana — My name is Hana)", "我是李伟。(wǒ shì Lǐ Wěi — I am Li Wei)"] },
          { pattern: "我是[nationality]人 / 我从[place]来", examples: ["我是日本人。(wǒ shì Rìběnrén — I'm Japanese)", "我从上海来。(wǒ cóng Shànghǎi lái — I come from Shanghai)"] },
          { pattern: "认识你很高兴！", examples: ["A: 你好，我叫Hana。B: 认识你很高兴！(rènshi nǐ hěn gāoxìng — Nice to meet you!)"] },
        ],
        cultureNote: "In China, asking '你吃了吗？(nǐ chī le ma — Have you eaten?)' is a common greeting equivalent to 'How are you?' — food is central to Chinese culture and social bonding. Business cards (名片 míngpiàn) are exchanged with two hands as a sign of respect, similar to Japan.",
        vocab: [
          { term: "你好 (nǐ hǎo)", reading: "nǐ hǎo", meaning: "hello (literally: you good)", example: "你好！你叫什么名字？" },
          { term: "我叫 (wǒ jiào)", reading: "wǒ jiào", meaning: "my name is (literally: I am called)", example: "我叫李伟。" },
          { term: "认识你很高兴 (rènshi nǐ hěn gāoxìng)", reading: "rènshi nǐ hěn gāoxìng", meaning: "nice to meet you", example: "认识你很高兴！" },
          { term: "哪国人 (nǎ guó rén)", reading: "nǎ guó rén", meaning: "what nationality", example: "你是哪国人？" },
          { term: "从…来 (cóng…lái)", reading: "cóng…lái", meaning: "come from (a place)", example: "我从北京来。" },
        ],
        quiz: [
          q("'我叫李伟' means…", ["I am from Beijing","I am a student","My name is Li Wei","Nice to meet you"], 2, "introduction"),
          q("'认识你很高兴' is said when…", ["saying goodbye","meeting someone new","asking for directions","ordering food"], 1, "greetings"),
          qFill("Complete: '我是___ 人' (I am Japanese) — use 日本:", ["日本"], "nationality"),
          qReorder("Build: 'Hello! My name is Emma, I'm American.'", ["我叫Emma，","你好！","我是美国人。"], [1,0,2], "intro"),
        ],
      },
      {
        title: "你是学生吗？— Are You a Student?",
        objectives: ["Ask and answer yes/no questions with 吗", "Say your occupation in Mandarin"],
        warmUp: "In Mandarin, you make a yes/no question simply by adding 吗 (ma) at the end. How different is that from your language?",
        canDo: [
          "Form yes/no questions: [statement] + 吗？",
          "Say your occupation: 我是学生 / 我是老师 / 我在…工作",
          "Answer positively: 是的 / 对！ and negatively: 不是",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Li Wei", text: "Emma，你是学生吗？", translation: "Emma, nǐ shì xuésheng ma? / Emma, are you a student?" },
          { speaker: "Emma", text: "是的，我是大学生。我在北京大学学习中文。", translation: "shì de, wǒ shì dàxuéshēng. wǒ zài Běijīng Dàxué xuéxí Zhōngwén. / Yes, I'm a university student. I study Chinese at Peking University." },
          { speaker: "Li Wei", text: "哇，好厉害！你学习多久了？", translation: "wā, hǎo lìhai! nǐ xuéxí duō jiǔ le? / Wow, impressive! How long have you been studying?" },
          { speaker: "Emma", text: "一年了。中文很难，但是很有意思！你是老师吗？", translation: "yī nián le. Zhōngwén hěn nán, dànshì hěn yǒu yìsi! nǐ shì lǎoshī ma? / One year. Chinese is very difficult, but very interesting! Are you a teacher?" },
          { speaker: "Li Wei", text: "不是，我是程序员。在一家科技公司工作。", translation: "bù shì, wǒ shì chéngyuányuán. zài yī jiā kējì gōngsī gōngzuò. / No, I'm a programmer. I work at a tech company." },
        ],
        patternExamples: [
          { pattern: "[Statement] + 吗？= Yes/No question", examples: ["你是学生吗？(Are you a student?)", "他很忙吗？(Is he very busy?)", "这个好吃吗？(Is this delicious?)"] },
          { pattern: "我是[job] / 我在[place]工作", examples: ["我是学生。(I am a student.)", "我是老师。(I am a teacher.)", "我在医院工作。(I work at a hospital.)"] },
          { pattern: "是的 (yes) / 不是 (no, I'm not)", examples: ["你是学生吗？— 是的！(Yes!)", "你是老师吗？— 不是，我是学生。(No, I'm a student.)"] },
        ],
        cultureNote: "Mandarin doesn't have a simple 'yes/no' like English. Instead, you repeat the verb: 你是学生吗？→ 是 (yes, am) or 不是 (no, am not). 是的 is also commonly used. This concept takes a little getting used to but becomes very natural!",
        vocab: [
          { term: "学生 (xuésheng)", reading: "xuésheng", meaning: "student", example: "我是大学生。(I am a university student.)" },
          { term: "老师 (lǎoshī)", reading: "lǎoshī", meaning: "teacher", example: "他是中文老师。(He is a Chinese teacher.)" },
          { term: "难 (nán)", reading: "nán", meaning: "difficult", example: "中文很难！(Chinese is very difficult!)" },
          { term: "有意思 (yǒu yìsi)", reading: "yǒu yìsi", meaning: "interesting", example: "这本书很有意思。(This book is very interesting.)" },
          { term: "工作 (gōngzuò)", reading: "gōngzuò", meaning: "work / job", example: "你在哪里工作？(Where do you work?)" },
        ],
        quiz: [
          q("To make a yes/no question in Mandarin, you add…", ["吗 at the end","吗 at the beginning","是 before the verb","不 before the verb"], 0, "grammar"),
          q("'不是' is used to say…", ["yes","not really","no / I am not","I don't know"], 2, "negation"),
          qFill("Complete: '你是学生___？' (Are you a student?)", ["吗"], "questions"),
          qMatch("Match occupation to Pinyin:", [["学生","xuésheng"],["老师","lǎoshī"],["医生","yīshēng"]], "vocab"),
        ],
      },
    ],
  },

  {
    title: "日常生活 Rìcháng Shēnghuó",
    levelLabel: "Beginner",
    description: "Talk about daily routines, time, and common activities in Mandarin.",
    prereqTitles: ["你好 Nǐ Hǎo"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "几点了？— What Time Is It?",
        objectives: ["Tell the time in Mandarin", "Talk about when you do things"],
        warmUp: "Mandarin time-telling uses very logical patterns. 八点 = 8 o'clock (8 points). Can you guess what 三点半 might mean?",
        canDo: [
          "Ask the time: 现在几点？",
          "Tell the time: ～点 / ～点半 / ～点～分",
          "Say when you do things: 我八点…/ 早上/晚上",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Emma", text: "现在几点了？", translation: "xiànzài jǐ diǎn le? / What time is it now?" },
          { speaker: "Li Wei", text: "八点半。你几点上课？", translation: "bā diǎn bàn. nǐ jǐ diǎn shàng kè? / 8:30. What time is your class?" },
          { speaker: "Emma", text: "九点，还有三十分钟。来得及！", translation: "jiǔ diǎn, hái yǒu sānshí fēnzhōng. lái de jí! / At 9, there are still 30 minutes. I'll make it in time!" },
          { speaker: "Hana", text: "我昨天八点才睡觉，早上六点就起床了！", translation: "wǒ zuótiān bā diǎn cái shuìjiào, zǎoshang liù diǎn jiù qǐchuáng le! / I didn't sleep until 8 PM yesterday, but got up at 6 AM!" },
          { speaker: "Li Wei", text: "哇，你不累吗？", translation: "wā, nǐ bù lèi ma? / Wow, aren't you tired?" },
        ],
        patternExamples: [
          { pattern: "[数字]点 / [数字]点半 / [数字]点[分钟]分", examples: ["八点 (bā diǎn = 8 o'clock)", "三点半 (sān diǎn bàn = 3:30)", "九点十五分 (jiǔ diǎn shíwǔ fēn = 9:15)"] },
          { pattern: "早上/下午/晚上 + [时间]", examples: ["早上八点 (zǎoshang bā diǎn = 8 AM)", "下午两点 (xiàwǔ liǎng diǎn = 2 PM)", "晚上十点 (wǎnshang shí diǎn = 10 PM)"] },
        ],
        cultureNote: "China uses a 24-hour clock in official contexts, but colloquially people say 早上 (morning), 下午 (afternoon), or 晚上 (evening) before the time to clarify. Note: 两点 (liǎng diǎn) is used for '2 o'clock', not 二点 — 两 is used when counting things, including hours.",
        vocab: [
          { term: "几点 (jǐ diǎn)", reading: "jǐ diǎn", meaning: "what time (literally: how many points)", example: "现在几点？(What time is it now?)" },
          { term: "点 (diǎn)", reading: "diǎn", meaning: "o'clock (lit: dot/point)", example: "九点 = 9 o'clock" },
          { term: "半 (bàn)", reading: "bàn", meaning: "half (30 minutes past)", example: "八点半 = 8:30" },
          { term: "起床 (qǐchuáng)", reading: "qǐchuáng", meaning: "to get up / get out of bed", example: "我六点起床。(I get up at 6.)" },
          { term: "睡觉 (shuìjiào)", reading: "shuìjiào", meaning: "to sleep / go to sleep", example: "我十点睡觉。(I sleep at 10.)" },
        ],
        quiz: [
          q("'三点半' means…", ["3:00","3:05","3:30","3:15"], 2, "time"),
          q("'早上八点' means…", ["8 PM","8 AM","8:00 (no context)","8:30 in the morning"], 1, "time"),
          qFill("Complete: '现在几___ ？' (what time is it?)", ["点"], "time"),
          qMatch("Match to English:", [["起床","get up"],["睡觉","go to sleep"],["上课","attend class"]], "daily-vocab"),
        ],
      },
      {
        title: "你喜欢做什么？— What Do You Like To Do?",
        objectives: ["Express likes and dislikes", "Talk about hobbies and free time activities"],
        warmUp: "你喜欢做什么？You'll learn to answer this question today. Think about three activities you love — how would you say them in Mandarin?",
        canDo: [
          "Say what you like: 我喜欢… / 我很喜欢…",
          "Say what you dislike: 我不喜欢… / 我不太喜欢…",
          "Talk about hobbies: 我的爱好是…",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Emma", text: "李伟，你喜欢做什么？有什么爱好？", translation: "Lǐ Wěi, nǐ xǐhuān zuò shénme? yǒu shénme àihào? / Li Wei, what do you like to do? What are your hobbies?" },
          { speaker: "Li Wei", text: "我喜欢打篮球和听音乐。你呢？", translation: "wǒ xǐhuān dǎ lánqiú hé tīng yīnyuè. nǐ ne? / I like playing basketball and listening to music. What about you?" },
          { speaker: "Emma", text: "我很喜欢学习中文！也喜欢看电影，特别是中国电影。", translation: "wǒ hěn xǐhuān xuéxí Zhōngwén! yě xǐhuān kàn diànyǐng, tèbié shì Zhōngguó diànyǐng. / I really like studying Chinese! I also like watching movies, especially Chinese films." },
          { speaker: "Hana", text: "我不太喜欢运动，但是喜欢做饭。", translation: "wǒ bù tài xǐhuān yùndòng, dànshì xǐhuān zuò fàn. / I don't like sports very much, but I like cooking." },
          { speaker: "Li Wei", text: "哇，你会做中国菜吗？", translation: "wā, nǐ huì zuò Zhōngguó cài ma? / Wow, can you make Chinese food?" },
        ],
        patternExamples: [
          { pattern: "我喜欢 / 我很喜欢 / 我不喜欢 / 我不太喜欢 [verb/noun]", examples: ["我喜欢听音乐。(I like listening to music.)", "我很喜欢中国电影。(I really like Chinese movies.)", "我不喜欢运动。(I don't like sports.)", "我不太喜欢辣的食物。(I don't like spicy food very much.)"] },
          { pattern: "我的爱好是[activity]。", examples: ["我的爱好是打篮球。(My hobby is playing basketball.)", "我的爱好是画画。(My hobby is drawing.)"] },
        ],
        cultureNote: "Chinese people commonly bond over food — '你吃了吗？' (Have you eaten?) is a greeting. Asking about hobbies is a popular topic among young people. 打篮球 (basketball), 看剧 (watching TV dramas), 打游戏 (gaming), and 旅游 (travel) are very popular hobbies in modern China.",
        vocab: [
          { term: "喜欢 (xǐhuān)", reading: "xǐhuān", meaning: "to like", example: "我喜欢听音乐。(I like listening to music.)" },
          { term: "爱好 (àihào)", reading: "àihào", meaning: "hobby", example: "你有什么爱好？(What hobbies do you have?)" },
          { term: "听音乐 (tīng yīnyuè)", reading: "tīng yīnyuè", meaning: "to listen to music", example: "我喜欢听音乐放松。" },
          { term: "看电影 (kàn diànyǐng)", reading: "kàn diànyǐng", meaning: "to watch movies", example: "周末我喜欢看电影。" },
          { term: "做饭 (zuò fàn)", reading: "zuò fàn", meaning: "to cook (literally: make rice/food)", example: "她很喜欢做饭。" },
        ],
        quiz: [
          q("'我不太喜欢' means…", ["I hate","I don't like very much","I really like","I don't know"], 1, "likes"),
          q("'爱好' means…", ["love","hobbies","sports","free time"], 1, "vocab"),
          qFill("Complete: '我喜欢___音乐。' (listening to music)", ["听"], "hobbies"),
          qReorder("Build: 'I like watching Chinese movies.'", ["我喜欢","特别是中国电影。","看电影，"], [0,2,1], "hobbies"),
        ],
      },
    ],
  },

  {
    title: "吃饭 Chī Fàn",
    levelLabel: "Beginner",
    description: "Order food, talk about Chinese cuisine, and navigate a Chinese restaurant.",
    prereqTitles: ["日常生活 Rìcháng Shēnghuó"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "在餐厅 — At the Restaurant",
        objectives: ["Order food and drinks in a Chinese restaurant", "Use measure words with food"],
        warmUp: "Chinese menus can be overwhelming — hundreds of dishes! Have you tried any Chinese food? What's your favorite?",
        canDo: [
          "Get the waiter's attention: 服务员！",
          "Order: 我要… / 来一份…",
          "Ask what's good: 有什么好吃的？",
          "Use basic measure words: 一碗、一盘、一杯",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Hana", text: "服务员！", translation: "fúwùyuán! / Waiter / Excuse me!" },
          { speaker: "Li Wei", text: "来了！请问，要点什么？", translation: "lái le! qǐngwèn, yào diǎn shénme? / Coming! May I ask, what would you like to order?" },
          { speaker: "Hana", text: "有什么好吃的推荐？我们是第一次来。", translation: "yǒu shénme hǎo chī de tuījiàn? wǒmen shì dìyī cì lái. / What do you recommend? This is our first time." },
          { speaker: "Li Wei", text: "我们的招牌菜是宫保鸡丁，还有酸辣汤很受欢迎。", translation: "wǒmen de zhāopái cài shì gōngbǎo jīdīng, hái yǒu suānlà tāng hěn shòu huānyíng. / Our signature dish is Kung Pao chicken, and the hot and sour soup is also very popular." },
          { speaker: "Emma", text: "好，来一份宫保鸡丁，一碗米饭，还有两碗酸辣汤。", translation: "hǎo, lái yī fèn gōngbǎo jīdīng, yī wǎn mǐfàn, hái yǒu liǎng wǎn suānlà tāng. / Okay, one portion Kung Pao chicken, one bowl of rice, and two bowls of hot and sour soup." },
          { speaker: "Li Wei", text: "好的！请稍等。", translation: "hǎo de! qǐng shāo děng. / Alright! Please wait a moment." },
        ],
        patternExamples: [
          { pattern: "来[measure word + 量词][dish]！ / 我要[dish]", examples: ["来一份宫保鸡丁！(One serving of Kung Pao chicken!)", "来两碗米饭。(Two bowls of rice.)", "我要一杯茶。(I want a cup of tea.)"] },
          { pattern: "Measure words: 份 fèn (portions), 碗 wǎn (bowls), 杯 bēi (cups), 盘 pán (plates)", examples: ["一份饺子 (one portion of dumplings)", "一碗汤 (one bowl of soup)", "两杯水 (two glasses of water)"] },
        ],
        cultureNote: "In Chinese restaurants, you call the waiter by shouting '服务员！' — perfectly normal and not rude! Chinese dining is communal: dishes are placed in the center and everyone shares. The host is expected to order for the table and often pays for everyone — refusing to let someone pay can cause awkward social dynamics!",
        vocab: [
          { term: "服务员 (fúwùyuán)", reading: "fúwùyuán", meaning: "waiter / service staff", example: "服务员，买单！(Waiter, the check please!)" },
          { term: "点 (diǎn)", reading: "diǎn", meaning: "to order (food)", example: "你要点什么？(What would you like to order?)" },
          { term: "推荐 (tuījiàn)", reading: "tuījiàn", meaning: "to recommend", example: "你有什么推荐？(What do you recommend?)" },
          { term: "一碗 (yī wǎn)", reading: "yī wǎn", meaning: "one bowl (measure word + bowl)", example: "一碗米饭。(One bowl of rice.)" },
          { term: "好吃 (hǎo chī)", reading: "hǎo chī", meaning: "delicious (literally: good to eat)", example: "这个很好吃！(This is very delicious!)" },
        ],
        quiz: [
          q("To get a waiter's attention in a Chinese restaurant, you say…", ["请！","谢谢！","服务员！","你好！"], 2, "restaurant"),
          q("'一碗米饭' uses 碗 as a…", ["verb","adjective","measure word","question word"], 2, "measure-words"),
          q("'好吃' literally means…", ["good food","tasty restaurant","good to eat","I'm hungry"], 2, "vocab"),
          qFill("Complete: '来一___宫保鸡丁。' (one serving — use 份)", ["份"], "measure-words"),
        ],
      },
    ],
  },

  {
    title: "去哪里？Qù Nǎlǐ?",
    levelLabel: "Beginner",
    description: "Ask for directions, use transport, and navigate in a Mandarin-speaking city.",
    prereqTitles: ["吃饭 Chī Fàn"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "怎么去？— How Do I Get There?",
        objectives: ["Ask for and understand directions in Mandarin", "Name common transport and use 坐/骑/走"],
        warmUp: "Imagine you're lost in Shanghai without Google Maps. You see a local. What Mandarin phrases would you need?",
        canDo: [
          "Ask directions: 请问，…怎么走？",
          "Understand: 往左/右转、一直走、在…旁边",
          "Say transport method: 坐地铁、骑自行车、走路",
        ],
        grammar: "",
        reading: "",
        dialogue: [
          { speaker: "Emma", text: "请问，天安门广场怎么走？", translation: "qǐngwèn, Tiān'ānmén Guǎngchǎng zěnme zǒu? / Excuse me, how do I get to Tiananmen Square?" },
          { speaker: "Li Wei", text: "你可以坐地铁，坐一号线，在天安门东站下车。", translation: "nǐ kěyǐ zuò dìtiě, zuò yī hào xiàn, zài Tiān'ānmén Dōng Zhàn xià chē. / You can take the subway — take Line 1, get off at Tiananmen East Station." },
          { speaker: "Emma", text: "地铁站在哪里？", translation: "dìtiě zhàn zài nǎlǐ? / Where is the subway station?" },
          { speaker: "Li Wei", text: "一直往前走，在红绿灯那里往左转，就在银行旁边。", translation: "yīzhí wǎng qián zǒu, zài hónglǜdēng nàlǐ wǎng zuǒ zhuǎn, jiù zài yínháng pángbiān. / Go straight ahead, turn left at the traffic light, it's right next to the bank." },
          { speaker: "Emma", text: "谢谢！大概多远？", translation: "xièxiè! dàgài duō yuǎn? / Thank you! About how far?" },
          { speaker: "Li Wei", text: "走路大概五分钟。", translation: "zǒulù dàgài wǔ fēnzhōng. / About a 5-minute walk." },
        ],
        patternExamples: [
          { pattern: "请问，[place]怎么走？", examples: ["请问，地铁站怎么走？(Excuse me, how do I get to the subway station?)", "请问，厕所在哪里？(Excuse me, where is the toilet?)"] },
          { pattern: "往[左/右]转 / 一直走 / 在[landmark]旁边", examples: ["往左转 (turn left)", "一直走 (go straight)", "在银行旁边 (next to the bank)", "在红绿灯那里 (at the traffic light)"] },
          { pattern: "坐地铁/公共汽车 / 骑自行车 / 走路", examples: ["坐地铁去 (go by subway)", "骑自行车去 (go by bicycle)", "走路大概十分钟 (about 10 minutes on foot)"] },
        ],
        cultureNote: "China has the world's largest subway network — Shanghai alone has over 500 stations! The subway (地铁 dìtiě) is the most efficient way to navigate Chinese cities. Most stations have signs in both Chinese and English, and ticket machines often have an English option. Didi (滴滴) is China's equivalent of Uber.",
        vocab: [
          { term: "请问 (qǐngwèn)", reading: "qǐngwèn", meaning: "excuse me / may I ask", example: "请问，厕所在哪里？" },
          { term: "怎么走 (zěnme zǒu)", reading: "zěnme zǒu", meaning: "how to get there (literally: how to walk)", example: "地铁站怎么走？" },
          { term: "一直走 (yīzhí zǒu)", reading: "yīzhí zǒu", meaning: "go straight", example: "一直走，然后左转。" },
          { term: "坐地铁 (zuò dìtiě)", reading: "zuò dìtiě", meaning: "take the subway", example: "我每天坐地铁上班。" },
          { term: "旁边 (pángbiān)", reading: "pángbiān", meaning: "next to / beside", example: "在超市旁边。(Next to the supermarket.)" },
        ],
        quiz: [
          q("'怎么走' means…", ["how far is it","how do I get there","where is it","how long does it take"], 1, "directions"),
          q("'往左转' means…", ["go straight","turn right","turn left","go back"], 2, "directions"),
          q("'坐地铁' means…", ["ride a bicycle","take the subway","walk","take a bus"], 1, "transport"),
          qFill("Complete: '___问，超市怎么走？' (excuse me)", ["请"], "polite"),
        ],
      },
    ],
  },
];

// ─── Achievements ─────────────────────────────────────────────────────────────

const achievements = [
  { code: "first_module",        title: "First Steps",         description: "Complete your first module.",                     icon: "star",    criteria: { type: "modules_completed",       value: 1  } },
  { code: "five_modules",        title: "On a Roll",           description: "Complete 5 modules.",                             icon: "fire",    criteria: { type: "modules_completed",       value: 5  } },
  { code: "twenty_modules",      title: "Dedicated Learner",   description: "Complete 20 modules.",                            icon: "medal",   criteria: { type: "modules_completed",       value: 20 } },
  { code: "first_streak",        title: "Habit Builder",       description: "Maintain a 3-day learning streak.",               icon: "flame",   criteria: { type: "streak_days",             value: 3  } },
  { code: "week_streak",         title: "Week Warrior",        description: "Maintain a 7-day learning streak.",               icon: "trophy",  criteria: { type: "streak_days",             value: 7  } },
  { code: "xp_100",              title: "XP Starter",          description: "Earn 100 XP.",                                    icon: "zap",     criteria: { type: "total_xp",               value: 100} },
  { code: "xp_500",              title: "XP Collector",        description: "Earn 500 XP.",                                    icon: "zap",     criteria: { type: "total_xp",               value: 500} },
  { code: "perfect_quiz",        title: "Perfect Score",       description: "Get 100% on a quiz.",                             icon: "check",   criteria: { type: "perfect_quiz",            value: 1  } },
  { code: "conversation_first",  title: "Conversation Starter","description": "Complete your first AI conversation.",           icon: "chat",    criteria: { type: "conversations_completed", value: 1  } },
  { code: "conversation_master", title: "Conversation Master", description: "Complete 5 AI conversations.",                    icon: "chat",    criteria: { type: "conversations_completed", value: 5  } },
  { code: "hiragana_complete",   title: "Hiragana Master",     description: "Complete all Hiragana modules.",                  icon: "star",    criteria: { type: "modules_completed",       value: 11 } },
];

// ─── Seeder ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Vocaa (comprehensive content)…");

  // Clear content tables (not user data)
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.module.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.language.deleteMany();

  const languages: { code: string; name: string; hasWritingSystem: boolean; skills: SkillSeed[] }[] = [
    { code: "id", name: "Indonesian", hasWritingSystem: false, skills: indonesianSkills },
    { code: "en", name: "English",    hasWritingSystem: false, skills: englishSkills    },
    { code: "ja", name: "Japanese",   hasWritingSystem: true,  skills: japaneseSkills   },
    { code: "zh", name: "Mandarin",   hasWritingSystem: true,  skills: mandarinSkills   },
  ];

  for (const lang of languages) {
    const language = await prisma.language.create({
      data: { code: lang.code, name: lang.name, hasWritingSystem: lang.hasWritingSystem },
    });

    const titleToId = new Map<string, string>();
    let skillOrder = 0;

    for (const s of lang.skills) {
      const skill = await prisma.skill.create({
        data: {
          languageId: language.id,
          levelLabel: s.levelLabel,
          title: s.title,
          description: s.description,
          orderIndex: skillOrder++,
          prerequisiteIds: "",
          autoCompleteLevel: s.autoCompleteLevel,
        },
      });
      titleToId.set(s.title, skill.id);

      let modOrder = 0;
      for (const m of s.modules) {
        const mod = await prisma.module.create({
          data: {
            skillId: skill.id,
            title: m.title,
            orderIndex: modOrder++,
            objectives: JSON.stringify(m.objectives),
            warmUp: m.warmUp ?? "",
            canDo: JSON.stringify(m.canDo ?? []),
            grammar: m.grammar,
            reading: m.reading,
            dialogue: JSON.stringify(m.dialogue),
            patternExamples: JSON.stringify(m.patternExamples ?? []),
            cultureNote: m.cultureNote ?? "",
            xpReward: 50,
          },
        });

        for (const v of m.vocab) {
          await prisma.vocabulary.create({
            data: {
              languageId: language.id,
              moduleId: mod.id,
              term: v.term,
              reading: v.reading ?? "",
              meaning: v.meaning,
              exampleSentence: v.example ?? "",
            },
          });
        }

        const quiz = await prisma.quiz.create({ data: { moduleId: mod.id, passThreshold: 60 } });
        let qOrder = 0;
        for (const question of m.quiz) {
          await prisma.quizQuestion.create({
            data: {
              quizId: quiz.id,
              type: question.type,
              prompt: question.prompt,
              options: JSON.stringify(question.options),
              answer: question.answer,
              answerData: question.answerData,
              skillTag: question.skillTag,
              orderIndex: qOrder++,
            },
          });
        }
      }
    }

    // Second pass: set prerequisite IDs.
    for (const s of lang.skills) {
      if (s.prereqTitles.length === 0) continue;
      const ids = s.prereqTitles
        .map((t) => titleToId.get(t))
        .filter((x): x is string => Boolean(x));
      if (ids.length > 0) {
        await prisma.skill.update({
          where: { id: titleToId.get(s.title)! },
          data: { prerequisiteIds: ids.join(",") },
        });
      }
    }

    console.log(`  ✓ ${lang.name}: ${lang.skills.length} skills, ${lang.skills.reduce((n, s) => n + s.modules.length, 0)} modules`);
  }

  for (const a of achievements) {
    await prisma.achievement.create({
      data: {
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.icon,
        criteria: JSON.stringify(a.criteria),
      },
    });
  }
  console.log(`  ✓ ${achievements.length} achievements`);
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
