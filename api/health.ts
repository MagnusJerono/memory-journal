import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const checks = {
    app: true,
    supabase_url: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
    supabase_anon_key: Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    supabase_service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    openai_key: Boolean(process.env.OPENAI_API_KEY),
    node_env: process.env.NODE_ENV || 'unknown',
    vercel_env: process.env.VERCEL_ENV || 'unknown',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown',
    timestamp: new Date().toISOString(),
  };

  const ok =
    checks.supabase_url &&
    checks.supabase_anon_key &&
    checks.openai_key;

  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    checks,
  });
}
