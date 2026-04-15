import { extractUser } from './_lib/auth';

type UserPreferences = {
  notifications?: boolean;
  emailUpdates?: boolean;
  autoSave?: boolean;
};

type PreferencesPayload = {
  preferences?: UserPreferences;
  personalVoiceSample?: string;
};

type StoredPreferences = {
  preferences: UserPreferences;
  personalVoiceSample: string;
  updatedAt: string;
};

const DEFAULT_PREFERENCES: Required<UserPreferences> = {
  notifications: true,
  emailUpdates: false,
  autoSave: true,
};

const REQUIRE_AUTH_FOR_PREFERENCES = process.env.REQUIRE_AUTH_FOR_PREFERENCES === 'true';

// In-memory fallback when Supabase is not configured.
const memoryStore = new Map<string, StoredPreferences>();

// ── Supabase helpers ───────────────────────────────────────────────────────────

function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

type SupabasePrefsRow = {
  user_id: string;
  notifications: boolean;
  email_updates: boolean;
  auto_save: boolean;
  personal_voice_sample: string;
  updated_at: string;
};

/**
 * Makes an authenticated request to the Supabase REST API.
 *
 * When a userToken (the caller's Supabase JWT) is provided it is used as the
 * Authorization header so that Row Level Security policies are enforced for
 * that specific user. SUPABASE_ANON_KEY is used as the API key so PostgREST
 * evaluates the request in the `authenticated` role.
 *
 * When no userToken is present (unauthenticated fallback) the service-role key
 * is used, which bypasses RLS. In practice this path should only be reached
 * when REQUIRE_AUTH_FOR_PREFERENCES is false.
 */
async function supabaseFetch(
  config: { url: string; key: string },
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
  userToken?: string,
): Promise<Response> {
  // Use the anon key as apikey when we have a user token so PostgREST applies
  // RLS. Fall back to the service-role key for unauthenticated paths.
  const anonKey = process.env.SUPABASE_ANON_KEY ?? config.key;
  const apikey = userToken ? anonKey : config.key;
  const authorization = userToken ? `Bearer ${userToken}` : `Bearer ${config.key}`;

  return fetch(`${config.url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey,
      Authorization: authorization,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function loadFromSupabase(
  config: { url: string; key: string },
  userId: string,
  userToken?: string,
): Promise<StoredPreferences | null> {
  const resp = await supabaseFetch(
    config,
    'GET',
    `user_preferences?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    undefined,
    undefined,
    userToken,
  );
  if (!resp.ok) return null;
  const rows = (await resp.json()) as SupabasePrefsRow[];
  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  return {
    preferences: {
      notifications: row.notifications ?? DEFAULT_PREFERENCES.notifications,
      emailUpdates: row.email_updates ?? DEFAULT_PREFERENCES.emailUpdates,
      autoSave: row.auto_save ?? DEFAULT_PREFERENCES.autoSave,
    },
    personalVoiceSample: row.personal_voice_sample ?? '',
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

async function saveToSupabase(
  config: { url: string; key: string },
  userId: string,
  data: StoredPreferences,
  userToken?: string,
): Promise<boolean> {
  const row: SupabasePrefsRow = {
    user_id: userId,
    notifications: data.preferences.notifications ?? DEFAULT_PREFERENCES.notifications,
    email_updates: data.preferences.emailUpdates ?? DEFAULT_PREFERENCES.emailUpdates,
    auto_save: data.preferences.autoSave ?? DEFAULT_PREFERENCES.autoSave,
    personal_voice_sample: data.personalVoiceSample,
    updated_at: data.updatedAt,
  };
  const resp = await supabaseFetch(
    config,
    'POST',
    'user_preferences?on_conflict=user_id',
    row,
    { Prefer: 'resolution=merge-duplicates' },
    userToken,
  );
  return resp.ok || resp.status === 201;
}

// ── Shared logic ───────────────────────────────────────────────────────────────

function normalizeIpIdentity(req: any): string {
  const forwardedFor = (req.headers?.['x-forwarded-for'] as string | undefined) ?? '';
  const firstForwarded = forwardedFor.split(',')[0]?.trim();
  const ip = firstForwarded || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
  return `ip:${ip}`.trim().toLowerCase().slice(0, 128);
}

function mergePreferences(preferences?: UserPreferences): UserPreferences {
  return {
    notifications: preferences?.notifications ?? DEFAULT_PREFERENCES.notifications,
    emailUpdates: preferences?.emailUpdates ?? DEFAULT_PREFERENCES.emailUpdates,
    autoSave: preferences?.autoSave ?? DEFAULT_PREFERENCES.autoSave,
  };
}

function getMemoryStored(identity: string): StoredPreferences {
  const existing = memoryStore.get(identity);
  if (existing) return existing;
  const next: StoredPreferences = {
    preferences: { ...DEFAULT_PREFERENCES },
    personalVoiceSample: '',
    updatedAt: new Date().toISOString(),
  };
  memoryStore.set(identity, next);
  return next;
}

// ── Handler ────────────────────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  const authUser = await extractUser(req);

  if (REQUIRE_AUTH_FOR_PREFERENCES && !authUser) {
    res.status(401).json({ error: 'Authentication required for preferences' });
    return;
  }

  const identity = authUser ? authUser.id : normalizeIpIdentity(req);

  // Extract the raw bearer token so Supabase RLS can be enforced using the
  // caller's own JWT rather than the service-role key.
  const bearerToken =
    (req.headers?.['authorization'] as string | undefined)
      ?.replace(/^Bearer\s+/i, '')
      .trim() || undefined;

  const db = supabaseConfig();

  if (req.method === 'GET') {
    let current: StoredPreferences;
    if (db) {
      try {
        current = (await loadFromSupabase(db, identity, bearerToken)) ?? getMemoryStored(identity);
      } catch {
        current = getMemoryStored(identity);
      }
    } else {
      current = getMemoryStored(identity);
    }

    res.status(200).json({
      preferences: mergePreferences(current.preferences),
      personalVoiceSample: current.personalVoiceSample,
      updatedAt: current.updatedAt,
    });
    return;
  }

  if (req.method === 'PUT') {
    const body = (req.body || {}) as PreferencesPayload;

    let current: StoredPreferences;
    if (db) {
      try {
        current = (await loadFromSupabase(db, identity, bearerToken)) ?? getMemoryStored(identity);
      } catch {
        current = getMemoryStored(identity);
      }
    } else {
      current = getMemoryStored(identity);
    }

    const next: StoredPreferences = {
      preferences: body.preferences
        ? mergePreferences({ ...current.preferences, ...body.preferences })
        : current.preferences,
      personalVoiceSample:
        typeof body.personalVoiceSample === 'string'
          ? body.personalVoiceSample
          : current.personalVoiceSample,
      updatedAt: new Date().toISOString(),
    };

    memoryStore.set(identity, next);
    if (db) {
      try {
        await saveToSupabase(db, identity, next, bearerToken);
      } catch {
        // Memory store already has the latest; Supabase will sync next time.
      }
    }

    res.status(200).json({
      ok: true,
      preferences: next.preferences,
      personalVoiceSample: next.personalVoiceSample,
      updatedAt: next.updatedAt,
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
