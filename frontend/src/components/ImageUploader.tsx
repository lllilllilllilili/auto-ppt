"use client";

import { useRef } from "react";
import { ImageItem, ImagePosition, POSITION_OPTIONS } from "@/types";
import { addImage } from "@/lib/image-store";

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  max?: number;
  showPosition?: boolean;
}

const POSITION_PREVIEW: Record<ImagePosition, { area: string; desc: string }> = {
  "left-top":     { area: "top-0 left-0 w-1/2 h-1/2", desc: "텍스트 우측" },
  "right-top":    { area: "top-0 right-0 w-1/2 h-1/2", desc: "텍스트 좌측" },
  "center":       { area: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4", desc: "중앙 배치" },
  "full":         { area: "inset-0", desc: "전체 영역" },
  "left-bottom":  { area: "bottom-0 left-0 w-1/2 h-1/2", desc: "좌하단" },
  "right-bottom": { area: "bottom-0 right-0 w-1/2 h-1/2", desc: "우하단" },
  "left-half":    { area: "top-0 left-0 w-1/2 h-full", desc: "왼쪽 절반" },
};

export default function ImageUploader({ images, onChange, max = 6, showPosition = true }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const remaining = max - images.length;
    const toAdd = Array.from(files).slice(0, remaining);

    const newImages: ImageItem[] = [];
    for (const file of toAdd) {
      const item = await addImage(file);
      newImages.push({ ...item, position: "right-top" });
    }
    onChange([...images, ...newImages]);
  };

  const remove = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const updatePosition = (id: string, position: ImagePosition) => {
    onChange(images.map((img) => (img.id === id ? { ...img, position } : img)));
  };

  return (
    <div className="space-y-3">
      {images.map((img) => (
        <div key={img.id} className="flex gap-3 items-start p-3 bg-zinc-50 rounded-lg border border-zinc-100">
          {/* 썸네일 */}
          <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 bg-white shrink-0">
            <img src={img.data} alt={img.name} className="w-full h-full object-contain" />
            <button
              onClick={() => remove(img.id)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              ×
            </button>
          </div>

          {/* 위치 선택 */}
          {showPosition && (
            <div className="flex-1">
              <div className="text-xs text-zinc-500 mb-1.5">{img.name}</div>
              <div className="grid grid-cols-4 gap-1.5">
                {POSITION_OPTIONS.map((opt) => {
                  const selected = (img.position || "right-top") === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => updatePosition(img.id, opt.value)}
                      className={`relative rounded border p-0.5 transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                      title={opt.label}
                    >
                      {/* 미니 슬라이드 프리뷰 */}
                      <div className="relative w-full aspect-[16/9] bg-zinc-100 rounded-sm overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-zinc-300" />
                        <div className={`absolute ${POSITION_PREVIEW[opt.value].area} ${selected ? "bg-blue-400/50" : "bg-zinc-300/60"} rounded-[1px]`} />
                      </div>
                      <div className={`text-[9px] mt-0.5 text-center ${selected ? "text-blue-600 font-medium" : "text-zinc-400"}`}>
                        {opt.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      {images.length < max && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 rounded-lg border-2 border-dashed border-zinc-300 hover:border-blue-400 text-zinc-400 hover:text-blue-500 flex items-center justify-center gap-2 transition text-sm"
        >
          <span className="text-lg leading-none">+</span>
          이미지 추가
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
