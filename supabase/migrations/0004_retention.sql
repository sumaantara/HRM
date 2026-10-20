-- ONEderland HRM — retention & hardening (run once in Supabase → SQL Editor → New query → Run)
-- Keeps daily server snapshots 30 days (+ Sunday ones 6 months, manual ones 90 days),
-- the change log ~13 months, and removes API access for signed-out visitors.

create or replace function hrm.prune() returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from hrm.snapshots where kind = 'daily' and taken_at < now() - interval '30 days'
    and not (extract(isodow from taken_at) = 7 and taken_at > now() - interval '183 days');
  delete from hrm.snapshots where kind = 'manual' and taken_at < now() - interval '90 days';
  delete from hrm.changelog where at < now() - interval '400 days';
  delete from hrm.leases where expires_at < now() - interval '1 day';
end $$;

revoke all on public.docs from anon;
revoke execute on all functions in schema public from public, anon;
grant execute on function public.hrm_level(), public.hrm_rule_level(text, text, text), public.hrm_whoami(), public.hrm_link_by_email(),
  public.hrm_claim(text, text), public.hrm_acquire(text, text, int), public.hrm_profiles(uuid[]), public.hrm_snapshots(),
  public.hrm_snapshot(bigint), public.hrm_snapshot_now(), public.hrm_changelog(int) to authenticated;

-- One-time cleanup of the rows used to test the access rules during setup (safe: real data uses other ids)
delete from public.docs where path in ('employees/t1', 'employees/t2', 'private/t1', 'private/t9', 'requests/x1',
  'dec/11111111-1111-1111-1111-111111111111', 'links/33333333-3333-3333-3333-333333333333');
delete from hrm.snapshots where taken_at < '2026-10-20 07:45:00+00';
delete from hrm.changelog where user_id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')
  or (user_id is null and at < '2026-10-20 07:45:00+00');
delete from hrm.leases where holder = 'h';
