import OpenAI from "openai";
import { NextResponse } from "next/server";
import { consumeDailyQueryQuota } from "../../../lib/rate-limit";
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
  return typeof post.body === "string" && typeof post.authorTitle === "string";
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

    const quota = await consumeDailyQueryQuota(request, "regenerate-headline");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Daily query limit reached for this IP.",
          remaining: quota.remaining,
          resetAt: quota.resetAt.toISOString(),
        },
        { status: 429 },
      );
    }

    const prompt = `
Generate one SATIRICAL all-caps LinkedIn ragebait headline.
Fictional only. No real people or real companies.
Return plain text only.

Context:
Author role: ${post.authorTitle}
Body: ${post.body}
absurdity=${settings.absurdity}
corporateCringe=${settings.corporateCringe}
aiPanic=${settings.aiPanic}
founderEgo=${settings.founderEgo}
humorLevel=${settings.humorLevel}
dystopiaLevel=${settings.dystopiaLevel}
    `.trim();

    const response = await openai.responses.create({
      model: textModel,
      input: prompt,
      temperature: 1,
    });

    const headline = response.output_text?.trim();
    if (!headline) {
      return NextResponse.json(
        { error: "Model returned empty headline." },
        { status: 502 },
      );
    }

    return NextResponse.json({ headline });
  } catch {
    return NextResponse.json(
      { error: "Failed to regenerate headline." },
      { status: 500 },
    );
  }
}
