"use client";

import { ThemeName, THEME_OPTIONS } from "@/types";

interface ThemeSelectorProps {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
}

const THEME_PREVIEW: Record<ThemeName, { bg: string; accent: string; text: string }> = {
  business: { bg: "bg-white", accent: "bg-[#1B3A5C]", text: "text-[#1B3A5C]" },
  simple: { bg: "bg-zinc-100", accent: "bg-zinc-800", text: "text-zinc-800" },
  dark: { bg: "bg-[#2D2D2D]", accent: "bg-cyan-400", text: "text-cyan-400" },
};

export default function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex gap-3">
      {THEME_OPTIONS.map((t) => {
        const preview = THEME_PREVIEW[t.value];
        const selected = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`flex-1 rounded-xl border-2 p-3 transition-all ${
              selected
                ? "border-blue-500 shadow-md shadow-blue-100"
                : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {/* Mini preview */}
            <div className={`${preview.bg} rounded-lg p-2.5 mb-2 aspect-[16/9] flex flex-col justify-center items-center gap-1`}>
              <div className={`h-1.5 w-10 ${preview.accent} rounded-full`} />
              <div className={`h-1 w-7 ${preview.accent} rounded-full opacity-40`} />
            </div>
            <div className="text-sm font-medium text-zinc-700">{t.label}</div>
            <div className="text-xs text-zinc-400">{t.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
