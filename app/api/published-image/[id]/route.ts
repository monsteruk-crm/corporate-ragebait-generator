import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

function parseDataUrl(dataUrl: string): {
  contentType: string;
  bytes: ArrayBuffer;
} | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const contentType = match[1];
  const base64 = match[2];
  return {
    contentType,
    bytes: Uint8Array.from(Buffer.from(base64, "base64")).buffer,
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const post = await prisma.publishedPost.findUnique({
    where: { id },
    select: {
      supportImageDataUrl: true,
    },
  });

  if (!post?.supportImageDataUrl) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  const parsed = parseDataUrl(post.supportImageDataUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid image data." }, { status: 500 });
  }

  return new Response(parsed.bytes, {
    headers: {
      "Content-Type": parsed.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
