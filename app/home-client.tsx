"use client";

import { useState } from "react";
import { GenerateButton } from "./components/GenerateButton";
import { PublishButton } from "./components/PublishButton";
import {
  LinkedInPostPreview,
  PLACEHOLDER_POST,
} from "./components/LinkedInPostPreview";
import { RagebaitControls } from "./components/RagebaitControls";
import { ShareButton } from "./components/ShareButton";
import { generateLocalRagebait } from "../lib/localGenerator";
import { buildShareText } from "../lib/published-post";
import type { RagebaitPost, RagebaitSettings } from "../lib/types";

type ImageGenerationStage =
  | "queued"
  | "rendering"
  | "encoding"
  | "finalizing"
  | "complete";

const IMAGE_PHASES: Array<{ key: ImageGenerationStage; label: string }> = [
  { key: "queued", label: "Queued" },
  { key: "rendering", label: "Rendering" },
  { key: "encoding", label: "Encoding" },
  { key: "finalizing", label: "Finalizing" },
  { key: "complete", label: "Done" },
];

type HomeClientProps = {
  initialSettings: RagebaitSettings;
  initialPost: RagebaitPost | null;
  initialImageUrl: string | null;
  initialPublishedUrl: string | null;
};

async function readErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const json = (await response.json()) as { error?: unknown };
    if (typeof json.error === "string" && json.error.trim().length > 0) {
      return json.error;
    }
  } catch {
    // Ignore malformed error bodies and fall back to a generic message.
  }

  return fallbackMessage;
}

