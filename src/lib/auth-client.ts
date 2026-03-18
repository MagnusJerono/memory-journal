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

async function getUserFromApi(): Promise<AppUser | null> {
  const response = await fetch(resolveAuthEndpoint(), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
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
  try {
    return await getUserFromApi();
  } catch {
    if (hasSparkUser()) {
      return getUserFromSpark();
    }
    return null;
  }
}
