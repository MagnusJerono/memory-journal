// Persistent rate limiter backed by Supabase.
// Queries llm_usage_events table for the current windows per identity.
// Falls back to allowing requests if Supabase is unreachable — logs a warning.

type UserTier = 'free' | 'premium';

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
  remaining10m: number;
  remainingDay: number;
  tier: UserTier;
}

const TEN_MINUTES_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_FREE_10M = 10;
const DEFAULT_FREE_DAY = 50;
const DEFAULT_PREMIUM_10M = 60;
const DEFAULT_PREMIUM_DAY = 500;

function getNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getLimits(tier: UserTier) {
  if (tier === 'premium') {
    return {
      max10m: getNumberEnv('PREMIUM_AI_LIMIT_10M', DEFAULT_PREMIUM_10M),
      maxDay: getNumberEnv('PREMIUM_AI_LIMIT_DAY', DEFAULT_PREMIUM_DAY),
    };
  }
  return {
    max10m: getNumberEnv('FREE_AI_LIMIT_10M', DEFAULT_FREE_10M),
    maxDay: getNumberEnv('FREE_AI_LIMIT_DAY', DEFAULT_FREE_DAY),
  };
}

function supabaseRestUrl(): string | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  return url ? url.replace(/\/$/, '') + '/rest/v1' : null;
}

function serviceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

async function countSince(identity: string, sinceMs: number): Promise<number> {
  const base = supabaseRestUrl();
  const key = serviceRoleKey();
  if (!base || !key) return 0; // fail open if misconfigured

  const sinceIso = new Date(Date.now() - sinceMs).toISOString();
  const url =
    `${base}/llm_usage_events` +
    `?select=id&identity=eq.${encodeURIComponent(identity)}` +
    `&status=in.(success,provider_error)` +
    `&created_at=gte.${encodeURIComponent(sinceIso)}`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
    });
    const contentRange = res.headers.get('content-range') || '';
    const match = contentRange.match(/\/(\d+|\*)$/);
    if (match && match[1] !== '*') return Number(match[1]);
    return 0;
  } catch (err) {
    console.warn('[rate-limit] Supabase query failed, failing open', err);
    return 0;
  }
}

export function inferTier(identity: string, explicitTier?: string): UserTier {
  if (explicitTier === 'premium') return 'premium';
  const raw = process.env.PREMIUM_USER_IDS ?? '';
  const premiumIds = raw.split(',').map(v => v.trim()).filter(Boolean);
  return premiumIds.includes(identity) ? 'premium' : 'free';
}

export async function checkRateLimit(identity: string, tier: UserTier): Promise<RateLimitResult> {
  const limits = getLimits(tier);
  const [count10m, countDay] = await Promise.all([
    countSince(identity, TEN_MINUTES_MS),
    countSince(identity, DAY_MS),
  ]);

  if (count10m >= limits.max10m) {
    return {
      allowed: false,
      reason: '10-minute limit exceeded',
      retryAfterSeconds: 60,
      remaining10m: 0,
      remainingDay: Math.max(0, limits.maxDay - countDay),
      tier,
    };
  }
  if (countDay >= limits.maxDay) {
    return {
      allowed: false,
      reason: 'daily limit exceeded',
      retryAfterSeconds: 3600,
      remaining10m: Math.max(0, limits.max10m - count10m),
      remainingDay: 0,
      tier,
    };
  }
  return {
    allowed: true,
    remaining10m: Math.max(0, limits.max10m - count10m - 1),
    remainingDay: Math.max(0, limits.maxDay - countDay - 1),
    tier,
  };
}

// Legacy sync export for backwards compatibility — callers should migrate to checkRateLimit.
export function checkAndConsumeRateLimit(_identity: string, tier: UserTier): RateLimitResult {
  // Sync version is no longer backed by state; returns "allowed" and relies on
  // the DB-backed usage log to enforce limits on subsequent calls.
  // Kept only so existing imports do not break at compile time.
  const limits = getLimits(tier);
  return {
    allowed: true,
    remaining10m: limits.max10m,
    remainingDay: limits.maxDay,
    tier,
  };
}

export async function getMonthlyCostUsd(): Promise<number> {
  const base = supabaseRestUrl();
  const key = serviceRoleKey();
  if (!base || !key) return 0;
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const url =
    `${base}/llm_usage_events` +
    `?select=estimated_cost_usd` +
    `&created_at=gte.${encodeURIComponent(monthStart.toISOString())}`;
  try {
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return 0;
    const rows = (await res.json()) as Array<{ estimated_cost_usd: number | null }>;
    return rows.reduce((sum, r) => sum + (Number(r.estimated_cost_usd) || 0), 0);
  } catch {
    return 0;
  }
}
