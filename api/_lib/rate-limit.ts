type UserTier = 'free' | 'premium';

interface LimitWindow {
  requests: number;
  startedAt: number;
}

interface IdentityState {
  tenMinute: LimitWindow;
  day: LimitWindow;
}

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

const state = new Map<string, IdentityState>();

function getNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }
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

function createWindow(now: number): LimitWindow {
  return { requests: 0, startedAt: now };
}

function getOrCreateState(identity: string, now: number): IdentityState {
  const existing = state.get(identity);
  if (existing) {
    return existing;
  }

  const next: IdentityState = {
    tenMinute: createWindow(now),
    day: createWindow(now),
  };
  state.set(identity, next);
  return next;
}

function maybeResetWindow(window: LimitWindow, windowMs: number, now: number): void {
  if (now - window.startedAt >= windowMs) {
    window.startedAt = now;
    window.requests = 0;
  }
}

export function inferTier(identity: string, explicitTier?: string): UserTier {
  if (explicitTier === 'premium') {
    return 'premium';
  }

  const premiumIdsRaw = process.env.PREMIUM_USER_IDS ?? '';
  const premiumIds = premiumIdsRaw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return premiumIds.includes(identity) ? 'premium' : 'free';
}

export function checkAndConsumeRateLimit(identity: string, tier: UserTier): RateLimitResult {
  const now = Date.now();
  const limits = getLimits(tier);
  const entry = getOrCreateState(identity, now);

  maybeResetWindow(entry.tenMinute, TEN_MINUTES_MS, now);
  maybeResetWindow(entry.day, DAY_MS, now);

  if (entry.tenMinute.requests >= limits.max10m) {
    const retryAfterSeconds = Math.max(1, Math.ceil((TEN_MINUTES_MS - (now - entry.tenMinute.startedAt)) / 1000));
    return {
      allowed: false,
      reason: '10-minute limit exceeded',
      retryAfterSeconds,
      remaining10m: 0,
      remainingDay: Math.max(0, limits.maxDay - entry.day.requests),
      tier,
    };
  }

  if (entry.day.requests >= limits.maxDay) {
    const retryAfterSeconds = Math.max(1, Math.ceil((DAY_MS - (now - entry.day.startedAt)) / 1000));
    return {
      allowed: false,
      reason: 'daily limit exceeded',
      retryAfterSeconds,
      remaining10m: Math.max(0, limits.max10m - entry.tenMinute.requests),
      remainingDay: 0,
      tier,
    };
  }

  entry.tenMinute.requests += 1;
  entry.day.requests += 1;

  return {
    allowed: true,
    remaining10m: Math.max(0, limits.max10m - entry.tenMinute.requests),
    remainingDay: Math.max(0, limits.maxDay - entry.day.requests),
    tier,
  };
}
