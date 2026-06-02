export type RagebaitPost = {
  authorName: string;
  authorTitle: string;
  headline: string;
  body: string;
  hashtags: string[];
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  imagePrompt: string;
};

export type RagebaitSettings = {
  headlineLength: number;
  bodyLength: number;
  hashtagCount: number;
  absurdity: number;
  corporateCringe: number;
  aiPanic: number;
  founderEgo: number;
  humorLevel: number;
  dystopiaLevel: number;
  emojiDensity: number;
  hashtagChaos: number;
};

export type SliderKey = keyof RagebaitSettings;
