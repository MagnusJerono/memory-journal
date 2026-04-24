-- Memory Journal: premium tier + Stripe subscription fields on profiles
--
-- Adds billing-aware tier tracking so server-side code can resolve a user's
-- plan from the database rather than the PREMIUM_USER_IDS env var. The env
-- var remains as a dev fallback (see api/_lib/rate-limit.ts).

alter table public.profiles
  add column if not exists tier                    text        not null default 'free',
  add column if not exists stripe_customer_id      text,
  add column if not exists stripe_subscription_id  text,
  add column if not exists subscription_status     text,
  add column if not exists current_period_end      timestamptz;

alter table public.profiles
  add constraint profiles_tier_check
    check (tier in ('free', 'premium'));

-- Unique index on stripe_customer_id (nullable) so webhook handlers can
-- look up a profile by Stripe customer without ambiguity.
create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_id_key
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- Existing RLS policies on profiles already scope select/update to
-- auth.uid() = id, which covers the new columns. Tier and Stripe IDs
-- are only written by the service role (via the Stripe webhook),
-- never by the client.
