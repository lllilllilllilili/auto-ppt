export type SlideLayout = "title" | "content" | "two-column" | "closing";

export interface SlideData {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle: string;
  bullets: string[];
  left_title: string;
  left_bullets: string[];
  right_title: string;
  right_bullets: string[];
}

export type ThemeName = "business" | "simple" | "dark";

export interface PresentationData {
  title: string;
  theme: ThemeName;
  slides: SlideData[];
}

export const LAYOUT_LABELS: Record<SlideLayout, string> = {
  title: "표지",
  content: "콘텐츠",
  "two-column": "2단 비교",
  closing: "마무리",
};

export const THEME_OPTIONS: { value: ThemeName; label: string; desc: string }[] = [
  { value: "business", label: "비즈니스", desc: "흰 배경 + 네이비 포인트" },
  { value: "simple", label: "심플", desc: "밝은 회색 + 블랙" },
  { value: "dark", label: "다크", desc: "차콜 배경 + 시안 포인트" },
];

export function createSlide(layout: SlideLayout = "content"): SlideData {
  return {
    id: crypto.randomUUID(),
    layout,
    title: "",
    subtitle: "",
    bullets: [""],
    left_title: "",
    left_bullets: [""],
    right_title: "",
    right_bullets: [""],
  };
}
