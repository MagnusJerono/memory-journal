/**
 * Photo Library plugin — read-only access to the device's photo gallery.
 *
 * Implementations:
 *  - Web (browser / Capacitor PWA): file picker + exifr metadata extraction.
 *  - iOS (native): Photos framework (PHAsset) — see ios/App/App/PhotoLibraryPlugin.swift.
 *  - Android (native): MediaStore.Images — see android/.../PhotoLibraryPlugin.java.
 */

export type PhotoPermissionState = 'granted' | 'limited' | 'denied' | 'prompt';

export interface PhotoAsset {
  /** Stable identifier for the asset on the host platform. */
  id: string;
  /** Wall-clock timestamp the photo was created (ms since epoch). */
  createdAt: number;
  /** Latitude in degrees, if available. */
  latitude?: number;
  /** Longitude in degrees, if available. */
  longitude?: number;
  /** Pixel width of the original asset. */
  width?: number;
  /** Pixel height of the original asset. */
  height?: number;
  /** MIME type when known (e.g. image/jpeg). */
  mimeType?: string;
}

export interface ListAssetsOptions {
  /** Inclusive lower bound for createdAt (ms since epoch). Defaults to 30 days ago. */
  sinceMs?: number;
  /** Maximum number of assets to return. Defaults to 1000. */
  limit?: number;
}

export interface PhotoLibraryPlugin {
  /** Returns the current authorization status without prompting. */
  checkPermission(): Promise<{ status: PhotoPermissionState }>;
  /** Prompts the user for photo library access. */
  requestPermission(): Promise<{ status: PhotoPermissionState }>;
  /** Returns metadata for assets matching the given filter, sorted by createdAt descending. */
  listAssets(options?: ListAssetsOptions): Promise<{ assets: PhotoAsset[] }>;
  /** Returns a base64-encoded JPEG thumbnail for the given asset id. */
  getThumbnail(options: { id: string; size?: number }): Promise<{ base64: string }>;
  /** Returns a base64-encoded JPEG of the full-resolution asset (resized to maxEdge). */
  getAssetData(options: { id: string; maxEdge?: number }): Promise<{
    base64: string;
    mimeType: string;
    width: number;
    height: number;
  }>;
}
