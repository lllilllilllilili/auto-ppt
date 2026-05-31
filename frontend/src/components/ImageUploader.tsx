"use client";

import { useRef, useState, useEffect } from "react";
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

const MAX_STORAGE_MB = 5;
const WARN_THRESHOLD = 0.8;
const MAX_FILE_SIZE_MB = 1.5;

function getStorageUsageMB(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) total += (localStorage.getItem(key)?.length || 0) * 2;
  }
  return total / (1024 * 1024);
}

export default function ImageUploader({ images, onChange, max = 6, showPosition = true }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    setStorageUsage(getStorageUsageMB());
  }, [images]);

  const usagePercent = Math.min((storageUsage / MAX_STORAGE_MB) * 100, 100);
  const isWarning = storageUsage > MAX_STORAGE_MB * WARN_THRESHOLD;
  const isFull = storageUsage > MAX_STORAGE_MB * 0.95;

  const handleFiles = async (files: FileList) => {
    setError("");
    const remaining = max - images.length;
    const toAdd = Array.from(files).slice(0, remaining);

    const newImages: ImageItem[] = [];
    for (const file of toAdd) {
      const sizeMB = file.size / (1024 * 1024);

      if (sizeMB > MAX_FILE_SIZE_MB) {
        setError(`"${file.name}" 용량 초과 (${sizeMB.toFixed(1)}MB). 이미지당 최대 ${MAX_FILE_SIZE_MB}MB`);
        continue;
      }

      try {
        const item = await addImage(file);
        newImages.push({ ...item, position: "right-top" });
      } catch {
        setError("저장 공간이 부족합니다. 기존 이미지를 삭제해주세요.");
        break;
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
    setStorageUsage(getStorageUsageMB());
  };

  const remove = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
    setError("");
    setTimeout(() => setStorageUsage(getStorageUsageMB()), 100);
  };

  const updatePosition = (id: string, position: ImagePosition) => {
    onChange(images.map((img) => (img.id === id ? { ...img, position } : img)));
  };

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

      {/* 에러 메시지 */}
      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {/* 저장 용량 바 */}
      {images.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>브라우저 저장 공간</span>
            <span className={isFull ? "text-red-500 font-medium" : isWarning ? "text-amber-500" : ""}>
              {storageUsage.toFixed(1)} / {MAX_STORAGE_MB}MB
            </span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? "bg-red-400" : isWarning ? "bg-amber-400" : "bg-blue-400"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      )}

      {images.length < max && !isFull && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 rounded-lg border-2 border-dashed border-zinc-300 hover:border-blue-400 text-zinc-400 hover:text-blue-500 flex items-center justify-center gap-2 transition text-sm"
        >
          <span className="text-lg leading-none">+</span>
          이미지 추가
        </button>
      )}

      {isFull && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
          저장 공간이 가득 찼습니다. 기존 이미지를 삭제해주세요.
        </div>
      )}

      {/* 주의사항 */}
      <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700 space-y-1">
        <p className="font-semibold">이미지 주의사항</p>
        <ul className="space-y-0.5 list-disc list-inside text-amber-600">
          <li>브라우저 저장소(localStorage) 최대 <b>5MB</b> — 이미지 3~4장 정도</li>
          <li>이미지 1장당 최대 <b>{MAX_FILE_SIZE_MB}MB</b>, 초과 시 업로드 불가</li>
          <li>브라우저 데이터 삭제 시 이미지도 <b>함께 삭제</b>됨</li>
          <li>고해상도 이미지는 PPT 화질이 떨어질 수 있어 <b>적정 크기로 리사이즈</b> 권장</li>
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
