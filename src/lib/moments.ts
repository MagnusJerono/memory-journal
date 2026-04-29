import type { PhotoAsset } from './photo-library';

/**
 * On-device clustering of photos into "moments" using only metadata
 * (timestamps + GPS). No image bytes are read here — keep this module pure
 * so it stays cheap and easy to test.
 */

export interface MomentCluster {
  /** Stable hash derived from the asset ids — used as a cache key. */
  id: string;
  /** Asset ids in chronological order (oldest first). */
  assetIds: string[];
  /** Earliest createdAt in the cluster (ms). */
  startMs: number;
  /** Latest createdAt in the cluster (ms). */
  endMs: number;
  /** Median latitude when at least one asset has a location. */
  latitude?: number;
  /** Median longitude when at least one asset has a location. */
  longitude?: number;
  /** Asset id chosen as the cover image. */
  coverAssetId: string;
  /** Number of assets in the cluster. */
  count: number;
}

export interface ClusterOptions {
  /** Time gap that splits clusters, in ms. Default: 4 hours. */
  timeGapMs?: number;
  /** Spatial gap that splits clusters, in km. Default: 2 km. */
  spatialGapKm?: number;
  /** Minimum number of photos for a cluster to be returned. Default: 3. */
  minSize?: number;
  /** Asset ids to drop before clustering (e.g. user-dismissed moments). */
  dismissedAssetIds?: ReadonlySet<string>;
}

const DEFAULT_OPTS: Required<Omit<ClusterOptions, 'dismissedAssetIds'>> = {
  timeGapMs: 4 * 60 * 60 * 1000,
  spatialGapKm: 2,
  minSize: 3,
};

/** Great-circle distance in kilometres. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function hashIds(ids: string[]): string {
  // Tiny non-cryptographic FNV-1a — collision risk is irrelevant for caching.
  let h = 0x811c9dc5;
  for (const id of ids) {
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    h ^= 0x2c; // delimiter
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * Group assets by time-gap and spatial-gap. Assets without a location join the
 * current cluster purely on time (they don't break a spatial run).
 */
export function clusterMoments(
  assets: readonly PhotoAsset[],
  options: ClusterOptions = {},
): MomentCluster[] {
  const opts = { ...DEFAULT_OPTS, ...options };
  const dismissed = options.dismissedAssetIds ?? new Set<string>();

  const filtered = assets
    .filter(a => !dismissed.has(a.id))
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt);

  const clusters: PhotoAsset[][] = [];
  let current: PhotoAsset[] = [];
  let lastTs = 0;
  let lastLat: number | undefined;
  let lastLon: number | undefined;

  for (const asset of filtered) {
    if (current.length === 0) {
      current.push(asset);
      lastTs = asset.createdAt;
      lastLat = asset.latitude;
      lastLon = asset.longitude;
      continue;
    }

    const dt = asset.createdAt - lastTs;
    let split = dt > opts.timeGapMs;

    if (
      !split &&
      typeof asset.latitude === 'number' &&
      typeof asset.longitude === 'number' &&
      typeof lastLat === 'number' &&
      typeof lastLon === 'number'
    ) {
      const distance = haversineKm(lastLat, lastLon, asset.latitude, asset.longitude);
      if (distance > opts.spatialGapKm) split = true;
    }

    if (split) {
      clusters.push(current);
      current = [asset];
    } else {
      current.push(asset);
    }
    lastTs = asset.createdAt;
    if (typeof asset.latitude === 'number') lastLat = asset.latitude;
    if (typeof asset.longitude === 'number') lastLon = asset.longitude;
  }
  if (current.length > 0) clusters.push(current);

  return clusters
    .filter(group => group.length >= opts.minSize)
    .map(group => buildCluster(group));
}

function buildCluster(group: PhotoAsset[]): MomentCluster {
  const assetIds = group.map(a => a.id);
  const lats = group.map(a => a.latitude).filter((v): v is number => typeof v === 'number');
  const lons = group.map(a => a.longitude).filter((v): v is number => typeof v === 'number');
  const cover = group[Math.floor(group.length / 2)] ?? group[0];
  return {
    id: hashIds(assetIds),
    assetIds,
    startMs: group[0].createdAt,
    endMs: group[group.length - 1].createdAt,
    latitude: lats.length > 0 ? median(lats) : undefined,
    longitude: lons.length > 0 ? median(lons) : undefined,
    coverAssetId: cover.id,
    count: group.length,
  };
}
