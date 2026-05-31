"use client";

import { useRef, useState } from "react";
import { ImageItem, ImagePosition, POSITION_OPTIONS } from "@/types";
import { addImage } from "@/lib/image-store";

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  max?: number;
  showPosition?: boolean;
}

const POSITION_PREVIEW: Record<ImagePosition, { area: string }> = {
  "left-top":     { area: "top-0 left-0 w-1/2 h-1/2" },
  "right-top":    { area: "top-0 right-0 w-1/2 h-1/2" },
  "center":       { area: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4" },
  "full":         { area: "inset-0" },
  "left-bottom":  { area: "bottom-0 left-0 w-1/2 h-1/2" },
  "right-bottom": { area: "bottom-0 right-0 w-1/2 h-1/2" },
  "left-half":    { area: "top-0 left-0 w-1/2 h-full" },
};

export default function ImageUploader({ images, onChange, max = 6, showPosition = true }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList) => {
    setError("");
    const remaining = max - images.length;
    const toAdd = Array.from(files).slice(0, remaining);

    const newImages: ImageItem[] = [];
    for (const file of toAdd) {
      try {
        const item = await addImage(file);
        newImages.push(item);
      } catch {
        setError(`"${file.name}" 저장에 실패했습니다.`);
        break;
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  };

  const remove = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
    setError("");
  };

  const updatePosition = (id: string, position: ImagePosition) => {
    onChange(images.map((img) => (img.id === id ? { ...img, position } : img)));
  };

  const totalSizeMB = images.reduce((sum, img) => sum + (img.data?.length || 0) * 0.75 / (1024 * 1024), 0);

  return (
    <div className="space-y-3">
      {images.map((img) => (
        <div key={img.id} className="flex gap-3 items-start p-3 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 bg-white shrink-0">
            <img src={img.data} alt={img.name} className="w-full h-full object-contain" />
            <button
              onClick={() => remove(img.id)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              ×
            </button>
          </div>

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

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="text-[10px] text-zinc-400 text-right">
          이 슬라이드 이미지: {images.length}장 ({totalSizeMB.toFixed(1)}MB)
        </div>
      )}

      {images.length < max && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 rounded-lg border-2 border-dashed border-zinc-300 hover:border-blue-400 text-zinc-400 hover:text-blue-500 flex items-center justify-center gap-2 transition text-sm"
        >
          <span className="text-lg leading-none">+</span>
          이미지 추가
        </button>
      )}

      <div className="px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-500 space-y-1">
        <p className="font-semibold text-zinc-600">이미지 안내</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>슬라이드당 최대 <b>{max}장</b>까지 첨부 가능</li>
          <li>큰 이미지는 업로드 시 자동 리사이즈 (1920px 이하)</li>
          <li>브라우저 IndexedDB에 저장 — 용량 제한 거의 없음</li>
          <li>브라우저 데이터 삭제 시 이미지도 함께 삭제됨</li>
        </ul>
      </div>

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
