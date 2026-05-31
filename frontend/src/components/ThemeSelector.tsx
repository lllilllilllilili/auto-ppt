"use client";

import { ThemeName, THEME_OPTIONS } from "@/types";

interface ThemeSelectorProps {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
}

const THEME_PREVIEW: Record<ThemeName, { coverBg: string; contentBg: string; accent: string }> = {
  business: { coverBg: "bg-[#001D2C]", contentBg: "bg-[#F2F2F2]", accent: "bg-[#44546A]" },
  simple: { coverBg: "bg-[#1A1A2E]", contentBg: "bg-white", accent: "bg-[#1A1A2E]" },
  dark: { coverBg: "bg-[#0A0A0A]", contentBg: "bg-[#1E1E1E]", accent: "bg-cyan-400" },
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
              selected ? "border-blue-500 shadow-md shadow-blue-100" : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="rounded-lg overflow-hidden mb-2 aspect-[16/9] flex flex-col">
              <div className={`${preview.coverBg} flex-1 flex items-center justify-center`}>
                <div className="h-0.5 w-8 bg-white/60 rounded-full" />
              </div>
              <div className={`${preview.contentBg} flex-1 flex items-start pt-1 pl-1.5`}>
                <div className={`h-1 w-6 ${preview.accent} rounded-full opacity-80`} />
              </div>
            </div>
            <div className="text-sm font-medium text-zinc-700">{t.label}</div>
            <div className="text-xs text-zinc-400">{t.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
