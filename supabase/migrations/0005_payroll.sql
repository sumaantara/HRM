-- ONEderland HRM — payroll: payslip records, private PDF storage, payroll access
-- Payslips are readable only by the employee they belong to and by payroll staff
-- (employees with the Payroll flag, HRD, Admin, owner). PDFs are written by the payslip edge function.

create or replace function public.hrm_my_emp() returns text language sql stable security definer set search_path = '' as $$
  select d.data->>'id' from public.docs d
  where d.col = 'employees' and d.data->>'userId' = auth.uid()::text and coalesce(d.data->>'status', '') <> 'Resigned'
  limit 1
$$;

create or replace function public.hrm_is_payroll() returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    exists (select 1 from hrm.members m where m.user_id = auth.uid() and m.level = 'owner')
    or exists (select 1 from public.docs d
               where d.col = 'employees' and d.data->>'userId' = auth.uid()::text and coalesce(d.data->>'status', '') <> 'Resigned'
                 and (coalesce((d.data->>'admin')::boolean, false) or coalesce((d.data->>'payroll')::boolean, false) or d.data->>'role' = 'hrd')))
$$;

-- the generic path rules never grant payslips; the dedicated policies below do
create or replace function public.hrm_rule_level(p text, kind text, me text) returns int language plpgsql immutable set search_path = '' as $$
declare s text[] := string_to_array(p, '/'); c text := s[1]; self boolean := (s[2] = me); lvl int;
begin
  lvl := case when kind = 'read' then 1 else 2 end;
  if c in ('requests', 'notifs', 'counters') then lvl := 1;
  elsif c in ('private', 'reviews', 'candidates', 'reminders', 'attImports', 'backups', 'sync') then lvl := 2;
  elsif c in ('dec', 'ph') then lvl := case when self then 1 when kind = 'read' then 1 else 3 end;
  elsif c in ('rd', 'sub') then lvl := case when self then 1 else 2 end;
  elsif c = 'links' then lvl := case when self then 0 else 2 end;
  elsif c = 'pv' then lvl := case when self and kind = 'read' then 1 else 2 end;
  elsif c = 'audit' then lvl := case when self then 1 when kind = 'read' then 2 else 3 end;
  elsif c in ('payslips', 'payruns') then lvl := 99;
  end if;
  return lvl;
end $$;

create policy docs_payslips_read on public.docs for select to authenticated
  using ((col = 'payslips' and (data->>'empId' = (select public.hrm_my_emp()) or (select public.hrm_is_payroll())))
      or (col = 'payruns' and (select public.hrm_is_payroll())));
create policy docs_payslips_insert on public.docs for insert to authenticated
  with check (col in ('payslips', 'payruns') and (select public.hrm_is_payroll()));
create policy docs_payslips_update on public.docs for update to authenticated
  using (col in ('payslips', 'payruns') and (select public.hrm_is_payroll()))
  with check (col in ('payslips', 'payruns') and (select public.hrm_is_payroll()));
create policy docs_payslips_delete on public.docs for delete to authenticated
  using (col in ('payslips', 'payruns') and (select public.hrm_is_payroll()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('payslips', 'payslips', false, 5242880, array['application/pdf', 'image/png', 'image/jpeg'])
  on conflict (id) do nothing;

-- employees read their own folder (<employee id>/…); payroll reads everything;
-- payroll may upload only the letterhead / stamp / signature images (_assets/…); PDFs come from the edge function
create policy hrm_payslips_read on storage.objects for select to authenticated
  using (bucket_id = 'payslips' and ((storage.foldername(name))[1] = (select public.hrm_my_emp()) or (select public.hrm_is_payroll())));
create policy hrm_payslips_assets_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'payslips' and (storage.foldername(name))[1] = '_assets' and (select public.hrm_is_payroll()));
create policy hrm_payslips_assets_update on storage.objects for update to authenticated
  using (bucket_id = 'payslips' and (storage.foldername(name))[1] = '_assets' and (select public.hrm_is_payroll()));
create policy hrm_payslips_delete on storage.objects for delete to authenticated
  using (bucket_id = 'payslips' and (select public.hrm_is_payroll()));

grant execute on function public.hrm_my_emp(), public.hrm_is_payroll() to authenticated;
