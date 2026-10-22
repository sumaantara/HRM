-- ONEderland HRM — attendance tablets (face recognition + PIN)
--   kiosks/<id>      registered tablets (office, time zone, token hash) — HRD/GM/Admin read; written only by the kiosk function
--   faces/<empId>    face descriptors (numbers, not photos) — no client access at all; only the kiosk function reads them
--   kioskpin/<empId> PIN hash (PBKDF2) — no client access
--   facestat/<empId> consent / enrolment / PIN status — the employee and HRD/GM/Admin read it; written by the function
--   kioskstate/main  housekeeping (photo clean-up)
--   storage bucket "kiosk": proof photos <date>/<empId>-<time>.jpg, kept 7 or 30 days — HRD/GM/Admin read

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
  elsif c in ('payslips', 'payruns', 'appraisals', 'faces', 'kioskpin', 'kioskstate', 'facestat') then lvl := 99;
  elsif c = 'kiosks' then lvl := case when kind = 'read' then 2 else 99 end;
  end if;
  return lvl;
end $$;

create policy docs_facestat_read on public.docs for select to authenticated
  using (col = 'facestat' and ((select public.hrm_level()) >= 2 or data->>'empId' = (select public.hrm_my_emp())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('kiosk', 'kiosk', false, 262144, array['image/jpeg'])
  on conflict (id) do nothing;
create policy hrm_kiosk_read on storage.objects for select to authenticated
  using (bucket_id = 'kiosk' and (select public.hrm_level()) >= 2);
