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
const MAX_IMAGE_PROMPT_LENGTH = 320;

const imagePromptResponseFormat: NonNullable<ResponseTextConfig["format"]> = {
  type: "json_schema",
  name: "ragebait_image_prompt",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["imagePrompt"],
    properties: {
      imagePrompt: {
        type: "string",
        minLength: 1,
        maxLength: MAX_IMAGE_PROMPT_LENGTH,
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
    typeof post.authorName === "string" &&
    typeof post.authorTitle === "string" &&
    typeof post.headline === "string" &&
    typeof post.body === "string"
  );
}

function normalizeImagePrompt(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const prompt = value.replace(/\r\n?/g, " ").replace(/\s+/g, " ").trim();
  if (!prompt) return null;

  return prompt.slice(0, MAX_IMAGE_PROMPT_LENGTH).trim();
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

    const quota = await consumeDailyQueryQuota(request, "regenerate-image-prompt");
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
Create one short visual prompt for a fictional satirical LinkedIn post.
Use retro pixel-art style. No real people, no real brands, no real organizations.
The prompt should be vivid but concise and should not mention a real company or person.
Return only valid JSON matching the requested schema.
      `.trim(),
      input: `
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
      `.trim(),
      text: {
        format: imagePromptResponseFormat,
        verbosity: "medium",
      },
      temperature: 1,
      max_output_tokens: 120,
    });

    const parsed = parseStructuredJson(response.output_text);
    const imagePrompt = normalizeImagePrompt(
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>).imagePrompt
        : null,
    );
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
