-- ============================================================
-- Pursuit database schema
-- Paste this whole file into Supabase: SQL Editor > New query > Run
-- ============================================================


-- ------------------------------------------------------------
-- 1. Applications: one row per job you're tracking
-- ------------------------------------------------------------
create table public.applications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company        text not null,
  role           text not null,
  status         text not null default 'saved'
                   check (status in ('saved', 'applied', 'interviewing', 'offer', 'closed')),
  job_url        text,
  location       text,
  salary_range   text,
  date_applied   date,
  deadline       date,
  next_step      text,          -- e.g. "Phone screen with recruiter"
  next_step_date date,
  notes          text,
  position       integer not null default 0,  -- order of cards inside a kanban column
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 2. Contacts: people in your network
-- ------------------------------------------------------------
create table public.contacts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name           text not null,
  company        text,
  title          text,
  email          text,
  linkedin_url   text,
  where_met      text,          -- e.g. "AfroTech 2026"
  met_on         date,
  last_contacted date,
  follow_up_on   date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 3. Links between applications and contacts
--    (a contact can help with many applications, and an
--    application can have many contacts)
-- ------------------------------------------------------------
create table public.application_contacts (
  application_id uuid not null references public.applications (id) on delete cascade,
  contact_id     uuid not null references public.contacts (id) on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  relationship   text,          -- e.g. "Referral", "Recruiter", "Hiring manager"
  created_at     timestamptz not null default now(),
  primary key (application_id, contact_id)
);


-- ------------------------------------------------------------
-- 4. Interactions: a log of every time you reached out
--    (coffee chats, emails, LinkedIn messages)
-- ------------------------------------------------------------
create table public.interactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id     uuid not null references public.contacts (id) on delete cascade,
  happened_on    date not null default current_date,
  kind           text not null default 'message'
                   check (kind in ('message', 'email', 'call', 'coffee', 'event', 'other')),
  summary        text,
  created_at     timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 5. Indexes so lookups stay fast as your data grows
-- ------------------------------------------------------------
create index on public.applications (user_id, status, position);
create index on public.contacts (user_id, follow_up_on);
create index on public.application_contacts (contact_id);
create index on public.interactions (contact_id, happened_on desc);


-- ------------------------------------------------------------
-- 6. Keep updated_at current automatically on every edit
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 7. Row Level Security
--    This is what makes the app safe for multiple users:
--    every user can only see and change their OWN rows.
-- ------------------------------------------------------------
alter table public.applications         enable row level security;
alter table public.contacts             enable row level security;
alter table public.application_contacts enable row level security;
alter table public.interactions         enable row level security;

create policy "Users manage their own applications"
  on public.applications for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own contacts"
  on public.contacts for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own links"
  on public.application_contacts for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own interactions"
  on public.interactions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- ------------------------------------------------------------
-- 8. Let logged-in users reach these tables through the API.
--    (Needed when "Grant API access to new tables automatically"
--    is turned off. Row Level Security above still limits each
--    person to their own rows.)
-- ------------------------------------------------------------
grant select, insert, update, delete
  on public.applications, public.contacts, public.application_contacts, public.interactions
  to authenticated;
