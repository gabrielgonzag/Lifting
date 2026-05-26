alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists goal text,
  add column if not exists experience_level text;

alter table public.profiles
  add constraint profiles_goal_check
  check (goal is null or goal in ('hipertrofia', 'forca', 'emagrecimento', 'condicionamento', 'saude_geral'))
  not valid;

alter table public.profiles
  add constraint profiles_experience_level_check
  check (experience_level is null or experience_level in ('iniciante', 'intermediario', 'avancado', 'atleta'))
  not valid;

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username))
  where username is not null;

create index if not exists profiles_user_goal_idx on public.profiles (goal);

comment on column public.profiles.bio is 'Short user-editable profile bio. Protected fields such as role, plan, status and email_verified are not editable by public clients.';
comment on column public.profiles.goal is 'User fitness goal: hipertrofia, forca, emagrecimento, condicionamento or saude_geral.';
comment on column public.profiles.experience_level is 'User training experience level.';
