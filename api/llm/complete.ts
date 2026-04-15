type RequestBody = {
  prompt?: string;
  model?: string;
  jsonMode?: boolean;
};

const MAX_INPUT_BYTES = 8 * 1024; // 8KB per request

function byteSize(s: string): number {
  return new TextEncoder().encode(s).length;
}

import { extractUser } from '../_lib/auth.js';
import { checkAndConsumeRateLimit, inferTier } from '../_lib/rate-limit.js';
import { recordUsageEvent } from '../_lib/usage-log.js';

type ChatResponse = {
  choices?: Array<{ 
    message?: {
      content?: string;
    };
  }>; 
};

const MAX_PROMPT_CHARS = Number(process.env.MAX_LLM_PROMPT_CHARS ?? 12000);
const REQUIRE_AUTH_FOR_LLM = process.env.REQUIRE_AUTH_FOR_LLM === 'true';

function normalizeIpIdentity(req: any): string {
  const forwardedFor = (req.headers?.['x-forwarded-for'] as string | undefined) ?? ''; 
  const firstForwarded = forwardedFor.split(',')[0]?.trim(); 
  const ip = firstForwarded || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
  return `ip:${ip}`.trim().toLowerCase().slice(0, 128);
}

function getExplicitTier(req: any): string | undefined {
  const tierHeader = req.headers?.['x-user-tier'];
  return typeof tierHeader === 'string' ? tierHeader : undefined;
}

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return key;
}

export default async function handler(req: any, res: any) {
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? '');
    if (byteSize(raw) > MAX_INPUT_BYTES) {
      return res.status(413).json({ error: 'Request body too large' });
    }
  } catch { /* ignore */ }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authUser = await extractUser(req);

    if (REQUIRE_AUTH_FOR_LLM && !authUser) {
      res.status(401).json({ error: 'Authentication required for AI requests' });
      return;
    }

    // Use the authenticated identity when available; fall back to IP for anonymous rate limiting.
    const identity = authUser ? authUser.id : normalizeIpIdentity(req);
    const tier = inferTier(identity, getExplicitTier(req));
    const limit = checkAndConsumeRateLimit(identity, tier);

    res.setHeader('X-RateLimit-Tier', tier);
    res.setHeader('X-RateLimit-Remaining-10m', String(limit.remaining10m));
    res.setHeader('X-RateLimit-Remaining-Day', String(limit.remainingDay));

    if (!limit.allowed) {
      if (limit.retryAfterSeconds) {
        res.setHeader('Retry-After', String(limit.retryAfterSeconds));
      }
      recordUsageEvent({
        identity,
        tier,
        model: 'unknown',
        status: 'rate_limited',
        promptChars: 0,
      });
      res.status(429).json({
        error: 'Rate limit exceeded',
        reason: limit.reason,
        retryAfterSeconds: limit.retryAfterSeconds,
        remaining10m: limit.remaining10m,
        remainingDay: limit.remainingDay,
        tier,
      });
      return;
    }

    const body = (req.body || {}) as RequestBody;
    const prompt = body.prompt?.trim();
    const model = body.model?.trim() || 'gpt-4o-mini';

    if (!prompt) {
      recordUsageEvent({
        identity,
        tier,
        model,
        status: 'invalid_input',
        promptChars: 0,
      });
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    if (prompt.length > MAX_PROMPT_CHARS) {
      recordUsageEvent({
        identity,
        tier,
        model,
        status: 'invalid_input',
        promptChars: prompt.length,
      });
      res.status(400).json({
        error: 'Prompt too large',
        maxPromptChars: MAX_PROMPT_CHARS,
      });
      return;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getOpenAIKey()}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: body.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      recordUsageEvent({
        identity,
        tier,
        model,
        status: 'provider_error',
        promptChars: prompt.length,
      });
      res.status(response.status).json({ error: 'OpenAI request failed', details: errorText });
      return;
    }

    const data = (await response.json()) as ChatResponse;
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      recordUsageEvent({
        identity,
        tier,
        model,
        status: 'provider_error',
        promptChars: prompt.length,
      });
      res.status(502).json({ error: 'OpenAI returned empty content' });
      return;
    }

    const usage = recordUsageEvent({
      identity,
      tier,
      model,
      status: 'success',
      promptChars: prompt.length,
    });

    res.status(200).json({ text, usage: { estimatedCostUsd: usage.estimatedCostUsd } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    res.status(500).json({ error: message });
  }
}