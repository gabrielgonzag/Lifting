create or replace function public.lifting_iron_streak_multiplier(p_weekly_workouts integer, p_weekly_prs integer)
returns numeric
language sql
immutable
as $$
  select case
    when p_weekly_workouts >= 5 and p_weekly_prs >= 3 then 2.0
    when p_weekly_workouts >= 5 and p_weekly_prs >= 1 then 1.6
    when p_weekly_workouts >= 4 and p_weekly_prs >= 1 then 1.4
    when p_weekly_workouts >= 3 and p_weekly_prs >= 1 then 1.2
    else 1.0
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
  v_active_months integer := 0;
  v_weekly_workouts integer := 0;
  v_weekly_prs integer := 0;
  v_total_xp integer := 0;
  v_level integer := 1;
  v_xp integer := 0;
  v_title text := 'iniciante';
  v_progression public.user_progression;
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  with session_sets as (
    select
      session.id,
      session.date,
      coalesce(sum(jsonb_array_length(coalesce(exercise->'sets', '[]'::jsonb))), 0) as set_count,
      coalesce(sum((
        select coalesce(sum(
          coalesce((set_item->>'weight')::numeric, 0) * coalesce((set_item->>'reps')::numeric, 0)
        ), 0)
        from jsonb_array_elements(coalesce(exercise->'sets', '[]'::jsonb)) as set_item
      )), 0) as volume
    from public.workout_sessions session
    left join lateral jsonb_array_elements(coalesce(session.exercises, '[]'::jsonb)) as exercise on true
    where session.user_id = v_user_id
    group by session.id, session.date
  )
  select
    count(*),
    coalesce(sum(set_count), 0),
    coalesce(sum(volume), 0),
    coalesce(sum(
      100
      + 25
      + 50
      + case when volume >= 30000 then 100 when volume >= 15000 then 50 when volume >= 5000 then 20 else 0 end
    ), 0)
  into v_workouts, v_sets, v_volume, v_total_xp
  from session_sets;

  select count(*) into v_prs
  from public.personal_records
  where user_id = v_user_id;

  select count(*) into v_weekly_workouts
  from public.workout_sessions
  where user_id = v_user_id
    and date >= date_trunc('week', now());

  select count(*) into v_weekly_prs
  from public.personal_records
  where user_id = v_user_id
    and date >= date_trunc('week', now());

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

  select coalesce(
    greatest(0, (extract(year from age(max(date), min(date)))::int * 12) + extract(month from age(max(date), min(date)))::int + 1),
    0
  )
  into v_active_months
  from public.workout_sessions
  where user_id = v_user_id;

  v_total_xp := v_total_xp + (v_prs * 20);
  if v_prs >= 2 then v_total_xp := v_total_xp + 15; end if;
  if v_prs >= 3 then v_total_xp := v_total_xp + 30; end if;
  if v_prs >= 5 then v_total_xp := v_total_xp + 50; end if;

  if v_streak >= 3 then v_total_xp := v_total_xp + 50; end if;
  if v_streak >= 7 then v_total_xp := v_total_xp + 150; end if;
  if v_streak >= 14 then v_total_xp := v_total_xp + 350; end if;
  if v_streak >= 30 then v_total_xp := v_total_xp + 1000; end if;
  if v_streak >= 60 then v_total_xp := v_total_xp + 2500; end if;
  if v_streak >= 100 then v_total_xp := v_total_xp + 5000; end if;
  if v_streak >= 365 then v_total_xp := v_total_xp + 15000; end if;

  if v_active_months >= 1 then v_total_xp := v_total_xp + 250; end if;
  if v_active_months >= 3 then v_total_xp := v_total_xp + 750; end if;
  if v_active_months >= 6 then v_total_xp := v_total_xp + 2000; end if;
  if v_active_months >= 12 then v_total_xp := v_total_xp + 5000; end if;
  if v_active_months >= 24 then v_total_xp := v_total_xp + 12000; end if;
  if v_active_months >= 36 then v_total_xp := v_total_xp + 25000; end if;

  if v_weekly_workouts >= 5 then v_total_xp := v_total_xp + 500; end if;
  v_total_xp := round(v_total_xp * public.lifting_iron_streak_multiplier(v_weekly_workouts, v_weekly_prs));

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
    ('seven-day-streak', 150, v_streak >= 7),
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
  values (
    v_user_id,
    'gamification_update',
    'info',
    jsonb_build_object(
      'level', v_level,
      'total_xp', v_total_xp,
      'title', v_title,
      'iron_streak_multiplier', public.lifting_iron_streak_multiplier(v_weekly_workouts, v_weekly_prs)
    )
  );

  return v_progression;
end;
$$;
