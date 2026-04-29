-- Memory Journal: book_orders table for print-on-demand fulfillment.
--
-- Tracks the lifecycle of a printed book from Stripe checkout through
-- POD provider (Lulu xPress) submission and shipping. Rows are created
-- when the user initiates checkout and updated by the Stripe webhook
-- and POD status polling.

create table public.book_orders (
  id                           uuid        primary key default gen_random_uuid(),
  user_id                      uuid        not null references auth.users(id) on delete cascade,
  book_id                      uuid        not null references public.books(id) on delete restrict,

  -- Stripe
  stripe_checkout_session_id   text        unique,
  stripe_payment_intent_id     text        unique,

  -- POD provider (Lulu xPress for v1)
  pod_provider                 text        not null default 'lulu',
  pod_print_job_id             text,

  -- Lifecycle
  status                       text        not null default 'pending_payment',

  -- Artifacts
  interior_pdf_url             text,
  cover_pdf_url                text,

  -- Commerce
  shipping_address             jsonb       not null,
  price_cents                  integer     not null,
  currency                     text        not null default 'eur',

  -- Tracking
  tracking_url                 text,
  tracking_carrier             text,

  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now(),

  constraint book_orders_status_check check (
    status in (
      'pending_payment',
      'paid',
      'submitted',
      'printing',
      'shipped',
      'delivered',
      'canceled',
      'failed'
    )
  ),
  constraint book_orders_provider_check check (
    pod_provider in ('lulu')
  )
);

create index if not exists book_orders_user_id_idx
  on public.book_orders (user_id, created_at desc);

create index if not exists book_orders_status_idx
  on public.book_orders (status)
  where status not in ('delivered', 'canceled', 'failed');

create trigger book_orders_set_updated_at
  before update on public.book_orders
  for each row execute function public.set_updated_at();

alter table public.book_orders enable row level security;

-- Owner can see their own orders.
create policy "book_orders: owner can select"
  on public.book_orders for select
  using (auth.uid() = user_id);

-- Owner can create an order row for themselves (tightened by API layer).
create policy "book_orders: owner can insert"
  on public.book_orders for insert
  with check (auth.uid() = user_id);

-- Updates are performed by the service role from webhooks, not clients.
-- No client-side update policy intentionally.
