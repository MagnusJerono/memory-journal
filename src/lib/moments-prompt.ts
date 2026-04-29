import { reverseGeocode } from './geocoding';
import { requestLLM, parseAIJson } from './ai-client';
import type { MomentCluster } from './moments';
import type { AppLanguage } from './i18n';

/**
 * LLM-driven prompt generation for photo moments.
 *
 * We never send image bytes — only a plain-text summary derived from cluster
 * metadata (when, where, how many photos). The model returns a short title and
 * a journaling prompt in the user's language.
 */

export interface MomentPrompt {
  title: string;
  prompt: string;
}

const PROMPT_CACHE_KEY = 'moments-prompt-cache:v1';
const GEO_CACHE_KEY = 'moments-geo-cache:v1';
const PROMPT_CACHE_MAX = 200;

interface PromptCacheEntry {
  prompt: MomentPrompt;
  language: AppLanguage;
  generatedAt: number;
}

interface GeoCacheEntry {
  /** Display name for the location (e.g. "Lisbon, Portugal"). */
  name: string | null;
  cachedAt: number;
}

function readJson<T>(key: string): Record<string, T> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeJson<T>(key: string, value: Record<string, T>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded — best-effort cache; ignore.
  }
}

/** Snap coordinates to a ~111m grid so close-by photos hit the same cache row. */
function geoCellKey(lat: number, lon: number): string {
  const round = (v: number) => Math.round(v * 1000) / 1000;
  return `${round(lat).toFixed(3)},${round(lon).toFixed(3)}`;
}

export async function resolvePlaceName(
  lat: number | undefined,
  lon: number | undefined,
): Promise<string | null> {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  const cache = readJson<GeoCacheEntry>(GEO_CACHE_KEY);
  const key = geoCellKey(lat, lon);
  const hit = cache[key];
  if (hit) return hit.name;
  try {
    const result = await reverseGeocode(lat, lon);
    const name = result?.city ?? result?.name ?? result?.country ?? null;
    cache[key] = { name, cachedAt: Date.now() };
    writeJson(GEO_CACHE_KEY, cache);
    return name;
  } catch {
    return null;
  }
}

const LANG_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  pt: 'Portuguese',
  zh: 'Simplified Chinese',
  ja: 'Japanese',
};

function formatDateRange(startMs: number, endMs: number, language: AppLanguage): string {
  const start = new Date(startMs);
  const end = new Date(endMs);
  const fmt = new Intl.DateTimeFormat(language, { dateStyle: 'long' });
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay ? fmt.format(start) : `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function buildPromptInput(
  cluster: MomentCluster,
  placeName: string | null,
  language: AppLanguage,
): string {
  const dateRange = formatDateRange(cluster.startMs, cluster.endMs, language);
  const where = placeName ? ` in ${placeName}` : '';
  const lang = LANG_LABELS[language];
  return [
    `You are helping someone start a journal entry from a moment in their photo library.`,
    `The user took ${cluster.count} photos${where} on ${dateRange}.`,
    `You do not see the photos themselves — write a short, gentle prompt that nudges`,
    `the user to remember what was happening. Avoid invented facts. Stay specific to the place and time.`,
    ``,
    `Reply as a JSON object with exactly two string fields:`,
    `  - "title": 2–5 words, like a chapter heading`,
    `  - "prompt": one or two sentences (max 220 characters), written as a question or invitation`,
    ``,
    `Write everything in ${lang}.`,
  ].join('\n');
}

function readPromptCache(): Record<string, PromptCacheEntry> {
  return readJson<PromptCacheEntry>(PROMPT_CACHE_KEY);
}

function writePromptCache(cache: Record<string, PromptCacheEntry>): void {
  // LRU-ish pruning: keep newest N.
  const entries = Object.entries(cache);
  if (entries.length <= PROMPT_CACHE_MAX) {
    writeJson(PROMPT_CACHE_KEY, cache);
    return;
  }
  entries.sort((a, b) => b[1].generatedAt - a[1].generatedAt);
  writeJson(PROMPT_CACHE_KEY, Object.fromEntries(entries.slice(0, PROMPT_CACHE_MAX)));
}

export function clearMomentsCache(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(PROMPT_CACHE_KEY);
  localStorage.removeItem(GEO_CACHE_KEY);
}

function fallbackPrompt(
  cluster: MomentCluster,
  placeName: string | null,
  language: AppLanguage,
): MomentPrompt {
  const dateRange = formatDateRange(cluster.startMs, cluster.endMs, language);
  const where = placeName ?? '';
  if (language === 'de') {
    return {
      title: where ? where : 'Ein Moment',
      prompt: `Du hast ${cluster.count} Fotos ${where ? `in ${where} ` : ''}am ${dateRange} gemacht. Was ist dir davon geblieben?`,
    };
  }
  return {
    title: where || 'A moment',
    prompt: `You took ${cluster.count} photos${where ? ` in ${where}` : ''} on ${dateRange}. What stayed with you?`,
  };
}

/**
 * Generate (or retrieve from cache) a journaling prompt for the given cluster.
 * Failures fall back to a deterministic local prompt so the UI is always usable.
 */
export async function generateMomentPrompt(
  cluster: MomentCluster,
  language: AppLanguage,
): Promise<MomentPrompt> {
  const cache = readPromptCache();
  const cacheKey = `${cluster.id}:${language}`;
  const cached = cache[cacheKey];
  if (cached && cached.language === language) return cached.prompt;

  const placeName = await resolvePlaceName(cluster.latitude, cluster.longitude);

  let result: MomentPrompt;
  try {
    const text = await requestLLM({
      prompt: buildPromptInput(cluster, placeName, language),
      model: 'gpt-4o-mini',
      jsonMode: true,
    });
    const parsed = parseAIJson<{ title?: unknown; prompt?: unknown }>(text, 'moment-prompt');
    if (typeof parsed.title === 'string' && typeof parsed.prompt === 'string') {
      result = { title: parsed.title.trim(), prompt: parsed.prompt.trim() };
    } else {
      result = fallbackPrompt(cluster, placeName, language);
    }
  } catch {
    result = fallbackPrompt(cluster, placeName, language);
  }

  cache[cacheKey] = { prompt: result, language, generatedAt: Date.now() };
  writePromptCache(cache);
  return result;
}
