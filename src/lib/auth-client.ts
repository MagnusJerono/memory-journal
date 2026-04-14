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
 *
 * Uses the official async `getSession()` API to avoid relying on the
 * internal localStorage key format, which can vary across Supabase versions.
 */
export async function getAuthToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function getUserFromApi(): Promise<AppUser | null> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = await getAuthToken();
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
        login: user.email ?? user.id,
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
