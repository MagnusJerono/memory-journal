import { supabase } from './supabase';

export interface AppUser {
  login: string;
  avatarUrl: string;
  email?: string;
}

interface AuthApiResponse {
  user?: AppUser | null;
}

const DEFAULT_AUTH_ENDPOINT = '/api/auth/me';

function resolveAuthEndpoint(): string {
  const endpoint = import.meta.env.VITE_AUTH_USER_ENDPOINT as string | undefined;
  return endpoint && endpoint.trim().length > 0 ? endpoint : DEFAULT_AUTH_ENDPOINT;
}

/**
 * Returns the current Supabase session JWT, or null when not signed in /
 * Supabase is not configured.
 */
export function getAuthToken(): string | null {
  // supabase.auth.session() is sync in v2 — access via the cached session.
  // We read from the global client which holds the in-memory session.
  if (!supabase) return null;
  // getSession() is async; for a synchronous fast-path we look at the stored
  // access_token that the Supabase client persists in localStorage.
  try {
    const storageKey = Object.keys(localStorage).find((k) =>
      k.startsWith('sb-') && k.endsWith('-auth-token'),
    );
    if (!storageKey) return null;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { access_token?: string };
    return parsed.access_token ?? null;
  } catch {
    return null;
  }
}

async function getUserFromApi(): Promise<AppUser | null> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(resolveAuthEndpoint(), {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Auth API failed (${response.status})`);
  }

  const data = (await response.json()) as AuthApiResponse;
  return data.user ?? null;
}

function hasSparkUser(): boolean {
  const spark = (window as Window & { spark?: { user?: unknown } }).spark;
  return typeof spark?.user === 'function';
}

async function getUserFromSpark(): Promise<AppUser | null> {
  const spark = (window as Window & {
    spark?: { user?: () => Promise<{ login: string; avatarUrl: string; email?: string } | null> };
  }).spark;
  if (!spark?.user) {
    return null;
  }

  const user = await spark.user();
  if (!user) {
    return null;
  }

  return {
    login: user.login,
    avatarUrl: user.avatarUrl,
    email: user.email,
  };
}

export async function getCurrentUser(): Promise<AppUser | null> {
  // If Supabase is configured, use the session user directly — no round-trip.
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        login: user.id,
        avatarUrl: '',
        email: user.email,
      };
    }
    return null;
  }

  // Fallback: call the API endpoint (handles Spark / x-user-id environments).
  try {
    return await getUserFromApi();
  } catch {
    if (hasSparkUser()) {
      return getUserFromSpark();
    }
    return null;
  }
}
