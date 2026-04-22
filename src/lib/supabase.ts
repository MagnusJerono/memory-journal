import { createClient } from '@supabase/supabase-js';

// Support both the legacy VITE_* names (set manually) and the NEXT_PUBLIC_*
// names injected by the Vercel ↔ Supabase marketplace integration. Whichever
// is defined wins.
const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] No Supabase URL / anon key found. Set VITE_SUPABASE_URL + ' +
      'VITE_SUPABASE_ANON_KEY, or use the Vercel ↔ Supabase integration ' +
      '(NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY). ' +
      'Supabase auth will not be available.',
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
