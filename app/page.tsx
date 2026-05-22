"use client";

import { useState } from "react";
import { GenerateButton } from "./components/GenerateButton";
import {
  LinkedInPostPreview,
  PLACEHOLDER_POST,
} from "./components/LinkedInPostPreview";
import { RagebaitControls } from "./components/RagebaitControls";
import { ShareButton } from "./components/ShareButton";
import { generateLocalRagebait } from "../lib/localGenerator";
import type { RagebaitPost, RagebaitSettings } from "../lib/types";

const DEFAULT_SETTINGS: RagebaitSettings = {
  absurdity: 55,
  corporateCringe: 70,
  aiPanic: 80,
  founderEgo: 65,
  humorLevel: 75,
  dystopiaLevel: 60,
  emojiDensity: 40,
  hashtagChaos: 90,
};

export default function Home() {
  const [settings, setSettings] = useState<RagebaitSettings>(DEFAULT_SETTINGS);
  const [post, setPost] = useState<RagebaitPost>(PLACEHOLDER_POST);
  const [imagePrompt, setImagePrompt] = useState<string>(PLACEHOLDER_POST.imagePrompt);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingPrompt, setIsRegeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  function randomSliderValue(): number {
    return Math.floor(Math.random() * 101);
  }

  function handleRandomizeSettings() {
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

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error("generation-failed");
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
        throw new Error("prompt-regeneration-failed");
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
    setGenerationNotice(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompt }),
      });

      if (!response.ok) {
        throw new Error("image-generation-failed");
      }

      const json = (await response.json()) as { imageUrl: string };
      setImageUrl(json.imageUrl);
    } catch {
      setGenerationNotice("Image generation failed. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function handleShareOnLinkedIn() {
    const shareText = [
      `${post.authorName} — ${post.authorTitle}`,
      "",
      post.headline,
      "",
      post.body,
      "",
      post.hashtags.join(" "),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Continue even if clipboard fails in some browser contexts.
    }

    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank", "noopener,noreferrer");
    setGenerationNotice(
      "LinkedIn does not allow arbitrary auto-posting without OAuth and API approval. Your post text has been copied.",
    );
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
              {isGeneratingImage ? "Generating Image..." : "Generate Support Image"}
            </button>
            <ShareButton onClick={handleShareOnLinkedIn} />
            {generationNotice ? (
              <p className="text-xs text-amber-700">{generationNotice}</p>
            ) : null}
          </div>
        </aside>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <LinkedInPostPreview post={post} imageUrl={imageUrl} />
        </div>
      </section>
    </main>
  );
}
