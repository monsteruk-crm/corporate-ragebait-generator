import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { ResponseTextConfig } from "openai/resources/responses/responses";
import { consumeDailyQueryQuota } from "../../../lib/rate-limit";
import type { RagebaitPost, RagebaitSettings } from "../../../lib/types";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";
const MAX_HEADLINE_LENGTH = 130;

const headlineResponseFormat: NonNullable<ResponseTextConfig["format"]> = {
  type: "json_schema",
  name: "ragebait_headline",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["headline"],
    properties: {
      headline: {
        type: "string",
        minLength: 1,
        maxLength: MAX_HEADLINE_LENGTH,
      },
    },
  },
};

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
    typeof post.body === "string" &&
    typeof post.authorTitle === "string" &&
    typeof post.headline === "string"
  );
}

function normalizeHeadline(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const headline = value.replace(/\r\n?/g, " ").replace(/\s+/g, " ").trim();
  if (!headline) return null;

  return headline.slice(0, MAX_HEADLINE_LENGTH).toUpperCase();
}

function parseStructuredJson(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
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

    const response = await openai.responses.create({
      model: textModel,
      instructions: `
Generate one completely fictional, satirical LinkedIn headline.
It must be ALL CAPS, dramatic, and under 130 characters.
No real people, no real companies, no factual claims about real organizations.
Return only valid JSON matching the requested schema.
      `.trim(),
      input: `
Context:
Author role: ${post.authorTitle}
Body: ${post.body}
absurdity=${settings.absurdity}
corporateCringe=${settings.corporateCringe}
aiPanic=${settings.aiPanic}
founderEgo=${settings.founderEgo}
humorLevel=${settings.humorLevel}
dystopiaLevel=${settings.dystopiaLevel}
      `.trim(),
      text: {
        format: headlineResponseFormat,
        verbosity: "medium",
      },
      temperature: 1.1,
      max_output_tokens: 120,
    });

    const parsed = parseStructuredJson(response.output_text);
    const headline = normalizeHeadline(
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>).headline
        : null,
    );
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
