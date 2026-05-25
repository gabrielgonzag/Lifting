alter table public.profiles
add column if not exists username text;

create unique index if not exists profiles_username_unique_idx
on public.profiles (username)
where username is not null;

create or replace function public.lifting_username_from_email(email text, user_id uuid)
returns text
language plpgsql
immutable
as $$
declare
  raw_username text := split_part(coalesce(email, ''), '@', 1);
  clean_username text;
begin
  clean_username := regexp_replace(lower(coalesce(raw_username, '')), '[^a-z0-9_.-]+', '', 'g');

  if clean_username = '' then
    clean_username := 'user_' || substr(replace(user_id::text, '-', ''), 1, 8);
  end if;

  return clean_username;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_google boolean := coalesce(new.raw_app_meta_data ->> 'provider', '') = 'google'
    or coalesce(new.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google';
  verified boolean := new.email_confirmed_at is not null or is_google;
begin
  insert into public.profiles (id, name, username, email, avatar_url, email_verified, status, role, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'user_name', public.lifting_username_from_email(new.email, new.id)),
    public.lifting_username_from_email(new.email, new.id),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'avatar_url',
    verified,
    case when verified then 'active'::public.user_status else 'pending_verification'::public.user_status end,
    'casual'::public.user_role,
    'entry'::public.user_plan
  )
  on conflict (id) do update
  set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    username = coalesce(public.profiles.username, excluded.username),
    email = excluded.email,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    email_verified = excluded.email_verified,
    status = case
      when public.profiles.status = 'suspended' then 'suspended'::public.user_status
      else excluded.status
    end,
    updated_at = now();
  return new;
end;
$$;

create or replace function public.ensure_profile()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  signed_in_user auth.users%rowtype;
  is_google boolean;
  verified boolean;
begin
  select *
  into signed_in_user
  from auth.users
  where id = auth.uid();

  if signed_in_user.id is null then
    raise exception 'Authenticated user not found';
  end if;

  is_google := coalesce(signed_in_user.raw_app_meta_data ->> 'provider', '') = 'google'
    or coalesce(signed_in_user.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google';
  verified := signed_in_user.email_confirmed_at is not null or is_google;

  insert into public.profiles (id, name, username, email, avatar_url, email_verified, status, role, plan)
  values (
    signed_in_user.id,
    coalesce(signed_in_user.raw_user_meta_data ->> 'name', signed_in_user.raw_user_meta_data ->> 'full_name', signed_in_user.raw_user_meta_data ->> 'user_name', public.lifting_username_from_email(signed_in_user.email, signed_in_user.id)),
    public.lifting_username_from_email(signed_in_user.email, signed_in_user.id),
    coalesce(signed_in_user.email, ''),
    signed_in_user.raw_user_meta_data ->> 'avatar_url',
    verified,
    case when verified then 'active'::public.user_status else 'pending_verification'::public.user_status end,
    'casual'::public.user_role,
    'entry'::public.user_plan
  )
  on conflict (id) do update
  set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    username = coalesce(public.profiles.username, excluded.username),
    email = excluded.email,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    email_verified = excluded.email_verified,
    status = case
      when public.profiles.status = 'suspended' then 'suspended'::public.user_status
      else excluded.status
    end,
    updated_at = now();
end;
$$;

revoke all on function public.ensure_profile() from public;
grant execute on function public.ensure_profile() to authenticated;
