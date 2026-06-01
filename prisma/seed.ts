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
type ModSeed = {
  title: string;
  objectives: string[];
  grammar: string;
  reading: string;
  dialogue: D[];
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
      // ① Vowels
      {
        title: "Vowels — あいうえお",
        objectives: ["Read the 5 Japanese vowels", "Recognize them in simple words"],
        grammar: `Hiragana is a phonetic syllabary — each character is one sound.
The 5 vowels are the foundation:

あ (a) — like "ah"   い (i) — like "ee"   う (u) — lips forward, like "oo" but unrounded
え (e) — like "eh"   お (o) — like "oh"

Every other hiragana character is one of these vowels preceded by a consonant.`,
        reading: `Tip: learn to write each character as you learn its sound.
あ → い → う → え → お is the order you'll find in every Japanese dictionary.
Words you already know: アイスクリーム(ice cream) — the vowels a-i are in there!`,
        dialogue: [
          { speaker: "A", text: "あ、いいえき！", translation: "Oh, a nice station!" },
          { speaker: "B", text: "うん、おおきいね。", translation: "Yeah, it's big, isn't it." },
        ],
        vocab: [
          { term: "あお", reading: "ao", meaning: "blue", example: "そらはあおい。(The sky is blue.)" },
          { term: "いえ", reading: "ie", meaning: "house / no", example: "おおきいいえ。(A big house.)" },
          { term: "うえ", reading: "ue", meaning: "above / top", example: "うえをみて。(Look up.)" },
          { term: "えき", reading: "eki", meaning: "train station", example: "えきはどこ？(Where is the station?)" },
          { term: "おかし", reading: "okashi", meaning: "sweets / snacks", example: "おかしがすき。(I like sweets.)" },
        ],
        quiz: [
          q("'い' is pronounced…", ["ah","ee","oh","eh"], 1, "hiragana-vowels"),
          qFill("Type the hiragana vowel that sounds like 'oh':", ["お"], "hiragana-vowels"),
          qMatch("Match each hiragana to its reading:", [["あ","a"],["い","i"],["う","u"],["え","e"]], "hiragana-vowels"),
          q("'えき' means…", ["snacks","house","train station","above"], 2, "vocab"),
        ],
      },
      // ② K-row
      {
        title: "K-row — かきくけこ",
        objectives: ["Read か・き・く・け・こ", "Use common K-row vocabulary"],
        grammar: `The K-row adds the 'k' consonant to each vowel:
か(ka)  き(ki)  く(ku)  け(ke)  こ(ko)

Note: き is special — it slightly resembles the number 4 with a flag.
Pattern: か → き → く → け → こ`,
        reading: `Common words using K-row:
かわ(river)  きく(listen/chrysanthemum)  くも(cloud)  けさ(this morning)  こども(child)

Practice reading: こどもがかわでさかなをみた。(A child saw a fish in the river.)`,
        dialogue: [
          { speaker: "A", text: "けさはくもがおおい。", translation: "There are many clouds this morning." },
          { speaker: "B", text: "こどもはかわにいる？", translation: "Are the kids at the river?" },
        ],
        vocab: [
          { term: "かわ", reading: "kawa", meaning: "river", example: "かわでおよぐ。(Swim in the river.)" },
          { term: "きく", reading: "kiku", meaning: "to listen; chrysanthemum", example: "おんがくをきく。(Listen to music.)" },
          { term: "くも", reading: "kumo", meaning: "cloud; spider", example: "くもがおおい。(There are many clouds.)" },
          { term: "けさ", reading: "kesa", meaning: "this morning", example: "けさはさむい。(It's cold this morning.)" },
          { term: "こども", reading: "kodomo", meaning: "child", example: "こどもがわらう。(The child laughs.)" },
        ],
        quiz: [
          q("'か' reads as…", ["ga","ka","ko","ki"], 1, "hiragana-k"),
          qFill("Write the hiragana for the sound 'ku':", ["く"], "hiragana-k"),
          qMatch("Match the hiragana to its meaning:", [["かわ","river"],["きく","to listen"],["こども","child"]], "vocab"),
          qReorder("Put in correct dictionary order:", ["こ","か","き","け","く"], [1,2,4,3,0], "hiragana-k"),
        ],
      },
      // ③ S-row
      {
        title: "S-row — さしすせそ",
        objectives: ["Read さ・し・す・せ・そ", "Note that し = 'shi' not 'si'"],
        grammar: `S-row:  さ(sa)  し(shi)  す(su)  せ(se)  そ(so)

⚠ Important exception: し is read 'shi', not 'si'. This is one of the irregular sounds in Japanese.

そ looks like the number 3 — a helpful memory hook.`,
        reading: `Key vocabulary:
さかな(fish)  しごと(work/job)  すし(sushi!)  せかい(world)  そら(sky)

Japanese sushi (すし) uses all hiragana you've learned so far: s+u and s+i.`,
        dialogue: [
          { speaker: "A", text: "しごとはどう？", translation: "How's work?" },
          { speaker: "B", text: "いそがしい。でも、すしをたべた！", translation: "Busy. But I ate sushi!" },
        ],
        vocab: [
          { term: "さかな", reading: "sakana", meaning: "fish", example: "さかなをたべる。(Eat fish.)" },
          { term: "しごと", reading: "shigoto", meaning: "work / job", example: "しごとがある。(I have work.)" },
          { term: "すし", reading: "sushi", meaning: "sushi", example: "すしがすき！(I love sushi!)" },
          { term: "せかい", reading: "sekai", meaning: "world", example: "せかいはひろい。(The world is wide.)" },
          { term: "そら", reading: "sora", meaning: "sky", example: "そらがあおい。(The sky is blue.)" },
        ],
        quiz: [
          q("'し' is pronounced…", ["si","su","shi","se"], 2, "hiragana-s"),
          q("'すし' in romaji is…", ["susi","shushi","sushi","soshi"], 2, "vocab"),
          q("'せかい' means…", ["sushi","sky","world","fish"], 2, "vocab"),
          q("Which S-row character looks like '3'?", ["さ","し","せ","そ"], 3, "hiragana-s"),
        ],
      },
      // ④ T-row
      {
        title: "T-row — たちつてと",
        objectives: ["Read た・ち・つ・て・と", "Note ち='chi' and つ='tsu'"],
        grammar: `T-row:  た(ta)  ち(chi)  つ(tsu)  て(te)  と(to)

⚠ Two more exceptions:
  ち = 'chi' (not 'ti')
  つ = 'tsu' (not 'tu')

て is one of the most-used characters — it forms the て-form of verbs.`,
        reading: `Words to know:
たべもの(food)  ちず(map)  つき(moon)  てがみ(letter)  とり(bird)

Practice: とりがつきをみている。(A bird is looking at the moon.)`,
        dialogue: [
          { speaker: "A", text: "てがみをかいた？", translation: "Did you write a letter?" },
          { speaker: "B", text: "うん、とりのえをかいた。", translation: "Yeah, I drew a picture of a bird." },
        ],
        vocab: [
          { term: "たべもの", reading: "tabemono", meaning: "food", example: "たべものがすき。(I like food.)" },
          { term: "ちず", reading: "chizu", meaning: "map", example: "ちずをみる。(Look at the map.)" },
          { term: "つき", reading: "tsuki", meaning: "moon / month", example: "つきがきれい。(The moon is beautiful.)" },
          { term: "てがみ", reading: "tegami", meaning: "letter (written)", example: "てがみをかく。(Write a letter.)" },
          { term: "とり", reading: "tori", meaning: "bird", example: "とりがとぶ。(A bird flies.)" },
        ],
        quiz: [
          q("'ち' reads as…", ["ti","chi","tchi","shi"], 1, "hiragana-t"),
          q("'つ' reads as…", ["tu","tsu","su","chu"], 1, "hiragana-t"),
          q("'つき' means…", ["food","map","moon","bird"], 2, "vocab"),
          q("'て' is special because it forms…", ["nouns","verb て-form","numbers","colors"], 1, "hiragana-t"),
        ],
      },
      // ⑤ N-row
      {
        title: "N-row — なにぬねの",
        objectives: ["Read な・に・ぬ・ね・の", "Use の as a possessive particle"],
        grammar: `N-row:  な(na)  に(ni)  ぬ(nu)  ね(ne)  の(no)

の is the possessive particle (like 's in English):
わたしのほん = my book (literally "I's book")
にほんのたべもの = Japanese food

に is the location/direction particle: えきに = to/at the station.`,
        reading: `Vocabulary:
なまえ(name)  にほん(Japan)  ぬの(cloth)  ねこ(cat)  のみもの(drink)

わたしのねこのなまえはクロ。(My cat's name is Kuro.)`,
        dialogue: [
          { speaker: "A", text: "なまえはなに？", translation: "What is your name?" },
          { speaker: "B", text: "にほんのたなかです。のみものはある？", translation: "I'm Tanaka from Japan. Is there a drink?" },
        ],
        vocab: [
          { term: "なまえ", reading: "namae", meaning: "name", example: "なまえをかいて。(Write your name.)" },
          { term: "にほん", reading: "nihon", meaning: "Japan", example: "にほんがすき。(I like Japan.)" },
          { term: "ぬの", reading: "nuno", meaning: "cloth / fabric", example: "あかいぬの。(Red cloth.)" },
          { term: "ねこ", reading: "neko", meaning: "cat", example: "ねこがいる。(There is a cat.)" },
          { term: "のみもの", reading: "nomimono", meaning: "drink / beverage", example: "のみものをください。(A drink please.)" },
        ],
        quiz: [
          q("の is used as…", ["topic particle","possessive particle","direction particle","question marker"], 1, "particle-no"),
          q("'ねこ' means…", ["dog","cat","bird","fish"], 1, "vocab"),
          q("'にほん' means…", ["China","Korea","Japan","USA"], 2, "vocab"),
          q("'わたしのほん' means…", ["your book","my book","a book","books"], 1, "particle-no"),
        ],
      },
      // ⑥ H-row
      {
        title: "H-row — はひふへほ",
        objectives: ["Read は・ひ・ふ・へ・ほ", "Use は as the topic particle"],
        grammar: `H-row:  は(ha)  ひ(hi)  ふ(fu)  へ(he)  ほ(ho)

⚠ Exception: ふ = 'fu' (not 'hu') — made with lips close together.

は as a particle is read 'wa' (not 'ha'):
わたしはがくせいです。= I am a student.

へ as a particle means 'toward':
えきへ = toward the station.`,
        reading: `Vocabulary:
はな(flower/nose)  ひと(person)  ふゆ(winter)  へや(room)  ほん(book)

はなのへやにほんがある。(There are books in the flower room.)`,
        dialogue: [
          { speaker: "A", text: "ほんはへやにある。", translation: "The books are in the room." },
          { speaker: "B", text: "ふゆは、ほんをたくさんよむ。", translation: "In winter I read many books." },
        ],
        vocab: [
          { term: "はな", reading: "hana", meaning: "flower; nose", example: "はながきれい。(The flower is beautiful.)" },
          { term: "ひと", reading: "hito", meaning: "person / people", example: "ひとがおおい。(There are many people.)" },
          { term: "ふゆ", reading: "fuyu", meaning: "winter", example: "ふゆはさむい。(Winter is cold.)" },
          { term: "へや", reading: "heya", meaning: "room", example: "へやをそうじする。(Clean the room.)" },
          { term: "ほん", reading: "hon", meaning: "book", example: "ほんをよむ。(Read a book.)" },
        ],
        quiz: [
          q("'ふ' is pronounced…", ["hu","fu","pu","bu"], 1, "hiragana-h"),
          q("When は is a particle it reads as…", ["ha","he","wa","wo"], 2, "particle-wa"),
          q("'ほん' means…", ["flower","room","book","person"], 2, "vocab"),
          q("'へや' means…", ["winter","book","flower","room"], 3, "vocab"),
        ],
      },
      // ⑦ M-row
      {
        title: "M-row — まみむめも",
        objectives: ["Read ま・み・む・め・も", "Use も (also) as a particle"],
        grammar: `M-row:  ま(ma)  み(mi)  む(mu)  め(me)  も(mo)

も means 'also / too':
わたしもがくせいです。= I am also a student.
ねこもいぬもいる。= There are both cats and dogs.`,
        reading: `Vocabulary:
まち(town)  みず(water)  むし(insect)  めがね(glasses)  もり(forest)

もりのまちにむしがたくさんいる。(There are many insects in the forest town.)`,
        dialogue: [
          { speaker: "A", text: "まちにいく？", translation: "Going to town?" },
          { speaker: "B", text: "うん。みずもかう。めがねもなおす。", translation: "Yeah. Also buying water. Also fixing glasses." },
        ],
        vocab: [
          { term: "まち", reading: "machi", meaning: "town / city", example: "まちをあるく。(Walk around town.)" },
          { term: "みず", reading: "mizu", meaning: "water", example: "みずをのむ。(Drink water.)" },
          { term: "むし", reading: "mushi", meaning: "insect / bug", example: "むしがいる。(There is a bug.)" },
          { term: "めがね", reading: "megane", meaning: "glasses / spectacles", example: "めがねをかける。(Put on glasses.)" },
          { term: "もり", reading: "mori", meaning: "forest", example: "もりをさんぽ。(Walk in the forest.)" },
        ],
        quiz: [
          q("も as a particle means…", ["also/too","but","because","if"], 0, "particle-mo"),
          q("'みず' means…", ["forest","town","water","insect"], 2, "vocab"),
          q("'めがね' means…", ["glasses","water","insect","bug"], 0, "vocab"),
          q("'まちももりもある' means…", ["There is town","There is forest","There are both town and forest","Neither town nor forest"], 2, "particle-mo"),
        ],
      },
      // ⑧ Y-row + W-row + N
      {
        title: "Y・W rows + ん — やゆよ / わをん",
        objectives: ["Read やゆよ and わをん", "Use を as the object particle", "Understand ん (n)"],
        grammar: `Y-row: や(ya)  ゆ(yu)  よ(yo)  (only 3 characters — no yi or ye)
W-row: わ(wa)  を(wo)  ん(n)

を is the object marker — always follows the thing being acted on:
りんごをたべる。= Eat an apple.  (りんご=apple、たべる=eat)

ん is the only standalone consonant; it always follows a vowel or another ん.`,
        reading: `Vocabulary:
やま(mountain)  ゆき(snow)  よる(night)  わたし(I/me)  を(object particle)

ゆきのやまによるいく。(Go to the snowy mountain at night.)`,
        dialogue: [
          { speaker: "A", text: "よる、やまにいく？", translation: "Going to the mountain at night?" },
          { speaker: "B", text: "ゆきをみたい！わたしもいく。", translation: "I want to see snow! I'll go too." },
        ],
        vocab: [
          { term: "やま", reading: "yama", meaning: "mountain", example: "やまにのぼる。(Climb a mountain.)" },
          { term: "ゆき", reading: "yuki", meaning: "snow", example: "ゆきがふる。(Snow falls.)" },
          { term: "よる", reading: "yoru", meaning: "night / evening", example: "よるはくらい。(Night is dark.)" },
          { term: "わたし", reading: "watashi", meaning: "I / me", example: "わたしはがくせい。(I am a student.)" },
          { term: "を", reading: "wo/o", meaning: "object particle", example: "りんごをたべる。(Eat an apple.)" },
        ],
        quiz: [
          q("を marks the…", ["subject","topic","object","location"], 2, "particle-wo"),
          q("'ゆき' means…", ["mountain","snow","night","I"], 1, "vocab"),
          q("The Y-row has how many characters?", ["5","4","3","2"], 2, "hiragana-y"),
          q("ん is…", ["a vowel","the only standalone consonant","a particle","a verb ending"], 1, "hiragana-n"),
        ],
      },
      // ⑨ R-row
      {
        title: "R-row — らりるれろ",
        objectives: ["Read ら・り・る・れ・ろ", "Note the Japanese 'r' sound"],
        grammar: `R-row: ら(ra)  り(ri)  る(ru)  れ(re)  ろ(ro)

The Japanese 'r' is NOT like English 'r'. It's closer to a light 'd' or 'l' sound — the tongue briefly taps the roof of the mouth.

Many dictionary forms of verbs end in る: たべる(eat)、みる(see)、する(do).`,
        reading: `Vocabulary:
らいねん(next year)  りんご(apple)  るすばん(house-sitting)  れきし(history)  ろうか(corridor)`,
        dialogue: [
          { speaker: "A", text: "りんごをたべる？", translation: "Will you eat an apple?" },
          { speaker: "B", text: "らいねん、れきしをべんきょうする。", translation: "Next year, I'll study history." },
        ],
        vocab: [
          { term: "らいねん", reading: "rainen", meaning: "next year", example: "らいねんにほんにいく。(Going to Japan next year.)" },
          { term: "りんご", reading: "ringo", meaning: "apple", example: "りんごをたべた。(I ate an apple.)" },
          { term: "るすばん", reading: "rusuban", meaning: "house-sitting / being home alone", example: "るすばんをする。(House-sit.)" },
          { term: "れきし", reading: "rekishi", meaning: "history", example: "れきしがすき。(I like history.)" },
          { term: "ろうか", reading: "rouka", meaning: "corridor / hallway", example: "ろうかをあるく。(Walk down the hallway.)" },
        ],
        quiz: [
          q("The Japanese 'r' sound is closest to…", ["English r","English l or d","English w","silent"], 1, "hiragana-r"),
          q("'りんご' means…", ["next year","history","apple","corridor"], 2, "vocab"),
          q("Many verb dictionary forms end in…", ["ん","の","る","も"], 2, "hiragana-r"),
          q("'れきし' means…", ["apple","history","corridor","house-sitting"], 1, "vocab"),
        ],
      },
      // ⑩ Dakuten — voiced consonants
      {
        title: "Dakuten — Voiced Consonants (が・ざ・だ・ば・ぱ)",
        objectives: ["Understand dakuten (゛) and handakuten (゜)", "Read voiced K/S/T/H rows"],
        grammar: `Adding ゛(dakuten) to an unvoiced character voices it:
  か→が(ga)  き→ぎ(gi)  く→ぐ(gu)  け→げ(ge)  こ→ご(go)
  さ→ざ(za)  し→じ(ji)  す→ず(zu)  せ→ぜ(ze)  そ→ぞ(zo)
  た→だ(da)  ち→ぢ(ji*)  つ→づ(zu*)  て→で(de)  と→ど(do)
  は→ば(ba)  ひ→び(bi)  ふ→ぶ(bu)  へ→べ(be)  ほ→ぼ(bo)

Adding ゜(handakuten) to H-row gives P sounds:
  は→ぱ(pa)  ひ→ぴ(pi)  ふ→ぷ(pu)  へ→ぺ(pe)  ほ→ぽ(po)

*ぢ and づ are rare; じ and ず are used in most words.`,
        reading: `Key words:
がっこう(school)  ざっし(magazine)  だいがく(university)  ばしょ(place)  ぱん(bread)

だいがくのがっこうはおおきい。(The university campus is big.)`,
        dialogue: [
          { speaker: "A", text: "がっこうはどこ？", translation: "Where is the school?" },
          { speaker: "B", text: "えきのそば。ぱんをかってから、ざっしをよむ。", translation: "Near the station. After buying bread, I'll read a magazine." },
        ],
        vocab: [
          { term: "がっこう", reading: "gakkou", meaning: "school", example: "がっこうにいく。(Go to school.)" },
          { term: "ざっし", reading: "zasshi", meaning: "magazine", example: "ざっしをよむ。(Read a magazine.)" },
          { term: "だいがく", reading: "daigaku", meaning: "university", example: "だいがくでべんきょうする。(Study at university.)" },
          { term: "ばしょ", reading: "basho", meaning: "place / location", example: "ばしょをおしえて。(Tell me the place.)" },
          { term: "ぱん", reading: "pan", meaning: "bread", example: "ぱんをたべる。(Eat bread.)" },
        ],
        quiz: [
          q("Dakuten (゛) makes a sound…", ["higher","lower/voiced","softer","longer"], 1, "hiragana-dakuten"),
          q("か + ゛= ?", ["さ","が","ざ","た"], 1, "hiragana-dakuten"),
          q("'がっこう' means…", ["magazine","bread","school","university"], 2, "vocab"),
          q("Handakuten (゜) on H-row produces…", ["G sounds","Z sounds","P sounds","B sounds"], 2, "hiragana-handakuten"),
        ],
      },
      // ⑪ Combination sounds
      {
        title: "Combination Sounds — 拗音 (きゃ・しゃ・ちゃ…)",
        objectives: ["Read combination (yoon) characters", "Recognize them in common words"],
        grammar: `Combining an i-column character with small や/ゆ/よ creates one syllable:

き+ゃ = きゃ(kya)   き+ゅ = きゅ(kyu)   き+ょ = きょ(kyo)
し+ゃ = しゃ(sha)   し+ゅ = しゅ(shu)   し+ょ = しょ(sho)
ち+ゃ = ちゃ(cha)   ち+ゅ = ちゅ(chu)   ち+ょ = ちょ(cho)
に+ゃ = にゃ(nya)   ひ+ゃ = ひゃ(hya)   み+ゃ = みゃ(mya)
り+ゃ = りゃ(rya)

The small や/ゆ/よ is written smaller than normal.`,
        reading: `Common words:
きゃく(guest)  しゃしん(photo)  ちゃいろ(brown)  しゅくだい(homework)  びょういん(hospital)`,
        dialogue: [
          { speaker: "A", text: "しゃしんをとっていい？", translation: "May I take a photo?" },
          { speaker: "B", text: "きゃくさんは、どうぞ。ちゃいろのかばんもいい？", translation: "Guests, please go ahead. The brown bag too?" },
        ],
        vocab: [
          { term: "きゃく", reading: "kyaku", meaning: "guest / customer", example: "きゃくがくる。(A guest is coming.)" },
          { term: "しゃしん", reading: "shashin", meaning: "photo / photograph", example: "しゃしんをとる。(Take a photo.)" },
          { term: "ちゃいろ", reading: "chairо", meaning: "brown (color)", example: "ちゃいろのいぬ。(A brown dog.)" },
          { term: "しゅくだい", reading: "shukudai", meaning: "homework", example: "しゅくだいをする。(Do homework.)" },
          { term: "びょういん", reading: "byouin", meaning: "hospital", example: "びょういんにいく。(Go to the hospital.)" },
        ],
        quiz: [
          q("きゃ is how many sounds/syllables?", ["2","3","1","4"], 2, "hiragana-yoon"),
          q("し + small ゃ = ?", ["しや","しゃ","さや","しあ"], 1, "hiragana-yoon"),
          q("'しゃしん' means…", ["homework","photo","guest","hospital"], 1, "vocab"),
          q("'びょういん' means…", ["photo","school","hospital","station"], 2, "vocab"),
        ],
      },
    ],
  },

  // ── Katakana ──────────────────────────────────────────────────────────────
  {
    title: "Katakana",
    levelLabel: "N5",
    description: "Master all katakana used in foreign loanwords across 8 lessons.",
    prereqTitles: ["Hiragana"],
    autoCompleteLevel: "intermediate,advanced",
    modules: [
      // ① Vowels
      {
        title: "Katakana Vowels — アイウエオ",
        objectives: ["Read ア・イ・ウ・エ・オ", "Recognize loanwords using the vowels"],
        grammar: `Katakana has the same sounds as Hiragana but different shapes. It's used for:
• Foreign loanwords (コーヒー = coffee)
• Foreign names (アメリカ = America)
• Emphasis or technical terms

Vowels:  ア(a)  イ(i)  ウ(u)  エ(e)  オ(o)

ー (long dash) extends any vowel: コー = koo (as in coffee こーひー)`,
        reading: `ア→イ→ウ→エ→オ. Notice how they look more angular/sharp than hiragana.
Tip: ア looks like hiragana あ missing one stroke.`,
        dialogue: [
          { speaker: "A", text: "アイスクリームをください。", translation: "An ice cream, please." },
          { speaker: "B", text: "ウーロンティーもあります。", translation: "We also have oolong tea." },
        ],
        vocab: [
          { term: "アイス", reading: "aisu", meaning: "ice (cream)", example: "アイスをたべる。(Eat ice cream.)" },
          { term: "エアコン", reading: "eakon", meaning: "air conditioner", example: "エアコンをつける。(Turn on the AC.)" },
          { term: "ウール", reading: "uuru", meaning: "wool", example: "ウールのセーター。(A wool sweater.)" },
          { term: "オーブン", reading: "oobun", meaning: "oven", example: "オーブンでやく。(Bake in the oven.)" },
          { term: "イメージ", reading: "imeeji", meaning: "image", example: "イメージをもつ。(Have an image/idea.)" },
        ],
        quiz: [
          q("ア corresponds to which hiragana?", ["い","う","あ","え"], 2, "katakana-vowels"),
          q("'ー' in katakana indicates…", ["a pause","a long vowel","a new word","a question"], 1, "katakana-long"),
          q("'アイス' means…", ["air","ice","oven","wool"], 1, "vocab"),
          q("Katakana is mainly used for…", ["verbs","particles","loanwords","grammar"], 2, "katakana-usage"),
        ],
      },
      // ② K-row
      {
        title: "K-row Katakana — カキクケコ",
        objectives: ["Read カ・キ・ク・ケ・コ", "Identify K-row loanwords"],
        grammar: `K-row katakana:  カ(ka)  キ(ki)  ク(ku)  ケ(ke)  コ(ko)

Compare with hiragana:  か(ka)  き(ki)  く(ku)  け(ke)  こ(ko)
Katakana tends to be more angular and straight-lined.`,
        reading: `Loanwords using K-row:
カメラ(camera)  キロ(kilo)  クラス(class)  ケーキ(cake)  コーヒー(coffee)`,
        dialogue: [
          { speaker: "A", text: "コーヒーとケーキをください。", translation: "Coffee and cake, please." },
          { speaker: "B", text: "カメラもありますか？", translation: "Do you also have a camera?" },
        ],
        vocab: [
          { term: "カメラ", reading: "kamera", meaning: "camera", example: "カメラでとる。(Take with a camera.)" },
          { term: "キロ", reading: "kiro", meaning: "kilo(gram/metre)", example: "ごキロ。(5 kilo.)" },
          { term: "ケーキ", reading: "keeki", meaning: "cake", example: "ケーキをつくる。(Make a cake.)" },
          { term: "コーヒー", reading: "koohii", meaning: "coffee", example: "コーヒーがすき。(I like coffee.)" },
          { term: "クラス", reading: "kurasu", meaning: "class", example: "クラスにいる。(Be in class.)" },
        ],
        quiz: [
          q("コーヒー means…", ["cake","camera","coffee","class"], 2, "vocab"),
          q("ケ reads as…", ["ki","ku","ke","ko"], 2, "katakana-k"),
          q("'ケーキ' means…", ["camera","cake","coffee","kilo"], 1, "vocab"),
          q("カ corresponds to which hiragana?", ["き","か","く","こ"], 1, "katakana-k"),
        ],
      },
      // ③ S-row
      {
        title: "S-row Katakana — サシスセソ",
        objectives: ["Read サ・シ・ス・セ・ソ", "Spot S-row katakana in menus and signs"],
        grammar: `S-row:  サ(sa)  シ(shi)  ス(su)  セ(se)  ソ(so)
Note: シ and ツ look similar! Remember: シ = 'shi' (strokes go /) and ツ = 'tsu' (strokes go \\).`,
        reading: `Loanwords:
サラダ(salad)  シャツ(shirt/T-shirt)  スポーツ(sports)  セール(sale)  ソファ(sofa)`,
        dialogue: [
          { speaker: "A", text: "スポーツはすきですか？", translation: "Do you like sports?" },
          { speaker: "B", text: "サッカーがすき。シャツもセールでかった。", translation: "I like soccer. I also bought a shirt on sale." },
        ],
        vocab: [
          { term: "サラダ", reading: "sarada", meaning: "salad", example: "サラダをたべる。(Eat a salad.)" },
          { term: "シャツ", reading: "shatsu", meaning: "shirt / T-shirt", example: "しろいシャツ。(A white shirt.)" },
          { term: "スポーツ", reading: "supootsu", meaning: "sports", example: "スポーツをする。(Play sports.)" },
          { term: "セール", reading: "seeru", meaning: "sale", example: "セールちゅう。(On sale now.)" },
          { term: "ソファ", reading: "sofa", meaning: "sofa / couch", example: "ソファにすわる。(Sit on the sofa.)" },
        ],
        quiz: [
          q("The difference between シ and ツ is…", ["size","stroke direction","vowel sound","usage"], 1, "katakana-shi-tsu"),
          q("'サラダ' means…", ["shirt","salad","sofa","sale"], 1, "vocab"),
          q("シ reads as…", ["sa","su","si","shi"], 3, "katakana-s"),
          q("'スポーツ' means…", ["sports","shirt","sofa","sale"], 0, "vocab"),
        ],
      },
      // ④ T-row
      {
        title: "T-row Katakana — タチツテト",
        objectives: ["Read タ・チ・ツ・テ・ト", "Distinguish ツ from シ"],
        grammar: `T-row:  タ(ta)  チ(chi)  ツ(tsu)  テ(te)  ト(to)

Memory tricks:
• タ looks like a tent → 'ta'
• テ looks like a TV antenna → 'te'
• ト looks like a totem → 'to'
• ツ = 'tsu', strokes go downward \\`,
        reading: `Loanwords:
タクシー(taxi)  チケット(ticket)  ツアー(tour)  テスト(test)  トイレ(toilet)`,
        dialogue: [
          { speaker: "A", text: "タクシーでテストのばしょへいく？", translation: "Going to the test location by taxi?" },
          { speaker: "B", text: "いや、ツアーバス。チケットもある。", translation: "No, tour bus. I have a ticket too." },
        ],
        vocab: [
          { term: "タクシー", reading: "takushii", meaning: "taxi", example: "タクシーをよぶ。(Call a taxi.)" },
          { term: "チケット", reading: "chiketto", meaning: "ticket", example: "チケットをかう。(Buy a ticket.)" },
          { term: "ツアー", reading: "tsuaa", meaning: "tour", example: "ツアーにさんか。(Join the tour.)" },
          { term: "テスト", reading: "tesuto", meaning: "test / exam", example: "テストをうける。(Take a test.)" },
          { term: "トイレ", reading: "toire", meaning: "toilet / restroom", example: "トイレはどこ？(Where is the restroom?)" },
        ],
        quiz: [
          q("ツ reads as…", ["ti","chi","tsu","tu"], 2, "katakana-t"),
          q("'タクシー' means…", ["ticket","taxi","tour","test"], 1, "vocab"),
          q("'トイレ' means…", ["test","toilet","ticket","taxi"], 1, "vocab"),
          q("ツ and シ are different in…", ["sound and stroke direction","only sound","only shape","nothing"], 0, "katakana-shi-tsu"),
        ],
      },
      // ⑤ N-row + H-row
      {
        title: "N & H rows — ナニヌネノ / ハヒフヘホ",
        objectives: ["Read all N-row and H-row katakana", "Identify loanwords using these rows"],
        grammar: `N-row:  ナ(na)  ニ(ni)  ヌ(nu)  ネ(ne)  ノ(no)
H-row:  ハ(ha)  ヒ(hi)  フ(fu)  ヘ(he)  ホ(ho)

ノ looks like a simple slash — easy to remember as 'no'.
フ = 'fu' just like in hiragana.`,
        reading: `Loanwords:
ナイフ(knife)  ニュース(news)  ネット(net/internet)  ハンバーガー(hamburger)  ホテル(hotel)  ヒーロー(hero)`,
        dialogue: [
          { speaker: "A", text: "ホテルでニュースをみた。", translation: "I watched the news at the hotel." },
          { speaker: "B", text: "ハンバーガーとナイフがあった？", translation: "Was there a hamburger and a knife?" },
        ],
        vocab: [
          { term: "ナイフ", reading: "naifu", meaning: "knife", example: "ナイフをつかう。(Use a knife.)" },
          { term: "ニュース", reading: "nyuusu", meaning: "news", example: "ニュースをみる。(Watch the news.)" },
          { term: "ネット", reading: "netto", meaning: "internet / net", example: "ネットでしらべる。(Look it up online.)" },
          { term: "ハンバーガー", reading: "hanbaagaa", meaning: "hamburger", example: "ハンバーガーをたべる。(Eat a hamburger.)" },
          { term: "ホテル", reading: "hoteru", meaning: "hotel", example: "ホテルにとまる。(Stay at a hotel.)" },
        ],
        quiz: [
          q("ノ reads as…", ["na","ni","nu","no"], 3, "katakana-n"),
          q("'ホテル' means…", ["hotel","hero","news","hamburger"], 0, "vocab"),
          q("'ニュース' means…", ["knife","net","news","hotel"], 2, "vocab"),
          q("'ハンバーガー' means…", ["hamburger","knife","net","news"], 0, "vocab"),
        ],
      },
      // ⑥ M-row + Y-row
      {
        title: "M & Y rows — マミムメモ / ヤユヨ",
        objectives: ["Read マ-row and ヤ-row katakana"],
        grammar: `M-row:  マ(ma)  ミ(mi)  ム(mu)  メ(me)  モ(mo)
Y-row:  ヤ(ya)  ユ(yu)  ヨ(yo)  (only 3 characters)

Tip: ユ looks like the letter U — sounds like 'yu'.`,
        reading: `Loanwords:
マップ(map)  ミルク(milk)  メニュー(menu)  マスク(mask)  ヨーグルト(yogurt)  ユーモア(humor)`,
        dialogue: [
          { speaker: "A", text: "メニューをみて。ヨーグルトもある。", translation: "Look at the menu. There's yogurt too." },
          { speaker: "B", text: "マップはある？ミルクをかいたい。", translation: "Is there a map? I want to buy milk." },
        ],
        vocab: [
          { term: "マップ", reading: "mappu", meaning: "map", example: "マップをみる。(Look at a map.)" },
          { term: "ミルク", reading: "miruku", meaning: "milk", example: "ミルクをのむ。(Drink milk.)" },
          { term: "メニュー", reading: "menyuu", meaning: "menu", example: "メニューをください。(Menu, please.)" },
          { term: "ヨーグルト", reading: "yooguruto", meaning: "yogurt", example: "ヨーグルトをたべる。(Eat yogurt.)" },
          { term: "マスク", reading: "masuku", meaning: "mask", example: "マスクをつける。(Put on a mask.)" },
        ],
        quiz: [
          q("ユ reads as…", ["ma","mi","yu","yo"], 2, "katakana-y"),
          q("'ミルク' means…", ["mask","milk","menu","map"], 1, "vocab"),
          q("'メニュー' means…", ["menu","milk","yogurt","mask"], 0, "vocab"),
          q("The Y-row has how many characters?", ["5","4","3","2"], 2, "katakana-y"),
        ],
      },
      // ⑦ R-row + W-row + ン
      {
        title: "R & W rows + ン — ラリルレロ / ワヲン",
        objectives: ["Complete all katakana rows", "Read ン (n) at end of syllables"],
        grammar: `R-row:  ラ(ra)  リ(ri)  ル(ru)  レ(le/re)  ロ(ro)
W-row:  ワ(wa)  ヲ(wo) — ヲ is very rare in loanwords
ン = the only katakana standalone consonant (same as ん)

You now know ALL 46 basic katakana characters! 🎉`,
        reading: `Loanwords:
ラジオ(radio)  リモコン(remote control)  レストラン(restaurant)  ロボット(robot)  ワイン(wine)`,
        dialogue: [
          { speaker: "A", text: "レストランでワインをのんだ。", translation: "I drank wine at the restaurant." },
          { speaker: "B", text: "ラジオでロボットのニュースをきいた。", translation: "I heard news about robots on the radio." },
        ],
        vocab: [
          { term: "ラジオ", reading: "rajio", meaning: "radio", example: "ラジオをきく。(Listen to the radio.)" },
          { term: "リモコン", reading: "rimokon", meaning: "remote control", example: "リモコンはどこ？(Where is the remote?)" },
          { term: "レストラン", reading: "resutoran", meaning: "restaurant", example: "レストランにいく。(Go to the restaurant.)" },
          { term: "ロボット", reading: "robotto", meaning: "robot", example: "ロボットがいる。(There is a robot.)" },
          { term: "ワイン", reading: "wain", meaning: "wine", example: "ワインをのむ。(Drink wine.)" },
        ],
        quiz: [
          q("ン is…", ["a vowel","a standalone 'n' consonant","a particle","a verb ending"], 1, "katakana-n"),
          q("'レストラン' means…", ["radio","robot","restaurant","remote"], 2, "vocab"),
          q("'ワイン' means…", ["wine","radio","robot","water"], 0, "vocab"),
          q("After this lesson, how many base katakana do you know?", ["40","44","46","50"], 2, "katakana-complete"),
        ],
      },
      // ⑧ Dakuten + Extended sounds
      {
        title: "Katakana Dakuten & Extended Sounds",
        objectives: ["Read voiced katakana", "Read extended katakana for foreign sounds: ファ, ティ, ウィ"],
        grammar: `Dakuten works exactly the same as in hiragana:
ガ(ga)  ザ(za)  ダ(da)  バ(ba)  パ(pa)  ビ(bi)  ブ(bu) etc.

Extended katakana for sounds not in Japanese:
ファ(fa)  フィ(fi)  フェ(fe)  フォ(fo)
ティ(ti/thi)  ディ(di)  ウィ(wi)  ウェ(we)  ウォ(wo)
チェ(che)  シェ(she)  ジェ(je)`,
        reading: `Fashion loanwords use many extended sounds:
ファッション(fashion)  ティッシュ(tissue)  ディスカウント(discount)
ウィンドウ(window)  チェック(check)  バッグ(bag)`,
        dialogue: [
          { speaker: "A", text: "ファッションのバッグをチェックして。", translation: "Check out the fashion bag." },
          { speaker: "B", text: "ティッシュもディスカウントだ！", translation: "The tissues are discounted too!" },
        ],
        vocab: [
          { term: "ファッション", reading: "fasshon", meaning: "fashion", example: "ファッションがすき。(I like fashion.)" },
          { term: "ティッシュ", reading: "tisshu", meaning: "tissue (paper)", example: "ティッシュをとる。(Take a tissue.)" },
          { term: "バッグ", reading: "baggu", meaning: "bag", example: "バッグをかう。(Buy a bag.)" },
          { term: "チェック", reading: "chekku", meaning: "check / checkered", example: "チェックする。(Check it.)" },
          { term: "ウィンドウ", reading: "windou", meaning: "window (computing/display)", example: "ウィンドウをひらく。(Open a window.)" },
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

  // ── N5 Content Skills ──────────────────────────────────────────────────────
  {
    title: "Greetings",
    levelLabel: "N5",
    description: "Everyday greetings and common expressions.",
    prereqTitles: ["Hiragana"],
    autoCompleteLevel: "advanced",
    modules: [
      {
        title: "Daily Greetings",
        objectives: ["Greet at different times of day", "Say thank you, sorry, excuse me"],
        grammar: `Time-of-day greetings:
おはようございます (Good morning — formal) / おはよう (casual)
こんにちは (Hello / Good afternoon)
こんばんは (Good evening)

Common expressions:
ありがとうございます (Thank you very much) / ありがとう (casual)
すみません (Excuse me / I'm sorry — general polite)
ごめんなさい (I'm sorry — apology)
どういたしまして (You're welcome)`,
        reading: `Japanese greetings change based on the time of day and your relationship with the person.
With friends: use casual forms (おはよう、ありがとう)
With teachers, customers, seniors: use polite forms (おはようございます、ありがとうございます)`,
        dialogue: [
          { speaker: "A", text: "おはようございます！", translation: "Good morning!" },
          { speaker: "B", text: "おはよう！げんきですか？", translation: "Morning! How are you?" },
          { speaker: "A", text: "げんきです。ありがとう！", translation: "I'm fine. Thank you!" },
        ],
        vocab: [
          { term: "おはよう", reading: "ohayou", meaning: "good morning (casual)", example: "おはよう、みんな！(Morning, everyone!)" },
          { term: "こんにちは", reading: "konnichiwa", meaning: "hello / good afternoon", example: "こんにちは、せんせい。(Hello, teacher.)" },
          { term: "こんばんは", reading: "konbanwa", meaning: "good evening", example: "こんばんは！(Good evening!)" },
          { term: "ありがとう", reading: "arigatou", meaning: "thank you", example: "ありがとうございます。(Thank you very much.)" },
          { term: "すみません", reading: "sumimasen", meaning: "excuse me / sorry", example: "すみません、えきはどこ？(Excuse me, where is the station?)" },
          { term: "ごめんなさい", reading: "gomennasai", meaning: "I'm sorry (apology)", example: "ごめんなさい！(I'm sorry!)" },
        ],
        quiz: [
          q("Which greeting is used in the morning?", ["こんにちは","こんばんは","おはよう","さようなら"], 2, "greetings"),
          q("'ありがとう' means…", ["hello","goodbye","thank you","sorry"], 2, "greetings"),
          q("'すみません' is used to…", ["say goodbye","get attention or apologize lightly","say good morning","express anger"], 1, "greetings"),
          q("Formal 'good morning' is…", ["おはよう","こんにちは","おはようございます","ありがとうございます"], 2, "greetings"),
        ],
      },
    ],
  },
  {
    title: "Numbers",
    levelLabel: "N5",
    description: "Numbers 1–100, counters, and telling time.",
    prereqTitles: ["Greetings"],
    autoCompleteLevel: "advanced",
    modules: [
      {
        title: "Numbers 1–10",
        objectives: ["Count 1 to 10 in Japanese", "Read kanji numerals"],
        grammar: `いち(1)  に(2)  さん(3)  し/よん(4)  ご(5)
ろく(6)  なな/しち(7)  はち(8)  きゅう/く(9)  じゅう(10)

4 and 7 have two readings each:
  4 = し (in compounds like 4月 shigatsu) or よん (when counting)
  7 = しち (in time/months) or なな (general counting)`,
        reading: `Combine numbers for 11–99:
じゅういち(11) = じゅう + いち
にじゅう(20) = に + じゅう
さんじゅうご(35) = さん + じゅう + ご
ひゃく(100)`,
        dialogue: [
          { speaker: "A", text: "りんごをみっつください。", translation: "Three apples, please." },
          { speaker: "B", text: "さんびゃくえんです。", translation: "That's 300 yen." },
          { speaker: "A", text: "じゅうえんたりない！", translation: "I'm 10 yen short!" },
        ],
        vocab: [
          { term: "いち", reading: "ichi", meaning: "one (1)", example: "いちじ。(One o'clock.)" },
          { term: "に", reading: "ni", meaning: "two (2)", example: "にまい。(Two sheets.)" },
          { term: "さん", reading: "san", meaning: "three (3)", example: "さんにん。(Three people.)" },
          { term: "じゅう", reading: "juu", meaning: "ten (10)", example: "じっぷん。(Ten minutes.)" },
          { term: "ひゃく", reading: "hyaku", meaning: "one hundred (100)", example: "ひゃくえん。(100 yen.)" },
        ],
        quiz: [
          q("'さん' is…", ["1","2","3","4"], 2, "numbers"),
          q("'じゅう' means…", ["7","8","9","10"], 3, "numbers"),
          q("How do you say 11 in Japanese?", ["いちじゅう","じゅうに","じゅういち","いちいち"], 2, "numbers"),
          q("4 can be read as し or…", ["さん","ご","よん","ろく"], 2, "numbers"),
        ],
      },
      {
        title: "Telling the Time",
        objectives: ["Say what time it is", "Use じ (o'clock) and ふん (minutes)"],
        grammar: `じ = o'clock:  いちじ(1:00)  にじ(2:00)  さんじ(3:00)
ふん / ぷん = minutes:  いっぷん(1 min)  ごふん(5 min)  じっぷん(10 min)  さんじっぷん(30 min)
はん = half (past): にじはん = 2:30

Asking the time: いまなんじですか？(What time is it now?)`,
        reading: `Common time expressions:
ごぜん = AM  ごご = PM
あさ = morning  ひる = noon  よる = night
まいにち = every day  まいあさ = every morning`,
        dialogue: [
          { speaker: "A", text: "いまなんじですか？", translation: "What time is it now?" },
          { speaker: "B", text: "さんじはんです。", translation: "It's 3:30." },
          { speaker: "A", text: "じゅうごふんはやい！", translation: "15 minutes early!" },
        ],
        vocab: [
          { term: "なんじ", reading: "nanji", meaning: "what time", example: "なんじですか？(What time is it?)" },
          { term: "〜じ", reading: "~ji", meaning: "o'clock", example: "よじ。(4 o'clock.)" },
          { term: "〜ふん", reading: "~fun/pun", meaning: "minutes", example: "じっぷん。(10 minutes.)" },
          { term: "はん", reading: "han", meaning: "half past", example: "いちじはん。(1:30.)" },
          { term: "ごぜん", reading: "gozen", meaning: "AM / morning", example: "ごぜんじゅうじ。(10 AM.)" },
        ],
        quiz: [
          q("'さんじ' means…", ["3 minutes","3 o'clock","30 minutes","13 o'clock"], 1, "time"),
          q("'はん' means…", ["hour","minutes","half past","second"], 2, "time"),
          q("ごぜん means…", ["PM","noon","AM","evening"], 2, "time"),
          q("'にじじゅうごふん' is…", ["2:05","2:15","2:25","2:50"], 1, "time"),
        ],
      },
    ],
  },
  {
    title: "Daily Conversation",
    levelLabel: "N5",
    description: "Self-introduction, describing yourself, and small talk.",
    prereqTitles: ["Numbers"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Self Introduction",
        objectives: ["Introduce yourself politely", "State nationality and occupation"],
        grammar: `はじめまして。= Nice to meet you. (first meeting)
わたしは〔name〕です。= I am [name].
〔country〕からきました。= I came from [country].
〔occupation〕です。= I am a [occupation].
よろしくおねがいします。= Please treat me well. (standard phrase at introductions)`,
        reading: `A standard Japanese self-introduction follows this order:
1. はじめまして。
2. わたしは〔name〕です。
3. 〔country〕からきました。
4. よろしくおねがいします。`,
        dialogue: [
          { speaker: "A", text: "はじめまして。わたしはアンナです。アメリカからきました。がくせいです。よろしく！", translation: "Nice to meet you. I'm Anna. I came from America. I'm a student. Pleased to meet you!" },
          { speaker: "B", text: "こちらこそ、よろしく。わたしはたなかです。", translation: "Likewise, pleased to meet you. I'm Tanaka." },
        ],
        vocab: [
          { term: "はじめまして", reading: "hajimemashite", meaning: "nice to meet you (first meeting)", example: "はじめまして！(Nice to meet you!)" },
          { term: "〜からきました", reading: "~kara kimashita", meaning: "came from ~", example: "にほんからきました。(I came from Japan.)" },
          { term: "がくせい", reading: "gakusei", meaning: "student", example: "わたしはがくせいです。(I am a student.)" },
          { term: "よろしくおねがいします", reading: "yoroshiku onegaishimasu", meaning: "pleased to meet you / please take care of me", example: "よろしくおねがいします！" },
          { term: "しごと", reading: "shigoto", meaning: "job / work", example: "しごとはなんですか？(What is your job?)" },
        ],
        quiz: [
          q("'はじめまして' is said when…", ["parting","angry","meeting someone for the first time","asking a question"], 2, "self-intro"),
          q("'〜からきました' means…", ["I live in ~","I came from ~","I like ~","I work at ~"], 1, "grammar-kara"),
          q("'がくせい' means…", ["teacher","student","doctor","worker"], 1, "vocab"),
          q("'よろしく' is said…", ["at the end of introductions","at meals","when leaving","when thanking"], 0, "self-intro"),
        ],
      },
    ],
  },
  {
    title: "Shopping",
    levelLabel: "N5",
    description: "Buy things, ask prices, and shop in Japanese.",
    prereqTitles: ["Numbers"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Shopping Expressions",
        objectives: ["Ask 'how much?'", "Use shopping vocabulary"],
        grammar: `いくらですか？= How much is it?
〜をください。= Please give me ~ / I'll take ~.
〜はありますか？= Do you have ~?
〜えんです。= It is ~ yen.
おつりをください。= Change please.
たかい(expensive) / やすい(cheap)`,
        reading: `At a Japanese shop:
1. Find what you want.
2. Ask: いくらですか？(How much?)
3. Decide: 〜をください。(I'll take ~.)
4. Pay and check: おつりはいくら？(How much change?)`,
        dialogue: [
          { speaker: "Customer", text: "すみません、このりんごはいくらですか？", translation: "Excuse me, how much is this apple?" },
          { speaker: "Staff", text: "ひゃくえんです。", translation: "It's 100 yen." },
          { speaker: "Customer", text: "みっつください。", translation: "Three, please." },
        ],
        vocab: [
          { term: "いくら", reading: "ikura", meaning: "how much (price)", example: "いくらですか？(How much is it?)" },
          { term: "〜をください", reading: "~wo kudasai", meaning: "please give me ~", example: "みずをください。(Water please.)" },
          { term: "たかい", reading: "takai", meaning: "expensive / tall/high", example: "たかい！(Expensive!)" },
          { term: "やすい", reading: "yasui", meaning: "cheap / inexpensive", example: "やすい！かう！(Cheap! I'll buy it!)" },
          { term: "おつり", reading: "otsuri", meaning: "change (money)", example: "おつりをください。(Change please.)" },
        ],
        quiz: [
          q("'いくらですか' means…", ["Where is it?","How much is it?","What is it?","Do you have it?"], 1, "shopping"),
          q("'〜をください' means…", ["Please take ~","Please give me ~","~ is here","~ is expensive"], 1, "shopping"),
          q("'やすい' means…", ["expensive","tall","cheap","small"], 2, "vocab"),
          q("'おつり' means…", ["receipt","price tag","change (money)","total"], 2, "vocab"),
        ],
      },
    ],
  },
  // ── Family (家族) ──────────────────────────────────────────────────────────
  {
    title: "Family (家族)",
    levelLabel: "N5",
    description: "Talk about your family members in Japanese.",
    prereqTitles: ["Greetings"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Family Members — かぞく",
        objectives: ["Name close family members in Japanese", "Use family terms in simple sentences"],
        grammar: `Japanese has two sets of family words:
• Your own family (humble): ちち(father) はは(mother) あに(older brother) あね(older sister) おとうと(younger brother) いもうと(younger sister)
• Someone else's family (polite): おとうさん おかあさん おにいさん おねえさん おとうとさん いもうとさん

Use the humble form when talking about your own family.
Use the polite form when talking about others'.`,
        reading: `Introducing your family:
わたしのちちはいしゃです。(My father is a doctor.)
はははせんせいです。(My mother is a teacher.)
あにはだいがくせいです。(My older brother is a university student.)

Useful phrase: きょうだいはいますか？(Do you have siblings?)`,
        dialogue: [
          { speaker: "A", text: "ごかぞくはなんにんですか？", translation: "How many people are in your family?" },
          { speaker: "B", text: "よにんです。ちちとははとあにとわたし。", translation: "Four. My father, mother, older brother and I." },
          { speaker: "A", text: "おにいさんはおいくつですか？", translation: "How old is your older brother?" },
          { speaker: "B", text: "にじゅうさんさいです。", translation: "He's 23 years old." },
        ],
        vocab: [
          { term: "かぞく", reading: "kazoku", meaning: "family", example: "かぞくをしょうかいします。(Let me introduce my family.)" },
          { term: "ちち", reading: "chichi", meaning: "my father", example: "ちちはいしゃです。(My father is a doctor.)" },
          { term: "はは", reading: "haha", meaning: "my mother", example: "はははりょうりがじょうずです。(My mother is good at cooking.)" },
          { term: "あに", reading: "ani", meaning: "my older brother", example: "あにはとうきょうにいます。(My older brother is in Tokyo.)" },
          { term: "あね", reading: "ane", meaning: "my older sister", example: "あねはかいしゃいんです。(My older sister is a company employee.)" },
          { term: "おとうと", reading: "otouto", meaning: "my younger brother", example: "おとうとはちゅうがくせいです。(My younger brother is a junior high student.)" },
          { term: "いもうと", reading: "imouto", meaning: "my younger sister", example: "いもうとはかわいいです。(My younger sister is cute.)" },
          { term: "そふ", reading: "sofu", meaning: "my grandfather", example: "そふはとしょかんでほんをよみます。(My grandfather reads books at the library.)" },
        ],
        quiz: [
          q("'はは' means (about your own family)…", ["older sister","mother","grandmother","aunt"], 1, "family"),
          q("'あに' means…", ["younger brother","father","older brother","uncle"], 2, "family"),
          qFill("Fill in: My mother is called ___ (your own family, humble form):", ["はは", "haha"], "family"),
          qMatch("Match the family member to its Japanese term:", [["father","ちち"],["older sister","あね"],["grandfather","そふ"]], "family"),
          qReorder("Arrange to say 'My older brother is in Tokyo':", ["とうきょうに","あには","います"], [1,0,2], "family"),
          q("When talking about SOMEONE ELSE's mother, you say…", ["はは","おかあさん","かあさん","ははさん"], 1, "family-polite"),
        ],
      },
    ],
  },
  // ── Food & Drink (食べ物・飲み物) ─────────────────────────────────────────
  {
    title: "Food & Drink (食べ物)",
    levelLabel: "N5",
    description: "Vocabulary for food, drinks, and expressing taste.",
    prereqTitles: ["Family (家族)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Food Vocabulary — たべもの",
        objectives: ["Name common Japanese foods", "Express food preferences with すき・きらい"],
        grammar: `Expressing likes and dislikes:
〜がすきです = I like ~    〜がきらいです = I dislike ~
〜がだいすきです = I love ~   〜があまりすきじゃないです = I don't really like ~

おいしい = delicious   まずい = bad tasting   からい = spicy
あまい = sweet   しょっぱい = salty   すっぱい = sour`,
        reading: `にほんのたべものはおいしいです。(Japanese food is delicious.)
わたしはすしがだいすきです。(I love sushi.)
らーめんもすきです。でも、からいたべものはあまりすきじゃないです。
(I also like ramen. But I don't really like spicy food.)`,
        dialogue: [
          { speaker: "A", text: "なにたべたいですか？", translation: "What do you want to eat?" },
          { speaker: "B", text: "すしがたべたいです！わたしはすしがだいすきです。", translation: "I want to eat sushi! I love sushi." },
          { speaker: "A", text: "わたしはらーめんがすきです。からいらーめんがとくにすきです。", translation: "I like ramen. I especially like spicy ramen." },
          { speaker: "B", text: "からいのはちょっと…にがてです。", translation: "Spicy things are a bit... not my strong suit." },
        ],
        vocab: [
          { term: "すし", reading: "sushi", meaning: "sushi", example: "すしをたべます。(I eat sushi.)" },
          { term: "ラーメン", reading: "rāmen", meaning: "ramen (noodle soup)", example: "からいラーメンがすき。(I like spicy ramen.)" },
          { term: "ごはん", reading: "gohan", meaning: "rice / meal", example: "ごはんをたべましょう。(Let's eat a meal.)" },
          { term: "パン", reading: "pan", meaning: "bread", example: "あさはパンをたべます。(I eat bread in the morning.)" },
          { term: "みず", reading: "mizu", meaning: "water", example: "みずをください。(Water please.)" },
          { term: "おちゃ", reading: "ocha", meaning: "green tea", example: "おちゃをのみます。(I drink green tea.)" },
          { term: "おいしい", reading: "oishii", meaning: "delicious / tasty", example: "このすしはおいしい！(This sushi is delicious!)" },
          { term: "すきです", reading: "suki desu", meaning: "I like ~ (with が)", example: "すしがすきです。(I like sushi.)" },
        ],
        quiz: [
          q("'おいしい' means…", ["spicy","cheap","delicious","expensive"], 2, "food-adj"),
          qFill("Type the Japanese word for 'water':", ["みず", "mizu"], "food-vocab"),
          qMatch("Match the food to its Japanese name:", [["sushi","すし"],["ramen","ラーメン"],["green tea","おちゃ"]], "food-vocab"),
          qReorder("Build the sentence 'I love sushi':", ["が","すし","だいすきです","わたしは"], [3,1,0,2], "likes"),
        ],
      },
    ],
  },
  // ── Colors (色) ────────────────────────────────────────────────────────────
  {
    title: "Colors (いろ)",
    levelLabel: "N5",
    description: "Learn color names and how to describe objects.",
    prereqTitles: ["Food & Drink (食べ物)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Colors — いろ",
        objectives: ["Name 8 basic colors in Japanese", "Use colors to describe objects"],
        grammar: `Colors as い-adjectives or nouns:
あかい(red) あおい(blue) きいろい(yellow) くろい(black) しろい(white) みどりの(green) むらさきの(purple) オレンジの(orange)

Using colors with nouns:
あかいくるま = red car   しろいいぬ = white dog
Pattern: color + noun → あかいシャツ (red shirt)`,
        reading: `いろのことば:
そらはあおい。(The sky is blue.)
ゆきはしろい。(Snow is white.)
このリンゴはあかい。(This apple is red.)
わたしのおきにいりのいろはあおです。(My favorite color is blue.)`,
        dialogue: [
          { speaker: "A", text: "すきないろはなんですか？", translation: "What is your favorite color?" },
          { speaker: "B", text: "あおがすきです。そらのいろだから。", translation: "I like blue. Because it's the color of the sky." },
          { speaker: "A", text: "わたしはあかがすきです。でも、くろいふくをよくきます。", translation: "I like red. But I often wear black clothes." },
        ],
        vocab: [
          { term: "あか", reading: "aka", meaning: "red", example: "あかいはなをかいました。(I bought red flowers.)" },
          { term: "あお", reading: "ao", meaning: "blue / green (traffic lights)", example: "そらはあおい。(The sky is blue.)" },
          { term: "きいろ", reading: "kiiro", meaning: "yellow", example: "きいろいバナナ。(Yellow banana.)" },
          { term: "しろ", reading: "shiro", meaning: "white", example: "しろいシャツがすき。(I like white shirts.)" },
          { term: "くろ", reading: "kuro", meaning: "black", example: "くろいねこ。(Black cat.)" },
          { term: "みどり", reading: "midori", meaning: "green", example: "みどりのき。(Green tree.)" },
          { term: "むらさき", reading: "murasaki", meaning: "purple", example: "むらさきいろのはな。(Purple flower.)" },
          { term: "いろ", reading: "iro", meaning: "color", example: "すきないろはなんですか？(What is your favorite color?)" },
        ],
        quiz: [
          qFill("Type the Japanese word for 'blue/green' (空の色):", ["あお", "ao"], "colors"),
          qMatch("Match the color to its Japanese name:", [["red","あか"],["white","しろ"],["black","くろ"],["yellow","きいろ"]], "colors"),
          q("'みどり' is…", ["purple","orange","green","yellow"], 2, "colors"),
          qReorder("Say 'I like blue because it's the color of the sky':", ["あおが","だから","そらのいろ","すきです"], [0,3,2,1], "colors"),
        ],
      },
    ],
  },
  // ── Days & Time (曜日・時間) ───────────────────────────────────────────────
  {
    title: "Days & Time (曜日)",
    levelLabel: "N5",
    description: "Days of the week, telling time, and schedule expressions.",
    prereqTitles: ["Colors (いろ)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Days of the Week — ようび",
        objectives: ["Name all 7 days of the week", "Ask and say what day it is"],
        grammar: `Days of the week — all end in ようび:
にちようび (Sunday)   げつようび (Monday)   かようび (Tuesday)
すいようび (Wednesday)   もくようび (Thursday)   きんようび (Friday)   どようび (Saturday)

Memory trick: the kanji match the 5 elements + sun/moon:
日(sun)月(moon)火(fire)水(water)木(tree)金(gold)土(earth)

きょうはなんようびですか？= What day is today?
きょうはかようびです。= Today is Tuesday.`,
        reading: `スケジュール:
げつようびからきんようびまでがっこうです。(School is Monday to Friday.)
どようびとにちようびはやすみです。(Saturday and Sunday are days off.)
まいにち = every day  |  まいしゅう = every week`,
        dialogue: [
          { speaker: "A", text: "きょうはなんようびですか？", translation: "What day is today?" },
          { speaker: "B", text: "もくようびです。あしたはきんようびですね。", translation: "It's Thursday. Tomorrow is Friday, right?" },
          { speaker: "A", text: "そうです！しゅうまつはなにをしますか？", translation: "That's right! What will you do on the weekend?" },
          { speaker: "B", text: "どようびはかいものして、にちようびはやすみます。", translation: "On Saturday I'll shop, and on Sunday I'll rest." },
        ],
        vocab: [
          { term: "にちようび", reading: "nichiyōbi", meaning: "Sunday", example: "にちようびはやすみです。(Sunday is a day off.)" },
          { term: "げつようび", reading: "getsuyōbi", meaning: "Monday", example: "げつようびからしごとがはじまります。(Work starts from Monday.)" },
          { term: "きんようび", reading: "kin'yōbi", meaning: "Friday", example: "きんようびのよるはたのしい！(Friday nights are fun!)" },
          { term: "どようび", reading: "doyōbi", meaning: "Saturday", example: "どようびにえいがをみます。(I watch movies on Saturday.)" },
          { term: "きょう", reading: "kyō", meaning: "today", example: "きょうはなんようびですか？(What day is today?)" },
          { term: "あした", reading: "ashita", meaning: "tomorrow", example: "あしたはしけんです。(Tomorrow is the exam.)" },
          { term: "しゅうまつ", reading: "shūmatsu", meaning: "weekend", example: "しゅうまつはなにをしますか？(What do you do on weekends?)" },
        ],
        quiz: [
          q("'きんようび' is…", ["Monday","Wednesday","Friday","Sunday"], 2, "days"),
          qFill("Type the Japanese for 'today':", ["きょう", "kyou", "kyō"], "time-vocab"),
          qMatch("Match the day to its English name:", [["げつようび","Monday"],["すいようび","Wednesday"],["どようび","Saturday"]], "days"),
          qReorder("Order the weekdays: Mon → Tue → Wed → Thu →…", ["もくようび","かようび","げつようび","すいようび"], [2,1,3,0], "days"),
        ],
      },
    ],
  },
  // ── N5 Kanji Basics (漢字) ─────────────────────────────────────────────────
  {
    title: "N5 Kanji Basics (漢字)",
    levelLabel: "N5",
    description: "Learn the most essential 20 kanji for everyday Japanese.",
    prereqTitles: ["Days & Time (曜日)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Nature Kanji — 日月火水木金土山川",
        objectives: ["Read and write 9 nature kanji", "Recognize them in compound words"],
        grammar: `Kanji have two readings: on'yomi (Chinese-derived) and kun'yomi (Japanese).
日: にち/じつ (on) | ひ/か (kun) — 日曜日(Sunday), 今日(today)
月: げつ/がつ (on) | つき (kun) — 月曜日(Monday), 今月(this month)
火: か (on) | ひ (kun) — 火曜日(Tuesday), 火(fire)
水: すい (on) | みず (kun) — 水曜日(Wednesday), 水(water)
木: もく (on) | き (kun) — 木曜日(Thursday), 木(tree)
金: きん (on) | かね/きん (kun) — 金曜日(Friday), お金(money)
土: ど (on) | つち (kun) — 土曜日(Saturday), 土(soil)
山: さん (on) | やま (kun) — 富士山(Mt.Fuji), 山(mountain)
川: せん (on) | かわ (kun) — 川(river)`,
        reading: `These 9 kanji appear in words you use every day:
日本(にほん) = Japan  |  今日(きょう) = today  |  山川(やまかわ) = mountains and rivers
お金(おかね) = money  |  水(みず) = water  |  木(き) = tree
These kanji also give the days of the week their names!`,
        dialogue: [
          { speaker: "A", text: "「火」はなんとよみますか？", translation: "How do you read '火'?" },
          { speaker: "B", text: "「ひ」または「か」とよみます。「火曜日」は「かようび」です。", translation: "It reads as 'hi' or 'ka'. '火曜日' is 'kayōbi' (Tuesday)." },
          { speaker: "A", text: "「山」は？", translation: "And '山'?" },
          { speaker: "B", text: "「やま」です。「ふじさん」はゆうめいですね。", translation: "'Yama'. Mt. Fuji is famous, isn't it." },
        ],
        vocab: [
          { term: "日本", reading: "nihon", meaning: "Japan", example: "日本のたべものはおいしい。(Japanese food is delicious.)" },
          { term: "今日", reading: "kyō", meaning: "today", example: "今日はさむい。(Today is cold.)" },
          { term: "お金", reading: "okane", meaning: "money", example: "お金がありません。(I don't have money.)" },
          { term: "山", reading: "yama", meaning: "mountain", example: "やまにのぼります。(I climb the mountain.)" },
          { term: "川", reading: "kawa", meaning: "river", example: "かわでおよぎます。(I swim in the river.)" },
          { term: "水", reading: "mizu", meaning: "water", example: "みずをのみます。(I drink water.)" },
        ],
        quiz: [
          q("'日本' reads as…", ["にっぽん/にほん","げつほん","ひほん","かほん"], 0, "kanji-reading"),
          q("'お金' means…", ["water","money","mountain","fire"], 1, "kanji-vocab"),
          q("Which kanji means 'river'?", ["山","木","川","土"], 2, "kanji"),
          q("'今日' reads as…", ["きのう","きょう","あした","こんにち"], 1, "kanji-reading"),
        ],
      },
      {
        title: "People & Body Kanji — 人口目耳手足",
        objectives: ["Read 6 body/people kanji", "Use them in compound words"],
        grammar: `人: じん/にん (on) | ひと (kun) — 日本人(Japanese person), 三人(3 people)
口: こう/く (on) | くち (kun) — 人口(population), 口(mouth)
目: もく (on) | め (kun) — 目(eye), 一番目(1st)
耳: じ (on) | みみ (kun) — 耳(ear)
手: しゅ (on) | て (kun) — 手(hand), 上手(skilled)
足: そく (on) | あし (kun) — 足(foot/leg), 足りる(sufficient)`,
        reading: `Body vocabulary:
め(eye)  みみ(ear)  て(hand)  あし(foot/leg)  くち(mouth)  はな(nose)  あたま(head)
Useful compound words:
上手(じょうず) = skilled  |  下手(へた) = unskilled  |  人口(じんこう) = population`,
        dialogue: [
          { speaker: "A", text: "上手ですね！", translation: "You're skilled!" },
          { speaker: "B", text: "ありがとう。でも、まだまだです。もっとれんしゅうします。", translation: "Thank you. But I still have a long way to go. I'll practice more." },
          { speaker: "A", text: "日本語がとても上手ですよ。", translation: "Your Japanese is really good, you know." },
        ],
        vocab: [
          { term: "人", reading: "hito/jin", meaning: "person / people", example: "日本人(Japanese person)" },
          { term: "目", reading: "me", meaning: "eye", example: "めがおおきい。(Big eyes.)" },
          { term: "耳", reading: "mimi", meaning: "ear", example: "みみをかたむける。(To lend an ear.)" },
          { term: "手", reading: "te", meaning: "hand", example: "てをあらう。(Wash your hands.)" },
          { term: "上手", reading: "jōzu", meaning: "skilled / good at", example: "えがじょうずですね。(Your drawing is good!)" },
          { term: "人口", reading: "jinkō", meaning: "population", example: "とうきょうのじんこうはおおい。(Tokyo's population is large.)" },
        ],
        quiz: [
          q("'上手' (じょうず) means…", ["unskilled","population","skilled/good at","hand"], 2, "kanji-vocab"),
          q("'め' (目) means…", ["ear","nose","eye","mouth"], 2, "body"),
          q("'人' can be read as…", ["ひと or じん","やま or さん","かわ or せん","き or もく"], 0, "kanji-reading"),
          q("'てをあらう' means…", ["wash face","wash hands","wash feet","wash ears"], 1, "body-vocab"),
        ],
      },
    ],
  },
  // ── Common Verbs 1 (動詞) ──────────────────────────────────────────────────
  {
    title: "Common Verbs 1 (動詞)",
    levelLabel: "N5",
    description: "Essential action verbs and the -ます polite form.",
    prereqTitles: ["N5 Kanji Basics (漢字)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Verbs — ます form",
        objectives: ["Conjugate verbs in the polite ます form", "Use 10 essential verbs"],
        grammar: `Polite verb forms (ます form):
たべます (eat)   のみます (drink)   いきます (go)   きます (come)   みます (see/watch)
きます (wear/put on) *different kanji   かきます (write)   よみます (read)   はなします (speak)
します (do)   かいます (buy)   おきます (wake up)   ねます (sleep)

Negative: 〜ません (do not)   Past: 〜ました (did)
わたしはまいあさ６じにおきます。(I wake up at 6 every morning.)`,
        reading: `まいにちのスケジュール:
わたしはろくじにおきます。(I wake up at 6.)
あさごはんをたべて、かいしゃにいきます。(I eat breakfast then go to work.)
よるはほんをよんで、じゅういちじにねます。(At night I read a book, and sleep at 11.)`,
        dialogue: [
          { speaker: "A", text: "まいにちなにをしますか？", translation: "What do you do every day?" },
          { speaker: "B", text: "あさはコーヒーをのんで、ほんをよみます。", translation: "In the morning I drink coffee and read books." },
          { speaker: "A", text: "テレビはみますか？", translation: "Do you watch TV?" },
          { speaker: "B", text: "あまりみません。えいがのほうがすきです。", translation: "I don't watch much. I prefer movies." },
        ],
        vocab: [
          { term: "たべます", reading: "tabemasu", meaning: "eat", example: "すしをたべます。(I eat sushi.)" },
          { term: "のみます", reading: "nomimasu", meaning: "drink", example: "みずをのみます。(I drink water.)" },
          { term: "いきます", reading: "ikimasu", meaning: "go", example: "がっこうにいきます。(I go to school.)" },
          { term: "みます", reading: "mimasu", meaning: "see / watch", example: "えいがをみます。(I watch a movie.)" },
          { term: "よみます", reading: "yomimasu", meaning: "read", example: "ほんをよみます。(I read a book.)" },
          { term: "かきます", reading: "kakimasu", meaning: "write", example: "てがみをかきます。(I write a letter.)" },
          { term: "ねます", reading: "nemasu", meaning: "sleep / go to bed", example: "じゅういちじにねます。(I sleep at 11.)" },
          { term: "おきます", reading: "okimasu", meaning: "wake up / get up", example: "しちじにおきます。(I wake up at 7.)" },
        ],
        quiz: [
          q("'のみます' means…", ["eat","drink","sleep","go"], 1, "verbs"),
          q("Negative of 'いきます' is…", ["いきました","いかない","いきません","いくます"], 2, "verb-neg"),
          q("'ほんをよみます' means…", ["I buy a book","I write a book","I read a book","I see a book"], 2, "verbs"),
          q("'おきます' means…", ["sleep","eat","wake up","drink"], 2, "verbs"),
        ],
      },
    ],
  },
  // ── Adjectives (形容詞) ───────────────────────────────────────────────────
  {
    title: "Adjectives (形容詞)",
    levelLabel: "N5",
    description: "い-adjectives and な-adjectives for describing people and things.",
    prereqTitles: ["Common Verbs 1 (動詞)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "い-Adjectives",
        objectives: ["Use い-adjectives to describe things", "Form negatives with くない"],
        grammar: `い-adjectives end in い and conjugate like this:
Present: おおきい (big)   Negative: おおきくない (not big)
Past: おおきかった (was big)   Past negative: おおきくなかった

Common い-adjectives:
おおきい (big)   ちいさい (small)   あたらしい (new)   ふるい (old)
たかい (expensive/tall)   やすい (cheap/low)   むずかしい (difficult)   やさしい (easy/kind)
おもしろい (interesting)   つまらない (boring)   たのしい (fun)   かなしい (sad)`,
        reading: `このえいがはおもしろい！(This movie is interesting!)
あのほんはむずかしくない。(That book is not difficult.)
えきからとおいですか？(Is it far from the station?)
いいえ、ちかいです。(No, it's close.)`,
        dialogue: [
          { speaker: "A", text: "この問題はむずかしいですか？", translation: "Is this problem difficult?" },
          { speaker: "B", text: "むずかしくないですよ。でも、じかんがかかります。", translation: "It's not difficult. But it takes time." },
          { speaker: "A", text: "そのしごとはたのしいですか？", translation: "Is that job fun?" },
          { speaker: "B", text: "はい、とてもたのしいです！まいにちあたらしいことをまなびます。", translation: "Yes, very fun! Every day I learn new things." },
        ],
        vocab: [
          { term: "おおきい", reading: "ōkii", meaning: "big / large", example: "おおきいいえにすみたい。(I want to live in a big house.)" },
          { term: "ちいさい", reading: "chiisai", meaning: "small / little", example: "ちいさいこども。(A small child.)" },
          { term: "あたらしい", reading: "atarashii", meaning: "new", example: "あたらしいスマホをかった。(I bought a new smartphone.)" },
          { term: "むずかしい", reading: "muzukashii", meaning: "difficult", example: "にほんごはむずかしい。(Japanese is difficult.)" },
          { term: "たのしい", reading: "tanoshii", meaning: "fun / enjoyable", example: "たのしいじゅぎょう。(A fun class.)" },
          { term: "おもしろい", reading: "omoshiroi", meaning: "interesting / funny", example: "おもしろいほん。(An interesting book.)" },
          { term: "やさしい", reading: "yasashii", meaning: "easy / kind", example: "やさしいせんせい。(A kind teacher.)" },
        ],
        quiz: [
          q("'おおきくない' means…", ["very big","not big","was big","is big"], 1, "i-adj-neg"),
          q("'むずかしい' means…", ["easy","interesting","difficult","fun"], 2, "adj-vocab"),
          q("'たのしい' means…", ["sad","boring","fun/enjoyable","expensive"], 2, "adj-vocab"),
          q("'あたらしい' means…", ["old","cheap","new","small"], 2, "adj-vocab"),
        ],
      },
    ],
  },
  // ── At the Restaurant (レストランで) ──────────────────────────────────────
  {
    title: "At the Restaurant (レストランで)",
    levelLabel: "N5",
    description: "Order food, ask for the bill, and dine out in Japanese.",
    prereqTitles: ["Adjectives (形容詞)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Ordering Food — ちゅうもん",
        objectives: ["Order food politely in a Japanese restaurant", "Ask for the bill and common requests"],
        grammar: `Key restaurant phrases:
すみません = excuse me (to call a waiter)
〜をひとつ/ふたつください = one/two ~ please
〜をおすすめはなんですか？= What do you recommend?
おかいけいをおねがいします = Bill please (polite)
〜はアレルギーがあります = I'm allergic to ~
〜なしでおねがいします = Without ~ please

Ordering: 〜にします / 〜をください / 〜をおねがいします`,
        reading: `レストランでのかいわ:
「いらっしゃいませ！なんめいさまですか？」= Welcome! How many people?
「ふたりです。」= Two people.
「ごちゅうもんはおきまりですか？」= Are you ready to order?
「はい。ラーメンをひとつとぎょうざをふたつください。」= Yes. One ramen and two gyoza please.
「おかいけいをおねがいします。」= Bill please.`,
        dialogue: [
          { speaker: "Staff", text: "いらっしゃいませ！なんめいさまですか？", translation: "Welcome! How many guests?" },
          { speaker: "Customer", text: "ふたりです。", translation: "Two people." },
          { speaker: "Staff", text: "こちらへどうぞ。ごちゅうもんはおきまりですか？", translation: "This way please. Are you ready to order?" },
          { speaker: "Customer", text: "すみません、おすすめはなんですか？", translation: "Excuse me, what do you recommend?" },
          { speaker: "Staff", text: "ほんじつはとんこつラーメンがおすすめです。", translation: "Today we recommend the tonkotsu ramen." },
          { speaker: "Customer", text: "じゃあ、それをふたつください。あと、おかいけいもおねがいします。", translation: "Then two of those please. Also, the bill please." },
        ],
        vocab: [
          { term: "すみません", reading: "sumimasen", meaning: "excuse me / sorry", example: "すみません！みずをください。(Excuse me! Water please.)" },
          { term: "ちゅうもん", reading: "chuumon", meaning: "order", example: "ちゅうもんをとってください。(Please take our order.)" },
          { term: "おすすめ", reading: "osusume", meaning: "recommendation", example: "おすすめはなんですか？(What's your recommendation?)" },
          { term: "おかいけい", reading: "okaikei", meaning: "the bill / check", example: "おかいけいをおねがいします。(Bill please.)" },
          { term: "〜をください", reading: "~wo kudasai", meaning: "please give me ~", example: "みずをふたつください。(Two waters please.)" },
          { term: "なんめいさま", reading: "nanmei sama", meaning: "how many guests (polite)", example: "なんめいさまですか？(How many guests?)" },
        ],
        quiz: [
          q("To call a waiter's attention, you say…", ["おかいけい","ちゅうもん","すみません","いただきます"], 2, "restaurant"),
          q("'おかいけいをおねがいします' means…", ["Recommend something","Water please","Bill please","What is this?"], 2, "restaurant"),
          q("'おすすめはなんですか？' means…", ["What is the price?","What do you recommend?","Is it spicy?","How many people?"], 1, "restaurant"),
          q("To order 'two ramens', you say…", ["ラーメンをひとつ","ラーメンをふたつください","ラーメンをさんつ","ラーメンをよっつ"], 1, "ordering"),
        ],
      },
    ],
  },
  // ── Transportation (交通) ──────────────────────────────────────────────────
  {
    title: "Transportation (交通)",
    levelLabel: "N5",
    description: "Getting around Japan — trains, buses, and asking for directions.",
    prereqTitles: ["At the Restaurant (レストランで)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Transport & Directions — こうつう",
        objectives: ["Name transport types", "Ask and understand basic direction phrases"],
        grammar: `Transport words:
でんしゃ (train)   バス (bus)   タクシー (taxi)   じてんしゃ (bicycle)   ひこうき (airplane)   ふね (ship)

Direction words:
まっすぐ (straight ahead)   みぎ (right)   ひだり (left)   まがる (turn)
〜をまがってください = please turn at ~
〜まで = to/until ~ (destination particle)

Asking directions:
〜はどこですか？= Where is ~?
〜にどうやっていきますか？= How do I get to ~?`,
        reading: `えきへのいきかた:
つぎのかどをみぎにまがってください。(Turn right at the next corner.)
まっすぐいくと、ひだりにえきがあります。(Go straight and the station is on the left.)
えきまでどのくらいかかりますか？(How long does it take to the station?)
あるいて１０ぷんです。(It's 10 minutes on foot.)`,
        dialogue: [
          { speaker: "A", text: "すみません、えきはどこですか？", translation: "Excuse me, where is the station?" },
          { speaker: "B", text: "まっすぐいって、つぎのしんごうをひだりにまがってください。", translation: "Go straight, then turn left at the next traffic light." },
          { speaker: "A", text: "どのくらいかかりますか？", translation: "How long does it take?" },
          { speaker: "B", text: "あるいてごふんです。バスでいけば２ふんです。", translation: "5 minutes on foot. 2 minutes by bus." },
        ],
        vocab: [
          { term: "でんしゃ", reading: "densha", meaning: "train (electric)", example: "でんしゃでいきます。(I go by train.)" },
          { term: "バス", reading: "basu", meaning: "bus", example: "バスにのります。(I take the bus.)" },
          { term: "まっすぐ", reading: "massugu", meaning: "straight ahead", example: "まっすぐいってください。(Please go straight.)" },
          { term: "みぎ", reading: "migi", meaning: "right", example: "みぎにまがってください。(Please turn right.)" },
          { term: "ひだり", reading: "hidari", meaning: "left", example: "ひだりにえきがあります。(The station is on the left.)" },
          { term: "〜まで", reading: "~made", meaning: "to / until (destination)", example: "えきまでどのくらい？(How far to the station?)" },
          { term: "あるいて", reading: "aruite", meaning: "on foot / walking", example: "あるいて５ふんです。(5 minutes on foot.)" },
        ],
        quiz: [
          q("'でんしゃ' means…", ["airplane","bus","bicycle","train"], 3, "transport"),
          q("'ひだり' means…", ["straight","right","left","back"], 2, "directions"),
          q("'まっすぐ' means…", ["turn right","turn left","straight ahead","stop here"], 2, "directions"),
          q("'えきはどこですか？' means…", ["How far is the station?","Where is the station?","Is there a station?","What time does the train come?"], 1, "directions-q"),
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
    description: "Greet people and introduce yourself in English.",
    prereqTitles: [],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Saying Hello",
        objectives: ["Use common greetings", "Introduce yourself with 'I am'"],
        grammar: `Use 'I am' / 'I'm' + name to introduce yourself.
Use 'Nice to meet you' when meeting someone new.
Greetings by time: Good morning / Good afternoon / Good evening.
Reply to 'How are you?': I'm fine / I'm great / Not bad, thank you.`,
        reading: `Hi! My name is Sam. Nice to meet you.
How are you today? I'm doing well, thank you!
This is my friend, Lisa. She's from Indonesia.`,
        dialogue: [
          { speaker: "A", text: "Hi, I'm Sam. Nice to meet you!", translation: "Halo, saya Sam. Senang bertemu denganmu!" },
          { speaker: "B", text: "Nice to meet you too! I'm Maya. How are you?", translation: "Senang bertemu juga! Saya Maya. Apa kabar?" },
          { speaker: "A", text: "I'm great, thanks!", translation: "Saya baik-baik saja, terima kasih!" },
        ],
        vocab: [
          { term: "hello", meaning: "a greeting", example: "Hello! How are you?" },
          { term: "nice to meet you", meaning: "a polite greeting when first meeting someone", example: "Nice to meet you, I'm Andi." },
          { term: "my name is", meaning: "used to introduce yourself", example: "My name is Sari." },
          { term: "how are you?", meaning: "asking about someone's wellbeing", example: "Hi! How are you today?" },
          { term: "fine / great / good", meaning: "common replies to 'how are you'", example: "I'm fine, thank you." },
        ],
        quiz: [
          q("Which is a greeting?", ["Goodbye","Hello","Sorry","Later"], 1, "greetings"),
          q("Complete: 'Nice ___ meet you.'", ["to","for","at","of"], 0, "phrases"),
          q("'My name ___' followed by your name.", ["am","be","is","are"], 2, "grammar"),
          q("Reply to 'How are you?':", ["Yes please","Nice to meet you","I'm fine, thank you","Goodbye"], 2, "conversation"),
        ],
      },
    ],
  },
  {
    title: "Present Simple",
    levelLabel: "Beginner",
    description: "Talk about habits and facts with the present simple.",
    prereqTitles: ["Greetings & Introductions"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Present Simple — Affirmative",
        objectives: ["Form present simple sentences", "Add -s/-es for he/she/it"],
        grammar: `Present simple structure:
I / You / We / They + base verb: "I work." "They study."
He / She / It + verb + -s: "She works." "He studies."

Spelling rules for -s:
• Most verbs: add -s → work→works
• -sh/-ch/-x/-o: add -es → watch→watches, go→goes
• Consonant + -y: change y→i + es → study→studies`,
        reading: `Every day, Andi wakes up at 7 AM. He drinks coffee and reads the news.
He works at a company in Jakarta. His sister studies at university.
They both love Indonesian food!`,
        dialogue: [
          { speaker: "A", text: "What do you do every day?", translation: "Apa yang kamu lakukan setiap hari?" },
          { speaker: "B", text: "I wake up early and exercise. Then I go to work.", translation: "Saya bangun pagi dan olahraga. Lalu pergi kerja." },
          { speaker: "A", text: "My sister exercises too. She runs every morning.", translation: "Adik saya juga olahraga. Dia lari setiap pagi." },
        ],
        vocab: [
          { term: "wake up", meaning: "to stop sleeping and get up", example: "I wake up at 7 AM." },
          { term: "study", meaning: "to learn from books or classes", example: "She studies English every day." },
          { term: "work", meaning: "to do a job", example: "He works in an office." },
          { term: "exercise", meaning: "to do physical activity", example: "They exercise in the morning." },
          { term: "every day", meaning: "daily; each day", example: "I eat breakfast every day." },
        ],
        quiz: [
          q("'She ___ to school every day.'", ["go","goes","going","gone"], 1, "present-simple-s"),
          qFill("Complete: 'He ___ the news every morning.' (read)", ["reads"], "present-simple-s"),
          qMatch("Match the verb to its he/she/it form:", [["go","goes"],["study","studies"],["watch","watches"]], "spelling"),
          qReorder("Build the sentence:", ["reads","every morning","He","the news"], [2,0,3,1], "present-simple"),
        ],
      },
      {
        title: "Present Simple — Negative & Questions",
        objectives: ["Make negative sentences with don't/doesn't", "Ask yes/no questions with do/does"],
        grammar: `Negative:
I/You/We/They + don't + base verb: "I don't eat meat."
He/She/It + doesn't + base verb: "She doesn't like coffee."

Questions:
Do + I/you/we/they + verb? "Do you like sushi?"
Does + he/she/it + verb? "Does she work here?"

Short answers:
Yes, I do. / No, I don't.  |  Yes, she does. / No, she doesn't.`,
        reading: `Ria doesn't eat meat — she's vegetarian. She does eat fish, though.
"Do you cook at home?" "Yes, I do! I cook every weekend."
"Does your brother like cooking too?" "No, he doesn't. He orders food online."`,
        dialogue: [
          { speaker: "A", text: "Do you speak Japanese?", translation: "Apakah kamu berbicara bahasa Jepang?" },
          { speaker: "B", text: "Yes, I do! But I don't speak Chinese.", translation: "Ya! Tapi saya tidak berbicara bahasa Mandarin." },
          { speaker: "A", text: "Does your teacher speak Indonesian?", translation: "Apakah gurumu berbicara bahasa Indonesia?" },
          { speaker: "B", text: "No, she doesn't.", translation: "Tidak." },
        ],
        vocab: [
          { term: "don't", meaning: "do not — used with I/you/we/they", example: "I don't like coffee." },
          { term: "doesn't", meaning: "does not — used with he/she/it", example: "She doesn't eat meat." },
          { term: "do you…?", meaning: "question form for I/you/we/they", example: "Do you live here?" },
          { term: "does he/she…?", meaning: "question form for he/she/it", example: "Does she work here?" },
          { term: "vegetarian", meaning: "a person who doesn't eat meat", example: "I'm vegetarian." },
        ],
        quiz: [
          q("'He ___ like pizza.' (negative)", ["don't","doesn't","isn't","aren't"], 1, "present-simple-neg"),
          qFill("Complete: '___ she speak Japanese?' (question form):", ["Does"], "present-simple-q"),
          qReorder("Build the negative sentence:", ["meat","doesn't","She","eat"], [2,1,3,0], "present-simple-neg"),
          qMatch("Match the subject to the correct auxiliary:", [["I","don't"],["She","doesn't"],["They","don't"]], "present-simple-neg"),
        ],
      },
    ],
  },
  {
    title: "Past Simple",
    levelLabel: "Beginner",
    description: "Talk about completed actions in the past.",
    prereqTitles: ["Present Simple"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Past Simple — Regular & Irregular Verbs",
        objectives: ["Form past simple with -ed", "Use common irregular past forms"],
        grammar: `Regular verbs: add -ed
  work → worked   study → studied   walk → walked   watch → watched

Irregular verbs (memorize these):
  go → went   eat → ate   have → had   see → saw   come → came
  buy → bought   take → took   make → made   give → gave

Negative: didn't + base verb (same for all subjects)
  "He didn't go to school yesterday."

Question: Did + subject + base verb?
  "Did you eat breakfast?"`,
        reading: `Yesterday, Budi went to the market. He bought vegetables and fruit.
He cooked dinner and invited his friends. They ate together and had a great time.
"Did you make the curry?" "Yes, I did! I also made rice."`,
        dialogue: [
          { speaker: "A", text: "Where did you go last weekend?", translation: "Kamu pergi ke mana akhir pekan lalu?" },
          { speaker: "B", text: "I went to Bali. It was amazing! I saw a temple.", translation: "Saya pergi ke Bali. Luar biasa! Saya melihat kuil." },
          { speaker: "A", text: "Did you eat local food?", translation: "Kamu makan makanan lokal?" },
          { speaker: "B", text: "Yes! I ate nasi goreng every day.", translation: "Ya! Saya makan nasi goreng setiap hari." },
        ],
        vocab: [
          { term: "went", meaning: "past of 'go'", example: "I went to the shop." },
          { term: "ate", meaning: "past of 'eat'", example: "She ate sushi for lunch." },
          { term: "saw", meaning: "past of 'see'", example: "We saw a great movie." },
          { term: "bought", meaning: "past of 'buy'", example: "He bought a new phone." },
          { term: "didn't", meaning: "did not — past negative", example: "I didn't sleep well." },
        ],
        quiz: [
          qFill("Write the past tense of 'go':", ["went"], "irregular"),
          q("'She ___ TV last night.' (watch)", ["watched","watch","watches","watchd"], 0, "past-regular"),
          qMatch("Match the verb to its past form:", [["go","went"],["eat","ate"],["buy","bought"],["see","saw"]], "irregular"),
          qReorder("Build the question:", ["did","the movie","you","see","?"], [0,2,3,1,4], "past-question"),
        ],
      },
    ],
  },
  // ── Present Continuous ────────────────────────────────────────────────────
  {
    title: "Present Continuous",
    levelLabel: "Beginner",
    description: "Describe actions happening right now using am/is/are + -ing.",
    prereqTitles: ["Past Simple"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Present Continuous — am/is/are + -ing",
        objectives: ["Form the present continuous tense", "Distinguish it from present simple"],
        grammar: `Structure: subject + am/is/are + verb-ing

I am eating.   She is working.   They are playing.

Spelling rules for -ing:
• Most verbs: add -ing → eat→eating, work→working
• Verb ends in -e: drop e + ing → write→writing, make→making
• Short vowel + consonant: double last letter + ing → run→running, sit→sitting

Use it for: actions happening NOW, temporary situations, future plans.
"I'm studying Japanese this year." (temporary ongoing)`,
        reading: `Look around you right now:
The teacher is writing on the board. Students are listening.
Some are taking notes, and one student is sleeping!
"What are you doing?" "I'm doing my homework."
"Is she coming to the party?" "No, she's working tonight."`,
        dialogue: [
          { speaker: "A", text: "Where are you? You're late!", translation: "" },
          { speaker: "B", text: "Sorry! I'm running to the bus stop. The bus is leaving!", translation: "" },
          { speaker: "A", text: "Hurry up! Everyone is waiting for you.", translation: "" },
          { speaker: "B", text: "I'm coming! I'm almost there.", translation: "" },
        ],
        vocab: [
          { term: "am/is/are + -ing", meaning: "present continuous form", example: "She is cooking dinner." },
          { term: "right now", meaning: "at this moment", example: "What are you doing right now?" },
          { term: "at the moment", meaning: "currently; right now", example: "I'm studying at the moment." },
          { term: "currently", meaning: "at this time; now", example: "He is currently living in Jakarta." },
          { term: "temporary", meaning: "lasting only a short time", example: "She is temporarily working from home." },
        ],
        quiz: [
          q("'She ___ (read) a book right now.'", ["reads","is reading","read","readed"], 1, "present-cont"),
          q("'write' → -ing form is…", ["writeing","writting","writing","writhing"], 2, "spelling-ing"),
          qFill("Write the -ing form of 'run':", ["running"], "spelling-ing"),
          qReorder("Build: 'She is reading a book right now':", ["is","right now","She","a book","reading"], [2,0,4,3,1], "present-cont"),
        ],
      },
    ],
  },
  // ── Future Tense ──────────────────────────────────────────────────────────
  {
    title: "Future Tense",
    levelLabel: "Beginner",
    description: "Talk about future plans and predictions using will and going to.",
    prereqTitles: ["Present Continuous"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "will & going to",
        objectives: ["Use 'will' for predictions and decisions", "Use 'going to' for plans"],
        grammar: `WILL: subject + will + base verb
Use for: predictions, spontaneous decisions, offers/promises.
"It will rain tomorrow." (prediction)
"I'll help you!" (spontaneous offer)

GOING TO: subject + am/is/are + going to + base verb
Use for: pre-planned intentions, things you can already see will happen.
"I'm going to visit Japan next year." (planned)
"Look at those clouds — it's going to rain!" (you can see it coming)

Negative: won't (will not) | isn't/aren't going to`,
        reading: `Next week is going to be busy!
On Monday, I'm going to start a new project at work.
I think it will be challenging, but I'll work hard.
"Are you going to join us for dinner?" "No, I won't be able to. I'll be working late."
"Don't worry. It will be fine!"`,
        dialogue: [
          { speaker: "A", text: "What are you going to do this weekend?", translation: "" },
          { speaker: "B", text: "I'm going to visit my grandparents. What about you?", translation: "" },
          { speaker: "A", text: "I'll probably just stay home. Maybe I'll watch a movie.", translation: "" },
          { speaker: "B", text: "That sounds relaxing! I think the weather will be nice.", translation: "" },
        ],
        vocab: [
          { term: "will", meaning: "future auxiliary for predictions/decisions", example: "I will call you later." },
          { term: "won't", meaning: "will not", example: "She won't be at the party." },
          { term: "going to", meaning: "future for plans/intentions", example: "We are going to travel next month." },
          { term: "probably", meaning: "likely; almost certainly", example: "It will probably rain today." },
          { term: "plan", meaning: "an intention to do something", example: "I have plans to study abroad." },
        ],
        quiz: [
          q("Best for a spontaneous decision: 'I ___ help you carry that.'", ["am going to","will","going to","am will"], 1, "will-vs-going-to"),
          q("Best for a pre-made plan: 'We ___ move to a new house next month.'", ["will","might","are going to","would"], 2, "will-vs-going-to"),
          q("Negative of 'will' is…", ["won't","willn't","will not going","wouldn't"], 0, "future-neg"),
          q("'It ___ be cold tomorrow.' (prediction)", ["going to","is going","will","are going to"], 2, "future-pred"),
        ],
      },
    ],
  },
  // ── Family & Relationships ────────────────────────────────────────────────
  {
    title: "Family & Relationships",
    levelLabel: "Beginner",
    description: "Talk about your family, describe relationships and introduce people.",
    prereqTitles: ["Future Tense"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Family Vocabulary",
        objectives: ["Name family members in English", "Describe family relationships"],
        grammar: `Possessive 's: "My father's name is Ahmad."
Relationship descriptions:
~ is my + [family word] → "She is my sister."
I have + [number] + [family word](s) → "I have two brothers."
My ~ is [age/job/adjective] → "My mother is a nurse."`,
        reading: `Let me tell you about my family.
I have four people in my family: my father, mother, older sister, and me.
My father is an engineer. My mother is a teacher. My sister is 25 and she works as a designer.
We are a close family. We have dinner together every Sunday.`,
        dialogue: [
          { speaker: "A", text: "Do you have any brothers or sisters?", translation: "" },
          { speaker: "B", text: "Yes, I have one older brother and one younger sister. What about you?", translation: "" },
          { speaker: "A", text: "I'm an only child. But I have many cousins!", translation: "" },
          { speaker: "B", text: "That sounds fun. My brother is married, so now I have a sister-in-law too.", translation: "" },
        ],
        vocab: [
          { term: "parents", meaning: "father and mother together", example: "My parents live in Bandung." },
          { term: "sibling", meaning: "a brother or sister", example: "I have three siblings." },
          { term: "cousin", meaning: "child of your uncle or aunt", example: "My cousin lives in Surabaya." },
          { term: "only child", meaning: "a person with no siblings", example: "She is an only child." },
          { term: "married", meaning: "having a husband or wife", example: "My sister got married last year." },
          { term: "relative", meaning: "a family member (broad)", example: "All my relatives came to the wedding." },
        ],
        quiz: [
          q("Your mother's sister is your…", ["cousin","aunt","niece","grandmother"], 1, "family"),
          q("'I have no brothers or sisters' means you are…", ["married","an only child","adopted","an uncle"], 1, "family"),
          q("Your brother's son is your…", ["nephew","cousin","grandson","stepson"], 0, "family"),
          q("'My parents' refers to…", ["all grandparents","your father and mother","your siblings","your relatives"], 1, "family"),
        ],
      },
    ],
  },
  // ── Food & Dining ─────────────────────────────────────────────────────────
  {
    title: "Food & Dining",
    levelLabel: "Beginner",
    description: "Vocabulary for meals, restaurants, and food preferences.",
    prereqTitles: ["Family & Relationships"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Meals & Food Vocabulary",
        objectives: ["Name different meals and common foods", "Order food and express preferences"],
        grammar: `Meal times: breakfast, lunch, dinner/supper, snack
Expressing preferences:
I love / like / enjoy + noun or verb-ing → "I love spicy food." "I enjoy cooking."
I don't like / I can't stand / I hate + noun → "I can't stand broccoli."
I'm allergic to ~ → "I'm allergic to nuts."
Would you like ~? → polite offer → "Would you like some coffee?"`,
        reading: `Eating out in Indonesia:
When you enter a restaurant, the staff usually say "Selamat datang!" (Welcome).
You can ask: "What do you recommend?" or "What's today's special?"
To call a waiter: "Excuse me!" or raise your hand.
After eating, ask for the bill: "Could we have the check, please?"`,
        dialogue: [
          { speaker: "Waiter", text: "Good evening! Are you ready to order?", translation: "" },
          { speaker: "Customer", text: "Yes. I'd like the grilled chicken, please. Is it spicy?", translation: "" },
          { speaker: "Waiter", text: "It's mildly spicy. Would you like extra sauce on the side?", translation: "" },
          { speaker: "Customer", text: "Yes, please. And could I have a glass of water too?", translation: "" },
        ],
        vocab: [
          { term: "breakfast", meaning: "the first meal of the day", example: "I usually skip breakfast." },
          { term: "recommend", meaning: "to suggest something good", example: "What do you recommend here?" },
          { term: "allergic", meaning: "having a bad reaction to certain foods", example: "I'm allergic to seafood." },
          { term: "would like", meaning: "polite form of 'want'", example: "I'd like the pasta, please." },
          { term: "check / bill", meaning: "the paper showing how much to pay", example: "Could we have the check, please?" },
          { term: "spicy", meaning: "having a hot, peppery flavor", example: "Is this dish spicy?" },
        ],
        quiz: [
          q("A polite way to order food is…", ["I want the pasta","Give me pasta","I'd like the pasta, please","Pasta, now"], 2, "restaurant-english"),
          q("'I'm allergic to nuts' means…", ["I don't like nuts","Nuts make me sick","I love nuts","I can't find nuts"], 1, "food-vocab"),
          q("'Would you like some dessert?' is…", ["a command","a question","an offer","a complaint"], 2, "restaurant-english"),
          q("'The bill, please' means…", ["More food please","Water please","I want to pay","Excuse me"], 2, "restaurant-english"),
        ],
      },
    ],
  },
  // ── Jobs & Professions ────────────────────────────────────────────────────
  {
    title: "Jobs & Professions",
    levelLabel: "Beginner",
    description: "Talk about jobs, workplaces and daily work routines.",
    prereqTitles: ["Food & Dining"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Professions & Workplaces",
        objectives: ["Name common jobs in English", "Describe what people do at work"],
        grammar: `Talking about jobs:
"I am a/an + [job]." → "I am a teacher."
"She works as a/an + [job]." → "She works as an engineer."
"He works at/in + [place]." → "He works at a hospital."
"What do you do (for a living)?" → Common question about jobs.

Article rules: a/an before job title → "a doctor", "an artist" (an before vowel sounds)`,
        reading: `People work in many different fields.
Doctors and nurses work in hospitals to help sick people.
Teachers work in schools to educate students.
Engineers design and build things — from apps to bridges.
Farmers grow food for everyone.
No job is more important than another — every profession matters!`,
        dialogue: [
          { speaker: "A", text: "What do you do for a living?", translation: "" },
          { speaker: "B", text: "I'm a software engineer. I work at a tech company. What about you?", translation: "" },
          { speaker: "A", text: "I'm studying to become a doctor. It's a lot of work!", translation: "" },
          { speaker: "B", text: "That's impressive. Where do you want to work after you graduate?", translation: "" },
        ],
        vocab: [
          { term: "doctor", meaning: "a person who treats sick people", example: "The doctor examined the patient." },
          { term: "engineer", meaning: "a person who designs or builds systems", example: "She is a civil engineer." },
          { term: "teacher", meaning: "a person who educates others", example: "My teacher is very kind." },
          { term: "nurse", meaning: "a person who cares for patients", example: "The nurse took my blood pressure." },
          { term: "chef", meaning: "a professional cook", example: "The chef prepared a wonderful meal." },
          { term: "for a living", meaning: "as a job / to earn money", example: "What do you do for a living?" },
        ],
        quiz: [
          q("'What do you do for a living?' asks about…", ["your hobby","your health","your job","your family"], 2, "jobs"),
          q("'I am ___ engineer.' (correct article)", ["a","an","the","—"], 1, "articles"),
          q("Someone who works at a hospital and treats patients is a…", ["teacher","lawyer","doctor","pilot"], 2, "professions"),
          q("'She works as a chef' means she…", ["eats a lot","cooks professionally","shops a lot","serves food"], 1, "professions"),
        ],
      },
    ],
  },
  // ── Modal Verbs ───────────────────────────────────────────────────────────
  {
    title: "Modal Verbs",
    levelLabel: "Intermediate",
    description: "Express ability, permission, obligation and advice with can/should/must.",
    prereqTitles: ["Jobs & Professions"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "can / should / must",
        objectives: ["Use can for ability and permission", "Use should for advice and must for obligation"],
        grammar: `CAN: ability / permission
"I can swim." (ability)   "Can I leave early?" (permission)
Cannot / can't → "She can't drive yet."

SHOULD: advice / recommendation
"You should see a doctor." (advice)   "We shouldn't waste food."

MUST: obligation / strong necessity
"You must wear a seatbelt." (rule/law)   "I must finish this today." (strong need)
Negative: mustn't (prohibited) vs. don't have to (not necessary)
"You mustn't smoke here." (forbidden)   "You don't have to come." (optional)`,
        reading: `Signs and rules use modals:
"You must not enter." — forbidden
"You should consult a doctor." — advice
"Visitors can park here." — permission
At work: "You must arrive on time." "You should dress professionally."
"Can I help you?" — polite offer using can`,
        dialogue: [
          { speaker: "A", text: "I have a headache. What should I do?", translation: "" },
          { speaker: "B", text: "You should rest and drink lots of water. Can you take the day off?", translation: "" },
          { speaker: "A", text: "I can't. I must finish a report by noon.", translation: "" },
          { speaker: "B", text: "Then you should at least take some medicine. You mustn't ignore your health.", translation: "" },
        ],
        vocab: [
          { term: "can", meaning: "ability or permission", example: "Can you speak French?" },
          { term: "can't / cannot", meaning: "inability or no permission", example: "You can't park here." },
          { term: "should", meaning: "advice or recommendation", example: "You should exercise regularly." },
          { term: "must", meaning: "strong obligation or necessity", example: "You must wear a helmet." },
          { term: "mustn't", meaning: "prohibition — not allowed", example: "You mustn't smoke inside." },
          { term: "don't have to", meaning: "not necessary / optional", example: "You don't have to come if you're busy." },
        ],
        quiz: [
          q("'You ___ wear a seatbelt.' (it's the law)", ["should","can","must","might"], 2, "must"),
          q("'You ___ smoke here.' (it's forbidden)", ["mustn't","shouldn't","can't","don't have to"], 0, "mustn't"),
          q("Best for giving advice: 'You ___ see a doctor.'", ["must","should","can","will"], 1, "should"),
          q("'don't have to' means…", ["it's forbidden","you are not allowed","it's not necessary","you must not"], 2, "modals"),
        ],
      },
    ],
  },
];

