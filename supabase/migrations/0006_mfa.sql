-- ONEderland HRM — two-step verification (MFA, authenticator app / TOTP)
-- Required for: owner, Admin, HRD, GM/Director (role gm) and Finance (Payroll flag).
-- Optional for everyone else — but once a person turns it on, it is required for them too
-- (otherwise a stolen password would still open the account).
-- Enforced here, in the database: until the session is verified with the second step (JWT aal = aal2),
-- hrm_level() returns 0 (no data), and payroll / own-payslip checks return nothing.

create or replace function public.hrm_privileged() returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    exists (select 1 from hrm.members m where m.user_id = auth.uid() and m.level = 'owner')
    or exists (select 1 from public.docs d
               where d.col = 'employees' and d.data->>'userId' = auth.uid()::text and coalesce(d.data->>'status', '') <> 'Resigned'
                 and (coalesce((d.data->>'admin')::boolean, false) or coalesce((d.data->>'payroll')::boolean, false) or d.data->>'role' in ('hrd', 'gm'))))
$$;

create or replace function public.hrm_has_mfa() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified')
$$;

create or replace function public.hrm_mfa_ok() returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is null
      or coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
      or not (public.hrm_privileged() or public.hrm_has_mfa())
$$;

create or replace function public.hrm_level() returns integer language sql stable security definer set search_path = '' as $$
  select case
    when auth.uid() is null then -1
    when not public.hrm_mfa_ok() then 0
    when exists (select 1 from hrm.members m where m.user_id = auth.uid() and m.level = 'owner') then 3
    else coalesce((
      select case when coalesce((d.data->>'admin')::boolean, false) or d.data->>'role' in ('hrd', 'gm') then 2 else 1 end
      from public.docs d
      where d.col = 'employees' and d.data->>'userId' = auth.uid()::text and coalesce(d.data->>'status', '') <> 'Resigned'
      order by 1 desc limit 1), 0)
  end
$$;

create or replace function public.hrm_is_payroll() returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and public.hrm_mfa_ok() and (
    exists (select 1 from hrm.members m where m.user_id = auth.uid() and m.level = 'owner')
    or exists (select 1 from public.docs d
               where d.col = 'employees' and d.data->>'userId' = auth.uid()::text and coalesce(d.data->>'status', '') <> 'Resigned'
                 and (coalesce((d.data->>'admin')::boolean, false) or coalesce((d.data->>'payroll')::boolean, false) or d.data->>'role' = 'hrd')))
$$;

create or replace function public.hrm_my_emp() returns text language sql stable security definer set search_path = '' as $$
  select d.data->>'id' from public.docs d
  where public.hrm_mfa_ok() and d.col = 'employees' and d.data->>'userId' = auth.uid()::text and coalesce(d.data->>'status', '') <> 'Resigned'
  limit 1
$$;

-- whoami also tells the app whether the second step is needed
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
    'level', public.hrm_level(),
    'mfa', jsonb_build_object('required', public.hrm_privileged() or public.hrm_has_mfa(), 'mandatory', public.hrm_privileged(),
                              'enrolled', public.hrm_has_mfa(), 'aal', coalesce(auth.jwt()->>'aal', 'aal1')));
end $$;

-- who has two-step verification on (user ids only) — HRD / GM / Admin, for the System → Access overview
create or replace function public.hrm_mfa_users() returns jsonb language sql stable security definer set search_path = '' as $$
  select case when public.hrm_level() >= 2
    then coalesce((select jsonb_agg(distinct f.user_id) from auth.mfa_factors f where f.status = 'verified'), '[]'::jsonb)
    else '[]'::jsonb end
$$;

-- may the caller reset the target's two-step verification (lost phone)? Owner: anyone else. Admin: anyone else except the owner.
create or replace function public.hrm_mfa_reset_allowed(target uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and target is not null and target <> auth.uid() and public.hrm_mfa_ok() and (
    exists (select 1 from hrm.members m where m.user_id = auth.uid() and m.level = 'owner')
    or (exists (select 1 from public.docs d where d.col = 'employees' and d.data->>'userId' = auth.uid()::text
                and coalesce(d.data->>'status', '') <> 'Resigned' and coalesce((d.data->>'admin')::boolean, false))
        and not exists (select 1 from hrm.members m where m.user_id = target and m.level = 'owner')))
$$;

grant execute on function public.hrm_privileged(), public.hrm_has_mfa(), public.hrm_mfa_ok(), public.hrm_mfa_users(), public.hrm_mfa_reset_allowed(uuid) to authenticated;
