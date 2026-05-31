import { ImageItem } from "@/types";

const DB_NAME = "auto-ppt-db";
const DB_VERSION = 1;
const STORE_NAME = "images";

// PPT 슬라이드 기준 충분한 해상도 (1920px 이하로 리사이즈)
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadAllImages(): Promise<ImageItem[]> {
  if (typeof window === "undefined") return [];
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as ImageItem[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function saveItem(item: ImageItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // MAX_DIMENSION 이하면 리사이즈 안 함
        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
          resolve(reader.result as string);
          return;
        }

        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === "image/png";
        const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addImage(file: File): Promise<ImageItem> {
  const data = await compressImage(file);

  const item: ImageItem = {
    id: crypto.randomUUID(),
    data,
    name: file.name,
    content_type: file.type || "image/png",
    position: "right-top",
  };

  await saveItem(item);
  return item;
}

export async function removeImage(id: string): Promise<void> {
  await deleteItem(id);
}

export async function getImage(id: string): Promise<ImageItem | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as ImageItem | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function getStorageEstimate(): Promise<{ usageMB: number; quotaMB: number }> {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    const est = await navigator.storage.estimate();
    return {
      usageMB: (est.usage || 0) / (1024 * 1024),
      quotaMB: (est.quota || 0) / (1024 * 1024),
    };
  }
  return { usageMB: 0, quotaMB: 0 };
}

// localStorage → IndexedDB 마이그레이션 (한번만 실행)
export async function migrateFromLocalStorage(): Promise<ImageItem[]> {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("auto-ppt-images");
  if (!raw) return [];

  try {
    const items: ImageItem[] = JSON.parse(raw);
    for (const item of items) {
      if (!item.position) item.position = "right-top";
      await saveItem(item);
    }
    localStorage.removeItem("auto-ppt-images");
    return items;
  } catch {
    return [];
  }
}
