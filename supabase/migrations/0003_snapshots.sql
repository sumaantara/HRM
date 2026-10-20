-- applied 0003_snapshots
create extension if not exists pg_cron;

create or replace function hrm.take_snapshot(k text default 'daily') returns bigint language plpgsql security definer set search_path = '' as $$
declare d jsonb; n int; sid bigint;
begin
  select coalesce(jsonb_object_agg(path, jsonb_build_object('data', data, 'v', version)), '{}'::jsonb), count(*) into d, n
    from public.docs where path not like 'pv/%' and path not like 'sync/%';
  insert into hrm.snapshots(kind, doc_count, bytes, data) values (k, n, octet_length(d::text), d) returning id into sid;
  perform hrm.prune();
  return sid;
end $$;

-- retention is installed separately (0004_retention.sql); until then nothing is pruned
create or replace function hrm.prune() returns void language plpgsql security definer set search_path = '' as $$
begin
  return;
end $$;

create or replace function public.hrm_snapshot_now() returns bigint language plpgsql security definer set search_path = '' as $$
begin
  if public.hrm_level() < 2 then raise exception 'denied' using errcode = '42501'; end if;
  if (select count(*) from hrm.snapshots where kind = 'manual' and taken_at > now() - interval '1 hour') >= 5 then
    raise exception 'too many snapshots, try later' using errcode = '54000';
  end if;
  return hrm.take_snapshot('manual');
end $$;
grant execute on function public.hrm_snapshot_now() to authenticated;

select cron.schedule('hrm-daily-snapshot', '0 18 * * *', $$select hrm.take_snapshot('daily')$$);
