import type { RagebaitSettings } from "./types";

export const DEFAULT_SETTINGS: RagebaitSettings = {
  headlineLength: 35,
  bodyLength: 28,
  hashtagCount: 55,
  absurdity: 55,
  corporateCringe: 70,
  aiPanic: 80,
  founderEgo: 65,
  humorLevel: 75,
  dystopiaLevel: 60,
  emojiDensity: 40,
  hashtagChaos: 90,
};

export function isRagebaitSettings(input: unknown): input is RagebaitSettings {
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