export function HomeClient({
  initialSettings,
  initialPost,
  initialImageUrl,
  initialPublishedUrl,
}: HomeClientProps) {
  const [settings, setSettings] = useState<RagebaitSettings>(initialSettings);
  const [post, setPost] = useState<RagebaitPost>(initialPost ?? PLACEHOLDER_POST);
  const [imagePrompt, setImagePrompt] = useState<string>(
    initialPost?.imagePrompt ?? PLACEHOLDER_POST.imagePrompt,
  );
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingPrompt, setIsRegeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState(0);
  const [imageGenerationStage, setImageGenerationStage] =
    useState<ImageGenerationStage | null>(null);
  const [imageGenerationStatus, setImageGenerationStatus] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(initialPublishedUrl);

  function randomSliderValue(): number {
    return Math.floor(Math.random() * 101);
  }

  function handleRandomizeSettings() {
    setPublishedUrl(null);
    setSettings({
      absurdity: randomSliderValue(),
      corporateCringe: randomSliderValue(),
      aiPanic: randomSliderValue(),
      founderEgo: randomSliderValue(),
      humorLevel: randomSliderValue(),
      dystopiaLevel: randomSliderValue(),
      emojiDensity: randomSliderValue(),
      hashtagChaos: randomSliderValue(),
    });
    setGenerationNotice("Parameters randomized.");
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerationNotice(null);
    setPublishedUrl(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "OpenAI unavailable. Used local parody generator fallback.",
        );

        if (response.status === 429) {
          setGenerationNotice(errorMessage);
          return;
        }

        throw new Error(errorMessage);
      }

      const json = (await response.json()) as RagebaitPost;
      setPost(json);
      setImagePrompt(json.imagePrompt);
      setImageUrl(null);
    } catch {
      const fallbackPost = generateLocalRagebait(settings);
      setPost(fallbackPost);
      setImagePrompt(fallbackPost.imagePrompt);
      setImageUrl(null);
      setGenerationNotice("OpenAI unavailable. Used local parody generator fallback.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRegeneratePrompt() {
    setIsRegeneratingPrompt(true);
    setGenerationNotice(null);

    try {
      const response = await fetch("/api/regenerate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, post }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "Could not regenerate image prompt. You can still edit it manually.",
        );

        if (response.status === 429) {
          setGenerationNotice(errorMessage);
          return;
        }

        throw new Error(errorMessage);
      }

      const json = (await response.json()) as { imagePrompt: string };
      setImagePrompt(json.imagePrompt);
    } catch {
      setGenerationNotice("Could not regenerate image prompt. You can still edit it manually.");
    } finally {
      setIsRegeneratingPrompt(false);
    }
  }

  async function handleGenerateImage() {
    setIsGeneratingImage(true);
    setImageGenerationProgress(0);
    setImageGenerationStage("queued");
    setImageGenerationStatus("Starting image generation...");
    setGenerationNotice(null);
    setPublishedUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompt }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "Image generation failed. Please try again.",
        );

        if (response.status === 429) {
          setGenerationNotice(errorMessage);
          return;
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (!response.body || !contentType.includes("text/event-stream")) {
        const json = (await response.json()) as { imageUrl: string };
        setImageUrl(json.imageUrl);
        setImageGenerationProgress(100);
        setImageGenerationStatus("Image ready.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "message";
      let currentData = "";

      const flushEvent = () => {
        if (!currentData.trim()) {
          currentEvent = "message";
          currentData = "";
          return;
        }

        try {
          const payload = JSON.parse(currentData) as
            | { progress?: number; stage?: string; message?: string; imageUrl?: string }
            | { imageUrl?: string }
            | { error?: string };

          if (
            currentEvent === "progress" &&
            "progress" in payload &&
            typeof payload.progress === "number"
          ) {
            setImageGenerationProgress(payload.progress);
          }

          if (
            currentEvent === "partial" &&
            "imageUrl" in payload &&
            typeof payload.imageUrl === "string"
          ) {
            setImageUrl(payload.imageUrl);
            setImageGenerationStage("rendering");
            if ("progress" in payload && typeof payload.progress === "number") {
              setImageGenerationProgress(payload.progress);
            }
            if ("message" in payload && typeof payload.message === "string") {
              setImageGenerationStatus(payload.message);
            }
          }

          if ("stage" in payload && typeof payload.stage === "string") {
            const nextStage = payload.stage as ImageGenerationStage;
            setImageGenerationStage(nextStage);
            const stageLabelMap: Record<string, string> = {
              queued: "Queued for rendering...",
              rendering: "Rendering the support image...",
              encoding: "Encoding the generated image...",
              finalizing: "Finalizing image output...",
              complete: "Image ready.",
            };

            setImageGenerationStatus(
              stageLabelMap[payload.stage] ?? payload.message ?? null,
            );
          }

          if ("message" in payload && typeof payload.message === "string") {
            setImageGenerationStatus(payload.message);
          }

          if (
            currentEvent === "done" &&
            "imageUrl" in payload &&
            typeof payload.imageUrl === "string"
          ) {
            setImageUrl(payload.imageUrl);
            setImageGenerationProgress(100);
            setImageGenerationStatus("Image ready.");
          }

          if (
            currentEvent === "error" &&
            "error" in payload &&
            typeof payload.error === "string"
          ) {
            throw new Error(payload.error);
          }
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
        } finally {
          currentEvent = "message";
          currentData = "";
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundaryIndex = buffer.indexOf("\n\n");
        while (boundaryIndex !== -1) {
          const rawEvent = buffer.slice(0, boundaryIndex);
          buffer = buffer.slice(boundaryIndex + 2);

          const lines = rawEvent.split("\n");
          currentEvent = "message";
          currentData = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              currentData += line.slice(5).trim();
            }
          }

          flushEvent();
          boundaryIndex = buffer.indexOf("\n\n");
        }
      }
    } catch {
      setGenerationNotice("Image generation failed. Please try again.");
      setImageGenerationStatus("Image generation failed.");
      setImageGenerationStage(null);
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function copyTextToClipboard(text: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  }

  async function publishCurrentPost() {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, post, imageUrl }),
    });

    if (!response.ok) {
      throw new Error("publish-failed");
    }

    const json = (await response.json()) as { id: string; url: string };
    setPublishedUrl(json.url);
    return json.url;
  }

  function buildLinkedInShareUrl(url: string, title: string) {
    const summary = post.body.slice(0, 220);
    const params = new URLSearchParams({
      mini: "true",
      url,
      title,
      summary,
      source: "LinkedIn Ragebait Forge",
    });

    return `https://www.linkedin.com/shareArticle?${params.toString()}`;
  }

  async function handleShareOnLinkedIn() {
    const shareText = buildShareText(post);
    const popup = window.open("about:blank", "_blank", "noopener,noreferrer");

    let copied = false;
    try {
      copied = await copyTextToClipboard(shareText);
    } catch {
      copied = false;
    }

    let publishedShareUrl = publishedUrl;
    try {
      if (!publishedShareUrl) {
        publishedShareUrl = await publishCurrentPost();
      }
    } catch {
      setGenerationNotice("Could not create a shareable URL. Please try again.");
      if (popup) {
        popup.close();
      }
      return;
    }

    const linkedinShareUrl = buildLinkedInShareUrl(
      publishedShareUrl,
      post.headline,
    );

    if (popup) {
      popup.location.replace(linkedinShareUrl);
    } else {
      window.open(linkedinShareUrl, "_blank", "noopener,noreferrer");
    }

    if (!popup) {
      setGenerationNotice(
        copied
          ? "Clipboard copy worked, but the LinkedIn tab was blocked by your browser. Open LinkedIn manually to share the published page."
          : "Clipboard copy failed and the LinkedIn tab was blocked by your browser. Open LinkedIn manually to share the published page.",
      );
      return;
    }

    setGenerationNotice(
      copied
        ? "Published share page opened in LinkedIn share flow. Your post text has been copied."
        : "Published share page opened in LinkedIn share flow. Clipboard copy failed, so paste manually if needed.",
    );
  }

  async function handlePublishSharePage() {
    setIsPublishing(true);
    setGenerationNotice(null);

    try {
      const url = await publishCurrentPost();
      setPublishedUrl(url);
      setGenerationNotice("Published share page saved to the database.");
    } catch {
      setGenerationNotice("Publishing failed. Make sure the database is reachable.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <header className="rounded-2xl border border-black/10 bg-white px-6 py-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
              Satire project
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              LinkedIn Ragebait Forge
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-700 sm:text-base">
              Build absurd fake thought-leadership posts with fictional personas and
              overcaffeinated corporate drama.
            </p>
          </div>
          <div className="sm:min-w-[260px]">
            <GenerateButton onClick={handleGenerate} isLoading={isGenerating} />
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <RagebaitControls
            settings={settings}
            onChange={setSettings}
            onRandomize={handleRandomizeSettings}
          />
          <div className="mt-6 flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-800" htmlFor="imagePrompt">
              Suggested image prompt
            </label>
            <textarea
              id="imagePrompt"
              value={imagePrompt}
              onChange={(event) => setImagePrompt(event.target.value)}
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
            <button
              type="button"
              onClick={handleRegeneratePrompt}
              disabled={isRegeneratingPrompt}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {isRegeneratingPrompt ? "Regenerating Prompt..." : "Regenerate Prompt"}
            </button>
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              {isGeneratingImage
                ? `Generating Image... ${imageGenerationProgress}%`
                : "Generate Support Image"}
            </button>
            {isGeneratingImage ? (
              <div className="space-y-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-3">
                <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(imageGenerationProgress, 5), 100)}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-indigo-900">
                  {imageGenerationStatus ?? "Rendering image..."}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {IMAGE_PHASES.map((phase, index) => {
                    const isActive = imageGenerationStage === phase.key;
                    const isComplete =
                      imageGenerationStage !== null &&
                      IMAGE_PHASES.findIndex((item) => item.key === imageGenerationStage) >
                        index;

                    return (
                      <div
                        key={phase.key}
                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                          isActive
                            ? "border-indigo-300 bg-white text-indigo-900"
                            : isComplete
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-indigo-100 bg-indigo-50/60 text-indigo-700"
                        }`}
                      >
                        {phase.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <PublishButton onClick={handlePublishSharePage} isLoading={isPublishing} />
            <ShareButton onClick={handleShareOnLinkedIn} />
            {generationNotice ? (
              <p className="text-xs text-amber-700">{generationNotice}</p>
            ) : null}
            {publishedUrl ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                <p className="font-semibold">Live share page</p>
                <a className="break-all underline" href={publishedUrl}>
                  {publishedUrl}
                </a>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <LinkedInPostPreview
            post={post}
            imageUrl={imageUrl}
            publishedUrl={publishedUrl}
          />
        </div>
      </section>
    </main>
  );
}
