do $$
begin
  create type public.user_status as enum ('pending_verification', 'active', 'suspended');
exception
  when duplicate_object then null;
end $$;

alter type public.user_role add value if not exists 'enterprise_admin';
alter type public.user_role add value if not exists 'instructor';

alter type public.user_plan add value if not exists 'entry';
alter type public.user_plan add value if not exists 'core';
alter type public.user_plan add value if not exists 'coach';
alter type public.user_plan add value if not exists 'elite';
