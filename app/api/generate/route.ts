import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildRagebaitPrompt } from "../../../lib/prompts";
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

function isValidRagebaitPost(input: unknown): input is RagebaitPost {
  if (!input || typeof input !== "object") return false;
  const data = input as Record<string, unknown>;

  return (
    typeof data.authorName === "string" &&
    typeof data.authorTitle === "string" &&
    typeof data.headline === "string" &&
    typeof data.body === "string" &&
    Array.isArray(data.hashtags) &&
    data.hashtags.every((item) => typeof item === "string") &&
    typeof data.reactionCount === "number" &&
    typeof data.commentCount === "number" &&
    typeof data.repostCount === "number" &&
    typeof data.imagePrompt === "string"
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

    if (!isValidSettings(settings)) {
      return NextResponse.json(
        { error: "Invalid generator settings." },
        { status: 400 },
      );
    }

    const quota = await consumeDailyQueryQuota(request, "generate");
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

    const prompt = buildRagebaitPrompt(settings);
    const response = await openai.responses.create({
      model: textModel,
      input: prompt,
      temperature: 1,
    });

    const text = response.output_text?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "Model returned empty output." },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Model returned non-JSON output." },
        { status: 502 },
      );
    }

    if (!isValidRagebaitPost(parsed)) {
      return NextResponse.json(
        { error: "Model returned invalid JSON shape." },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate ragebait post." },
      { status: 500 },
    );
  }
}
