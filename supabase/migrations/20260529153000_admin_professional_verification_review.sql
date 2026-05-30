create or replace function public.is_lifto_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.profiles
     where id = auth.uid()
       and role = 'admin'::public.user_role
       and status = 'active'
  );
$$;

drop policy if exists "Admins can read professional verifications" on public.professional_verifications;
create policy "Admins can read professional verifications"
on public.professional_verifications for select
using (public.is_lifto_admin());

drop policy if exists "Admins can read professional documents" on storage.objects;
create policy "Admins can read professional documents"
on storage.objects for select
using (
  bucket_id = 'professional-documents'
  and public.is_lifto_admin()
);

create or replace function public.admin_decide_professional_verification(
  p_verification_id uuid,
  p_approve boolean,
  p_notes text default null
)
returns public.professional_verifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_row public.professional_verifications;
  v_status text := case when p_approve then 'verified' else 'rejected' end;
begin
  if v_admin_id is null or not public.is_lifto_admin() then
    raise exception 'admin access required';
  end if;

  update public.professional_verifications
     set status = v_status,
         review_notes = nullif(left(trim(coalesce(p_notes, '')), 1000), ''),
         verified_at = case when p_approve then now() else null end,
         rejected_at = case when p_approve then null else now() end,
         updated_at = now()
   where id = p_verification_id
   returning * into v_row;

  if v_row.id is null then
    raise exception 'professional verification not found';
  end if;

  perform set_config('lifto.allow_professional_verification_update', 'on', true);

  if p_approve then
    update public.profiles
       set role = 'professional'::public.user_role,
           plan = 'coach'::public.user_plan,
           professional_verification_status = 'verified',
           updated_at = now()
     where id = v_row.user_id;
  else
    update public.profiles
       set professional_verification_status = 'rejected',
           updated_at = now()
     where id = v_row.user_id;
  end if;

  insert into public.security_audit_logs (user_id, event_type, severity, metadata)
  values (
    v_row.user_id,
    case when p_approve then 'professional_verified' else 'professional_verification_rejected' end,
    case when p_approve then 'info' else 'warning' end,
    jsonb_build_object(
      'admin_id', v_admin_id,
      'verification_id', v_row.id,
      'status', v_status
    )
  );

  insert into public.security_audit_logs (user_id, event_type, severity, metadata)
  values (
    v_admin_id,
    'admin_action',
    'info',
    jsonb_build_object(
      'action', 'professional_verification_decision',
      'target_user_id', v_row.user_id,
      'verification_id', v_row.id,
      'status', v_status
    )
  );

  return v_row;
end;
$$;

revoke all on function public.admin_decide_professional_verification(uuid, boolean, text) from public;
grant execute on function public.admin_decide_professional_verification(uuid, boolean, text) to authenticated;
