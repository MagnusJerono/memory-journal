/**
 * Lightweight client-side tracker for AI quota state.
 *
 * The serverless LLM endpoint returns rate-limit headers on every response
 * (success or 429). We stash those here so the UI can show remaining quota
 * in settings and surface a helpful toast on 429.
 */

export interface QuotaSnapshot {
  tier: 'free' | 'premium' | string;
  remaining10m: number | null;
  remainingDay: number | null;
  retryAfterSeconds: number | null;
  updatedAt: number;
}

type Listener = (snapshot: QuotaSnapshot) => void;

let current: QuotaSnapshot = {
  tier: 'free',
  remaining10m: null,
  remainingDay: null,
  retryAfterSeconds: null,
  updatedAt: 0,
};

const listeners = new Set<Listener>();

export function getQuota(): QuotaSnapshot {
  return current;
}

export function subscribeQuota(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseIntOrNull(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function recordQuotaFromHeaders(headers: Headers): void {
  const next: QuotaSnapshot = {
    tier: headers.get('x-ratelimit-tier') ?? current.tier,
    remaining10m: parseIntOrNull(headers.get('x-ratelimit-remaining-10m')) ?? current.remaining10m,
    remainingDay: parseIntOrNull(headers.get('x-ratelimit-remaining-day')) ?? current.remainingDay,
    retryAfterSeconds: parseIntOrNull(headers.get('retry-after')),
    updatedAt: Date.now(),
  };
  current = next;
  for (const l of listeners) l(next);
}

export class RateLimitError extends Error {
  retryAfterSeconds: number | null;
  remaining10m: number | null;
  remainingDay: number | null;
  tier: string;
  constructor(message: string, info: {
    retryAfterSeconds: number | null;
    remaining10m: number | null;
    remainingDay: number | null;
    tier: string;
  }) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = info.retryAfterSeconds;
    this.remaining10m = info.remaining10m;
    this.remainingDay = info.remainingDay;
    this.tier = info.tier;
  }
}

export function formatRetryAfter(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return 'a moment';
  if (seconds < 60) return `${Math.ceil(seconds)} seconds`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  return `${Math.ceil(seconds / 3600)} hours`;
}
