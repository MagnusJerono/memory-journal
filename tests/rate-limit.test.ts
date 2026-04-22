import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { inferTier } from '../api/_lib/rate-limit.js';

describe('inferTier', () => {
  const original = process.env.PREMIUM_USER_IDS;

  beforeEach(() => {
    delete process.env.PREMIUM_USER_IDS;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.PREMIUM_USER_IDS;
    else process.env.PREMIUM_USER_IDS = original;
  });

  it('respects explicit premium header', () => {
    expect(inferTier('ip:1.2.3.4', 'premium')).toBe('premium');
  });

  it('falls back to free by default', () => {
    expect(inferTier('ip:1.2.3.4')).toBe('free');
  });

  it('promotes identities listed in PREMIUM_USER_IDS', () => {
    process.env.PREMIUM_USER_IDS = 'alice, bob ,carol';
    expect(inferTier('bob')).toBe('premium');
    expect(inferTier('dave')).toBe('free');
  });
});
