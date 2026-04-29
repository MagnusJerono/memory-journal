// Stripe API key + webhook signing helpers shared by all Stripe-related
// handlers. Kept dependency-free (uses fetch + a small HMAC verifier) to
// match the rest of the api/_lib footprint — adding the full `stripe`
// npm package can come later if we want richer SDK types.

import { createHmac, timingSafeEqual } from 'node:crypto';

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return key;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return secret;
}

export interface StripePriceIds {
  monthly: string;
  annual: string;
}

export function getPremiumPriceIds(): StripePriceIds {
  const monthly = process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '';
  const annual = process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? '';
  if (!monthly || !annual) {
    throw new Error(
      'Stripe premium price IDs are not configured ' +
        '(STRIPE_PRICE_PREMIUM_MONTHLY / STRIPE_PRICE_PREMIUM_ANNUAL).',
    );
  }
  return { monthly, annual };
}

/**
 * Verifies a Stripe webhook signature according to the scheme documented at
 * https://stripe.com/docs/webhooks/signatures. Accepts a tolerance window in
 * seconds to guard against replay attacks (default 5 minutes).
 *
 * `rawBody` MUST be the exact bytes Stripe sent; any JSON round-trip breaks
 * the signature. See api/stripe/webhook.ts for the Vercel config that
 * preserves the raw body.
 */
export function verifyStripeSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined,
  secret: string,
  toleranceSeconds = 300,
): { ok: true } | { ok: false; reason: string } {
  if (!signatureHeader) return { ok: false, reason: 'missing signature header' };

  const parts = signatureHeader.split(',').reduce<Record<string, string[]>>(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (!k || !v) return acc;
      (acc[k] ||= []).push(v);
      return acc;
    },
    {},
  );

  const timestamp = parts['t']?.[0];
  const signatures = parts['v1'] ?? [];
  if (!timestamp || signatures.length === 0) {
    return { ok: false, reason: 'malformed signature header' };
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum)) {
    return { ok: false, reason: 'invalid timestamp' };
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tsNum) > toleranceSeconds) {
    return { ok: false, reason: 'timestamp outside tolerance window' };
  }

  const payload =
    typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  const anyMatch = signatures.some((candidate) => {
    let candidateBuf: Buffer;
    try {
      candidateBuf = Buffer.from(candidate, 'hex');
    } catch {
      return false;
    }
    if (candidateBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(candidateBuf, expectedBuf);
  });

  if (!anyMatch) return { ok: false, reason: 'signature mismatch' };
  return { ok: true };
}
