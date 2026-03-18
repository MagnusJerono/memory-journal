export default async function handler(_req: any, res: any) {
  // Placeholder route for non-Spark auth providers (Supabase/Auth.js/etc.).
  // Return { user } when wired to a real auth backend.
  res.status(200).json({ user: null });
}
