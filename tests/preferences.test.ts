import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockRequest, createMockResponse } from './_mock-res';

async function loadHandler() {
  const mod = await import('../api/preferences.js');
  return mod.default as (req: any, res: any) => Promise<void>;
}

describe('/api/preferences (memory store)', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.REQUIRE_AUTH_FOR_PREFERENCES;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...envBackup };
    vi.resetModules();
  });

  it('returns 401 when auth is required and no token is provided', async () => {
    process.env.REQUIRE_AUTH_FOR_PREFERENCES = 'true';
    const handler = await loadHandler();
    const req = createMockRequest({ method: 'GET' });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it('returns default preferences on first GET for a fresh identity', async () => {
    const handler = await loadHandler();
    const req = createMockRequest({ method: 'GET', headers: { 'x-forwarded-for': '203.0.113.1' } });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect((res.body as any).preferences).toMatchObject({
      notifications: true,
      emailUpdates: false,
      autoSave: true,
    });
  });

  it('PUT updates preferences and subsequent GET returns them (within same module instance)', async () => {
    const handler = await loadHandler();
    const headers = { 'x-forwarded-for': '203.0.113.42' };
    const putReq = createMockRequest({
      method: 'PUT',
      headers,
      body: {
        preferences: { notifications: false, emailUpdates: true },
        personalVoiceSample: 'sample text',
      },
    });
    const putRes = createMockResponse();
    await handler(putReq, putRes);
    expect(putRes.statusCode).toBe(200);
    expect((putRes.body as any).preferences.notifications).toBe(false);
    expect((putRes.body as any).preferences.emailUpdates).toBe(true);
    expect((putRes.body as any).personalVoiceSample).toBe('sample text');

    const getReq = createMockRequest({ method: 'GET', headers });
    const getRes = createMockResponse();
    await handler(getReq, getRes);
    expect((getRes.body as any).preferences.notifications).toBe(false);
    expect((getRes.body as any).personalVoiceSample).toBe('sample text');
  });

  it('returns 405 for unsupported methods', async () => {
    const handler = await loadHandler();
    const req = createMockRequest({ method: 'DELETE' });
    const res = createMockResponse();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });
});
