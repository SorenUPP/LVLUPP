-- 003_weekly_routine.sql
-- A per-user weekly training plan: one workout (catalogue or custom) per
-- weekday, or a rest day. The dashboard surfaces the current weekday's entry.
--
-- Apply with:  node scripts/migrate.mjs

begin;

create table if not exists public.routine_days (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references auth.users (id) on delete cascade,
  weekday           integer not null check (weekday between 0 and 6), -- 0 = Sunday (JS getDay)
  workout_id        bigint references public.workouts (id) on delete set null,
  custom_workout_id bigint references public.custom_workouts (id) on delete cascade,
  updated_at        timestamptz not null default now(),
  unique (user_id, weekday),
  constraint routine_days_one_target check (num_nonnulls(workout_id, custom_workout_id) <= 1)
);

create index if not exists routine_days_user_idx on public.routine_days (user_id);

-- A tracked session can now belong to a custom day too.
alter table public.workout_sessions
  add column if not exists custom_workout_id bigint
    references public.custom_workouts (id) on delete set null;

alter table public.routine_days enable row level security;

drop policy if exists routine_days_all on public.routine_days;
create policy routine_days_all on public.routine_days
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
