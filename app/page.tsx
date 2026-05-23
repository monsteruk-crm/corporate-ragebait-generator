import { prisma } from "../lib/prisma";
import { isRagebaitSettings, DEFAULT_SETTINGS } from "../lib/default-settings";
import { HomeClient } from "./home-client";
import type { RagebaitSettings } from "../lib/types";

export const dynamic = "force-dynamic";

async function getInitialSettings(): Promise<RagebaitSettings> {
  const latestPublished = await prisma.publishedPost.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      settings: true,
    },
  });

  if (latestPublished && isRagebaitSettings(latestPublished.settings)) {
    return latestPublished.settings;
  }

  return DEFAULT_SETTINGS;
}

export default async function Home() {
  const initialSettings = await getInitialSettings();

  return <HomeClient initialSettings={initialSettings} />;
}