// ─── INDONESIAN ────────────────────────────────────────────────────────────────

const indonesianSkills: SkillSeed[] = [
  {
    title: "Salam & Sapaan",
    levelLabel: "Beginner",
    description: "Greetings and daily expressions in Indonesian.",
    prereqTitles: [],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Sapaan Dasar",
        objectives: ["Greet by time of day", "Respond to 'apa kabar?'"],
        grammar: `Sapaan berdasarkan waktu:
Selamat pagi (morning, before ~11)
Selamat siang (midday, ~11–15)
Selamat sore (afternoon, ~15–18)
Selamat malam (evening/night)

Respon untuk "Apa kabar?":
Baik / Baik-baik saja (good / fine)
Luar biasa! (great/amazing)
Lumayan (not bad)`,
        reading: `Percakapan umum:
A: Selamat pagi! Apa kabar?
B: Baik, terima kasih. Dan kamu?
A: Luar biasa!

Terima kasih = thank you  |  Sama-sama = you're welcome
Permisi = excuse me  |  Maaf = sorry`,
        dialogue: [
          { speaker: "A", text: "Selamat pagi! Apa kabar?", translation: "Good morning! How are you?" },
          { speaker: "B", text: "Baik-baik saja, terima kasih. Dan kamu?", translation: "Fine, thanks. And you?" },
          { speaker: "A", text: "Luar biasa! Terima kasih.", translation: "Great! Thank you." },
        ],
        vocab: [
          { term: "selamat pagi", meaning: "good morning", example: "Selamat pagi, Bu Guru!" },
          { term: "selamat malam", meaning: "good evening / good night", example: "Selamat malam semua." },
          { term: "apa kabar?", meaning: "how are you?", example: "Halo! Apa kabar?" },
          { term: "terima kasih", meaning: "thank you", example: "Terima kasih banyak." },
          { term: "sama-sama", meaning: "you're welcome", example: "—Terima kasih! —Sama-sama." },
          { term: "maaf", meaning: "sorry", example: "Maaf, saya terlambat." },
        ],
        quiz: [
          q("'Good morning' in Indonesian is…", ["Selamat malam","Selamat siang","Selamat pagi","Selamat sore"], 2, "greetings"),
          qFill("Type the Indonesian for 'thank you':", ["terima kasih"], "vocab"),
          qMatch("Match the expression to its meaning:", [["Selamat pagi","Good morning"],["Terima kasih","Thank you"],["Maaf","Sorry"]], "vocab"),
          qReorder("Build the greeting:", ["Apa","Selamat","kabar?","pagi!"], [1,3,0,2], "greetings"),
        ],
      },
    ],
  },
  {
    title: "Angka & Waktu",
    levelLabel: "Beginner",
    description: "Numbers, telling time, and dates in Indonesian.",
    prereqTitles: ["Salam & Sapaan"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Angka 1–20",
        objectives: ["Count to 20 in Indonesian", "Use angka in context"],
        grammar: `satu(1)  dua(2)  tiga(3)  empat(4)  lima(5)
enam(6)  tujuh(7)  delapan(8)  sembilan(9)  sepuluh(10)
sebelas(11)  dua belas(12)  tiga belas(13)  empat belas(14)  lima belas(15)
enam belas(16)  tujuh belas(17)  delapan belas(18)  sembilan belas(19)  dua puluh(20)

Pola: belasan = 11–19 (add -belas)
       puluhan = 20–90 (add puluh)`,
        reading: `Contoh:
dua puluh tiga = 23  |  lima puluh = 50  |  seratus = 100
Harga: Berapa harganya? (How much does it cost?)
Ini dua puluh ribu rupiah. (This is 20,000 rupiah.)`,
        dialogue: [
          { speaker: "A", text: "Berapa umurmu?", translation: "How old are you?" },
          { speaker: "B", text: "Saya dua puluh satu tahun. Kamu?", translation: "I'm 21 years old. You?" },
          { speaker: "A", text: "Delapan belas tahun.", translation: "18 years old." },
        ],
        vocab: [
          { term: "satu", meaning: "one (1)", example: "Satu apel." },
          { term: "lima", meaning: "five (5)", example: "Lima orang." },
          { term: "sepuluh", meaning: "ten (10)", example: "Sepuluh menit." },
          { term: "dua puluh", meaning: "twenty (20)", example: "Dua puluh ribu." },
          { term: "berapa?", meaning: "how many / how much?", example: "Berapa harganya?" },
        ],
        quiz: [
          q("'tujuh' is…", ["5","6","7","8"], 2, "numbers"),
          q("'sepuluh' means…", ["7","8","9","10"], 3, "numbers"),
          q("How do you say 13?", ["satu belas","tiga belas","tiga puluh","tiga satu"], 1, "numbers"),
          q("'Berapa?' means…", ["who","what","how many/much","where"], 2, "question-words"),
        ],
      },
    ],
  },
  // ── Keluarga ───────────────────────────────────────────────────────────────
  {
    title: "Keluarga",
    levelLabel: "Beginner",
    description: "Anggota keluarga dan cara memperkenalkan keluarga.",
    prereqTitles: ["Angka & Waktu"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Anggota Keluarga",
        objectives: ["Menyebutkan anggota keluarga inti", "Memperkenalkan keluarga kepada orang lain"],
        grammar: `Menyebut anggota keluarga:
ayah (father)   ibu (mother)   kakak laki-laki (older brother)   kakak perempuan (older sister)
adik laki-laki (younger brother)   adik perempuan (younger sister)
kakek (grandfather)   nenek (grandmother)   paman (uncle)   bibi (aunt)

Memperkenalkan keluarga:
"Ini [nama], [ayah/ibu] saya." = This is [name], my [father/mother].
"Nama ayah saya [nama]." = My father's name is [name].
"Kami ada [angka] bersaudara." = There are [number] of us siblings.`,
        reading: `Keluarga saya kecil tapi bahagia.
Ayah saya bekerja sebagai insinyur. Ibu saya seorang guru.
Saya punya satu kakak perempuan dan satu adik laki-laki.
Kakek dan nenek tinggal bersama kami.
Kami suka makan malam bersama setiap hari.`,
        dialogue: [
          { speaker: "A", text: "Keluargamu tinggal di mana?", translation: "Where does your family live?" },
          { speaker: "B", text: "Kami tinggal di Bandung. Ada ayah, ibu, dan dua adik saya.", translation: "We live in Bandung. There's my father, mother, and two younger siblings." },
          { speaker: "A", text: "Pekerjaan ayahmu apa?", translation: "What is your father's job?" },
          { speaker: "B", text: "Ayah saya dokter. Ibu saya ibu rumah tangga.", translation: "My father is a doctor. My mother is a homemaker." },
        ],
        vocab: [
          { term: "ayah", meaning: "father", example: "Ayah saya bekerja di kantor." },
          { term: "ibu", meaning: "mother", example: "Ibu saya pandai memasak." },
          { term: "kakak", meaning: "older sibling", example: "Kakak saya sudah menikah." },
          { term: "adik", meaning: "younger sibling", example: "Adik saya masih sekolah." },
          { term: "kakek", meaning: "grandfather", example: "Kakek saya suka berkebun." },
          { term: "nenek", meaning: "grandmother", example: "Nenek sering bercerita." },
          { term: "bersaudara", meaning: "siblings (number of)", example: "Kami tiga bersaudara." },
        ],
        quiz: [
          q("'Kakak' berarti…", ["adik","kakek","kakak (lebih tua)","nenek"], 2, "family-id"),
          q("'Nenek' is…", ["grandfather","uncle","grandmother","aunt"], 2, "family-id"),
          q("'Ayah' means…", ["mother","father","older brother","grandfather"], 1, "family-id"),
          q("'Kami tiga bersaudara' means…", ["We have 3 children","There are 3 of us siblings","We are 3 friends","We have 3 cousins"], 1, "family-id"),
        ],
      },
    ],
  },
  // ── Makanan & Minuman ──────────────────────────────────────────────────────
  {
    title: "Makanan & Minuman",
    levelLabel: "Beginner",
    description: "Nama-nama makanan dan minuman populer Indonesia.",
    prereqTitles: ["Keluarga"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Makanan Sehari-hari",
        objectives: ["Menyebutkan makanan dan minuman umum", "Memesan makanan di warung/restoran"],
        grammar: `Memesan makanan:
Saya mau pesan... = I'd like to order...
Ada...? = Do you have...?
Satu porsi... = One serving of...
Mau minum apa? = What would you like to drink?
Berapa harganya? = How much is it?
Pedas atau tidak? = Spicy or not?`,
        reading: `Indonesia terkenal dengan makanannya yang lezat.
Nasi goreng adalah makanan favorit banyak orang.
Di warung, kamu bisa pesan: nasi goreng, mie goreng, soto, atau gado-gado.
Minuman populer: es teh, es jeruk, kopi, dan jus buah.
Jangan lupa bilang "pedas" atau "tidak pedas" saat memesan!`,
        dialogue: [
          { speaker: "Pelayan", text: "Selamat datang! Mau pesan apa?", translation: "Welcome! What would you like to order?" },
          { speaker: "Tamu", text: "Satu nasi goreng spesial dan satu es teh, terima kasih.", translation: "One special fried rice and one iced tea, thank you." },
          { speaker: "Pelayan", text: "Mau pedas?", translation: "Do you want it spicy?" },
          { speaker: "Tamu", text: "Sedang saja. Tidak terlalu pedas.", translation: "Medium please. Not too spicy." },
        ],
        vocab: [
          { term: "nasi goreng", meaning: "fried rice (iconic Indonesian dish)", example: "Nasi goreng paling enak di sini." },
          { term: "mie goreng", meaning: "fried noodles", example: "Mie goreng atau nasi goreng?" },
          { term: "soto", meaning: "Indonesian spiced broth soup", example: "Soto ayam sangat enak." },
          { term: "es teh", meaning: "iced tea", example: "Minta satu es teh manis." },
          { term: "pedas", meaning: "spicy", example: "Makanan ini pedas sekali!" },
          { term: "enak", meaning: "delicious / tasty", example: "Masakannya enak banget!" },
          { term: "makan siang", meaning: "lunch", example: "Kita makan siang di mana?" },
        ],
        quiz: [
          qFill("Tulis Bahasa Indonesia untuk 'delicious':", ["enak", "lezat"], "food-id"),
          qMatch("Cocokkan makanan dengan artinya:", [["nasi goreng","fried rice"],["mie goreng","fried noodles"],["soto","spiced soup"]], "food-id"),
          q("'Pedas' means…", ["sweet","spicy","sour","salty"], 1, "food-id"),
          qReorder("Susun kalimat pemesanan:", ["satu","nasi goreng","Saya","mau pesan","dan es teh"], [2,3,1,0,4], "ordering-id"),
        ],
      },
    ],
  },
  // ── Warna & Bentuk ─────────────────────────────────────────────────────────
  {
    title: "Warna & Bentuk",
    levelLabel: "Beginner",
    description: "Warna-warna dasar dan cara mendeskripsikan benda.",
    prereqTitles: ["Makanan & Minuman"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Warna Dasar",
        objectives: ["Menyebutkan 8 warna dasar dalam bahasa Indonesia", "Mendeskripsikan warna benda"],
        grammar: `Warna digunakan setelah kata benda:
baju merah (red shirt)   tas biru (blue bag)   mobil putih (white car)

Atau dengan kata 'berwarna':
Bajunya berwarna merah. (His shirt is red / of red color.)

Warna dasar:
merah (red)   biru (blue)   kuning (yellow)   hijau (green)
putih (white)   hitam (black)   jingga/oranye (orange)   ungu (purple)
coklat (brown)   abu-abu (grey)   merah muda/pink (pink)`,
        reading: `Warna di sekitar kita:
Langit berwarna biru. (The sky is blue.)
Rumput berwarna hijau. (Grass is green.)
Bendera Indonesia berwarna merah dan putih.
Warna favoritku adalah biru karena seperti warna laut.`,
        dialogue: [
          { speaker: "A", text: "Kamu suka warna apa?", translation: "What color do you like?" },
          { speaker: "B", text: "Saya suka warna hijau. Warna alam yang menenangkan.", translation: "I like green. It's a calming natural color." },
          { speaker: "A", text: "Baju yang kamu pakai hari ini warnanya cantik!", translation: "The color of the shirt you're wearing today is pretty!" },
          { speaker: "B", text: "Terima kasih! Ini warna biru muda.", translation: "Thank you! This is light blue." },
        ],
        vocab: [
          { term: "merah", meaning: "red", example: "Apel ini berwarna merah." },
          { term: "biru", meaning: "blue", example: "Langit biru cerah hari ini." },
          { term: "kuning", meaning: "yellow", example: "Pisang berwarna kuning." },
          { term: "hijau", meaning: "green", example: "Daun-daun berwarna hijau." },
          { term: "putih", meaning: "white", example: "Bendera Indonesia merah dan putih." },
          { term: "hitam", meaning: "black", example: "Kucing hitam lewat." },
          { term: "warna", meaning: "color", example: "Warna favoritmu apa?" },
        ],
        quiz: [
          qFill("Tulis warna 'red' dalam Bahasa Indonesia:", ["merah"], "colors-id"),
          qMatch("Cocokkan warna dengan artinya:", [["merah","red"],["biru","blue"],["hijau","green"],["kuning","yellow"]], "colors-id"),
          q("Bendera Indonesia berwarna…", ["merah dan biru","kuning dan hitam","merah dan putih","biru dan putih"], 2, "colors-id"),
          qReorder("Susun kalimat: 'I like green because it is calming':", ["karena","Saya suka","menenangkan","warna hijau"], [1,3,0,2], "colors-id"),
        ],
      },
    ],
  },
  // ── Transportasi ──────────────────────────────────────────────────────────
  {
    title: "Transportasi",
    levelLabel: "Beginner",
    description: "Kendaraan umum dan cara bertanya arah di Indonesia.",
    prereqTitles: ["Warna & Bentuk"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Kendaraan & Arah",
        objectives: ["Menyebutkan jenis kendaraan", "Bertanya dan memberikan arah"],
        grammar: `Jenis kendaraan:
bus, kereta api, taksi, ojek (motorcycle taxi), sepeda motor, pesawat, kapal

Bertanya arah:
Di mana...? = Where is...?
Bagaimana cara ke...? = How do I get to...?
Berapa jauh? = How far?

Petunjuk arah:
belok kanan (turn right)   belok kiri (turn left)   lurus (go straight)
di sebelah kanan (on the right)   di sebelah kiri (on the left)
dekat (near)   jauh (far)   lampu merah (traffic light)`,
        reading: `Jakarta punya banyak transportasi umum.
Ada Transjakarta (bus cepat), MRT, KRL, dan ojek online.
Untuk pergi ke mana-mana, kamu bisa pakai aplikasi di ponsel.
Kalau tersesat: "Permisi, stasiun MRT di mana ya?"
"Lurus terus, lalu belok kanan di lampu merah."`,
        dialogue: [
          { speaker: "A", text: "Permisi, bagaimana cara ke Stasiun Gambir?", translation: "Excuse me, how do I get to Gambir Station?" },
          { speaker: "B", text: "Naik bus nomor 12, turun di halte Gambir.", translation: "Take bus number 12, get off at the Gambir stop." },
          { speaker: "A", text: "Berapa lama perjalanannya?", translation: "How long is the journey?" },
          { speaker: "B", text: "Kira-kira 20 menit, tergantung macet.", translation: "About 20 minutes, depending on traffic." },
        ],
        vocab: [
          { term: "kereta api", meaning: "train", example: "Naik kereta api lebih cepat." },
          { term: "ojek", meaning: "motorcycle taxi", example: "Ojek online sangat populer di Indonesia." },
          { term: "belok kanan", meaning: "turn right", example: "Belok kanan di perempatan." },
          { term: "lurus", meaning: "straight ahead", example: "Jalan lurus saja sampai lampu merah." },
          { term: "dekat", meaning: "near / close", example: "Stasiunnya dekat dari sini." },
          { term: "macet", meaning: "traffic jam", example: "Jakarta sering macet." },
          { term: "halte", meaning: "bus stop", example: "Tunggu di halte bus." },
        ],
        quiz: [
          q("'Ojek' adalah…", ["car","bus","motorcycle taxi","bicycle"], 2, "transport-id"),
          q("'Belok kiri' means…", ["go straight","turn right","turn left","stop"], 2, "directions-id"),
          q("'Macet' artinya…", ["fast","traffic jam","bus stop","far"], 1, "vocab-id"),
          q("'Berapa jauh?' asks…", ["How long?","How much?","How far?","How many?"], 2, "directions-id"),
        ],
      },
    ],
  },
  // ── Pekerjaan ─────────────────────────────────────────────────────────────
  {
    title: "Pekerjaan",
    levelLabel: "Beginner",
    description: "Nama-nama pekerjaan dan cara bertanya tentang profesi.",
    prereqTitles: ["Transportasi"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Profesi & Tempat Kerja",
        objectives: ["Menyebutkan profesi umum", "Menanyakan dan menjelaskan pekerjaan seseorang"],
        grammar: `Menyebut pekerjaan:
Saya seorang [pekerjaan]. = I am a [job].
Saya bekerja sebagai [pekerjaan]. = I work as a [job].
Saya bekerja di [tempat]. = I work at [place].

Menanyakan pekerjaan:
Apa pekerjaanmu? / Kerja di mana? / Profesimu apa?
Sudah berapa lama bekerja di sini? = How long have you worked here?`,
        reading: `Indonesia punya banyak profesi penting:
Dokter dan perawat menjaga kesehatan kita.
Guru mendidik generasi masa depan.
Petani menghasilkan makanan untuk semua orang.
Polisi menjaga keamanan masyarakat.
Pengusaha menciptakan lapangan kerja.
Semua pekerjaan punya peran penting dalam masyarakat.`,
        dialogue: [
          { speaker: "A", text: "Apa pekerjaanmu sekarang?", translation: "What is your job now?" },
          { speaker: "B", text: "Saya seorang guru SD. Sudah 5 tahun mengajar.", translation: "I'm an elementary school teacher. I've been teaching for 5 years." },
          { speaker: "A", text: "Wah, keren! Kamu suka pekerjaanmu?", translation: "Wow, cool! Do you like your job?" },
          { speaker: "B", text: "Sangat suka! Melihat murid berkembang itu menyenangkan.", translation: "I love it! Watching students grow is fulfilling." },
        ],
        vocab: [
          { term: "dokter", meaning: "doctor", example: "Dokter itu sangat baik hati." },
          { term: "guru", meaning: "teacher", example: "Guru saya mengajar matematika." },
          { term: "polisi", meaning: "police officer", example: "Polisi membantu warga." },
          { term: "petani", meaning: "farmer", example: "Petani bekerja keras setiap hari." },
          { term: "pedagang", meaning: "merchant / trader", example: "Pedagang itu jual sayur." },
          { term: "seorang", meaning: "a (person); one person", example: "Dia seorang dokter." },
          { term: "bekerja", meaning: "to work", example: "Saya bekerja dari jam 8 pagi." },
        ],
        quiz: [
          q("'Guru' berarti…", ["doctor","teacher","police","farmer"], 1, "jobs-id"),
          q("'Saya seorang dokter' means…", ["I work with doctors","I am a doctor","I need a doctor","I like doctors"], 1, "jobs-id"),
          q("'Petani' adalah…", ["merchant","teacher","farmer","engineer"], 2, "jobs-id"),
          q("'Apa pekerjaanmu?' artinya…", ["Where do you work?","How long have you worked?","What is your job?","Do you like work?"], 2, "jobs-id"),
        ],
      },
    ],
  },
  // ── Kata Kerja Dasar ──────────────────────────────────────────────────────
  {
    title: "Kata Kerja Dasar",
    levelLabel: "Beginner",
    description: "Kata kerja paling sering digunakan dalam percakapan sehari-hari.",
    prereqTitles: ["Pekerjaan"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Verba Aktif & Me- Prefix",
        objectives: ["Menggunakan kata kerja dasar dengan benar", "Memahami awalan me- pada kata kerja"],
        grammar: `Kata kerja dasar Indonesia sering menggunakan awalan me-:
makan (eat)   minum (drink)   pergi (go)   datang (come)
beli / membeli (buy)   jual / menjual (sell)   baca / membaca (read)
tulis / menulis (write)   lihat / melihat (see)   dengar / mendengar (hear)
bicara / berbicara (speak)   tidur (sleep)   bangun (wake up)

Bentuk kalimat: Subjek + kata kerja + objek
"Saya makan nasi." (I eat rice.)
"Dia membaca buku." (She reads a book.)`,
        reading: `Aktivitas sehari-hari:
Saya bangun pukul 6 pagi. Kemudian mandi dan sarapan.
Saya pergi ke sekolah naik bus.
Di sekolah, saya belajar dan menulis di buku.
Pulang sekolah, saya makan siang dan tidur siang sebentar.
Malam hari, saya menonton TV bersama keluarga.`,
        dialogue: [
          { speaker: "A", text: "Kamu suka membaca buku?", translation: "Do you like reading books?" },
          { speaker: "B", text: "Suka sekali! Saya membaca setiap malam sebelum tidur.", translation: "I love it! I read every night before sleeping." },
          { speaker: "A", text: "Buku apa yang sedang kamu baca sekarang?", translation: "What book are you reading now?" },
          { speaker: "B", text: "Novel sejarah Indonesia. Sangat menarik!", translation: "An Indonesian historical novel. Very interesting!" },
        ],
        vocab: [
          { term: "makan", meaning: "to eat", example: "Mari makan bersama!" },
          { term: "minum", meaning: "to drink", example: "Jangan lupa minum air putih." },
          { term: "pergi", meaning: "to go", example: "Saya mau pergi ke pasar." },
          { term: "membeli", meaning: "to buy", example: "Ibu membeli sayur di pasar." },
          { term: "membaca", meaning: "to read", example: "Anak itu suka membaca." },
          { term: "menulis", meaning: "to write", example: "Guru menulis di papan tulis." },
          { term: "tidur", meaning: "to sleep", example: "Saya tidur pukul 10 malam." },
          { term: "bangun", meaning: "to wake up", example: "Bangun pagi itu menyehatkan." },
        ],
        quiz: [
          q("'Minum' artinya…", ["to eat","to sleep","to drink","to go"], 2, "verbs-id"),
          q("'Membaca' means…", ["to write","to speak","to read","to listen"], 2, "verbs-id"),
          q("'Saya pergi ke sekolah' means…", ["I study at school","I go to school","I like school","I leave school"], 1, "verbs-id"),
          q("Awalan 'me-' pada kata kerja berfungsi untuk…", ["negation","question","active verb form","past tense"], 2, "grammar-id"),
        ],
      },
    ],
  },
];

