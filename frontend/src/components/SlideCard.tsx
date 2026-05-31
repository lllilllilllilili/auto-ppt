"use client";

import { SlideData, SlideLayout, LAYOUT_LABELS } from "@/types";
import BulletList from "./BulletList";

interface SlideCardProps {
  index: number;
  slide: SlideData;
  onChange: (slide: SlideData) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  totalSlides: number;
}

const LAYOUTS: SlideLayout[] = ["title", "content", "two-column", "closing"];

export default function SlideCard({
  index,
  slide,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  totalSlides,
}: SlideCardProps) {
  const patch = (partial: Partial<SlideData>) => onChange({ ...slide, ...partial });

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 bg-zinc-200/60 rounded-full w-6 h-6 flex items-center justify-center">
            {index + 1}
          </span>
          <select
            value={slide.layout}
            onChange={(e) => patch({ layout: e.target.value as SlideLayout })}
            className="text-sm font-medium bg-transparent border border-zinc-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {LAYOUTS.map((l) => (
              <option key={l} value={l}>
                {LAYOUT_LABELS[l]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="위로"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="아래로"
          >
            ↓
          </button>
          {totalSlides > 1 && (
            <button
              onClick={onRemove}
              className="p-1.5 text-zinc-400 hover:text-red-500 transition ml-1"
              title="슬라이드 삭제"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* 공통: 제목 */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            {slide.layout === "closing" ? "마무리 문구" : "제목"}
          </label>
          <input
            type="text"
            value={slide.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder={slide.layout === "closing" ? "감사합니다" : "슬라이드 제목"}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </div>

        {/* 표지: 부제목 */}
        {slide.layout === "title" && (
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">부제목</label>
            <input
              type="text"
              value={slide.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
              placeholder="발표자, 날짜, 팀명 등"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            />
          </div>
        )}

        {/* 콘텐츠: 불릿 */}
        {slide.layout === "content" && (
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">내용</label>
            <BulletList bullets={slide.bullets} onChange={(b) => patch({ bullets: b })} />
          </div>
        )}

        {/* 2단 비교 */}
        {slide.layout === "two-column" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">왼쪽 제목</label>
              <input
                type="text"
                value={slide.left_title}
                onChange={(e) => patch({ left_title: e.target.value })}
                placeholder="예: As-Is"
                className="w-full px-3 py-2 mb-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
              <BulletList bullets={slide.left_bullets} onChange={(b) => patch({ left_bullets: b })} placeholder="왼쪽" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">오른쪽 제목</label>
              <input
                type="text"
                value={slide.right_title}
                onChange={(e) => patch({ right_title: e.target.value })}
                placeholder="예: To-Be"
                className="w-full px-3 py-2 mb-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
              <BulletList bullets={slide.right_bullets} onChange={(b) => patch({ right_bullets: b })} placeholder="오른쪽" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
