import type { RagebaitSettings } from "./types";

export function buildRagebaitPrompt(settings: RagebaitSettings): string {
  const headlineTarget =
    settings.headlineLength < 34
      ? "very short, around 70-90 characters"
      : settings.headlineLength < 67
        ? "medium length, around 90-110 characters"
        : "longer, up to 130 characters";

  const bodyTarget =
    settings.bodyLength < 34
      ? "2 very short lines"
      : settings.bodyLength < 67
        ? "3-4 short lines"
        : "5-7 short lines";

  const hashtagTarget =
    settings.hashtagCount < 34
      ? "4-5 hashtags"
      : settings.hashtagCount < 67
        ? "6-7 hashtags"
        : "8-9 hashtags";

  return `
You are writing a completely fictional, satirical LinkedIn ragebait post.
The result must feel like a real overcooked LinkedIn post, but it must be obvious parody.

Safety constraints:
- Use only fictional people and fictional companies.
- Do not mention real people, real companies, real products, or specific allegations.
- Do not imply factual claims about real organizations.
- No hate, violence, sexual content, medical advice, legal advice, or financial advice.
- No harassment and no defamatory claims.
- Avoid anything that could plausibly be mistaken as a real accusation.

Creative brief:
- absurd founder/influencer energy
- corporate cringe and leadership theatre
- AI panic, agent hype, and automation anxiety
- dystopian productivity culture
- fake humblebrag storytelling
- fake metrics, fake board updates, fake sprint rituals, fake OKRs, fake dashboards, or fake investor memos
- varied structure from generation to generation

Slider behavior:
- headlineLength: ${headlineTarget}.
- bodyLength: ${bodyTarget}.
- hashtagCount: ${hashtagTarget}.
- absurdity: higher means more surreal logic and outrageous claims.
- corporateCringe: higher means more jargon, synergy, leadership theatre, and KPI nonsense.
- aiPanic: higher means more AI automation anxiety and agent hype.
- founderEgo: higher means more narcissistic founder voice and self-congratulation.
- humorLevel: higher means punchier, funnier, and more comedic.
- dystopiaLevel: higher means more bleak productivity-culture satire.
- emojiDensity: higher means more emojis in the body, but do not overdo it.
- hashtagChaos: higher means more chaotic, weirder hashtags.

Variation rules:
- Do not use the same structure every time.
- Avoid repeating the same opening style.
- Avoid generic "Last quarter..." openings unless the model invents a genuinely fresh angle.
- Include one surprising specific detail in every post.
- Include at least one fake business artifact or metric in every post.
- The body should read like a believable fake LinkedIn post, not a stitched template.

Output requirements:
- Return only valid JSON.
- Follow this exact schema:
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

- authorName: plausible but fictional human name; do not reuse a fixed list.
- authorTitle: ridiculous fictional LinkedIn title plus fictional company.
- headline: ALL CAPS, dramatic, under 130 characters.
- body: 3-7 short LinkedIn-style lines or short paragraphs.
- hashtags: 4-9 hashtags, each starts with #, varied and relevant.
- reactionCount/commentCount/repostCount: plausible exaggerated LinkedIn-style numbers influenced by the slider values.
- imagePrompt: a short visual prompt for a retro/pixel-art satirical office image. It must not mention real brands or real people.

Formatting guidance:
- headline should be punchy and extreme.
- body should match the requested line count and feel shorter or longer based on bodyLength.
- body should include fake metrics, fake lessons, and fake CTA energy.
- make the voice sound self-important, ridiculous, and internet-native.
- use light emoji seasoning when emojiDensity is higher, but do not overdo it.
- hashtags should reflect the post content and the chaos slider.

Slider values (0-100):
- headlineLength: ${settings.headlineLength}
- bodyLength: ${settings.bodyLength}
- hashtagCount: ${settings.hashtagCount}
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
