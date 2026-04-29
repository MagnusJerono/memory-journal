-- Entry-level collaboration for shared memories.

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.normalize_email(email text)
returns text
language sql
immutable
as $$
  select lower(trim(email));
$$;

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select public.normalize_email(auth.jwt() ->> 'email');
$$;

create table public.entry_collaborators (
  id                     uuid primary key default gen_random_uuid(),
  entry_id               uuid not null references public.entries(id) on delete cascade,
  owner_id               uuid not null references auth.users(id) on delete cascade,
  collaborator_user_id   uuid references auth.users(id) on delete cascade,
  invitee_email          text not null,
  role                   text not null default 'editor' check (role in ('editor', 'viewer')),
  status                 text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint entry_collaborators_email_not_empty check (length(public.normalize_email(invitee_email)) > 0)
);

create unique index entry_collaborators_entry_email_idx
  on public.entry_collaborators(entry_id, public.normalize_email(invitee_email));

create index entry_collaborators_owner_idx on public.entry_collaborators(owner_id, updated_at desc);
create index entry_collaborators_user_idx on public.entry_collaborators(collaborator_user_id)
  where collaborator_user_id is not null;
create index entry_collaborators_email_idx on public.entry_collaborators(public.normalize_email(invitee_email));

create trigger entry_collaborators_set_updated_at
  before update on public.entry_collaborators
  for each row execute function public.set_updated_at();

alter table public.entry_collaborators enable row level security;

create or replace function public.can_select_entry(p_entry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.entries e
    where e.id = p_entry_id
      and e.user_id = auth.uid()
  ) or exists (
    select 1
    from public.entry_collaborators c
    where c.entry_id = p_entry_id
      and (
        c.collaborator_user_id = auth.uid()
        or public.normalize_email(c.invitee_email) = public.current_user_email()
      )
  );
$$;

create or replace function public.can_edit_entry(p_entry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.entries e
    where e.id = p_entry_id
      and e.user_id = auth.uid()
  ) or exists (
    select 1
    from public.entry_collaborators c
    where c.entry_id = p_entry_id
      and c.role = 'editor'
      and (
        c.collaborator_user_id = auth.uid()
        or public.normalize_email(c.invitee_email) = public.current_user_email()
      )
  );
$$;

create or replace function public.is_entry_owner(p_entry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.entries e
    where e.id = p_entry_id
      and e.user_id = auth.uid()
  );
$$;

create or replace function public.claim_entry_collaborator_invites(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.normalize_email(p_email) <> public.current_user_email() then
    raise exception 'Cannot claim collaborator invites for a different email';
  end if;

  update public.entry_collaborators
     set collaborator_user_id = auth.uid(),
         status = 'accepted'
   where public.normalize_email(invitee_email) = public.current_user_email()
     and (collaborator_user_id is null or collaborator_user_id = auth.uid());
end;
$$;

-- ---------------------------------------------------------------------------
-- Collaborator policies
-- ---------------------------------------------------------------------------

create policy "entry_collaborators: related users can select"
  on public.entry_collaborators for select
  using (
    owner_id = auth.uid()
    or collaborator_user_id = auth.uid()
    or public.normalize_email(invitee_email) = public.current_user_email()
  );

create policy "entry_collaborators: owner can insert"
  on public.entry_collaborators for insert
  with check (
    owner_id = auth.uid()
    and public.is_entry_owner(entry_id)
    and public.normalize_email(invitee_email) <> public.current_user_email()
  );

create policy "entry_collaborators: owner can update"
  on public.entry_collaborators for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_entry_owner(entry_id));

create policy "entry_collaborators: owner can delete"
  on public.entry_collaborators for delete
  using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Entries: owner plus collaborators can read, owner/editor can update.
-- ---------------------------------------------------------------------------

drop policy if exists "entries: owner can select" on public.entries;
drop policy if exists "entries: owner can update" on public.entries;
drop policy if exists "entries: owner can delete" on public.entries;

create policy "entries: owner and collaborators can select"
  on public.entries for select
  using (public.can_select_entry(id));

create policy "entries: owner and editors can update"
  on public.entries for update
  using (public.can_edit_entry(id))
  with check (public.can_edit_entry(id));

create policy "entries: owner can delete"
  on public.entries for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Entry photos: collaborators can read shared photos, owner manages them.
-- ---------------------------------------------------------------------------

drop policy if exists "entry_photos: owner can select" on public.entry_photos;

create policy "entry_photos: owner and collaborators can select"
  on public.entry_photos for select
  using (auth.uid() = user_id or public.can_select_entry(entry_id));

drop policy if exists "journal-photos: owner can select" on storage.objects;

create policy "journal-photos: owner and collaborators can select"
  on storage.objects for select
  using (
    bucket_id = 'journal-photos'
    and (
      auth.uid()::text = split_part(name, '/', 1)
      or public.can_select_entry(nullif(split_part(name, '/', 2), '')::uuid)
    )
  );