// ─── MANDARIN ─────────────────────────────────────────────────────────────────

const mandarinSkills: SkillSeed[] = [
  {
    title: "Pinyin & Tones",
    levelLabel: "HSK1",
    description: "Learn pinyin romanization, 4 tones, and basic greetings.",
    prereqTitles: [],
    autoCompleteLevel: "",
    modules: [
      {
        title: "The 4 Tones",
        objectives: ["Understand Mandarin's 4 tones", "Read tone marks over pinyin"],
        grammar: `Mandarin is tonal — the same syllable means different things depending on the tone:

1st tone (māo ─): high, flat — like singing one long note → mā = mother
2nd tone (máo ╱): rising — like asking "huh?" → má = hemp
3rd tone (mǎo ╲╱): falling then rising — like a hesitant "hmm" → mǎ = horse
4th tone (mào ╲): falling — like saying "no!" firmly → mà = to scold

Neutral tone: light, quick, no mark — de (的) in 我的 (my/mine)`,
        reading: `The famous example:
mā (妈) = mother  máo (麻) = hemp  mǎo (马) = horse  mà (骂) = to scold

Tones apply to all syllables. Getting them wrong changes the meaning!
Practice: say mā→má→mǎ→mà going up, up-down, down.`,
        dialogue: [
          { speaker: "A", text: "你好！(Nǐ hǎo!)", translation: "Hello!" },
          { speaker: "B", text: "你好！你叫什么名字？(Nǐ hǎo! Nǐ jiào shénme míngzi?)", translation: "Hello! What's your name?" },
          { speaker: "A", text: "我叫小明。(Wǒ jiào Xiǎomíng.)", translation: "My name is Xiaoming." },
        ],
        vocab: [
          { term: "你好", reading: "nǐ hǎo", meaning: "hello (lit. you good)", example: "你好！老师。(Hello, teacher!)" },
          { term: "谢谢", reading: "xièxie", meaning: "thank you", example: "谢谢你！(Thank you!)" },
          { term: "再见", reading: "zàijiàn", meaning: "goodbye (lit. see again)", example: "再见！(Goodbye!)" },
          { term: "对不起", reading: "duìbuqǐ", meaning: "sorry / I'm sorry", example: "对不起！(I'm sorry!)" },
          { term: "没关系", reading: "méiguānxi", meaning: "it doesn't matter / no problem", example: "没关系！(No problem!)" },
        ],
        quiz: [
          q("The 1st tone is…", ["falling","rising","flat/high","falling-rising"], 2, "tones"),
          qFill("Type the pinyin for 'hello' (你好):", ["ni hao", "nǐ hǎo"], "vocab"),
          qMatch("Match the tone to its description:", [["1st tone","high flat ─"],["2nd tone","rising ╱"],["3rd tone","falling-rising ╲╱"],["4th tone","falling ╲"]], "tones"),
          qReorder("Put in correct tone order (1st→2nd→3rd→4th):", ["mà","māo","mǎo","máo"], [1,3,2,0], "tones"),
        ],
      },
      {
        title: "Numbers 1–10 in Mandarin",
        objectives: ["Count 1–10 in Mandarin", "Use numbers in simple phrases"],
        grammar: `一(yī) 二(èr) 三(sān) 四(sì) 五(wǔ)
六(liù) 七(qī) 八(bā) 九(jiǔ) 十(shí)

Key notes:
• 一 (yī) changes tone depending on what follows:
  before 4th tone: yí (一个 yí gè = one (thing))
  before 1st/2nd/3rd tone: yì (一天 yì tiān = one day)
• 两 (liǎng) is used instead of 二 when counting objects: 两个苹果 = two apples`,
        reading: `Useful number phrases:
多少钱？(duōshao qián?) = How much money?
一百 (yī bǎi) = 100  |  一千 (yī qiān) = 1000
这个多少钱？(Zhège duōshao qián?) = How much is this?`,
        dialogue: [
          { speaker: "A", text: "这个多少钱？(Zhège duōshao qián?)", translation: "How much is this?" },
          { speaker: "B", text: "十块。(Shí kuài.)", translation: "Ten yuan." },
          { speaker: "A", text: "太贵了！(Tài guì le!)", translation: "Too expensive!" },
        ],
        vocab: [
          { term: "一", reading: "yī", meaning: "one (1)", example: "一个苹果。(One apple.)" },
          { term: "五", reading: "wǔ", meaning: "five (5)", example: "五点。(Five o'clock.)" },
          { term: "十", reading: "shí", meaning: "ten (10)", example: "十分钟。(Ten minutes.)" },
          { term: "多少", reading: "duōshao", meaning: "how many / how much", example: "多少钱？(How much?)" },
          { term: "贵", reading: "guì", meaning: "expensive", example: "太贵了！(Too expensive!)" },
        ],
        quiz: [
          q("'五' is pronounced…", ["sì","wǔ","liù","qī"], 1, "numbers"),
          q("'十' means…", ["five","seven","nine","ten"], 3, "numbers"),
          q("'多少钱？' means…", ["What is this?","How much?","Where is it?","Do you have it?"], 1, "shopping"),
          q("When counting 2 objects, use…", ["二","两","双","对"], 1, "numbers"),
        ],
      },
    ],
  },
  // ── Greetings & Self Introduction (问候) ──────────────────────────────────
  {
    title: "Greetings & Introductions (问候)",
    levelLabel: "HSK1",
    description: "Introduce yourself and greet people in Mandarin.",
    prereqTitles: ["Pinyin & Tones"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Self Introduction — 自我介绍",
        objectives: ["Introduce yourself in Mandarin", "Ask and answer basic personal questions"],
        grammar: `Key introduction phrases:
我叫... (Wǒ jiào...) = My name is... (lit. I'm called...)
我是... (Wǒ shì...) = I am...
我来自... (Wǒ láizì...) = I'm from...
我...岁 (Wǒ...suì) = I am...years old
我是学生/老师/工程师 = I am a student/teacher/engineer

Questions:
你叫什么名字？(Nǐ jiào shénme míngzi?) = What's your name?
你从哪里来？(Nǐ cóng nǎlǐ lái?) = Where are you from?
你多大了？(Nǐ duō dà le?) = How old are you?`,
        reading: `自我介绍示例:
你好！我叫李明。我是中国人，来自上海。
我今年二十岁，是大学生。
我在学英语和日语。很高兴认识你！

(Hello! My name is Li Ming. I am Chinese, from Shanghai.
I am 20 years old and a university student.
I am studying English and Japanese. Nice to meet you!)`,
        dialogue: [
          { speaker: "A", text: "你好！你叫什么名字？", translation: "Hello! What's your name?" },
          { speaker: "B", text: "你好！我叫王芳。你呢？", translation: "Hello! My name is Wang Fang. And you?" },
          { speaker: "A", text: "我叫大卫。我来自印度尼西亚。你来自哪里？", translation: "My name is David. I'm from Indonesia. Where are you from?" },
          { speaker: "B", text: "我来自北京。很高兴认识你！", translation: "I'm from Beijing. Nice to meet you!" },
        ],
        vocab: [
          { term: "我叫", reading: "wǒ jiào", meaning: "my name is (lit. I am called)", example: "我叫小明。(My name is Xiaoming.)" },
          { term: "我是", reading: "wǒ shì", meaning: "I am", example: "我是学生。(I am a student.)" },
          { term: "来自", reading: "láizì", meaning: "come from / from", example: "我来自印度尼西亚。(I'm from Indonesia.)" },
          { term: "高兴认识你", reading: "gāoxìng rènshi nǐ", meaning: "nice to meet you", example: "很高兴认识你！" },
          { term: "学生", reading: "xuésheng", meaning: "student", example: "我是大学生。(I'm a university student.)" },
          { term: "老师", reading: "lǎoshī", meaning: "teacher", example: "她是我的老师。(She is my teacher.)" },
          { term: "你呢？", reading: "nǐ ne?", meaning: "And you? / What about you?", example: "我很好，你呢？(I'm good, and you?)" },
        ],
        quiz: [
          qFill("Write the pinyin for 你好:", ["ni hao", "nǐ hǎo"], "vocab-zh"),
          qMatch("Match Chinese to English:", [["你好","hello"],["谢谢","thank you"],["再见","goodbye"],["学生","student"]], "vocab-zh"),
          qReorder("Build '我叫小明' (My name is Xiaoming):", ["小明","我","叫"], [1,2,0], "intro-zh"),
          q("'很高兴认识你' means…", ["How are you?","See you later","Nice to meet you","Good morning"], 2, "vocab-zh"),
        ],
      },
    ],
  },
  // ── Family (家人) ──────────────────────────────────────────────────────────
  {
    title: "Family (家人)",
    levelLabel: "HSK1",
    description: "Family members and talking about your family in Mandarin.",
    prereqTitles: ["Greetings & Introductions (问候)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Family Members — 家庭成员",
        objectives: ["Name family members in Mandarin", "Talk about your family"],
        grammar: `Family vocabulary:
爸爸(bàba) = dad   妈妈(māma) = mom   哥哥(gēge) = older brother   姐姐(jiějie) = older sister
弟弟(dìdi) = younger brother   妹妹(mèimei) = younger sister
爷爷(yéye) = paternal grandfather   奶奶(nǎinai) = paternal grandmother
儿子(érzi) = son   女儿(nǚ'ér) = daughter

Structure:
我有一个哥哥。(Wǒ yǒu yī gè gēge.) = I have an older brother.
我没有姐姐。(Wǒ méiyǒu jiějie.) = I don't have an older sister.
我的爸爸是医生。(Wǒ de bàba shì yīshēng.) = My father is a doctor.`,
        reading: `我的家:
我家有四口人：爸爸、妈妈、弟弟和我。
爸爸是工程师，妈妈是护士。
弟弟今年十五岁，在上中学。
我们一家人很幸福。

(My family: There are four people in my family: dad, mom, younger brother, and me.
Dad is an engineer, mom is a nurse. My brother is 15 and in middle school. Our family is very happy.)`,
        dialogue: [
          { speaker: "A", text: "你家有几口人？", translation: "How many people are in your family?" },
          { speaker: "B", text: "我家有三口人：爸爸、妈妈和我。你呢？", translation: "There are three in my family: dad, mom and me. And you?" },
          { speaker: "A", text: "我家有五口人。我有一个哥哥和一个妹妹。", translation: "There are five in mine. I have an older brother and a younger sister." },
          { speaker: "B", text: "哥哥做什么工作？", translation: "What does your older brother do for work?" },
        ],
        vocab: [
          { term: "爸爸", reading: "bàba", meaning: "dad / father", example: "爸爸很高大。(Dad is tall.)" },
          { term: "妈妈", reading: "māma", meaning: "mom / mother", example: "妈妈做饭很好吃。(Mom cooks deliciously.)" },
          { term: "哥哥", reading: "gēge", meaning: "older brother", example: "哥哥在上大学。(Older brother is in university.)" },
          { term: "姐姐", reading: "jiějie", meaning: "older sister", example: "姐姐已经结婚了。(Older sister is already married.)" },
          { term: "我有", reading: "wǒ yǒu", meaning: "I have", example: "我有两个妹妹。(I have two younger sisters.)" },
          { term: "口", reading: "kǒu", meaning: "measure word for family members", example: "我家有四口人。(There are 4 people in my family.)" },
        ],
        quiz: [
          q("'弟弟' means…", ["older brother","younger sister","younger brother","older sister"], 2, "family-zh"),
          q("'我家有三口人' means…", ["I have 3 siblings","There are 3 people in my family","I am 3 years old","My family has 3 rooms"], 1, "family-zh"),
          q("'妈妈' is…", ["dad","grandmother","mom","aunt"], 2, "family-zh"),
          q("'我有一个哥哥' means…", ["I want an older brother","I have an older brother","My older brother is one","I know one older brother"], 1, "family-zh"),
        ],
      },
    ],
  },
  // ── Food & Drink (食物饮料) ────────────────────────────────────────────────
  {
    title: "Food & Drink (食物)",
    levelLabel: "HSK1",
    description: "Order food, express preferences, and talk about Chinese cuisine.",
    prereqTitles: ["Family (家人)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Food Vocabulary — 食物",
        objectives: ["Name common foods and drinks in Mandarin", "Order food and say what you like"],
        grammar: `Food expressions:
我想吃... (Wǒ xiǎng chī...) = I want to eat...
我喜欢吃... (Wǒ xǐhuān chī...) = I like to eat...
这个好吃吗？(Zhège hǎochī ma?) = Is this delicious?
好吃！(Hǎochī!) = Delicious!   不好吃 (bù hǎochī) = Not good / tastes bad

Measure words:
一碗饭 (yī wǎn fàn) = one bowl of rice
一杯茶 (yī bēi chá) = one cup of tea
一瓶水 (yī píng shuǐ) = one bottle of water`,
        reading: `中国美食:
中国有很多好吃的食物。
我最喜欢吃饺子和面条。
在餐厅，我通常点米饭和炒菜。
喝茶是中国的传统文化。
(Chinese cuisine: China has a lot of delicious food.
I love dumplings and noodles the most. At restaurants I usually order rice and stir-fried dishes.
Drinking tea is Chinese traditional culture.)`,
        dialogue: [
          { speaker: "A", text: "你喜欢吃什么中国菜？", translation: "What Chinese food do you like?" },
          { speaker: "B", text: "我最喜欢吃饺子！你呢？", translation: "I love dumplings the most! And you?" },
          { speaker: "A", text: "我喜欢吃米饭和炒菜。你喝什么？", translation: "I like rice and stir-fry. What are you drinking?" },
          { speaker: "B", text: "绿茶。好喝！你要来一杯吗？", translation: "Green tea. It's great! Would you like a cup?" },
        ],
        vocab: [
          { term: "米饭", reading: "mǐfàn", meaning: "cooked rice", example: "我要一碗米饭。(I want a bowl of rice.)" },
          { term: "面条", reading: "miàntiáo", meaning: "noodles", example: "面条好吃极了！(The noodles are so delicious!)" },
          { term: "饺子", reading: "jiǎozi", meaning: "dumplings", example: "我妈妈包的饺子最好吃。(My mom's dumplings are the best.)" },
          { term: "茶", reading: "chá", meaning: "tea", example: "一杯绿茶，谢谢。(One green tea, please.)" },
          { term: "好吃", reading: "hǎochī", meaning: "delicious (food)", example: "这个好吃！(This is delicious!)" },
          { term: "我想", reading: "wǒ xiǎng", meaning: "I want to / I'd like to", example: "我想吃火锅。(I want to eat hot pot.)" },
        ],
        quiz: [
          q("'好吃' means…", ["expensive","spicy","delicious","hot"], 2, "food-zh"),
          q("'米饭' is…", ["noodles","dumplings","cooked rice","bread"], 2, "food-zh"),
          q("'我想吃饺子' means…", ["I made dumplings","I want to eat dumplings","I like dumplings","I don't like dumplings"], 1, "food-zh"),
          q("'一杯茶' means…", ["a bottle of tea","a bowl of tea","a cup of tea","a plate of tea"], 2, "food-zh"),
        ],
      },
    ],
  },
  // ── Colors (颜色) ──────────────────────────────────────────────────────────
  {
    title: "Colors (颜色)",
    levelLabel: "HSK1",
    description: "Color vocabulary and describing objects in Mandarin.",
    prereqTitles: ["Food & Drink (食物)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Basic Colors — 颜色",
        objectives: ["Name 8 colors in Mandarin", "Describe objects using colors"],
        grammar: `Colors in Mandarin use 色(sè) = color:
红色(hóngsè) = red   蓝色(lánsè) = blue   黄色(huángsè) = yellow   绿色(lǜsè) = green
白色(báisè) = white   黑色(hēisè) = black   橙色(chéngsè) = orange   紫色(zǐsè) = purple

In conversation, 色 is often dropped: 红的(hóng de) = the red one
Using colors to describe:
红色的苹果 = red apple   蓝色的天空 = blue sky
什么颜色？(shénme yánsè?) = What color?`,
        reading: `颜色在生活中:
天空是蓝色的。(The sky is blue.)
草是绿色的。(Grass is green.)
太阳是黄色的。(The sun is yellow.)
中国国旗是红色和黄色的。(China's flag is red and yellow.)
我最喜欢的颜色是蓝色。(My favorite color is blue.)`,
        dialogue: [
          { speaker: "A", text: "你最喜欢什么颜色？", translation: "What is your favorite color?" },
          { speaker: "B", text: "我喜欢绿色，像森林一样。你呢？", translation: "I like green, like a forest. And you?" },
          { speaker: "A", text: "我喜欢红色。红色很漂亮！", translation: "I like red. Red is very beautiful!" },
          { speaker: "B", text: "你的包是什么颜色的？", translation: "What color is your bag?" },
        ],
        vocab: [
          { term: "红色", reading: "hóngsè", meaning: "red", example: "红色的玫瑰。(Red roses.)" },
          { term: "蓝色", reading: "lánsè", meaning: "blue", example: "蓝色的天空。(Blue sky.)" },
          { term: "黄色", reading: "huángsè", meaning: "yellow", example: "黄色的香蕉。(Yellow banana.)" },
          { term: "绿色", reading: "lǜsè", meaning: "green", example: "绿色的树。(Green trees.)" },
          { term: "白色", reading: "báisè", meaning: "white", example: "白色的雪。(White snow.)" },
          { term: "黑色", reading: "hēisè", meaning: "black", example: "黑色的猫。(Black cat.)" },
          { term: "颜色", reading: "yánsè", meaning: "color", example: "你喜欢什么颜色？(What color do you like?)" },
        ],
        quiz: [
          q("'红色' is…", ["blue","green","yellow","red"], 3, "colors-zh"),
          q("'绿色' means…", ["blue","green","yellow","white"], 1, "colors-zh"),
          q("'什么颜色？' asks…", ["What time?","What color?","How much?","How many?"], 1, "colors-zh"),
          q("China's flag colors are…", ["红色和蓝色","红色和黄色","黄色和白色","红色和白色"], 1, "colors-zh"),
        ],
      },
    ],
  },
  // ── Time & Date (时间) ──────────────────────────────────────────────────────
  {
    title: "Time & Date (时间)",
    levelLabel: "HSK1",
    description: "Tell the time, days of the week, and dates in Mandarin.",
    prereqTitles: ["Colors (颜色)"],
    autoCompleteLevel: "",
    modules: [
      {
        title: "Telling Time & Days — 时间和星期",
        objectives: ["Tell the time in Mandarin", "Name days of the week and use date expressions"],
        grammar: `Telling time:
现在几点？(Xiànzài jǐ diǎn?) = What time is it now?
现在三点。(Xiànzài sān diǎn.) = It's 3 o'clock.
三点半 (sān diǎn bàn) = 3:30   三点一刻 (sān diǎn yī kè) = 3:15

Days of the week: 星期 (xīngqī) + number
星期一(Mon) 星期二(Tue) 星期三(Wed) 星期四(Thu) 星期五(Fri) 星期六(Sat) 星期天/日(Sun)

Time expressions:
今天(jīntiān) = today   明天(míngtiān) = tomorrow   昨天(zuótiān) = yesterday
上午(shàngwǔ) = morning   下午(xiàwǔ) = afternoon   晚上(wǎnshang) = evening`,
        reading: `我的一天:
我每天早上七点起床。(I wake up at 7 every morning.)
上午九点去上课。(I go to class at 9am.)
下午三点放学。(School ends at 3pm.)
晚上八点做作业。(I do homework at 8pm.)
星期六和星期天不用上学。(No school on Saturday and Sunday.)`,
        dialogue: [
          { speaker: "A", text: "现在几点？", translation: "What time is it now?" },
          { speaker: "B", text: "现在两点半。你有课吗？", translation: "It's 2:30. Do you have class?" },
          { speaker: "A", text: "有，三点开始。今天是星期几？", translation: "Yes, it starts at 3. What day is today?" },
          { speaker: "B", text: "今天是星期四。明天星期五，快到周末了！", translation: "Today is Thursday. Tomorrow is Friday, almost the weekend!" },
        ],
        vocab: [
          { term: "现在", reading: "xiànzài", meaning: "now / currently", example: "现在几点？(What time is it now?)" },
          { term: "几点", reading: "jǐ diǎn", meaning: "what time / how many o'clock", example: "你几点睡觉？(What time do you sleep?)" },
          { term: "今天", reading: "jīntiān", meaning: "today", example: "今天天气很好。(The weather is great today.)" },
          { term: "明天", reading: "míngtiān", meaning: "tomorrow", example: "明天见！(See you tomorrow!)" },
          { term: "昨天", reading: "zuótiān", meaning: "yesterday", example: "昨天我去了图书馆。(Yesterday I went to the library.)" },
          { term: "星期", reading: "xīngqī", meaning: "week / day of week", example: "这个星期你有空吗？(Are you free this week?)" },
          { term: "周末", reading: "zhōumò", meaning: "weekend", example: "周末你做什么？(What do you do on weekends?)" },
        ],
        quiz: [
          q("'现在几点？' means…", ["What day is it?","What time is it?","What is today?","When are you free?"], 1, "time-zh"),
          q("'三点半' is…", ["3:00","3:15","3:30","3:45"], 2, "time-zh"),
          q("'明天' means…", ["yesterday","today","tomorrow","next week"], 2, "time-zh"),
          q("Saturday in Chinese is…", ["星期五","星期六","星期天","星期四"], 1, "days-zh"),
        ],
      },
    ],
  },
];

