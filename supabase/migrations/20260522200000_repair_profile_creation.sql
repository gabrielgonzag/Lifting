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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, name, email, role, plan)
select
  auth_user.id,
  coalesce(auth_user.raw_user_meta_data ->> 'name', ''),
  coalesce(auth_user.email, ''),
  case
    when auth_user.raw_user_meta_data ->> 'role' = 'professional'
      then 'professional'::public.user_role
    else 'casual'::public.user_role
  end,
  case
    when auth_user.raw_user_meta_data ->> 'plan' = 'professional'
      then 'professional'::public.user_plan
    else 'free'::public.user_plan
  end
from auth.users as auth_user
on conflict (id) do nothing;

create or replace function public.ensure_profile()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  signed_in_user auth.users%rowtype;
  requested_role text;
  requested_plan text;
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

  insert into public.profiles (id, name, email, role, plan)
  values (
    signed_in_user.id,
    coalesce(signed_in_user.raw_user_meta_data ->> 'name', ''),
    coalesce(signed_in_user.email, ''),
    case when requested_role = 'professional' then 'professional'::public.user_role else 'casual'::public.user_role end,
    case when requested_plan = 'professional' then 'professional'::public.user_plan else 'free'::public.user_plan end
  )
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.ensure_profile() from public;
grant execute on function public.ensure_profile() to authenticated;
