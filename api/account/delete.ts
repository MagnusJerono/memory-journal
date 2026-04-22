import { requireAuth } from '../_lib/auth.js';

/*
 * DELETE /api/account/delete
 *
 * Permanently deletes the authenticated user's account. Row-level data
 * (entries, chapters, books, photos, preferences) is removed via the
 * `on delete cascade` foreign keys that reference auth.users. Storage
 * objects under `journal-photos/{user_id}/…` are cleaned up best-effort.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: 'Server is missing Supabase admin credentials' });
    return;
  }

  // Best-effort: remove storage objects under the user's folder so they
  // aren't orphaned once the DB rows are cascaded away.
  try {
    const listResp = await fetch(
      `${supabaseUrl}/storage/v1/object/list/journal-photos`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: `${user.id}/`, limit: 1000 }),
      },
    );
    if (listResp.ok) {
      const items = (await listResp.json()) as Array<{ name: string }>;
      const paths = items
        .filter((i) => i && typeof i.name === 'string')
        .map((i) => `${user.id}/${i.name}`);
      if (paths.length > 0) {
        await fetch(`${supabaseUrl}/storage/v1/object/journal-photos`, {
          method: 'DELETE',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prefixes: paths }),
        });
      }
    }
  } catch {
    // Ignore — continue with user deletion even if storage cleanup fails.
  }

  const deleteResp = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`,
    {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!deleteResp.ok && deleteResp.status !== 404) {
    const text = await deleteResp.text().catch(() => '');
    res.status(502).json({ error: 'Failed to delete account', detail: text });
    return;
  }

  res.status(200).json({ ok: true });
}
