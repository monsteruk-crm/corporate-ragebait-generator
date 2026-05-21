import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const imagePrompt = body?.imagePrompt;

    if (typeof imagePrompt !== "string" || imagePrompt.trim().length < 8) {
      return NextResponse.json(
        { error: "imagePrompt must be a non-empty string." },
        { status: 400 },
      );
    }

    const result = await openai.images.generate({
      model: imageModel,
      prompt: imagePrompt,
      size: "1024x1024",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "Image model returned no image data." },
        { status: 502 },
      );
    }

    return NextResponse.json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate support image." },
      { status: 500 },
    );
  }
}
