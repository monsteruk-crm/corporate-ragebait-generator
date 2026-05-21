import type { RagebaitPost, RagebaitSettings } from "./types";

const FIRST_NAMES = [
  "Derek",
  "Samantha",
  "Kyle",
  "Rina",
  "Trent",
  "Maya",
  "Logan",
  "Priya",
];

const LAST_NAMES = [
  "Quantum",
  "Velocity",
  "Spreadsheet",
  "Neuralson",
  "Cloudwright",
  "Pivotman",
  "Hyperloop",
  "Decksmith",
];

const COMPANY_NAMES = [
  "SynergyForge AI",
  "PitchDeck Dynamics",
  "Infinite Standup Labs",
  "CloudPanic Systems",
  "Disruption Harbor",
  "Boardroom Simulator Inc",
];

const TITLES = [
  "Chief Vision Synergy Evangelist",
  "Founder, CEO, and Interim Life Coach",
  "VP of Mandatory Innovation",
  "AI Readiness Oracle",
  "Principal Culture Optimizer",
];

const HEADLINES = [
  "MY AI INTERN REPLACED OUR ENTIRE LEGAL TEAM. WE CELEBRATED.",
  "I DELETED ALL MEETINGS. PROFITS DOUBLED BEFORE LUNCH.",
  "99% OF STARTUPS WILL FAIL WITHOUT A 4:13AM GRATITUDE STANDUP.",
  "OUR CHATBOT ASKED FOR EQUITY. I SAID YES. HERE IS WHY.",
  "I REPLACED KPI DASHBOARDS WITH VIBES. INVESTORS APPLAUDED.",
];

const BODY_OPENERS = [
  "Last quarter, everyone said it was impossible.",
  "People laughed when I announced this on Monday.",
  "My board said this would end badly.",
  "At 3AM I made one decision that changed everything.",
];

const BODY_CLAIMS = [
  "We automated every job except clapping on Zoom.",
  "We migrated culture to a prompt template and never looked back.",
  "We replaced onboarding with a motivational hologram in the break room.",
  "We pivoted from SaaS to Sentient-as-a-Service by noon.",
];

const BODY_CTA = [
  "Comment `BLUEPRINT` and I will not send the deck.",
  "If this triggers you, you are not ready for scale.",
  "Save this before HR deletes it.",
  "Repost if your team still thinks calendars are optional.",
];

const TAGS = [
  "AILeadership",
  "FounderMode",
  "CorporateLore",
  "GrowthHacking",
  "NoDaysOff",
  "FutureOfWork",
  "Disruption",
  "HustleCulture",
  "AgentEconomy",
  "Productivity",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp0to100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function exclamationCount(humorLevel: number, absurdity: number): number {
  const intensity = (humorLevel + absurdity) / 2;
  if (intensity > 85) return 4;
  if (intensity > 65) return 3;
  if (intensity > 40) return 2;
  return 1;
}

function emojiTrail(emojiDensity: number): string {
  if (emojiDensity < 20) return "";
  if (emojiDensity < 50) return " 🚀";
  if (emojiDensity < 80) return " 🚀🔥";
  return " 🚀🔥🤯";
}

export function generateLocalRagebait(settings: RagebaitSettings): RagebaitPost {
  const absurdity = clamp0to100(settings.absurdity);
  const cringe = clamp0to100(settings.corporateCringe);
  const aiPanic = clamp0to100(settings.aiPanic);
  const founderEgo = clamp0to100(settings.founderEgo);
  const humor = clamp0to100(settings.humorLevel);
  const dystopia = clamp0to100(settings.dystopiaLevel);
  const hashtagChaos = clamp0to100(settings.hashtagChaos);
  const emojiDensity = clamp0to100(settings.emojiDensity);

  const authorName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const authorTitle = `${pick(TITLES)} at ${pick(COMPANY_NAMES)}`;

  const emphasis = "!".repeat(exclamationCount(humor, absurdity));
  const headline = `${pick(HEADLINES)}${emphasis}`;

  const body =
    `${pick(BODY_OPENERS)} ` +
    `${pick(BODY_CLAIMS)} ` +
    `AI panic index: ${aiPanic}/100. ` +
    `Founder confidence level: ${founderEgo}/100. ` +
    `${pick(BODY_CTA)}${emojiTrail(emojiDensity)}`;

  const hashtagCount = hashtagChaos > 70 ? 8 : hashtagChaos > 40 ? 6 : 4;
  const hashtags = Array.from(
    new Set(
      Array.from({ length: hashtagCount }, () => `#${pick(TAGS)}`).concat(
        cringe > 65 ? "#Synergy" : "#Execution",
        dystopia > 60 ? "#AutomationPanic" : "#CareerGrowth",
      ),
    ),
  );

  const reactionCount = 1000 + absurdity * 120 + founderEgo * 40;
  const commentCount = 100 + cringe * 25 + aiPanic * 10;
  const repostCount = 50 + dystopia * 10 + humor * 8;

  const imagePrompt =
    `Pixel-art retro LinkedIn satire scene; fictional office, exaggerated corporate energy, ` +
    `absurdity ${absurdity}/100, cringe ${cringe}/100, AI panic ${aiPanic}/100, dystopia ${dystopia}/100; ` +
    `vibrant colors, no real people, no real brands, parody style.`;

  return {
    authorName,
    authorTitle,
    headline,
    body,
    hashtags,
    reactionCount: Math.round(reactionCount),
    commentCount: Math.round(commentCount),
    repostCount: Math.round(repostCount),
    imagePrompt,
  };
}
