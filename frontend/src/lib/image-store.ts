import { ImageItem } from "@/types";

const STORAGE_KEY = "auto-ppt-images";

export function loadImages(): ImageItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveImages(images: ImageItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (e) {
    console.warn("localStorage 용량 초과. 일부 이미지를 삭제해주세요.", e);
  }
}

export function addImage(file: File): Promise<ImageItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const item: ImageItem = {
        id: crypto.randomUUID(),
        data: reader.result as string,
        name: file.name,
        content_type: file.type || "image/png",
        position: "right-top",
      };

      const existing = loadImages();
      existing.push(item);
      saveImages(existing);
      resolve(item);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function removeImage(id: string) {
  const images = loadImages().filter((img) => img.id !== id);
  saveImages(images);
}

export function getImage(id: string): ImageItem | undefined {
  return loadImages().find((img) => img.id === id);
}
