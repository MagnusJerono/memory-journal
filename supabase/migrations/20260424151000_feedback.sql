-- Feedback table: captures in-app user feedback.
-- Only the service role can read/write; end users can only POST via the API,
-- which uses the service-role key.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  message text not null check (char_length(message) <= 4000),
  context jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

-- No policies => blocked for the authenticated / anon roles by default.
-- Only the service-role key (used by the /api/feedback serverless function)
-- can insert or read rows.
