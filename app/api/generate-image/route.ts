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

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    const sendEvent = async (event: string, data: unknown) => {
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
      );
    };

    void (async () => {
      let cancelled = false;

      try {
        await sendEvent("progress", {
          progress: 4,
          stage: "queued",
          message: "Queued for rendering...",
        });

        const stream = await openai.images.generate({
          model: imageModel,
          prompt: imagePrompt,
          size: "1024x1024",
          stream: true,
          partial_images: 3,
        });

        let finalImageUrl: string | null = null;

        for await (const event of stream) {
          if (cancelled) {
            return;
          }

          if (event.type === "image_generation.partial_image") {
            const progress = Math.min(18 + event.partial_image_index * 24, 86);
            await sendEvent("partial", {
              progress,
              stage: "rendering",
              message: `Rendering visual draft ${event.partial_image_index + 1}...`,
              imageUrl: `data:image/${event.output_format};base64,${event.b64_json}`,
              partialIndex: event.partial_image_index,
            });
            continue;
          }

          if (event.type === "image_generation.completed") {
            finalImageUrl = `data:image/${event.output_format};base64,${event.b64_json}`;
            await sendEvent("progress", {
              progress: 100,
              stage: "complete",
              message: "Image ready.",
            });
            await sendEvent("done", { imageUrl: finalImageUrl });
          }
        }

        if (!finalImageUrl) {
          await sendEvent("error", {
            error: "Image model returned no final image data.",
          });
          return;
        }
      } catch {
        await sendEvent("error", {
          error: "Failed to generate support image.",
        });
      } finally {
        cancelled = true;
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate support image." },
      { status: 500 },
    );
  }
}
