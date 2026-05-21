import type { RagebaitSettings } from "./types";

export function buildRagebaitPrompt(settings: RagebaitSettings): string {
  return `
You are writing SATIRICAL parody content for a fake LinkedIn post generator.

Safety constraints:
- The content must be clearly parody and absurd.
- Use only fictional names and fictional companies.
- Do not mention real people, real companies, or specific allegations.
- Avoid hateful or violent content.
- No defamatory claims.

Return ONLY a JSON object with this exact shape:
{
  "authorName": string,
  "authorTitle": string,
  "headline": string,
  "body": string,
  "hashtags": string[],
  "reactionCount": number,
  "commentCount": number,
  "repostCount": number,
  "imagePrompt": string
}

Style requirements:
- Tone: ridiculous LinkedIn guru energy, AI hype parody.
- Headline should be ALL CAPS and dramatic.
- Body should be 2-4 short sentences.
- Hashtags should be 4-9 items and each should start with #.
- imagePrompt should describe a retro/pixel-art style support image.

Slider values (0-100):
- absurdity: ${settings.absurdity}
- corporateCringe: ${settings.corporateCringe}
- aiPanic: ${settings.aiPanic}
- founderEgo: ${settings.founderEgo}
- humorLevel: ${settings.humorLevel}
- dystopiaLevel: ${settings.dystopiaLevel}
- emojiDensity: ${settings.emojiDensity}
- hashtagChaos: ${settings.hashtagChaos}
`.trim();
}
