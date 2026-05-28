import { prisma } from "../lib/prisma";
import { isRagebaitSettings, DEFAULT_SETTINGS } from "../lib/default-settings";
import { getPublicPostUrl, getPublishedImageUrl } from "../lib/published-post";
import { HomeClient } from "./home-client";
import { headers } from "next/headers";
import type { RagebaitPost } from "../lib/types";

export const dynamic = "force-dynamic";

function getRequestOrigin(headersList: Headers) {
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

async function getInitialState(requestUrl: string) {
  const latestPublished = await prisma.publishedPost.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      authorName: true,
      authorTitle: true,
      headline: true,
      body: true,
      hashtags: true,
      reactionCount: true,
      commentCount: true,
      repostCount: true,
      imagePrompt: true,
      settings: true,
    },
  });

  if (latestPublished && isRagebaitSettings(latestPublished.settings)) {
    const post: RagebaitPost = {
      authorName: latestPublished.authorName,
      authorTitle: latestPublished.authorTitle,
      headline: latestPublished.headline,
      body: latestPublished.body,
      hashtags: Array.isArray(latestPublished.hashtags)
        ? (latestPublished.hashtags as string[])
        : [],
      reactionCount: latestPublished.reactionCount,
      commentCount: latestPublished.commentCount,
      repostCount: latestPublished.repostCount,
      imagePrompt: latestPublished.imagePrompt,
    };

    return {
      initialSettings: latestPublished.settings,
      initialPost: post,
      initialImageUrl: getPublishedImageUrl(latestPublished.id),
      initialPublishedUrl: getPublicPostUrl(requestUrl, latestPublished.id),
    };
  }

  return {
    initialSettings: DEFAULT_SETTINGS,
    initialPost: null,
    initialImageUrl: null,
    initialPublishedUrl: null,
  };
}

export default async function Home() {
  const requestUrl = getRequestOrigin(await headers());
  const initialState = await getInitialState(requestUrl);

  return <HomeClient {...initialState} />;
}
