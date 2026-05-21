import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { RagebaitPost, RagebaitSettings } from "../../../lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";

function isValidSettings(input: unknown): input is RagebaitSettings {
  if (!input || typeof input !== "object") return false;
  const keys: Array<keyof RagebaitSettings> = [
    "absurdity",
    "corporateCringe",
    "aiPanic",
    "founderEgo",
    "humorLevel",
    "dystopiaLevel",
    "emojiDensity",
    "hashtagChaos",
  ];
  return keys.every((key) => {
    const value = (input as Record<string, unknown>)[key];
    return typeof value === "number" && Number.isFinite(value);
  });
}

function isValidPostInput(input: unknown): input is RagebaitPost {
  if (!input || typeof input !== "object") return false;
  const post = input as Record<string, unknown>;
  return (
    typeof post.authorName === "string" &&
    typeof post.authorTitle === "string" &&
    typeof post.headline === "string" &&
    typeof post.body === "string"
  );
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const settings = body?.settings;
    const post = body?.post;

    if (!isValidSettings(settings) || !isValidPostInput(post)) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const prompt = `
Create one image generation prompt for a satirical parody LinkedIn post.
Use retro pixel-art style and fictional elements only.
No real people and no real company names.
Return plain text only. No markdown.

Post context:
Headline: ${post.headline}
Body: ${post.body}
Author role: ${post.authorTitle}

Intensity sliders:
absurdity=${settings.absurdity}
corporateCringe=${settings.corporateCringe}
aiPanic=${settings.aiPanic}
founderEgo=${settings.founderEgo}
humorLevel=${settings.humorLevel}
dystopiaLevel=${settings.dystopiaLevel}
emojiDensity=${settings.emojiDensity}
hashtagChaos=${settings.hashtagChaos}
    `.trim();

    const response = await openai.responses.create({
      model: textModel,
      input: prompt,
      temperature: 1,
    });

    const imagePrompt = response.output_text?.trim();
    if (!imagePrompt) {
      return NextResponse.json(
        { error: "Model returned empty prompt." },
        { status: 502 },
      );
    }

    return NextResponse.json({ imagePrompt });
  } catch {
    return NextResponse.json(
      { error: "Failed to regenerate image prompt." },
      { status: 500 },
    );
  }
}
