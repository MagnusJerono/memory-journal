import exifr from 'exifr';
import type {
  ListAssetsOptions,
  PhotoAsset,
  PhotoLibraryPlugin,
  PhotoPermissionState,
} from './definitions';

interface StoredFile {
  id: string;
  file: File;
  createdAt: number;
  latitude?: number;
  longitude?: number;
  width?: number;
  height?: number;
}

const store = new Map<string, StoredFile>();
let lastPermission: PhotoPermissionState = 'prompt';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

async function decodeMetadata(file: File, id: string): Promise<StoredFile> {
  const fallback: StoredFile = {
    id,
    file,
    createdAt: file.lastModified || Date.now(),
  };
  try {
    const meta = await exifr.parse(file, {
      pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude', 'ExifImageWidth', 'ExifImageHeight'],
    });
    if (!meta) return fallback;
    const created = (meta.DateTimeOriginal ?? meta.CreateDate) as Date | undefined;
    return {
      id,
      file,
      createdAt: created instanceof Date ? created.getTime() : fallback.createdAt,
      latitude: typeof meta.GPSLatitude === 'number' ? meta.GPSLatitude : undefined,
      longitude: typeof meta.GPSLongitude === 'number' ? meta.GPSLongitude : undefined,
      width: typeof meta.ExifImageWidth === 'number' ? meta.ExifImageWidth : undefined,
      height: typeof meta.ExifImageHeight === 'number' ? meta.ExifImageHeight : undefined,
    };
  } catch {
    return fallback;
  }
}

async function pickFiles(): Promise<File[]> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      resolve(files);
    };
    input.oncancel = () => resolve([]);
    input.click();
  });
}

async function resizeToBase64(file: Blob, maxEdge: number): Promise<{
  base64: string;
  width: number;
  height: number;
}> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    return { base64: await blobToBase64(file), width: 0, height: 0 };
  }
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return { base64: await blobToBase64(file), width: 0, height: 0 };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85),
  );
  return { base64: await blobToBase64(blob), width, height };
}

export const PhotoLibraryWeb: PhotoLibraryPlugin = {
  async checkPermission() {
    return { status: lastPermission };
  },
  async requestPermission() {
    const files = await pickFiles();
    if (files.length === 0) {
      lastPermission = 'denied';
      return { status: 'denied' };
    }
    store.clear();
    const decoded = await Promise.all(
      files.map((f, idx) => decodeMetadata(f, `web:${Date.now()}:${idx}`)),
    );
    for (const entry of decoded) {
      store.set(entry.id, entry);
    }
    lastPermission = 'limited';
    return { status: 'limited' };
  },
  async listAssets(options: ListAssetsOptions = {}) {
    const since = options.sinceMs ?? Date.now() - 30 * 24 * 60 * 60 * 1000;
    const limit = options.limit ?? 1000;
    const assets: PhotoAsset[] = [];
    for (const entry of store.values()) {
      if (entry.createdAt < since) continue;
      assets.push({
        id: entry.id,
        createdAt: entry.createdAt,
        latitude: entry.latitude,
        longitude: entry.longitude,
        width: entry.width,
        height: entry.height,
        mimeType: entry.file.type || 'image/jpeg',
      });
    }
    assets.sort((a, b) => b.createdAt - a.createdAt);
    return { assets: assets.slice(0, limit) };
  },
  async getThumbnail({ id, size = 256 }) {
    const entry = store.get(id);
    if (!entry) throw new Error(`Asset not found: ${id}`);
    const { base64 } = await resizeToBase64(entry.file, size);
    return { base64 };
  },
  async getAssetData({ id, maxEdge = 2048 }) {
    const entry = store.get(id);
    if (!entry) throw new Error(`Asset not found: ${id}`);
    const { base64, width, height } = await resizeToBase64(entry.file, maxEdge);
    return { base64, mimeType: 'image/jpeg', width, height };
  },
};

export function getWebAssetFile(id: string): File | null {
  return store.get(id)?.file ?? null;
}
