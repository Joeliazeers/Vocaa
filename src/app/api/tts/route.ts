import { NextResponse } from "next/server";

// Google Translate TTS - free, no API key, supports all Vocaa languages.
// BCP-47 locale codes for each language
const LANG_LOCALE: Record<string, string> = {
  ja: "ja",
  zh: "zh-CN",
  id: "id",
  en: "en",
};

export async function POST(req: Request) {
  try {
    const { text, langCode } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const tl = LANG_LOCALE[langCode as string] ?? "en";
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${tl}&client=tw-ob`;

    const response = await fetch(url, {
      headers: {
        // Google Translate requires a browser-like User-Agent
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      console.error("Google TTS Error:", response.status, response.statusText);
      return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        // Cache aggressively - same text+lang always produces the same audio
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
