import { v4 as uuid } from 'uuid';
import { supabase } from './supabase';

const BUCKET = 'journal-photos';
const MAX_EDGE = 2048;
const QUALITY = 0.85;
const SIGNED_URL_TTL = 60 * 60; // 1 hour

export interface UploadedPhoto {
  storage_path: string;
  width: number;
  height: number;
  bytes: number;
}

/** Resize an image File down to MAX_EDGE on its longest side and re-encode as JPEG. */
export async function resizeImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    // Fall back to original if decoding fails (e.g. HEIC on an unsupported browser).
    return { blob: file, width: 0, height: 0 };
  }
  const { width: sw, height: sh } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(sw, sh));
  const width = Math.round(sw * scale);
  const height = Math.round(sh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      QUALITY
    );
  });
  return { blob, width, height };
}

/** Upload one photo for an entry; returns the canonical storage path. */
export async function uploadEntryPhoto(
  userId: string,
  entryId: string,
  file: File
): Promise<UploadedPhoto> {
  if (!supabase) throw new Error('Supabase client not configured');
  const { blob, width, height } = await resizeImage(file);
  const fileName = `${uuid()}.jpg`;
  const storage_path = `${userId}/${entryId}/${fileName}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storage_path, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false });
  if (error) throw error;
  return { storage_path, width, height, bytes: blob.size };
}

/** Sign a storage path for one hour. */
export async function getSignedPhotoUrl(storage_path: string): Promise<string> {
  if (!supabase) return '';
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storage_path, SIGNED_URL_TTL);
  if (error || !data) return '';
  return data.signedUrl;
}

/** Sign many paths in parallel, returning a map of path -> URL (empty string on failure). */
export async function getSignedPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  if (!supabase || paths.length === 0) return {};
  const unique = Array.from(new Set(paths));
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const row of data) {
    if (row.path && row.signedUrl) out[row.path] = row.signedUrl;
  }
  return out;
}

/** Remove objects from storage; errors are logged but not thrown so cleanup is best-effort. */
export async function deletePhotos(paths: string[]): Promise<void> {
  if (!supabase || paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.warn('Storage cleanup failed', error);
}
