create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  requested_plan text := new.raw_user_meta_data ->> 'plan';
  verified boolean := new.email_confirmed_at is not null;
begin
  insert into public.profiles (id, name, email, avatar_url, email_verified, status, role, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'user_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'avatar_url',
    verified,
    case when verified then 'active'::public.user_status else 'pending_verification'::public.user_status end,
    case when requested_role = 'professional' then 'professional'::public.user_role else 'casual'::public.user_role end,
    case
      when requested_role = 'professional' and requested_plan = 'coach' then 'coach'::public.user_plan
      else 'entry'::public.user_plan
    end
  )
  on conflict (id) do update
  set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
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
  requested_role text;
  requested_plan text;
  verified boolean;
begin
  select *
  into signed_in_user
  from auth.users
  where id = auth.uid();

  if signed_in_user.id is null then
    raise exception 'Authenticated user not found';
  end if;

  requested_role := signed_in_user.raw_user_meta_data ->> 'role';
  requested_plan := signed_in_user.raw_user_meta_data ->> 'plan';
  verified := signed_in_user.email_confirmed_at is not null;

  insert into public.profiles (id, name, email, avatar_url, email_verified, status, role, plan)
  values (
    signed_in_user.id,
    coalesce(signed_in_user.raw_user_meta_data ->> 'name', signed_in_user.raw_user_meta_data ->> 'full_name', signed_in_user.raw_user_meta_data ->> 'user_name', ''),
    coalesce(signed_in_user.email, ''),
    signed_in_user.raw_user_meta_data ->> 'avatar_url',
    verified,
    case when verified then 'active'::public.user_status else 'pending_verification'::public.user_status end,
    case when requested_role = 'professional' then 'professional'::public.user_role else 'casual'::public.user_role end,
    case
      when requested_role = 'professional' and requested_plan = 'coach' then 'coach'::public.user_plan
      else 'entry'::public.user_plan
    end
  )
  on conflict (id) do update
  set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
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
