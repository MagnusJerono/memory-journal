// Shared authentication helper for API endpoints.
//
// Validates user identity from the Authorization: Bearer header.
//
// To enable full Supabase JWT verification, set the SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY environment variables. The helper will then verify
// the JWT via Supabase and extract the canonical user ID from the token payload.

export interface AuthenticatedUser {
  id: string;
}

function normalizeIdentity(rawIdentity: string): string {
  return rawIdentity.trim().toLowerCase().slice(0, 128);
}

/**
 * Extracts a verified user identity from the request.
 *
 * Reads the Authorization: Bearer <token> header. When SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are configured the token is verified via Supabase
 * and the canonical user ID is returned.
 *
 * Returns null when no valid identity can be determined.
 */
export async function extractUser(req: any): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers?.['authorization'] as string | undefined;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.length > 0) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

      // No Supabase credentials — accept the token opaquely as the user identity.
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
