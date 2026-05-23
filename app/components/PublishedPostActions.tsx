"use client";

import { useState } from "react";

type PublishedPostActionsProps = {
  url: string;
  shareText: string;
};

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

export function PublishedPostActions({ url, shareText }: PublishedPostActionsProps) {
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  async function handleCopyLink() {
    const copied = await copyToClipboard(url);
    setCopiedMessage(copied ? "Public link copied." : "Could not copy the link.");
  }

  async function handleCopyText() {
    const copied = await copyToClipboard(shareText);
    setCopiedMessage(copied ? "Post text copied." : "Could not copy the post text.");
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
        Shareable URL
      </p>
      <p className="mt-2 break-all text-sm text-slate-700">{url}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Copy public link
        </button>
        <button
          type="button"
          onClick={handleCopyText}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Copy post text
        </button>
      </div>

      {copiedMessage ? (
        <p className="mt-3 text-xs text-emerald-700">{copiedMessage}</p>
      ) : null}
    </div>
  );
}
