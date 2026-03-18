type UsageEvent = {
  id: string;
  identity: string;
  tier: 'free' | 'premium';
  model: string;
  status: 'success' | 'rate_limited' | 'invalid_input' | 'provider_error';
  promptChars: number;
  estimatedCostUsd: number;
  createdAt: string;
};

const MAX_EVENTS = 2000;
const events: UsageEvent[] = [];

function estimateCostUsd(model: string, promptChars: number): number {
  const estimatedTokens = Math.ceil(promptChars / 4);
  const perMillionInput = model.includes('gpt-4o-mini') ? 0.15 : 2.5;
  return Number(((estimatedTokens / 1_000_000) * perMillionInput).toFixed(6));
}

export function recordUsageEvent(params: {
  identity: string;
  tier: 'free' | 'premium';
  model: string;
  status: UsageEvent['status'];
  promptChars: number;
}): UsageEvent {
  const event: UsageEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    identity: params.identity,
    tier: params.tier,
    model: params.model,
    status: params.status,
    promptChars: params.promptChars,
    estimatedCostUsd: estimateCostUsd(params.model, params.promptChars),
    createdAt: new Date().toISOString(),
  };

  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }

  return event;
}

export function getRecentUsageEvents(limit: number = 100): UsageEvent[] {
  return events.slice(Math.max(0, events.length - limit));
}
