create table if not exists public.signup_rate_limits (
  email_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.signup_rate_limits enable row level security;

create or replace function public.consume_signup_attempt(p_email_hash text)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_limit public.signup_rate_limits%rowtype;
  seconds_left integer;
begin
  select * into current_limit
  from public.signup_rate_limits
  where email_hash = p_email_hash
  for update;

  if not found then
    insert into public.signup_rate_limits (email_hash, attempt_count)
    values (p_email_hash, 1);
    return query select true, 0;
    return;
  end if;

  if current_limit.window_started_at + interval '1 hour' <= now() then
    update public.signup_rate_limits
    set window_started_at = now(), attempt_count = 1, updated_at = now()
    where email_hash = p_email_hash;
    return query select true, 0;
    return;
  end if;

  if current_limit.attempt_count >= 3 then
    seconds_left := greatest(
      1,
      ceil(extract(epoch from (
        current_limit.window_started_at + interval '1 hour' - now()
      )))::integer
    );
    return query select false, seconds_left;
    return;
  end if;

  update public.signup_rate_limits
  set attempt_count = attempt_count + 1, updated_at = now()
  where email_hash = p_email_hash;
  return query select true, 0;
end;
$$;

revoke all on function public.consume_signup_attempt(text) from public, anon, authenticated;
grant execute on function public.consume_signup_attempt(text) to service_role;
