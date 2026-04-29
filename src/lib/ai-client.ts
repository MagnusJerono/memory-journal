type LLMModel = 'gpt-4o' | 'gpt-4o-mini' | string;

import { getAuthToken } from './auth-client';
import { RateLimitError, recordQuotaFromHeaders } from './ai-quota';

interface LLMRequest {
  prompt: string;
  model: LLMModel;
  jsonMode?: boolean;
}

interface LLMApiResponse {
  text?: string;
  output?: string;
  response?: string;
}

const DEFAULT_LLM_ENDPOINT = '/api/llm/complete';

async function buildRequestHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const tier = window.localStorage.getItem('tightly-user-tier');
    if (tier === 'premium') {
      headers['x-user-tier'] = 'premium';
    }
  } catch {
    // Ignore storage access failures.
  }

  return headers;
}

function resolveEndpoint(): string {
  const envEndpoint = import.meta.env.VITE_LLM_API_ENDPOINT as string | undefined;
  return envEndpoint && envEndpoint.trim().length > 0 ? envEndpoint : DEFAULT_LLM_ENDPOINT;
}

async function requestViaApi(payload: LLMRequest): Promise<string> {
  const headers = await buildRequestHeaders();
  const response = await fetch(resolveEndpoint(), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  recordQuotaFromHeaders(response.headers);

  if (response.status === 429) {
    const body = await response.json().catch(() => ({} as Record<string, unknown>));
    throw new RateLimitError('AI rate limit reached', {
      retryAfterSeconds:
        typeof (body as { retryAfterSeconds?: unknown }).retryAfterSeconds === 'number'
          ? (body as { retryAfterSeconds: number }).retryAfterSeconds
          : Number(response.headers.get('retry-after')) || null,
      remaining10m:
        typeof (body as { remaining10m?: unknown }).remaining10m === 'number'
          ? (body as { remaining10m: number }).remaining10m
          : null,
      remainingDay:
        typeof (body as { remainingDay?: unknown }).remainingDay === 'number'
          ? (body as { remainingDay: number }).remainingDay
          : null,
      tier:
        typeof (body as { tier?: unknown }).tier === 'string'
          ? (body as { tier: string }).tier
          : response.headers.get('x-ratelimit-tier') ?? 'free',
    });
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`LLM API request failed (${response.status}): ${details}`);
  }

  const data = (await response.json()) as LLMApiResponse;
  const text = data.text ?? data.output ?? data.response;
  if (!text || typeof text !== 'string') {
    throw new Error('LLM API returned an empty response');
  }

  return text;
}

export async function requestLLM(payload: LLMRequest): Promise<string> {
  return requestViaApi(payload);
}

export function parseAIJson<T>(raw: string, context: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`AI returned invalid JSON for ${context}`);
  }
}
