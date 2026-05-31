"use client";

import { SlideData, SlideLayout, LAYOUT_LABELS, LAYOUT_DESC } from "@/types";
import BulletList from "./BulletList";
import ImageUploader from "./ImageUploader";

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

const LAYOUTS: SlideLayout[] = ["title", "toc", "content", "image-text", "grid", "two-column", "closing"];

export default function SlideCard({
  index, slide, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, totalSlides,
}: SlideCardProps) {
  const patch = (partial: Partial<SlideData>) => onChange({ ...slide, ...partial });
  const isCover = slide.layout === "title" || slide.layout === "closing";

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${isCover ? "bg-slate-900 border-slate-700" : "bg-white border-zinc-200"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${isCover ? "bg-slate-800 border-slate-700" : "bg-zinc-50 border-zinc-100"}`}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${isCover ? "bg-slate-600 text-slate-300" : "bg-zinc-200/60 text-zinc-400"}`}>
            {index + 1}
          </span>
          <select
            value={slide.layout}
            onChange={(e) => patch({ layout: e.target.value as SlideLayout })}
            className={`text-sm font-medium border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              isCover ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-transparent border-zinc-200"
            }`}
          >
            {LAYOUTS.map((l) => (
              <option key={l} value={l}>{LAYOUT_LABELS[l]}</option>
            ))}
          </select>
          <span className={`text-xs ${isCover ? "text-slate-400" : "text-zinc-400"}`}>
            {LAYOUT_DESC[slide.layout]}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className={`p-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition ${isCover ? "text-slate-400 hover:text-slate-200" : "text-zinc-400 hover:text-zinc-600"}`} title="위로">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className={`p-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition ${isCover ? "text-slate-400 hover:text-slate-200" : "text-zinc-400 hover:text-zinc-600"}`} title="아래로">↓</button>
          {totalSlides > 1 && (
            <button onClick={onRemove} className="p-1.5 text-zinc-400 hover:text-red-500 transition ml-1" title="삭제">✕</button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* 표지 */}
        {slide.layout === "title" && (
          <>
            <Field label="제목" dark>
              <input type="text" value={slide.title} onChange={(e) => patch({ title: e.target.value })} placeholder="발표 제목" className="input-dark" />
            </Field>
            <Field label="부제목 (팀/이름/날짜)" dark>
              <input type="text" value={slide.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} placeholder="병원1팀 / 홍길동" className="input-dark" />
            </Field>
          </>
        )}

        {/* 목차 */}
        {slide.layout === "toc" && (
          <Field label="목차 항목">
            <BulletList bullets={slide.bullets} onChange={(b) => patch({ bullets: b })} placeholder="목차 항목" numbered />
          </Field>
        )}

        {/* 콘텐츠 */}
        {slide.layout === "content" && (
          <>
            <Field label="제목">
              <input type="text" value={slide.title} onChange={(e) => patch({ title: e.target.value })} placeholder="슬라이드 제목" className="input-light" />
            </Field>
            <Field label="내용">
              <BulletList bullets={slide.bullets} onChange={(b) => patch({ bullets: b })} />
            </Field>
            <Field label="이미지 (선택)">
              <ImageUploader images={slide.images} onChange={(imgs) => patch({ images: imgs })} max={2} />
            </Field>
          </>
        )}

        {/* 이미지+텍스트 */}
        {slide.layout === "image-text" && (
          <>
            <Field label="제목">
              <input type="text" value={slide.title} onChange={(e) => patch({ title: e.target.value })} placeholder="슬라이드 제목" className="input-light" />
            </Field>
            <Field label="이미지">
              <ImageUploader images={slide.images} onChange={(imgs) => patch({ images: imgs })} max={1} />
            </Field>
            <Field label="캡션 / 설명">
              <input type="text" value={slide.caption} onChange={(e) => patch({ caption: e.target.value })} placeholder="이미지 아래 설명 텍스트" className="input-light" />
            </Field>
          </>
        )}

        {/* 그리드 */}
        {slide.layout === "grid" && (
          <>
            <Field label="제목">
              <input type="text" value={slide.title} onChange={(e) => patch({ title: e.target.value })} placeholder="슬라이드 제목" className="input-light" />
            </Field>
            <Field label="이미지 카드">
              <ImageUploader images={slide.images} onChange={(imgs) => patch({ images: imgs })} max={6} />
            </Field>
            <Field label="라벨 (이미지 순서대로)">
              <BulletList bullets={slide.bullets} onChange={(b) => patch({ bullets: b })} placeholder="라벨" />
            </Field>
          </>
        )}

        {/* 2단 비교 */}
        {slide.layout === "two-column" && (
          <>
            <Field label="제목">
              <input type="text" value={slide.title} onChange={(e) => patch({ title: e.target.value })} placeholder="슬라이드 제목" className="input-light" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Field label="왼쪽 제목">
                  <input type="text" value={slide.left_title} onChange={(e) => patch({ left_title: e.target.value })} placeholder="예: As-Is" className="input-light" />
                </Field>
                <div className="mt-3">
                  <BulletList bullets={slide.left_bullets} onChange={(b) => patch({ left_bullets: b })} placeholder="왼쪽" />
                </div>
              </div>
              <div>
                <Field label="오른쪽 제목">
                  <input type="text" value={slide.right_title} onChange={(e) => patch({ right_title: e.target.value })} placeholder="예: To-Be" className="input-light" />
                </Field>
                <div className="mt-3">
                  <BulletList bullets={slide.right_bullets} onChange={(b) => patch({ right_bullets: b })} placeholder="오른쪽" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 마무리 */}
        {slide.layout === "closing" && (
          <Field label="마무리 문구" dark>
            <input type="text" value={slide.title} onChange={(e) => patch({ title: e.target.value })} placeholder="감사합니다." className="input-dark" />
          </Field>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div>
      <label className={`block text-xs font-medium mb-1 ${dark ? "text-slate-400" : "text-zinc-500"}`}>{label}</label>
      {children}
    </div>
  );
}
