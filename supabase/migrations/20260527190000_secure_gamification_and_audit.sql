create table if not exists public.user_progression (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  total_xp integer not null default 0 check (total_xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  workouts_completed integer not null default 0 check (workouts_completed >= 0),
  prs integer not null default 0 check (prs >= 0),
  sets_completed integer not null default 0 check (sets_completed >= 0),
  total_volume numeric not null default 0 check (total_volume >= 0),
  current_title_id text not null default 'iniciante',
  updated_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  xp_reward integer not null default 0 check (xp_reward >= 0),
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create table if not exists public.user_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, title_id)
);

create table if not exists public.user_xp_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  xp_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_workout_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.user_progression enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_titles enable row level security;
alter table public.user_xp_history enable row level security;
alter table public.user_streaks enable row level security;
alter table public.security_audit_logs enable row level security;

drop policy if exists "Users can read own progression" on public.user_progression;
create policy "Users can read own progression" on public.user_progression
  for select using (auth.uid() = user_id);

drop policy if exists "Users can read own achievements" on public.user_achievements;
create policy "Users can read own achievements" on public.user_achievements
  for select using (auth.uid() = user_id);

drop policy if exists "Users can read own titles" on public.user_titles;
create policy "Users can read own titles" on public.user_titles
  for select using (auth.uid() = user_id);

drop policy if exists "Users can read own xp history" on public.user_xp_history;
create policy "Users can read own xp history" on public.user_xp_history
  for select using (auth.uid() = user_id);

drop policy if exists "Users can read own streak" on public.user_streaks;
create policy "Users can read own streak" on public.user_streaks
  for select using (auth.uid() = user_id);

drop policy if exists "Users can create own audit logs" on public.security_audit_logs;
create policy "Users can create own audit logs" on public.security_audit_logs
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can read own audit logs" on public.security_audit_logs;
create policy "Users can read own audit logs" on public.security_audit_logs
  for select using (auth.uid() = user_id);

create or replace function public.prevent_public_profile_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' and auth.uid() = old.id then
    if new.role is distinct from old.role
      or new.plan is distinct from old.plan
      or new.status is distinct from old.status
      or new.email_verified is distinct from old.email_verified
      or new.created_at is distinct from old.created_at then
      insert into public.security_audit_logs (user_id, event_type, severity, metadata)
      values (
        auth.uid(),
        'role_change_attempt',
        'critical',
        jsonb_build_object('blocked_fields', array['role', 'plan', 'status', 'email_verified', 'created_at'])
      );
      raise exception 'Protected profile fields cannot be changed by the public client.';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prevent_public_profile_privilege_change on public.profiles;
create trigger prevent_public_profile_privilege_change
before update on public.profiles
for each row execute function public.prevent_public_profile_privilege_change();

create or replace function public.lifting_title_for_stats(
  p_level integer,
  p_workouts integer,
  p_prs integer,
  p_streak integer,
  p_volume numeric
)
returns text
language sql
stable
as $$
  select case
    when p_volume >= 1000000 and p_workouts >= 500 and p_prs >= 150 and p_streak >= 180 then 'mr-olympia'
    when p_workouts >= 250 then 'iron-legacy'
    when p_streak >= 90 then 'golden-era'
    when p_prs >= 75 then 'colosso'
    when p_volume >= 250000 then 'hammer'
    when p_level >= 40 then 'lenda'
    when p_workouts >= 100 then 'prime'
    when p_streak >= 30 then 'apex'
    when p_prs >= 30 then 'monstro'
    when p_volume >= 75000 then 'tita'
    when p_level >= 18 then 'elite'
    when p_workouts >= 30 then 'relentless'
    when p_streak >= 10 then 'iron-mind'
    when p_volume >= 25000 then 'brutal'
    when p_prs >= 8 then 'evoluido'
    when p_level >= 8 then 'implacavel'
    when p_workouts >= 10 then 'foundation'
    when p_level >= 4 then 'iron-rookie'
    when p_streak >= 3 then 'disciplinado'
    when p_workouts >= 3 then 'consistente'
    else 'iniciante'
  end
$$;

