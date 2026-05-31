export type SlideLayout = "title" | "toc" | "content" | "image-text" | "grid" | "two-column" | "closing";

export type ImagePosition = "left-top" | "right-top" | "center" | "full" | "left-bottom" | "right-bottom" | "left-half";

export interface ImageItem {
  id: string;
  data: string;
  name: string;
  content_type: string;
  position: ImagePosition;
}

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
  images: ImageItem[];
  caption: string;
}

export type ThemeName = "business" | "simple" | "dark";

export interface PresentationData {
  title: string;
  theme: ThemeName;
  slides: SlideData[];
}

export const LAYOUT_LABELS: Record<SlideLayout, string> = {
  title: "표지",
  toc: "목차",
  content: "콘텐츠",
  "image-text": "이미지+텍스트",
  grid: "이미지 그리드",
  "two-column": "2단 비교",
  closing: "마무리",
};

export const LAYOUT_DESC: Record<SlideLayout, string> = {
  title: "제목 + 부제목 (다크 배경)",
  toc: "번호 매겨진 목차 리스트",
  content: "제목바 + 불릿 + 이미지(선택)",
  "image-text": "큰 이미지 + 캡션",
  grid: "이미지 카드 그리드 + 라벨",
  "two-column": "좌/우 비교",
  closing: "마무리 문구 (다크 배경)",
};

export const THEME_OPTIONS: { value: ThemeName; label: string; desc: string }[] = [
  { value: "business", label: "비즈니스", desc: "다크 네이비 + 라이트 그레이" },
  { value: "simple", label: "심플", desc: "딥 네이비 + 화이트" },
  { value: "dark", label: "다크", desc: "블랙 + 시안 포인트" },
];

export const POSITION_OPTIONS: { value: ImagePosition; label: string }[] = [
  { value: "left-top", label: "좌상단" },
  { value: "right-top", label: "우상단" },
  { value: "center", label: "중앙" },
  { value: "full", label: "전체" },
  { value: "left-bottom", label: "좌하단" },
  { value: "right-bottom", label: "우하단" },
  { value: "left-half", label: "왼쪽 절반" },
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
    images: [],
    caption: "",
  };
}
