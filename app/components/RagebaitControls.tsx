"use client";

import type { RagebaitSettings, SliderKey } from "../../lib/types";

type RagebaitControlsProps = {
  settings: RagebaitSettings;
  onChange: (settings: RagebaitSettings) => void;
  onRandomize: () => void;
};

const SLIDER_DEFS: Array<{ key: SliderKey; label: string }> = [
  { key: "absurdity", label: "Absurdity" },
  { key: "corporateCringe", label: "Corporate cringe" },
  { key: "aiPanic", label: "AI panic" },
  { key: "founderEgo", label: "Founder ego" },
  { key: "humorLevel", label: "Humor level" },
  { key: "dystopiaLevel", label: "Dystopia level" },
  { key: "emojiDensity", label: "Emoji density" },
  { key: "hashtagChaos", label: "Hashtag chaos" },
];

export function RagebaitControls({
  settings,
  onChange,
  onRandomize,
}: RagebaitControlsProps) {
  return (
    <section aria-label="Generator controls">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Controls</h2>
        <button
          type="button"
          onClick={onRandomize}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          title="Randomize parameters"
          aria-label="Randomize parameters"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3m0-8V5a2 2 0 0 0-2-2h-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="9" cy="9" r="1.2" fill="currentColor" />
            <circle cx="15" cy="9" r="1.2" fill="currentColor" />
            <circle cx="9" cy="15" r="1.2" fill="currentColor" />
            <circle cx="15" cy="15" r="1.2" fill="currentColor" />
          </svg>
          Randomize
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {SLIDER_DEFS.map(({ key, label }) => (
          <label key={key} className="block">
            <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
              <span>{label}</span>
              <span>{settings[key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={settings[key]}
              onChange={(event) => {
                onChange({
                  ...settings,
                  [key]: Number(event.target.value),
                });
              }}
              className="w-full accent-rose-600"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
