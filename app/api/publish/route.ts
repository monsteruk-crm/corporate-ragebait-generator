import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { buildShareText, getPublicPostUrl } from "../../../lib/published-post";
import type { RagebaitPost, RagebaitSettings } from "../../../lib/types";

function isValidSettings(input: unknown): input is RagebaitSettings {
  if (!input || typeof input !== "object") return false;

  const keys: Array<keyof RagebaitSettings> = [
    "headlineLength",
    "bodyLength",
    "hashtagCount",
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
  try {
    const body = await request.json();
    const post = body?.post;
    const settings = body?.settings;
    const imageUrl =
      typeof body?.imageUrl === "string" && body.imageUrl.trim().length > 0
        ? body.imageUrl.trim()
        : null;

    if (!isValidRagebaitPost(post) || !isValidSettings(settings)) {
      return NextResponse.json({ error: "Invalid publish payload." }, { status: 400 });
    }

    const shareText = buildShareText(post);
    const published = await prisma.publishedPost.create({
      data: {
        authorName: post.authorName,
        authorTitle: post.authorTitle,
        headline: post.headline,
        body: post.body,
        hashtags: post.hashtags,
        reactionCount: post.reactionCount,
        commentCount: post.commentCount,
        repostCount: post.repostCount,
        imagePrompt: post.imagePrompt,
        shareText,
        supportImageDataUrl: imageUrl,
        settings,
      },
    });

    return NextResponse.json({
      id: published.id,
      url: getPublicPostUrl(request.url, published.id),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to publish shareable post." },
      { status: 500 },
    );
  }
}
