-- ONEderland HRM — rate-limit records for the "Forgot password" email (docs/authrl/*): server only, no client access

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
  elsif c in ('payslips', 'payruns', 'appraisals', 'faces', 'kioskpin', 'kioskstate', 'facestat', 'authrl') then lvl := 99;
  elsif c = 'kiosks' then lvl := case when kind = 'read' then 2 else 99 end;
  end if;
  return lvl;
end $$;
