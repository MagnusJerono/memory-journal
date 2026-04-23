// Shared authentication helper for API endpoints.
//
// Validates user identity from the Authorization: Bearer header.
//
// To enable full Supabase JWT verification, set the Supabase URL and a
// server-side key. Supports both the legacy manual names (SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY) and the names injected by the Vercel ↔ Supabase
// marketplace integration (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY).
// The first available pair wins.

export interface AuthenticatedUser {
  id: string;
}

function normalizeIdentity(rawIdentity: string): string {
  return rawIdentity.trim().toLowerCase().slice(0, 128);
}

/**
 * Extracts a verified user identity from the request.
 *
 * Reads the Authorization: Bearer <token> header. When a Supabase URL and
 * server-side key are configured the token is verified via Supabase and the
 * canonical user ID is returned.
 *
 * Returns null when no valid identity can be determined.
 */
export async function extractUser(req: any): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers?.['authorization'] as string | undefined;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.length > 0) {
      const supabaseUrl =
        process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
      if (supabaseUrl && serviceRoleKey) {
        try {
          const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: serviceRoleKey,
            },
          });
          if (resp.ok) {
            const data = (await resp.json()) as { id?: string; email?: string };
            const userId = data.id ?? data.email;
            if (userId) {
              return { id: normalizeIdentity(userId) };
            }
          }
          // Invalid / expired JWT — deny access.
          return null;
        } catch {
          // Network error reaching Supabase; deny access to be safe.
          return null;
        }
      }

      // No Supabase credentials configured.
      //
      // In production we refuse to trust an unverified Bearer token — otherwise
      // any attacker could send `Authorization: Bearer anything` and be treated
      // as an authenticated user. In development we accept the token opaquely
      // so local demos without Supabase keep working.
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        return null;
      }
      return { id: normalizeIdentity(token) };
    }
  }

  return null;
}

/**
 * Asserts that the request carries a valid user identity.
 *
 * Writes a 401 JSON response and returns null when authentication fails.
 * Returns the AuthenticatedUser on success.
 */
export async function requireAuth(req: any, res: any): Promise<AuthenticatedUser | null> {
  const user = await extractUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return user;
}
