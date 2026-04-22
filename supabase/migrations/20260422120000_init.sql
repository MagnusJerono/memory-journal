-- Memory Journal: initial schema
--
-- Five tables plus a private Storage bucket for entry photos. All user data
-- is guarded by RLS against auth.uid(). A handle_new_user() trigger on
-- auth.users creates the matching profile row and seeds three starter
-- chapters (Growing Up / Adventures / People I Love) so first-time users
-- have something to click into.

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  locale        text,
  voice_sample  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: owner can select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- profiles inserts are handled by the handle_new_user() trigger below.

-- ---------------------------------------------------------------------------
-- chapters
-- ---------------------------------------------------------------------------

create table public.chapters (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  description  text,
  color        text not null,
  icon         text not null,
  is_pinned    boolean not null default false,
  is_archived  boolean not null default false,
  "order"      integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index chapters_user_id_idx on public.chapters(user_id, updated_at desc);

create trigger chapters_set_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

alter table public.chapters enable row level security;

create policy "chapters: owner can select"
  on public.chapters for select using (auth.uid() = user_id);

create policy "chapters: owner can insert"
  on public.chapters for insert with check (auth.uid() = user_id);

create policy "chapters: owner can update"
  on public.chapters for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chapters: owner can delete"
  on public.chapters for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- entries
-- ---------------------------------------------------------------------------

create table public.entries (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  chapter_id               uuid references public.chapters(id) on delete set null,
  memory_date              date,
  title_user               text,
  title_ai                 text,
  transcript               text,
  story_ai                 text,
  highlights_ai            jsonb,                -- string[]
  tags_ai                  jsonb,                -- { people, places, moods, themes }
  location_suggestions     jsonb,                -- LocationSuggestion[]
  manual_locations         jsonb,                -- string[]
  missing_info_questions   jsonb,                -- string[]
  uncertain_claims         jsonb,                -- string[]
  is_locked                boolean not null default false,
  is_starred               boolean not null default false,
  is_draft                 boolean not null default false,
  prompt_used              text,
  search_tsv               tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title_user, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(title_ai, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(transcript, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(story_ai, '')), 'B')
  ) stored,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index entries_user_id_idx       on public.entries(user_id, memory_date desc nulls last, created_at desc);
create index entries_chapter_id_idx    on public.entries(chapter_id) where chapter_id is not null;
create index entries_search_tsv_idx    on public.entries using gin(search_tsv);

create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

alter table public.entries enable row level security;

create policy "entries: owner can select"
  on public.entries for select using (auth.uid() = user_id);

create policy "entries: owner can insert"
  on public.entries for insert with check (auth.uid() = user_id);

create policy "entries: owner can update"
  on public.entries for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "entries: owner can delete"
  on public.entries for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- entry_photos
-- ---------------------------------------------------------------------------

create table public.entry_photos (
  id             uuid primary key default gen_random_uuid(),
  entry_id       uuid not null references public.entries(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  storage_path   text not null,      -- e.g. "uuid-user/uuid-entry/uuid-photo.jpg"
  position       integer not null default 0,
  width          integer,
  height         integer,
  bytes          integer,
  created_at     timestamptz not null default now()
);

create index entry_photos_entry_id_idx on public.entry_photos(entry_id, position);

alter table public.entry_photos enable row level security;

create policy "entry_photos: owner can select"
  on public.entry_photos for select using (auth.uid() = user_id);

create policy "entry_photos: owner can insert"
  on public.entry_photos for insert with check (auth.uid() = user_id);

create policy "entry_photos: owner can update"
  on public.entry_photos for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "entry_photos: owner can delete"
  on public.entry_photos for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- books
-- ---------------------------------------------------------------------------

create table public.books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default '',
  subtitle    text,
  theme       text not null default 'classic',
  entry_ids   uuid[] not null default '{}',
  is_draft    boolean not null default false,
  pdf_url     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index books_user_id_idx on public.books(user_id, updated_at desc);

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

alter table public.books enable row level security;

create policy "books: owner can select"
  on public.books for select using (auth.uid() = user_id);

create policy "books: owner can insert"
  on public.books for insert with check (auth.uid() = user_id);

create policy "books: owner can update"
  on public.books for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "books: owner can delete"
  on public.books for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- handle_new_user: create profile + starter chapters on signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
    values (new.id)
    on conflict (id) do nothing;

  insert into public.chapters (user_id, name, description, color, icon, "order") values
    (new.id, 'Growing Up',    'Childhood and family memories',     'oklch(0.75 0.18 75)',  'house',    0),
    (new.id, 'Adventures',    'Travel and experiences',            'oklch(0.65 0.17 160)', 'airplane', 1),
    (new.id, 'People I Love', 'Relationships and connections',     'oklch(0.65 0.2 350)',  'heart',    2);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage bucket: journal-photos
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'journal-photos',
    'journal-photos',
    false,
    10 * 1024 * 1024, -- 10 MB per object; client resizes before upload anyway
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: "{user_id}/{entry_id}/{file}". The first segment is the
-- owner — compare it to auth.uid() for row-level access.

create policy "journal-photos: owner can select"
  on storage.objects for select
  using (
    bucket_id = 'journal-photos'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "journal-photos: owner can insert"
  on storage.objects for insert
  with check (
    bucket_id = 'journal-photos'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "journal-photos: owner can update"
  on storage.objects for update
  using (
    bucket_id = 'journal-photos'
    and auth.uid()::text = split_part(name, '/', 1)
  )
  with check (
    bucket_id = 'journal-photos'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "journal-photos: owner can delete"
  on storage.objects for delete
  using (
    bucket_id = 'journal-photos'
    and auth.uid()::text = split_part(name, '/', 1)
  );
