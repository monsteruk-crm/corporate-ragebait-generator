import type { RagebaitPost } from "./types";

export function buildShareText(post: RagebaitPost): string {
  return [
    `${post.authorName} — ${post.authorTitle}`,
    "",
    post.headline,
    "",
    post.body,
    "",
    post.hashtags.join(" "),
  ].join("\n");
}

export function getPublicPostUrl(requestUrl: string, id: string): string {
  return new URL(`/p/${id}`, requestUrl).toString();
}

export function getPublishedImageUrl(id: string): string {
  return `/api/published-image/${id}`;
}
