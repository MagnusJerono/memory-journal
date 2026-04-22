import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockRequest, createMockResponse } from './_mock-res';

// These tests exercise the entry-level guards: method check, payload size,
// missing prompt, and auth enforcement. They deliberately avoid reaching
// OpenAI by triggering earlier rejections.
//
// Several of the guards read process.env at module load time, so env-sensitive
// cases reset the module cache and re-import the handler.

async function loadHandler() {
  const mod = await import('../api/llm/complete.js');
  return mod.default as (req: any, res: any) => Promise<void>;
}

describe('POST /api/llm/complete guards', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.REQUIRE_AUTH_FOR_LLM;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.PREMIUM_USER_IDS;
    delete process.env.MAX_LLM_PROMPT_CHARS;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...envBackup };
    vi.resetModules();
  });

  it('returns 405 for non-POST methods', async () => {
    const handler = await loadHandler();
    const req = createMockRequest({ method: 'GET' });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 413 when body exceeds the byte cap', async () => {
    const handler = await loadHandler();
    const huge = 'x'.repeat(9 * 1024);
    const req = createMockRequest({ method: 'POST', body: { prompt: huge } });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(413);
  });

  it('returns 401 when REQUIRE_AUTH_FOR_LLM is true and no token is provided', async () => {
    process.env.REQUIRE_AUTH_FOR_LLM = 'true';
    const handler = await loadHandler();
    const req = createMockRequest({ method: 'POST', body: { prompt: 'hi' } });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 for an empty prompt (when auth not required)', async () => {
    const handler = await loadHandler();
    const req = createMockRequest({ method: 'POST', body: { prompt: '   ' } });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect((res.body as any).error).toMatch(/missing prompt/i);
  });

  it('returns 400 when prompt exceeds MAX_LLM_PROMPT_CHARS', async () => {
    // Keep request body under the 8KB byte cap so we hit the char-length check.
    process.env.MAX_LLM_PROMPT_CHARS = '100';
    const handler = await loadHandler();
    const req = createMockRequest({ method: 'POST', body: { prompt: 'a'.repeat(200) } });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect((res.body as any).error).toMatch(/too large/i);
  });
});