create or replace function public.sync_user_progression()
returns public.user_progression
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_workouts integer := 0;
  v_prs integer := 0;
  v_sets integer := 0;
  v_volume numeric := 0;
  v_streak integer := 0;
  v_total_xp integer := 0;
  v_level integer := 1;
  v_xp integer := 0;
  v_title text := 'iniciante';
  v_progression public.user_progression;
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select count(*) into v_workouts
  from public.workout_sessions
  where user_id = v_user_id;

  select count(*) into v_prs
  from public.personal_records
  where user_id = v_user_id;

  select
    coalesce(sum(jsonb_array_length(coalesce(exercise->'sets', '[]'::jsonb))), 0),
    coalesce(sum((
      select coalesce(sum(
        coalesce((set_item->>'weight')::numeric, 0) * coalesce((set_item->>'reps')::numeric, 0)
      ), 0)
      from jsonb_array_elements(coalesce(exercise->'sets', '[]'::jsonb)) as set_item
    )), 0)
  into v_sets, v_volume
  from public.workout_sessions session
  cross join lateral jsonb_array_elements(coalesce(session.exercises, '[]'::jsonb)) as exercise
  where session.user_id = v_user_id;

  with workout_days as (
    select distinct date::date as day
    from public.workout_sessions
    where user_id = v_user_id
  ),
  numbered as (
    select day, day + (row_number() over (order by day desc))::int as streak_group
    from workout_days
    where day <= current_date
  )
  select coalesce(count(*), 0) into v_streak
  from numbered
  where streak_group = current_date + 1;

  v_total_xp := (v_workouts * 100) + (v_prs * 50);
  if v_streak >= 7 then v_total_xp := v_total_xp + 300; end if;
  if v_streak >= 30 then v_total_xp := v_total_xp + 1000; end if;
  v_level := floor(v_total_xp / 500) + 1;
  v_xp := mod(v_total_xp, 500);
  v_title := public.lifting_title_for_stats(v_level, v_workouts, v_prs, v_streak, v_volume);

  insert into public.user_progression (
    user_id, level, xp, total_xp, streak, workouts_completed, prs, sets_completed, total_volume, current_title_id, updated_at
  )
  values (v_user_id, v_level, v_xp, v_total_xp, v_streak, v_workouts, v_prs, v_sets, v_volume, v_title, now())
  on conflict (user_id) do update set
    level = excluded.level,
    xp = excluded.xp,
    total_xp = excluded.total_xp,
    streak = excluded.streak,
    workouts_completed = excluded.workouts_completed,
    prs = excluded.prs,
    sets_completed = excluded.sets_completed,
    total_volume = excluded.total_volume,
    current_title_id = excluded.current_title_id,
    updated_at = now()
  returning * into v_progression;

  insert into public.user_streaks (user_id, current_streak, longest_streak, last_workout_date, updated_at)
  values (
    v_user_id,
    v_streak,
    v_streak,
    (select max(date::date) from public.workout_sessions where user_id = v_user_id),
    now()
  )
  on conflict (user_id) do update set
    current_streak = excluded.current_streak,
    longest_streak = greatest(public.user_streaks.longest_streak, excluded.longest_streak),
    last_workout_date = excluded.last_workout_date,
    updated_at = now();

  insert into public.user_achievements (user_id, achievement_id, xp_reward)
  select v_user_id, id, reward
  from (values
    ('first-workout', 100, v_workouts >= 1),
    ('seven-day-streak', 300, v_streak >= 7),
    ('thirty-day-streak', 1000, v_streak >= 30),
    ('ten-prs', 250, v_prs >= 10),
    ('fifty-prs', 750, v_prs >= 50),
    ('hundred-sets', 250, v_sets >= 100),
    ('hundred-workouts', 1000, v_workouts >= 100)
  ) as unlocked(id, reward, ok)
  where ok
  on conflict (user_id, achievement_id) do nothing;

  insert into public.user_titles (user_id, title_id)
  select v_user_id, title_id
  from (values
    ('iniciante', true),
    ('consistente', v_workouts >= 3),
    ('disciplinado', v_streak >= 3),
    ('iron-rookie', v_level >= 4),
    ('foundation', v_workouts >= 10),
    ('implacavel', v_level >= 8),
    ('evoluido', v_prs >= 8),
    ('brutal', v_volume >= 25000),
    ('iron-mind', v_streak >= 10),
    ('relentless', v_workouts >= 30),
    ('elite', v_level >= 18),
    ('tita', v_volume >= 75000),
    ('monstro', v_prs >= 30),
    ('apex', v_streak >= 30),
    ('prime', v_workouts >= 100),
    ('lenda', v_level >= 40),
    ('hammer', v_volume >= 250000),
    ('colosso', v_prs >= 75),
    ('golden-era', v_streak >= 90),
    ('iron-legacy', v_workouts >= 250),
    ('mr-olympia', v_volume >= 1000000 and v_workouts >= 500 and v_prs >= 150 and v_streak >= 180)
  ) as unlocked(title_id, ok)
  where ok
  on conflict (user_id, title_id) do nothing;

  insert into public.security_audit_logs (user_id, event_type, severity, metadata)
  values (v_user_id, 'gamification_update', 'info', jsonb_build_object('level', v_level, 'total_xp', v_total_xp, 'title', v_title));

  return v_progression;
end;
$$;
