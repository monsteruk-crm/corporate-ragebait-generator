import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type ImageParams = {
  params: Promise<{
    id: string;
  }>;
};

async function getPublishedPost(id: string) {
  return prisma.publishedPost.findUnique({
    where: { id },
    select: {
      authorName: true,
      authorTitle: true,
      headline: true,
      body: true,
      hashtags: true,
      reactionCount: true,
      commentCount: true,
      repostCount: true,
    },
  });
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export default async function Image({ params }: ImageParams) {
  const { id } = await params;
  const post = await getPublishedPost(id);

  if (!post) {
    notFound();
  }

  const headline = truncate(post.headline, 88);
  const body = truncate(post.body, 168);
  const hashtags = Array.isArray(post.hashtags)
    ? post.hashtags
        .slice(0, 4)
        .filter((tag): tag is string => typeof tag === "string")
        .join(" ")
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(239, 68, 68, 0.34), transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #1f2937 100%)",
          color: "#f8fafc",
          padding: 56,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fda4af",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#fb7185",
              boxShadow: "0 0 0 8px rgba(251, 113, 133, 0.16)",
            }}
          />
          LinkedIn Ragebait Forge
        </div>

        <div
          style={{
            display: "flex",
            gap: 36,
            alignItems: "stretch",
            marginTop: 28,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingRight: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  borderRadius: 9999,
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  padding: "10px 18px",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#cbd5e1",
                }}
              >
                Published share page
              </div>

              <div
                style={{
                  fontSize: 72,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  maxWidth: 700,
                }}
              >
                {headline}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 28,
                  color: "#cbd5e1",
                }}
              >
                <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                  {post.authorName}
                </div>
                <div>{post.authorTitle}</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 32,
                fontSize: 26,
                color: "#e2e8f0",
              }}
            >
              <div
                style={{
                  maxWidth: 760,
                  lineHeight: 1.35,
                  color: "#e5e7eb",
                }}
              >
                {body}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                  color: "#fda4af",
                  fontWeight: 700,
                }}
              >
                <span>{post.reactionCount.toLocaleString()} reactions</span>
                <span>{post.commentCount.toLocaleString()} comments</span>
                <span>{post.repostCount.toLocaleString()} reposts</span>
              </div>
            </div>
          </div>

          <div
            style={{
              width: 320,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 32,
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(15, 23, 42, 0.7)",
              boxShadow: "0 28px 80px rgba(15, 23, 42, 0.45)",
              padding: 28,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#86efac",
                }}
              >
                Share preview
              </div>
              <div
                style={{
                  fontSize: 36,
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: "#f8fafc",
                }}
              >
                Built for social previews.
              </div>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.45,
                  color: "#cbd5e1",
                }}
              >
                A lightweight Open Graph thumbnail gives LinkedIn a small image to
                scrape instead of guessing from the page body.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 28,
                fontSize: 18,
                color: "#e2e8f0",
              }}
            >
              <div style={{ color: "#93c5fd", fontWeight: 700 }}>Tags</div>
              <div
                style={{
                  lineHeight: 1.45,
                  color: "#cbd5e1",
                }}
              >
                {hashtags || "#AIFirst #FounderMindset #NoDaysOff"}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
