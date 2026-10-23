-- ONEderland HRM — sign-in screen: tell "no account for this email" apart from "wrong password".
-- Returns only a status word (no names / ids). The short sleep slows down anyone trying many addresses.
create or replace function public.hrm_email_status(p_email text) returns text language plpgsql security definer set search_path = '' as $$
declare e text := lower(trim(coalesce(p_email, ''))); u record;
begin
  perform pg_sleep(0.3);
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then return 'none'; end if;
  select id, encrypted_password into u from auth.users where lower(email) = e limit 1;
  if u.id is not null then return case when coalesce(u.encrypted_password, '') = '' then 'no_password' else 'ok' end; end if;
  if exists (select 1 from public.docs d where d.col = 'employees' and lower(trim(d.data->>'email')) = e and coalesce(d.data->>'status', '') <> 'Resigned') then return 'not_invited'; end if;
  return 'none';
end $$;
grant execute on function public.hrm_email_status(text) to anon, authenticated;
