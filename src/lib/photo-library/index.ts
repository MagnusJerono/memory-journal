import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PhotoLibraryPlugin } from './definitions';
import { PhotoLibraryWeb, getWebAssetFile } from './web';

/**
 * Public handle for the native photo-library plugin.
 *
 * On native platforms we register the plugin with Capacitor (it resolves to the
 * Swift / Kotlin implementation). On the web we fall back to a file-picker shim.
 */
export const PhotoLibrary = Capacitor.getPlatform() === 'web'
  ? PhotoLibraryWeb
  : registerPlugin<PhotoLibraryPlugin>('PhotoLibrary', {
      web: () => PhotoLibraryWeb,
    });

export type {
  PhotoAsset,
  PhotoLibraryPlugin,
  PhotoPermissionState,
  ListAssetsOptions,
} from './definitions';

export function base64ToFile(base64: string, name: string, mimeType = 'image/jpeg'): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], name, { type: mimeType });
}

/**
 * Resolve an asset id to a File. On web, returns the underlying picked file.
 * On native, fetches the asset bytes via the plugin and wraps them.
 */
export async function getAssetAsFile(id: string, name = 'photo.jpg'): Promise<File> {
  if (Capacitor.getPlatform() === 'web') {
    const file = getWebAssetFile(id);
    if (file) return file;
  }
  const { base64, mimeType } = await PhotoLibrary.getAssetData({ id });
  return base64ToFile(base64, name, mimeType);
}

/** Convert a thumbnail base64 string to an `<img src>` data URL. */
export function thumbnailDataUrl(base64: string, mimeType = 'image/jpeg'): string {
  return `data:${mimeType};base64,${base64}`;
}
