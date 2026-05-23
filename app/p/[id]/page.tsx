import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LinkedInPostPreview } from "../../components/LinkedInPostPreview";
import { PublishedPostActions } from "../../components/PublishedPostActions";
import { prisma } from "../../../lib/prisma";
import { buildShareText, getPublicPostUrl } from "../../../lib/published-post";
import type { RagebaitPost } from "../../../lib/types";

export const dynamic = "force-dynamic";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

async function getPublishedPost(id: string) {
  return prisma.publishedPost.findUnique({
    where: { id },
  });
}

async function getRequestOrigin() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublishedPost(id);

  if (!post) {
    return {
      title: "Published post not found",
    };
  }

  const headline = post.headline.slice(0, 80);
  const description = post.body.slice(0, 160);

  return {
    title: `${post.authorName} | ${headline}`,
    description,
    openGraph: {
      title: headline,
      description,
    },
  };
}

export default async function PublishedPostPage({ params }: PageParams) {
  const { id } = await params;
  const post = await getPublishedPost(id);
  const origin = await getRequestOrigin();

  if (!post) {
    notFound();
  }

  const shareablePost: RagebaitPost = {
    authorName: post.authorName,
    authorTitle: post.authorTitle,
    headline: post.headline,
    body: post.body,
    hashtags: Array.isArray(post.hashtags) ? (post.hashtags as string[]) : [],
    reactionCount: post.reactionCount,
    commentCount: post.commentCount,
    repostCount: post.repostCount,
    imagePrompt: post.imagePrompt,
  };
  const url = getPublicPostUrl(origin, post.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <header className="rounded-2xl border border-black/10 bg-white px-6 py-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
          Published share page
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          {shareablePost.headline}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700 sm:text-base">
          This post was saved to the database and can be shared with anyone using the URL
          below.
        </p>
      </header>

      <LinkedInPostPreview post={shareablePost} imageUrl={post.supportImageDataUrl} />

      <PublishedPostActions
        url={url}
        shareText={post.shareText || buildShareText(shareablePost)}
      />
    </main>
  );
}