// ─── Achievements ──────────────────────────────────────────────────────────────

const achievements = [
  { code: "first_lesson", title: "First Lesson Completed", description: "Complete your first module.", icon: "sprout", criteria: { type: "modules_completed", value: 1 } },
  { code: "streak_7", title: "7-Day Streak", description: "Keep a 7-day learning streak.", icon: "flame", criteria: { type: "streak", value: 7 } },
  { code: "streak_30", title: "30-Day Streak", description: "Keep a 30-day learning streak.", icon: "flame", criteria: { type: "streak", value: 30 } },
  { code: "flashcards_50", title: "50 Flashcards Reviewed", description: "Review 50 flashcards.", icon: "cards", criteria: { type: "flashcards_reviewed", value: 50 } },
  { code: "flashcards_100", title: "100 Flashcards Reviewed", description: "Review 100 flashcards.", icon: "cards", criteria: { type: "flashcards_reviewed", value: 100 } },
  { code: "xp_500", title: "500 XP Earned", description: "Earn a total of 500 XP.", icon: "star", criteria: { type: "total_xp", value: 500 } },
  { code: "xp_1000", title: "1000 XP Earned", description: "Earn a total of 1000 XP.", icon: "star", criteria: { type: "total_xp", value: 1000 } },
  { code: "modules_10", title: "Dedicated Learner", description: "Complete 10 modules.", icon: "trophy", criteria: { type: "modules_completed", value: 10 } },
  { code: "conversation_master", title: "Conversation Master", description: "Complete 5 AI conversations.", icon: "chat", criteria: { type: "conversations_completed", value: 5 } },
  { code: "hiragana_complete", title: "Hiragana Master", description: "Complete all Hiragana modules.", icon: "star", criteria: { type: "modules_completed", value: 11 } },
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
            grammar: m.grammar,
            reading: m.reading,
            dialogue: JSON.stringify(m.dialogue),
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
