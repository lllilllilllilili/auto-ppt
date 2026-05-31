"use client";

import { useState, useEffect } from "react";
import { PresentationData, SlideLayout, createSlide, LAYOUT_LABELS } from "@/types";
import SlideCard from "@/components/SlideCard";
import { migrateFromLocalStorage } from "@/lib/image-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ADD_LAYOUTS: SlideLayout[] = ["content", "image-text", "grid", "two-column", "toc"];

function initialData(): PresentationData {
  return {
    title: "",
    slides: [
      createSlide("title"),
      createSlide("toc"),
      createSlide("content"),
      createSlide("closing"),
    ],
  };
}

export default function Home() {
  const [data, setData] = useState<PresentationData>(initialData);
  const [loading, setLoading] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  useEffect(() => { migrateFromLocalStorage(); }, []);

  const updateSlide = (index: number, slide: PresentationData["slides"][number]) => {
    const next = [...data.slides];
    next[index] = slide;
    setData({ ...data, slides: next });
  };

  const removeSlide = (index: number) => {
    setData({ ...data, slides: data.slides.filter((_, i) => i !== index) });
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= data.slides.length) return;
    const next = [...data.slides];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setData({ ...data, slides: next });
  };

  const addSlide = (layout: SlideLayout) => {
    const closingIndex = data.slides.findIndex((s) => s.layout === "closing");
    const next = [...data.slides];
    const insertAt = closingIndex >= 0 ? closingIndex : next.length;
    next.splice(insertAt, 0, createSlide(layout));
    setData({ ...data, slides: next });
    setAddMenuOpen(false);
  };

  const generate = async () => {
    if (!data.title.trim()) {
      alert("프레젠테이션 제목을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: data.title,
        slides: data.slides.map(({ id, ...rest }) => ({
          ...rest,
          bullets: rest.bullets.filter((b) => b.trim()),
          left_bullets: rest.left_bullets.filter((b) => b.trim()),
          right_bullets: rest.right_bullets.filter((b) => b.trim()),
          images: rest.images.map((img) => ({
            data: img.data,
            content_type: img.content_type,
            position: img.position || "right-top",
          })),
        })),
      };

      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("생성 실패");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title || "presentation"}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("PPT 생성에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (confirm("모든 입력을 초기화할까요?")) {
      setData(initialData());
    }
  };

  const hasContent = data.slides.some((s) => {
    const title = s.title?.trim();
    const hasBullets = Array.isArray(s.bullets) && s.bullets.some((b) => b.trim());
    const hasImages = Array.isArray(s.images) && s.images.length > 0;
    return title || hasBullets || hasImages;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-zinc-800">PPT 자동 생성기</h1>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition">
              초기화
            </button>
            <button
              onClick={generate}
              disabled={loading || !hasContent}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  생성 중...
                </>
              ) : (
                "PPT 다운로드"
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* 프레젠테이션 제목 */}
        <section className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-700">프레젠테이션 제목</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="예: 5월 전략발표"
            className="w-full px-4 py-3 text-lg border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </section>

        {/* 슬라이드 목록 */}
        <section className="space-y-4">
          <label className="block text-sm font-semibold text-zinc-700">
            슬라이드 ({data.slides.length})
          </label>

          <div className="space-y-4">
            {data.slides.map((slide, i) => (
              <SlideCard
                key={slide.id}
                index={i}
                slide={slide}
                onChange={(s) => updateSlide(i, s)}
                onRemove={() => removeSlide(i)}
                onMoveUp={() => moveSlide(i, i - 1)}
                onMoveDown={() => moveSlide(i, i + 1)}
                isFirst={i === 0}
                isLast={i === data.slides.length - 1}
                totalSlides={data.slides.length}
              />
            ))}
          </div>

          {/* 슬라이드 추가 */}
          <div className="relative flex items-center justify-center pt-2">
            <button
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="px-5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition"
            >
              + 슬라이드 추가
            </button>

            {addMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setAddMenuOpen(false)} />
                <div className="absolute top-full mt-2 z-30 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 min-w-[200px]">
                  {ADD_LAYOUTS.map((l) => (
                    <button
                      key={l}
                      onClick={() => addSlide(l)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition flex items-center justify-between"
                    >
                      <span className="font-medium">{LAYOUT_LABELS[l]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* 하단 생성 버튼 */}
        <div className="pt-4 pb-12">
          <button
            onClick={generate}
            disabled={loading || !hasContent}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-base"
          >
            {loading ? "생성 중..." : "PPT 생성 & 다운로드"}
          </button>
        </div>
      </main>
    </div>
  );
}
