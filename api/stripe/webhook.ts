// Stripe webhook endpoint.
//
// Responsibilities:
//   1. Verify the Stripe signature against the raw request body.
//   2. Route events to track-specific handlers:
//        - Premium subscription lifecycle (profiles.tier, subscription_status)
//        - Printed-book one-off payments (book_orders.status, POD submission)
//   3. Be idempotent — Stripe retries delivery. We rely on unique constraints
//      (stripe_subscription_id, stripe_checkout_session_id) to absorb replays.
//
// IMPORTANT: this route MUST receive the raw, unparsed request body. The
// `export const config` below disables Vercel's default JSON body parser.
//
// Handlers for individual events are intentionally NOT implemented in this
// scaffold — they land in Phase 1 (subscription) and Phase 2 (print) of the
// premium + print-journey plan. This file establishes the signature-verified
// entry point so the wiring is review-ready.

import { getStripeWebhookSecret, verifyStripeSignature } from '../_lib/stripe.js';

export const config = {
  api: {
    // Vercel Node runtime: preserve raw body so signature verification works.
    bodyParser: false,
  },
};

async function readRawBody(req: { body?: unknown; [key: string]: unknown }): Promise<string> {
  const body = req.body;
  if (typeof body === 'string') return body;
  if (Buffer.isBuffer(body)) return body.toString('utf8');

  const chunks: Buffer[] = [];
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

interface StripeEventEnvelope {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
  livemode: boolean;
  created: number;
}

export default async function handler(req: {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  [key: string]: unknown;
}, res: {
  status: (code: number) => { json: (body: unknown) => void };
}) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let secret: string;
  try {
    secret = getStripeWebhookSecret();
  } catch (err) {
    console.error('[stripe-webhook] missing webhook secret', err);
    res.status(500).json({ error: 'Webhook not configured' });
    return;
  }

  let rawBody: string;
  try {
    rawBody = await readRawBody(req);
  } catch (err) {
    console.error('[stripe-webhook] failed to read body', err);
    res.status(400).json({ error: 'Unable to read request body' });
    return;
  }

  const signatureHeader = req.headers?.['stripe-signature'] as string | undefined;
  const verification = verifyStripeSignature(rawBody, signatureHeader, secret);
  if (!verification.ok) {
    console.warn('[stripe-webhook] signature rejected:', verification.reason);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  let event: StripeEventEnvelope;
  try {
    event = JSON.parse(rawBody) as StripeEventEnvelope;
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Will dispatch to subscription handler OR print-order handler based
        // on the session `mode` (subscription vs payment).
        console.info('[stripe-webhook] received', event.type, event.id);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
        console.info('[stripe-webhook] received', event.type, event.id);
        break;
      default:
        console.info('[stripe-webhook] ignored event type', event.type);
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error', event.type, err);
    res.status(500).json({ error: 'Handler error' });
    return;
  }

  res.status(200).json({ received: true });
}
