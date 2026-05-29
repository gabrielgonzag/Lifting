alter table public.profiles
  add column if not exists professional_verification_status text
  check (professional_verification_status in ('pending', 'manual_review', 'auto_verified', 'verified', 'rejected', 'expired'));

alter table public.profiles
  alter column professional_verification_status drop default;

create table if not exists public.professional_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  cref_number text,
  cref_region text,
  cref_category text,
  status text not null default 'pending'
    check (status in ('pending', 'manual_review', 'auto_verified', 'verified', 'rejected', 'expired')),
  verification_method text not null default 'manual'
    check (verification_method in ('automated', 'manual')),
  cpf_hash text,
  matched_name text,
  matched_region text,
  matched_status text,
  document_url text,
  review_notes text,
  verified_at timestamptz,
  rejected_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professional_verifications_user_created_idx
  on public.professional_verifications (user_id, created_at desc);

create unique index if not exists professional_verifications_one_open_idx
  on public.professional_verifications (user_id)
  where status in ('pending', 'manual_review');

alter table public.professional_verifications enable row level security;

drop policy if exists "Users can read own professional verifications" on public.professional_verifications;
create policy "Users can read own professional verifications"
on public.professional_verifications for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can submit own professional verifications" on public.professional_verifications;
create policy "Users can submit own professional verifications"
on public.professional_verifications for insert
with check (
  (select auth.uid()) = user_id
  and status in ('pending', 'manual_review')
  and verified_at is null
  and rejected_at is null
);

create or replace function public.touch_professional_verification_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists professional_verifications_touch_updated_at on public.professional_verifications;
create trigger professional_verifications_touch_updated_at
before update on public.professional_verifications
for each row execute function public.touch_professional_verification_updated_at();

create or replace function public.prevent_profile_professional_verification_client_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) = old.id
     and coalesce(current_setting('lifto.allow_professional_verification_update', true), '') <> 'on'
     and old.professional_verification_status is distinct from new.professional_verification_status then
    raise exception 'professional verification status cannot be updated by client';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_block_professional_verification_client_update on public.profiles;
create trigger profiles_block_professional_verification_client_update
before update on public.profiles
for each row execute function public.prevent_profile_professional_verification_client_update();

create or replace function public.start_professional_verification_signup(p_full_name text)
returns public.professional_verifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.professional_verifications;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.professional_verifications (user_id, full_name, status, verification_method)
  values (v_user_id, left(trim(p_full_name), 160), 'pending', 'manual')
  on conflict (user_id) where status in ('pending', 'manual_review')
  do update set
    full_name = excluded.full_name,
    status = 'pending',
    updated_at = now()
  returning * into v_row;

  perform set_config('lifto.allow_professional_verification_update', 'on', true);
  update public.profiles
     set professional_verification_status = 'pending',
         updated_at = now()
   where id = v_user_id;

  insert into public.security_audit_logs (user_id, event_type, severity, metadata)
  values (v_user_id, 'professional_verification_pending', 'info', jsonb_build_object('source', 'signup'));

  return v_row;
end;
$$;

create or replace function public.create_professional_verification_from_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requested text := coalesce(new.raw_user_meta_data->>'requested_account_type', '');
  v_full_name text := coalesce(new.raw_user_meta_data->>'name', new.email, 'Profissional LIFTO');
begin
  if v_requested <> 'professional' then
    return new;
  end if;

  insert into public.professional_verifications (user_id, full_name, status, verification_method)
  values (new.id, left(trim(v_full_name), 160), 'pending', 'manual')
  on conflict (user_id) where status in ('pending', 'manual_review')
  do nothing;

  insert into public.security_audit_logs (user_id, event_type, severity, metadata)
  values
    (new.id, 'professional_signup_started', 'info', jsonb_build_object('source', 'signup_trigger')),
    (new.id, 'professional_verification_pending', 'info', jsonb_build_object('source', 'signup_trigger'));

  perform set_config('lifto.allow_professional_verification_update', 'on', true);
  update public.profiles
     set professional_verification_status = 'pending',
         updated_at = now()
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists zzz_create_professional_verification_from_signup on auth.users;
create trigger zzz_create_professional_verification_from_signup
after insert on auth.users
for each row execute function public.create_professional_verification_from_signup();

