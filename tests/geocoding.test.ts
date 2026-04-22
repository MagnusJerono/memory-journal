import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeocodingServiceError, reverseGeocode, searchLocations } from '../src/lib/geocoding';

const originalFetch = globalThis.fetch;

describe('geocoding', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Silence expected console.error noise from failure paths.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('searchLocations returns [] for short queries without calling fetch', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as any;
    const results = await searchLocations('a');
    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('searchLocations throws GeocodingServiceError on non-ok response', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('boom', { status: 503 })) as any;
    await expect(searchLocations('Berlin')).rejects.toBeInstanceOf(GeocodingServiceError);
  });

  it('searchLocations throws GeocodingServiceError on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline')) as any;
    await expect(searchLocations('Berlin')).rejects.toBeInstanceOf(GeocodingServiceError);
  });

  it('searchLocations maps and dedupes Nominatim results', async () => {
    const payload = [
      {
        place_id: 1,
        display_name: 'Berlin, Germany',
        lat: '52.52',
        lon: '13.405',
        importance: 0.9,
        type: 'city',
        class: 'place',
        address: { country: 'Germany', city: 'Berlin' },
        name: 'Berlin',
      },
      {
        place_id: 2,
        display_name: 'Berlin, Germany',
        lat: '52.52',
        lon: '13.405',
        importance: 0.8,
        type: 'city',
        class: 'place',
        address: { country: 'Germany', city: 'Berlin' },
        name: 'Berlin',
      },
    ];
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })) as any;
    const results = await searchLocations('Berlin');
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('city');
    expect(results[0].lat).toBeCloseTo(52.52);
  });

  it('reverseGeocode throws GeocodingServiceError on fetch failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline')) as any;
    await expect(reverseGeocode(0, 0)).rejects.toBeInstanceOf(GeocodingServiceError);
  });
});
