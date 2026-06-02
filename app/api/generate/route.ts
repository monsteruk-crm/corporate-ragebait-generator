import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { ResponseTextConfig } from "openai/resources/responses/responses";
import { buildRagebaitPrompt } from "../../../lib/prompts";
import { consumeDailyQueryQuota } from "../../../lib/rate-limit";
import type { RagebaitPost, RagebaitSettings } from "../../../lib/types";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";
const MAX_POST_TEXT_LENGTH = 2400;
const MAX_HEADLINE_LENGTH = 130;
const MAX_NAME_LENGTH = 80;
const MAX_TITLE_LENGTH = 140;
const MAX_IMAGE_PROMPT_LENGTH = 320;
const MAX_HASHTAG_LENGTH = 32;
const MAX_COUNTER_VALUE = 9_999_999;

const ragebaitResponseFormat: NonNullable<ResponseTextConfig["format"]> = {
  type: "json_schema",
  name: "ragebait_post",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "authorName",
      "authorTitle",
      "headline",
      "body",
      "hashtags",
      "reactionCount",
      "commentCount",
      "repostCount",
      "imagePrompt",
    ],
    properties: {
      authorName: {
        type: "string",
        minLength: 1,
        maxLength: MAX_NAME_LENGTH,
      },
      authorTitle: {
        type: "string",
        minLength: 1,
        maxLength: MAX_TITLE_LENGTH,
      },
      headline: {
        type: "string",
        minLength: 1,
        maxLength: MAX_HEADLINE_LENGTH,
      },
      body: {
        type: "string",
        minLength: 1,
        maxLength: MAX_POST_TEXT_LENGTH,
      },
      hashtags: {
        type: "array",
        minItems: 4,
        maxItems: 9,
        items: {
          type: "string",
          minLength: 2,
          maxLength: MAX_HASHTAG_LENGTH,
        },
      },
      reactionCount: {
        type: "integer",
        minimum: 0,
        maximum: MAX_COUNTER_VALUE,
      },
      commentCount: {
        type: "integer",
        minimum: 0,
        maximum: MAX_COUNTER_VALUE,
      },
      repostCount: {
        type: "integer",
        minimum: 0,
        maximum: MAX_COUNTER_VALUE,
      },
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

function parseStructuredJson(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall through to a looser extraction pass for unexpected wrapper text.
  }

  const startIndex = trimmed.indexOf("{");
  const endIndex = trimmed.lastIndexOf("}");
  if (startIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  try {
    return JSON.parse(trimmed.slice(startIndex, endIndex + 1));
  } catch {
    return null;
  }
}

function normalizeSingleLineText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.replace(/\r\n?/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  return normalized.slice(0, maxLength).trim();
}

function normalizeHeadline(value: unknown): string | null {
  const headline = normalizeSingleLineText(value, MAX_HEADLINE_LENGTH);
  if (!headline) return null;

  return headline.toUpperCase();
}

function normalizeBody(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const lines = value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const normalized = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) return null;

  return normalized.slice(0, MAX_POST_TEXT_LENGTH).trim();
}

function normalizeHashtag(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const compact = value.replace(/\s+/g, "").trim();
  if (!compact) return null;

  const withoutPrefix = compact.replace(/^#+/, "");
  const cleaned = withoutPrefix.replace(/[^A-Za-z0-9_-]/g, "");
  if (!cleaned) return null;

  return `#${cleaned}`.slice(0, MAX_HASHTAG_LENGTH);
}

function normalizeHashtags(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const hashtags: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    const normalized = normalizeHashtag(item);
    if (!normalized) continue;

    const dedupeKey = normalized.toLowerCase();
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    hashtags.push(normalized);

    if (hashtags.length === 9) break;
  }

  if (hashtags.length < 4) return null;

  return hashtags;
}

function normalizeCount(value: unknown): number | null {
  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  if (!Number.isFinite(numeric)) return null;

  return Math.min(MAX_COUNTER_VALUE, Math.max(0, Math.trunc(numeric)));
}

function normalizeRagebaitPost(input: unknown): RagebaitPost | null {
  if (!input || typeof input !== "object") return null;

  const data = input as Record<string, unknown>;
  const authorName = normalizeSingleLineText(data.authorName, MAX_NAME_LENGTH);
  const authorTitle = normalizeSingleLineText(data.authorTitle, MAX_TITLE_LENGTH);
  const headline = normalizeHeadline(data.headline);
  const body = normalizeBody(data.body);
  const hashtags = normalizeHashtags(data.hashtags);
  const reactionCount = normalizeCount(data.reactionCount);
  const commentCount = normalizeCount(data.commentCount);
  const repostCount = normalizeCount(data.repostCount);
  const imagePrompt = normalizeSingleLineText(data.imagePrompt, MAX_IMAGE_PROMPT_LENGTH);

  if (
    !authorName ||
    !authorTitle ||
    !headline ||
    !body ||
    !hashtags ||
    reactionCount === null ||
    commentCount === null ||
    repostCount === null ||
    !imagePrompt
  ) {
    return null;
  }

  return {
    authorName,
    authorTitle,
    headline,
    body,
    hashtags,
    reactionCount,
    commentCount,
    repostCount,
    imagePrompt,
  };
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

    const response = await openai.responses.create({
      model: textModel,
      instructions: buildRagebaitPrompt(settings),
      input: "Generate one complete satirical LinkedIn post.",
      text: {
        format: ragebaitResponseFormat,
        verbosity: "medium",
      },
      temperature: 1.1,
      max_output_tokens: 900,
    });

    const parsed = parseStructuredJson(response.output_text);
    const post = normalizeRagebaitPost(parsed);

    if (!post) {
      return NextResponse.json(
        { error: "AI generation failed. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { error: "AI generation failed. Please check OPENAI_API_KEY or try again." },
      { status: 500 },
    );
  }
}
