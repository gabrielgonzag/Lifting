create type public.user_role as enum ('casual', 'professional', 'admin');
create type public.user_plan as enum ('free', 'basic', 'professional', 'enterprise');
create type public.invite_status as enum ('pending', 'accepted', 'expired', 'canceled');
create type public.personal_record_type as enum ('absolute_weight', 'estimated_1rm', 'set_volume');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  avatar_url text,
  role public.user_role not null default 'casual',
  plan public.user_plan not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_plans (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  color text not null,
  muscle_groups text[] not null default '{}',
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sessions (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  workout_plan_id text not null,
  date timestamptz not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.personal_records (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  type public.personal_record_type not null,
  value numeric not null,
  weight numeric not null,
  reps integer not null,
  date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_exercises (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coach_student_relations (
  id text primary key,
  coach_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.invite_status not null default 'pending',
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index workout_plans_user_id_idx on public.workout_plans (user_id);
create index workout_sessions_user_id_date_idx on public.workout_sessions (user_id, date desc);
create index personal_records_user_id_date_idx on public.personal_records (user_id, date desc);
create index saved_exercises_user_id_idx on public.saved_exercises (user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger workout_plans_touch_updated_at
before update on public.workout_plans
for each row execute function public.touch_updated_at();
create trigger workout_sessions_touch_updated_at
before update on public.workout_sessions
for each row execute function public.touch_updated_at();
create trigger personal_records_touch_updated_at
before update on public.personal_records
for each row execute function public.touch_updated_at();
create trigger saved_exercises_touch_updated_at
before update on public.saved_exercises
for each row execute function public.touch_updated_at();

create or replace function public.keep_profile_permissions()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.id then
    new.role = old.role;
    new.plan = old.plan;
    new.email = old.email;
  end if;
  return new;
end;
$$;

create trigger profiles_keep_permissions
before update on public.profiles
for each row execute function public.keep_profile_permissions();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  requested_plan text := new.raw_user_meta_data ->> 'plan';
begin
  insert into public.profiles (id, name, email, role, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    case when requested_role = 'professional' then 'professional'::public.user_role else 'casual'::public.user_role end,
    case when requested_plan = 'professional' then 'professional'::public.user_plan else 'free'::public.user_plan end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.personal_records enable row level security;
alter table public.saved_exercises enable row level security;
alter table public.coach_student_relations enable row level security;

create policy "profiles select own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles update own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "workout plans own access"
on public.workout_plans for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "workout sessions own access"
on public.workout_sessions for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "personal records own access"
on public.personal_records for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "saved exercises own access"
on public.saved_exercises for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "coach student relations own access"
on public.coach_student_relations for select
to authenticated
using ((select auth.uid()) = coach_id or (select auth.uid()) = student_id);
