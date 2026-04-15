// Persists usage events to Supabase llm_usage_events table.
// Silently logs warnings on failure — never blocks the main request.

type Status = 'success' | 'rate_limited' | 'invalid_input' | 'provider_error' | 'budget_exceeded';

export interface UsageEvent {
  identity: string;
  userId?: string | null;
  tier: 'free' | 'premium';
  model?: string;
  status: Status;
  promptChars?: number;
  completionChars?: number;
  promptTokens?: number;
  completionTokens?: number;
}

// Rough cost estimate for gpt-4o-mini. Adjust if you change default model.
// Source: openai.com/pricing (as of 2025). $0.15/1M input, $0.60/1M output.
const PRICE_PER_1K_INPUT = Number(process.env.OPENAI_PRICE_PER_1K_INPUT ?? 0.00015);
const PRICE_PER_1K_OUTPUT = Number(process.env.OPENAI_PRICE_PER_1K_OUTPUT ?? 0.0006);

function estimateCostUsd(input: number, output: number): number {
  return (input / 1000) * PRICE_PER_1K_INPUT + (output / 1000) * PRICE_PER_1K_OUTPUT;
}

function approxTokens(chars?: number): number {
  // ~4 chars per token for English.
  return chars ? Math.ceil(chars / 4) : 0;
}

export async function recordUsageEvent(ev: UsageEvent): Promise<void> {
  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return;

  const promptTokens = ev.promptTokens ?? approxTokens(ev.promptChars);
  const completionTokens = ev.completionTokens ?? approxTokens(ev.completionChars);
  const cost = estimateCostUsd(promptTokens, completionTokens);

  const row = {
    identity: ev.identity,
    user_id: ev.userId ?? null,
    tier: ev.tier,
    model: ev.model ?? null,
    status: ev.status,
    prompt_chars: ev.promptChars ?? null,
    completion_chars: ev.completionChars ?? null,
    prompt_tokens: promptTokens || null,
    completion_tokens: completionTokens || null,
    estimated_cost_usd: Number.isFinite(cost) ? cost : null,
  };

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/rest/v1/llm_usage_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.warn('[usage-log] insert failed', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('[usage-log] error', err);
  }
}
