import { extractUser } from './_lib/auth.js';

const MAX_MESSAGE = 4000;

function supabaseConfig(): { url: string; serviceKey: string } | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = (req.body || {}) as { message?: string; context?: Record<string, unknown> };
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    res.status(400).json({ error: 'message required' });
    return;
  }
  if (message.length > MAX_MESSAGE) {
    res.status(400).json({ error: `message too long (max ${MAX_MESSAGE})` });
    return;
  }

  const authUser = await extractUser(req);
  const config = supabaseConfig();

  // No-op store when Supabase is not configured — still return success so the
  // client UX stays snappy during local dev.
  if (!config) {
    console.log('[feedback] (no supabase) from', authUser?.id ?? 'anon', message.slice(0, 200));
    res.status(200).json({ ok: true });
    return;
  }

  const forwardedFor = (req.headers?.['x-forwarded-for'] as string | undefined) ?? '';
  const ip = forwardedFor.split(',')[0]?.trim() || req.socket?.remoteAddress || null;

  const row = {
    user_id: authUser?.id ?? null,
    user_email: authUser?.email ?? null,
    message,
    context: body.context ?? null,
    ip,
    user_agent: (req.headers?.['user-agent'] as string | undefined) ?? null,
  };

  try {
    const resp = await fetch(`${config.url}/rest/v1/feedback`, {
      method: 'POST',
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!resp.ok && resp.status !== 201) {
      const text = await resp.text().catch(() => '');
      console.error('[feedback] supabase insert failed', resp.status, text);
      res.status(502).json({ error: 'could not record feedback' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[feedback] insert threw', err);
    res.status(502).json({ error: 'could not record feedback' });
  }
}
