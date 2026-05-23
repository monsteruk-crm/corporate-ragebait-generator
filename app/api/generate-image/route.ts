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
      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      let cancelled = false;
      let phaseRunner: Promise<void> | null = null;

      try {
        await sendEvent("progress", {
          progress: 6,
          stage: "queued",
          message: "Queued for rendering...",
        });

        const phasePlan = [
          { delay: 700, progress: 24, stage: "rendering", message: "Rendering the support image..." },
          { delay: 900, progress: 52, stage: "encoding", message: "Encoding the generated image..." },
          { delay: 900, progress: 78, stage: "finalizing", message: "Finalizing image output..." },
        ] as const;

        phaseRunner = (async () => {
          for (const phase of phasePlan) {
            await wait(phase.delay);
            if (cancelled) {
              return;
            }

            await sendEvent("progress", phase);
          }
        })();

        const result = await openai.images.generate({
          model: imageModel,
          prompt: imagePrompt,
          size: "1024x1024",
        });

        cancelled = true;
        await phaseRunner;

        const b64 = result.data?.[0]?.b64_json;
        if (!b64) {
          await sendEvent("error", {
            error: "Image model returned no image data.",
          });
          return;
        }

        await sendEvent("progress", {
          progress: 100,
          stage: "complete",
          message: "Image ready.",
        });
        await sendEvent("done", { imageUrl: `data:image/png;base64,${b64}` });
      } catch {
        await sendEvent("error", {
          error: "Failed to generate support image.",
        });
      } finally {
        cancelled = true;
        if (phaseRunner) {
          try {
            await phaseRunner;
          } catch {
            // Ignore background phase errors during shutdown.
          }
        }
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