create or replace function public.submit_professional_verification(
  p_full_name text,
  p_cpf_hash text,
  p_cref_number text,
  p_cref_region text,
  p_cref_category text,
  p_status text default 'manual_review',
  p_verification_method text default 'manual',
  p_matched_name text default null,
  p_matched_region text default null,
  p_matched_status text default null,
  p_document_url text default null
)
returns public.professional_verifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status text := case when p_status = 'rejected' then 'rejected' else 'manual_review' end;
  v_row public.professional_verifications;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.professional_verifications (
    user_id,
    full_name,
    cpf_hash,
    cref_number,
    cref_region,
    cref_category,
    status,
    verification_method,
    matched_name,
    matched_region,
    matched_status,
    document_url,
    rejected_at
  )
  values (
    v_user_id,
    left(trim(p_full_name), 160),
    p_cpf_hash,
    upper(regexp_replace(p_cref_number, '[^a-zA-Z0-9]', '', 'g')),
    upper(left(trim(p_cref_region), 12)),
    left(trim(p_cref_category), 80),
    v_status,
    'manual',
    nullif(left(trim(coalesce(p_matched_name, '')), 160), ''),
    nullif(left(trim(coalesce(p_matched_region, '')), 40), ''),
    nullif(left(trim(coalesce(p_matched_status, '')), 80), ''),
    nullif(left(trim(coalesce(p_document_url, '')), 500), ''),
    case when v_status = 'rejected' then now() else null end
  )
  on conflict (user_id) where status in ('pending', 'manual_review')
  do update set
    full_name = excluded.full_name,
    cpf_hash = excluded.cpf_hash,
    cref_number = excluded.cref_number,
    cref_region = excluded.cref_region,
    cref_category = excluded.cref_category,
    status = excluded.status,
    verification_method = 'manual',
    matched_name = excluded.matched_name,
    matched_region = excluded.matched_region,
    matched_status = excluded.matched_status,
    document_url = excluded.document_url,
    rejected_at = excluded.rejected_at,
    updated_at = now()
  returning * into v_row;

  perform set_config('lifto.allow_professional_verification_update', 'on', true);
  update public.profiles
     set professional_verification_status = v_status,
         updated_at = now()
   where id = v_user_id;

  insert into public.security_audit_logs (user_id, event_type, severity, metadata)
  values (
    v_user_id,
    case when v_status = 'rejected' then 'professional_verification_rejected' else 'professional_manual_review' end,
    case when v_status = 'rejected' then 'warning' else 'info' end,
    jsonb_build_object('cref_region', v_row.cref_region, 'cref_category', v_row.cref_category)
  );

  return v_row;
end;
$$;

create or replace function public.approve_professional_verification(
  p_verification_id uuid,
  p_role text default 'professional',
  p_auto_verified boolean default false
)
returns public.professional_verifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.professional_verifications;
  v_role public.user_role := case when p_role = 'instructor' then 'instructor'::public.user_role else 'professional'::public.user_role end;
  v_status text := case when p_auto_verified then 'auto_verified' else 'verified' end;
begin
  update public.professional_verifications
     set status = v_status,
         verified_at = now(),
         rejected_at = null,
         updated_at = now()
   where id = p_verification_id
   returning * into v_row;

  if v_row.id is null then
    raise exception 'professional verification not found';
  end if;

  perform set_config('lifto.allow_professional_verification_update', 'on', true);
  update public.profiles
     set role = v_role,
         plan = 'coach'::public.user_plan,
         professional_verification_status = v_status,
         updated_at = now()
   where id = v_row.user_id;

  insert into public.security_audit_logs (user_id, event_type, severity, metadata)
  values (
    v_row.user_id,
    'professional_verified',
    'info',
    jsonb_build_object('verification_id', v_row.id, 'role', v_role, 'status', v_status)
  );

  return v_row;
end;
$$;

revoke all on function public.approve_professional_verification(uuid, text, boolean) from public;
revoke all on function public.approve_professional_verification(uuid, text, boolean) from authenticated;
grant execute on function public.approve_professional_verification(uuid, text, boolean) to service_role;

insert into storage.buckets (id, name, public)
values ('professional-documents', 'professional-documents', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own professional documents" on storage.objects;
create policy "Users can upload own professional documents"
on storage.objects for insert
with check (
  bucket_id = 'professional-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can read own professional documents" on storage.objects;
create policy "Users can read own professional documents"
on storage.objects for select
using (
  bucket_id = 'professional-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
