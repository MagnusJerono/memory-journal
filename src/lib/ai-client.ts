type LLMModel = 'gpt-4o' | 'gpt-4o-mini' | string;

import { getCurrentUser } from './auth-client';

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

  try {
    const user = await getCurrentUser();
    if (user?.login) {
      headers['x-user-id'] = user.login;
    }
  } catch {
    // Keep anonymous behavior when auth is unavailable.
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

function hasSparkLLM(): boolean {
  const maybeSpark = (window as Window & { spark?: { llm?: unknown } }).spark;
  return typeof maybeSpark?.llm === 'function';
}

async function requestViaSpark(payload: LLMRequest): Promise<string> {
  const spark = (window as Window & { spark?: { llm?: (prompt: string, model: string, jsonMode?: boolean) => Promise<string> } }).spark;
  if (!spark?.llm) {
    throw new Error('Spark LLM is not available');
  }
  return spark.llm(payload.prompt, payload.model, payload.jsonMode ?? false);
}

export async function requestLLM(payload: LLMRequest): Promise<string> {
  try {
    return await requestViaApi(payload);
  } catch (apiError) {
    if (hasSparkLLM()) {
      return requestViaSpark(payload);
    }
    const message = apiError instanceof Error ? apiError.message : 'Unknown LLM provider error';
    throw new Error(`No AI provider configured. ${message}`);
  }
}

export function parseAIJson<T>(raw: string, context: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`AI returned invalid JSON for ${context}`);
  }
}
