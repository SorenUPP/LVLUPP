-- 001_accounts.sql
-- Supabase Auth accounts + per-user data isolation, and removal of the
-- pre-account seeded/fake data.
--
-- Apply with:  node scripts/migrate.mjs
-- Safe to re-run (idempotent) EXCEPT the one-time data wipe in section 3.

begin;

-- 1. profiles --------------------------------------------------------------
-- One row per auth user, created automatically on sign-up with sane defaults.
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  name           text not null default 'Athlete',
  avatar_url     text not null default 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=200&h=200&fit=crop&auto=format',
  tagline        text not null default 'Getting stronger every week',
  member_since   date not null default current_date,
  unit_system    text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  weight_kg      numeric,
  height_cm      numeric,
  weekly_goal    integer not null default 4,
  rest_timer_sec integer not null default 60,
  accent         text not null default '#c8a96e',
  updated_at     timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. user scoping on the write tables -------------------------------------
alter table public.workout_logs
  add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.workout_sessions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists workout_logs_user_idx     on public.workout_logs (user_id);
create index if not exists workout_sessions_user_idx on public.workout_sessions (user_id);

-- 3. remove the pre-account fake data (ONE-TIME) --------------------------
truncate public.workout_session_sets, public.workout_sessions, public.workout_logs
  restart identity;

-- Seeded "personal bests" were fake. PBs are now derived from real completed
-- sessions, so the table is emptied. classes / todays_exercises were never
-- wired into the current UI. All three are left in place but locked down
-- (RLS on, no policy = no API access) rather than dropped.
delete from public.personal_bests;

-- 4. Row Level Security --------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.workouts             enable row level security;
alter table public.workout_logs         enable row level security;
alter table public.workout_sessions     enable row level security;
alter table public.workout_session_sets enable row level security;

-- Dormant tables: RLS on, no policy -> unreachable via the public API key.
alter table public.personal_bests   enable row level security;
alter table public.classes          enable row level security;
alter table public.todays_exercises enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Workout catalog: public, read-only.
drop policy if exists workouts_read on public.workouts;
create policy workouts_read on public.workouts
  for select to anon, authenticated using (true);

-- History: owner-only, full access.
drop policy if exists workout_logs_all on public.workout_logs;
create policy workout_logs_all on public.workout_logs
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists workout_sessions_all on public.workout_sessions;
create policy workout_sessions_all on public.workout_sessions
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Session sets: scoped through the parent session's owner.
drop policy if exists workout_session_sets_all on public.workout_session_sets;
create policy workout_session_sets_all on public.workout_session_sets
  for all to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  ));

commit;
