import { describe, it, expect } from 'vitest';
import { clusterMoments, haversineKm } from '@/lib/moments';
import type { PhotoAsset } from '@/lib/photo-library';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function asset(id: string, ts: number, lat?: number, lon?: number): PhotoAsset {
  return { id, createdAt: ts, latitude: lat, longitude: lon };
}

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(48.85, 2.35, 48.85, 2.35)).toBeCloseTo(0, 4);
  });

  it('matches Paris–Berlin distance to within 5 km', () => {
    const km = haversineKm(48.85, 2.35, 52.52, 13.4);
    expect(km).toBeGreaterThan(870);
    expect(km).toBeLessThan(890);
  });
});

describe('clusterMoments', () => {
  it('returns no clusters for fewer than minSize photos', () => {
    const photos = [asset('a', 1000), asset('b', 2000)];
    expect(clusterMoments(photos, { minSize: 3 })).toEqual([]);
  });

  it('keeps photos within a 4h window in one cluster', () => {
    const base = Date.parse('2026-04-12T10:00:00Z');
    const photos = [
      asset('a', base),
      asset('b', base + 30 * 60 * 1000),
      asset('c', base + 90 * 60 * 1000),
      asset('d', base + 3 * HOUR),
    ];
    const clusters = clusterMoments(photos, { minSize: 3 });
    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(4);
    expect(clusters[0].assetIds).toEqual(['a', 'b', 'c', 'd']);
  });

  it('splits when the time gap exceeds the threshold', () => {
    const base = Date.parse('2026-04-12T10:00:00Z');
    const photos = [
      asset('a', base),
      asset('b', base + HOUR),
      asset('c', base + 2 * HOUR),
      asset('d', base + 2 * DAY), // big gap
      asset('e', base + 2 * DAY + HOUR),
      asset('f', base + 2 * DAY + 2 * HOUR),
    ];
    const clusters = clusterMoments(photos, { minSize: 3 });
    expect(clusters).toHaveLength(2);
    expect(clusters[0].assetIds).toEqual(['a', 'b', 'c']);
    expect(clusters[1].assetIds).toEqual(['d', 'e', 'f']);
  });

  it('splits on spatial gap > 2 km when both points have GPS', () => {
    const base = Date.parse('2026-04-12T10:00:00Z');
    const photos = [
      asset('a', base + 0 * HOUR, 48.85, 2.35),
      asset('b', base + 1 * HOUR, 48.86, 2.36),
      asset('c', base + 2 * HOUR, 48.86, 2.36),
      // Same evening but ~10 km away — different neighbourhood.
      asset('d', base + 3 * HOUR, 48.95, 2.36),
      asset('e', base + 3.5 * HOUR, 48.95, 2.36),
      asset('f', base + 3.7 * HOUR, 48.95, 2.36),
    ];
    const clusters = clusterMoments(photos, { minSize: 3 });
    expect(clusters).toHaveLength(2);
    expect(clusters[0].count).toBe(3);
    expect(clusters[1].count).toBe(3);
  });

  it('drops photos from the dismissed set before clustering', () => {
    const base = Date.parse('2026-04-12T10:00:00Z');
    const photos = [
      asset('a', base),
      asset('b', base + HOUR),
      asset('c', base + 2 * HOUR),
      asset('d', base + 3 * HOUR),
    ];
    const clusters = clusterMoments(photos, {
      minSize: 3,
      dismissedAssetIds: new Set(['a', 'b']),
    });
    expect(clusters).toHaveLength(0);
  });

  it('produces a stable cluster id for the same asset ids', () => {
    const base = 1_700_000_000_000;
    const photos = [asset('x', base), asset('y', base + HOUR), asset('z', base + 2 * HOUR)];
    const a = clusterMoments(photos, { minSize: 3 });
    const b = clusterMoments(photos, { minSize: 3 });
    expect(a[0].id).toEqual(b[0].id);
  });

  it('chooses the middle photo as the cover', () => {
    const base = 1_700_000_000_000;
    const photos = [
      asset('a', base),
      asset('b', base + HOUR),
      asset('c', base + 2 * HOUR),
      asset('d', base + 3 * HOUR),
      asset('e', base + 4 * HOUR),
    ];
    const [cluster] = clusterMoments(photos, { minSize: 3 });
    expect(cluster.coverAssetId).toBe('c');
  });
});
