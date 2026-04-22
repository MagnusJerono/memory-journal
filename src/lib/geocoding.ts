export interface GeocodingResult {
  name: string;
  displayName: string;
  type: 'city' | 'neighborhood' | 'landmark' | 'venue' | 'country' | 'region' | 'address';
  lat: number;
  lon: number;
  importance: number;
  country?: string;
  city?: string;
  state?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
  type: string;
  class: string;
  address?: {
    country?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    county?: string;
    neighbourhood?: string;
    suburb?: string;
    road?: string;
    tourism?: string;
    amenity?: string;
    building?: string;
  };
  name?: string;
}

function mapNominatimType(osmClass: string, osmType: string): GeocodingResult['type'] {
  if (osmClass === 'place') {
    if (['city', 'town', 'village', 'hamlet'].includes(osmType)) return 'city';
    if (['country', 'state', 'region'].includes(osmType)) return 'country';
    if (['suburb', 'neighbourhood', 'quarter', 'borough'].includes(osmType)) return 'neighborhood';
  }
  if (osmClass === 'boundary' && osmType === 'administrative') return 'region';
  if (osmClass === 'tourism' || ['attraction', 'monument', 'museum', 'artwork', 'viewpoint'].includes(osmType)) return 'landmark';
  if (osmClass === 'amenity' || ['restaurant', 'cafe', 'bar', 'hotel', 'shop'].includes(osmType)) return 'venue';
  if (osmClass === 'highway' || osmType === 'residential') return 'address';
  return 'landmark';
}

function extractBestName(result: NominatimResult): string {
  if (result.name && result.name.length > 0) {
    return result.name;
  }
  
  const addr = result.address;
  if (addr) {
    if (addr.tourism) return addr.tourism;
    if (addr.amenity) return addr.amenity;
    if (addr.building) return addr.building;
    if (addr.neighbourhood) return addr.neighbourhood;
    if (addr.suburb) return addr.suburb;
    if (addr.city) return addr.city;
    if (addr.town) return addr.town;
    if (addr.village) return addr.village;
  }
  
  const parts = result.display_name.split(',');
  return parts[0].trim();
}

function formatDisplayName(result: NominatimResult): string {
  const addr = result.address;
  if (!addr) return result.display_name;
  
  const parts: string[] = [];
  const name = extractBestName(result);
  
  if (name) parts.push(name);
  
  const city = addr.city || addr.town || addr.village;
  if (city && city !== name) parts.push(city);
  
  if (addr.state && addr.state !== city && addr.state !== name) {
    parts.push(addr.state);
  }
  
  if (addr.country && parts.length < 3) {
    parts.push(addr.country);
  }
  
  return parts.slice(0, 3).join(', ');
}

/**
 * Thrown when the Nominatim geocoding service is unreachable or returns a
 * non-2xx status. Callers can catch this to surface a user-facing toast.
 */
export class GeocodingServiceError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'GeocodingServiceError';
  }
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  let response: Response;
  try {
    const encodedQuery = encodeURIComponent(query.trim());
    response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&addressdetails=1&limit=8&namedetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TightlyMemoryJournal/1.0'
        }
      }
    );
  } catch (error) {
    console.error('Geocoding network error:', error);
    throw new GeocodingServiceError('Location service unreachable', error);
  }

  if (!response.ok) {
    console.error('Geocoding request failed:', response.status);
    throw new GeocodingServiceError(`Location service returned ${response.status}`);
  }

  const data: NominatimResult[] = await response.json();

  const results: GeocodingResult[] = data.map(item => ({
    name: extractBestName(item),
    displayName: formatDisplayName(item),
    type: mapNominatimType(item.class, item.type),
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    importance: item.importance,
    country: item.address?.country,
    city: item.address?.city || item.address?.town || item.address?.village,
    state: item.address?.state
  }));

  const seen = new Set<string>();
  return results.filter(r => {
    const key = r.displayName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  let response: Response;
  try {
    response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=16`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TightlyMemoryJournal/1.0'
        }
      }
    );
  } catch (error) {
    console.error('Reverse geocoding network error:', error);
    throw new GeocodingServiceError('Location service unreachable', error);
  }

  if (!response.ok) {
    console.error('Reverse geocoding failed:', response.status);
    throw new GeocodingServiceError(`Location service returned ${response.status}`);
  }

  const data: NominatimResult = await response.json();
  if (!data || typeof data.lat !== 'string' || typeof data.lon !== 'string') {
    return null;
  }

  return {
    name: extractBestName(data),
    displayName: formatDisplayName(data),
    type: mapNominatimType(data.class, data.type),
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon),
    importance: data.importance || 0.5,
    country: data.address?.country,
    city: data.address?.city || data.address?.town || data.address?.village,
    state: data.address?.state
  };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  });
}

export async function getCurrentLocation(): Promise<GeocodingResult | null> {
  // Allow GeolocationPositionError and GeocodingServiceError to propagate so
  // callers can show distinct user-visible messages.
  const position = await getCurrentPosition();
  return reverseGeocode(position.coords.latitude, position.coords.longitude);
}
