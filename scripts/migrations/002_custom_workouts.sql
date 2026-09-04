-- 002_custom_workouts.sql
-- User-built "training day" workouts, assembled from individual exercises
-- drawn from the shared workout catalogue.
--
-- Apply with:  node scripts/migrate.mjs

begin;

create table if not exists public.custom_workouts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'Custom Day',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_workout_exercises (
  id                bigint generated always as identity primary key,
  custom_workout_id bigint not null references public.custom_workouts (id) on delete cascade,
  position          integer not null default 0,
  name              text not null,
  muscle            text,
  sets              integer not null default 3,
  reps              text not null default '10',
  weight            text not null default 'Bodyweight',
  rest              text not null default '60s',
  source_workout_id bigint references public.workouts (id) on delete set null
);

create index if not exists custom_workouts_user_idx
  on public.custom_workouts (user_id);
create index if not exists custom_workout_exercises_parent_idx
  on public.custom_workout_exercises (custom_workout_id, position);

alter table public.custom_workouts          enable row level security;
alter table public.custom_workout_exercises enable row level security;

drop policy if exists custom_workouts_all on public.custom_workouts;
create policy custom_workouts_all on public.custom_workouts
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists custom_workout_exercises_all on public.custom_workout_exercises;
create policy custom_workout_exercises_all on public.custom_workout_exercises
  for all to authenticated
  using (exists (
    select 1 from public.custom_workouts w
    where w.id = custom_workout_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.custom_workouts w
    where w.id = custom_workout_id and w.user_id = auth.uid()
  ));

commit;
