// Small service-role Supabase REST helper shared by webhook handlers and
// future background jobs. Uses fetch directly to stay on the same lean
// footprint as api/_lib/rate-limit.ts (no @supabase/supabase-js dependency
// in the API layer).

function supabaseBaseUrl(): string | null {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL;
  return url ? url.replace(/\/$/, '') : null;
}

function serviceRoleKey(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    null
  );
}

export interface SupabaseAdminClient {
  restUrl: string;
  key: string;
}

export function getSupabaseAdmin(): SupabaseAdminClient | null {
  const base = supabaseBaseUrl();
  const key = serviceRoleKey();
  if (!base || !key) return null;
  return { restUrl: `${base}/rest/v1`, key };
}

export function requireSupabaseAdmin(): SupabaseAdminClient {
  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error(
      'Supabase service role credentials are not configured ' +
        '(expected SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).',
    );
  }
  return client;
}

type JsonRecord = Record<string, unknown>;

async function request(
  client: SupabaseAdminClient,
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<Response> {
  const { prefer, headers, ...rest } = init;
  return fetch(`${client.restUrl}${path}`, {
    ...rest,
    headers: {
      apikey: client.key,
      Authorization: `Bearer ${client.key}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
      ...(headers ?? {}),
    },
  });
}

/** Update a single row by primary key and return the updated row, if any. */
export async function updateRow<T extends JsonRecord>(
  client: SupabaseAdminClient,
  table: string,
  match: JsonRecord,
  patch: JsonRecord,
): Promise<T | null> {
  const query = Object.entries(match)
    .map(([k, v]) => `${encodeURIComponent(k)}=eq.${encodeURIComponent(String(v))}`)
    .join('&');
  const res = await request(client, `/${table}?${query}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    prefer: 'return=representation',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase update ${table} failed (${res.status}): ${body}`);
  }
  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

/** Fetch a single row matching the filters, or null if not found. */
export async function findRow<T extends JsonRecord>(
  client: SupabaseAdminClient,
  table: string,
  match: JsonRecord,
): Promise<T | null> {
  const query = Object.entries(match)
    .map(([k, v]) => `${encodeURIComponent(k)}=eq.${encodeURIComponent(String(v))}`)
    .join('&');
  const res = await request(client, `/${table}?${query}&limit=1`);
  if (!res.ok) return null;
  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}
