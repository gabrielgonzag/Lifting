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
set search_path = public, storage
as $$
declare
  v_user_id uuid := auth.uid();
  v_status text := case when p_status = 'rejected' then 'rejected' else 'manual_review' end;
  v_document_url text := nullif(left(trim(coalesce(p_document_url, '')), 500), '');
  v_row public.professional_verifications;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if v_document_url is not null then
    if (storage.foldername(v_document_url))[1] is distinct from v_user_id::text then
      raise exception 'document path does not belong to authenticated user';
    end if;

    if not exists (
      select 1
        from storage.objects
       where bucket_id = 'professional-documents'
         and name = v_document_url
    ) then
      raise exception 'professional document not found';
    end if;
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
    v_document_url,
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

drop policy if exists "Users can upload own professional documents" on storage.objects;
create policy "Users can upload own professional documents"
on storage.objects for insert
with check (
  bucket_id = 'professional-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
  and lower(storage.extension(name)) in ('pdf', 'jpg', 'jpeg', 'png', 'webp')
  and coalesce(metadata->>'mimetype', '') in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
  and coalesce((metadata->>'size')::bigint, 0) <= 5242880
);

drop policy if exists "Users can create own audit logs" on public.security_audit_logs;
create policy "Users can create own audit logs" on public.security_audit_logs
  for insert with check (auth.uid() = user_id);
