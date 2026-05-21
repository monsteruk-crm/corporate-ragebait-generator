"use client";

import type { RagebaitSettings, SliderKey } from "../../lib/types";

type RagebaitControlsProps = {
  settings: RagebaitSettings;
  onChange: (settings: RagebaitSettings) => void;
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

export function RagebaitControls({ settings, onChange }: RagebaitControlsProps) {
  return (
    <section aria-label="Generator controls">
      <h2 className="text-lg font-bold text-slate-900">Controls</h2>
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
