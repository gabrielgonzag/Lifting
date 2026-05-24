create or replace function public.sync_profile_email_confirmation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
    set
      email_verified = true,
      status = case
        when status = 'suspended' then 'suspended'::public.user_status
        else 'active'::public.user_status
      end,
      updated_at = now()
    where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;

create trigger on_auth_user_email_confirmed
after update of email_confirmed_at on auth.users
for each row
execute function public.sync_profile_email_confirmation();
