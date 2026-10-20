-- applied 0002_rpcs
create or replace function public.hrm_whoami() returns jsonb language plpgsql security definer set search_path = '' as $$
declare u record; owner_email text;
begin
  if auth.uid() is null then return null; end if;
  select id, email, email_confirmed_at, raw_user_meta_data into u from auth.users where id = auth.uid();
  select value into owner_email from hrm.settings where key = 'owner_email';
  if owner_email is not null and u.email_confirmed_at is not null and lower(u.email) = lower(owner_email)
     and not exists (select 1 from hrm.members where level = 'owner') then
    insert into hrm.members(user_id, level) values (auth.uid(), 'owner') on conflict do nothing;
  end if;
  return jsonb_build_object(
    'id', auth.uid(), 'email', u.email,
    'name', coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    'confirmed', u.email_confirmed_at is not null,
    'level', public.hrm_level());
end $$;

create or replace function public.hrm_link_by_email() returns text language plpgsql security definer set search_path = '' as $$
declare u record; e record; n int;
begin
  if auth.uid() is null then return null; end if;
  if exists (select 1 from public.docs where col = 'employees' and data->>'userId' = auth.uid()::text) then return 'linked'; end if;
  select email, email_confirmed_at into u from auth.users where id = auth.uid();
  if u.email_confirmed_at is null then return 'unverified'; end if;
  select count(*) into n from public.docs
    where col = 'employees' and lower(trim(data->>'email')) = lower(u.email) and coalesce(data->>'status', '') <> 'Resigned'
      and coalesce((data->>'system')::boolean, false) = false;
  if n <> 1 then return case when n = 0 then 'no_match' else 'ambiguous' end; end if;
  select path, data into e from public.docs
    where col = 'employees' and lower(trim(data->>'email')) = lower(u.email) and coalesce(data->>'status', '') <> 'Resigned'
      and coalesce((data->>'system')::boolean, false) = false;
  if coalesce(e.data->>'userId', '') <> '' then return 'taken'; end if;
  update public.docs set data = data || jsonb_build_object('userId', auth.uid()::text, 'rev', coalesce((data->>'rev')::int, 0) + 1) where path = e.path;
  insert into public.docs(path, data) values ('links/' || auth.uid(), jsonb_build_object(
    'empId', e.data->>'id', 'empNo', e.data->>'empNo', 'empName', e.data->>'name', 'status', 'approved', 'how', 'verified email match', 'decidedAt', now()))
    on conflict (path) do update set data = excluded.data;
  return 'linked';
end $$;

create or replace function public.hrm_claim(emp_no text, full_name text) returns text language plpgsql security definer set search_path = '' as $$
declare e record;
begin
  if auth.uid() is null then return 'signed_out'; end if;
  select path, data into e from public.docs
    where col = 'employees' and upper(trim(data->>'empNo')) = upper(trim(emp_no)) and coalesce(data->>'status', '') <> 'Resigned' limit 1;
  if e.path is null or lower(regexp_replace(trim(e.data->>'name'), '\s+', ' ', 'g')) <> lower(regexp_replace(trim(full_name), '\s+', ' ', 'g')) then
    return 'not_found';
  end if;
  if coalesce(e.data->>'userId', '') <> '' then return 'taken'; end if;
  insert into public.docs(path, data) values ('links/' || auth.uid(), jsonb_build_object(
    'empId', e.data->>'id', 'empNo', e.data->>'empNo', 'empName', e.data->>'name', 'status', 'pending', 'at', now()))
    on conflict (path) do update set data = excluded.data;
  return 'pending';
end $$;

create or replace function public.hrm_acquire(p text, holder text, ttl_ms int) returns jsonb language plpgsql security definer set search_path = '' as $$
declare l record;
begin
  if public.hrm_level() < public.hrm_rule_level(p, 'write', auth.uid()::text) then raise exception 'denied' using errcode = '42501'; end if;
  select * into l from hrm.leases where path = p for update;
  if found and l.expires_at > now() and l.holder <> holder then
    return jsonb_build_object('acquired', false, 'expiresAt', l.expires_at);
  end if;
  insert into hrm.leases(path, holder, expires_at) values (p, holder, now() + make_interval(secs => least(greatest(ttl_ms, 1000), 120000) / 1000.0))
    on conflict (path) do update set holder = excluded.holder, expires_at = excluded.expires_at;
  return jsonb_build_object('acquired', true, 'holder', holder);
end $$;

create or replace function public.hrm_profiles(ids uuid[]) returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(u.id, jsonb_build_object(
    'id', u.id, 'email', case when u.email_confirmed_at is not null then u.email end,
    'name', coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)))), '{}'::jsonb)
  from auth.users u
  where u.id = any(ids) and (public.hrm_level() >= 2 or u.id = auth.uid())
$$;

create or replace function public.hrm_snapshots() returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if public.hrm_level() < 2 then raise exception 'denied' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', id, 'at', taken_at, 'kind', kind, 'docs', doc_count, 'bytes', bytes) order by taken_at desc) from hrm.snapshots), '[]'::jsonb);
end $$;

create or replace function public.hrm_snapshot(sid bigint) returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if public.hrm_level() < 2 then raise exception 'denied' using errcode = '42501'; end if;
  return (select jsonb_build_object('id', id, 'at', taken_at, 'kind', kind, 'data', data) from hrm.snapshots where id = sid);
end $$;

create or replace function public.hrm_changelog(lim int default 200) returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if public.hrm_level() < 2 then raise exception 'denied' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(x) from (select id, at, user_id, op, path from hrm.changelog order by id desc limit least(lim, 1000)) x), '[]'::jsonb);
end $$;

grant execute on function public.hrm_level(), public.hrm_rule_level(text, text, text), public.hrm_whoami(), public.hrm_link_by_email(),
  public.hrm_claim(text, text), public.hrm_acquire(text, text, int), public.hrm_profiles(uuid[]), public.hrm_snapshots(),
  public.hrm_snapshot(bigint), public.hrm_changelog(int) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('files', 'files', false, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('backups', 'backups', false, 52428800, array['application/json'])
  on conflict (id) do nothing;

create policy hrm_files_read on storage.objects for select to authenticated using (bucket_id = 'files' and (select public.hrm_level()) >= 1);
create policy hrm_files_insert on storage.objects for insert to authenticated with check (bucket_id = 'files' and (select public.hrm_level()) >= 1);
create policy hrm_files_delete on storage.objects for delete to authenticated using (bucket_id = 'files' and ((select public.hrm_level()) >= 2 or owner_id = (select auth.uid())::text));
create policy hrm_backups_all on storage.objects for all to authenticated
  using (bucket_id = 'backups' and (select public.hrm_level()) >= 2)
  with check (bucket_id = 'backups' and (select public.hrm_level()) >= 2);
