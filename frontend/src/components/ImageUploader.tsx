"use client";

import { useRef } from "react";
import { ImageItem } from "@/types";
import { addImage } from "@/lib/image-store";

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  max?: number;
}

export default function ImageUploader({ images, onChange, max = 6 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const remaining = max - images.length;
    const toAdd = Array.from(files).slice(0, remaining);

    const newImages: ImageItem[] = [];
    for (const file of toAdd) {
      const item = await addImage(file);
      newImages.push(item);
    }
    onChange([...images, ...newImages]);
  };

  const remove = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <div key={img.id} className="relative group w-28 h-28 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
            <img src={img.data} alt={img.name} className="w-full h-full object-contain bg-zinc-50" />
            <button
              onClick={() => remove(img.id)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              ×
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
              {img.name}
            </div>
          </div>
        ))}

        {images.length < max && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-28 h-28 rounded-lg border-2 border-dashed border-zinc-300 hover:border-blue-400 text-zinc-400 hover:text-blue-500 flex flex-col items-center justify-center gap-1 transition"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-[10px]">이미지</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <p className="text-xs text-zinc-400">{images.length}/{max}장 (localStorage 저장)</p>
      )}
    </div>
  );
}
