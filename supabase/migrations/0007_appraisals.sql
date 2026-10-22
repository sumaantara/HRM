-- ONEderland HRM — probation & performance reviews ("appraisals/<id>")
-- Who sees a review:   HRD, GM, Admin, owner (hrm_level() >= 2) · the reviewer (supervisor) · the employee —
--                      the employee only once it has been shared in the review session (not drafts)
-- Who writes:          HRD/GM/Admin create, reassign, sign off · the reviewer fills in drafts and records the session
--                      (a trigger stops reviewers from touching sign-off / acknowledgement / assignment fields)
--                      · the employee only acknowledges, through hrm_appraisal_ack()

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
  elsif c in ('payslips', 'payruns', 'appraisals') then lvl := 99;
  end if;
  return lvl;
end $$;

create policy docs_appraisals_read on public.docs for select to authenticated
  using (col = 'appraisals' and (
    (select public.hrm_level()) >= 2
    or data->>'reviewerId' = (select public.hrm_my_emp())
    or (data->>'empId' = (select public.hrm_my_emp()) and data->>'status' in ('scheduled', 'shared', 'acknowledged', 'closed'))));
create policy docs_appraisals_insert on public.docs for insert to authenticated
  with check (col = 'appraisals' and (select public.hrm_level()) >= 2);
create policy docs_appraisals_update on public.docs for update to authenticated
  using (col = 'appraisals' and ((select public.hrm_level()) >= 2
         or (data->>'reviewerId' = (select public.hrm_my_emp()) and data->>'status' in ('scheduled', 'draft'))))
  with check (col = 'appraisals' and ((select public.hrm_level()) >= 2
         or (data->>'reviewerId' = (select public.hrm_my_emp()) and data->>'status' in ('scheduled', 'draft', 'shared'))));
create policy docs_appraisals_delete on public.docs for delete to authenticated
  using (col = 'appraisals' and (select public.hrm_level()) >= 2);

-- reviewers can't change who/what/when, acknowledgement or HR sign-off
create or replace function public.hrm_appraisal_guard() returns trigger language plpgsql set search_path = '' as $$
declare k text;
begin
  if new.col <> 'appraisals' or current_setting('hrm.ack', true) = '1' or auth.uid() is null or public.hrm_level() >= 2 then return new; end if;
  foreach k in array array['id', 'empId', 'reviewerId', 'kind', 'stage', 'cycle', 'due', 'opensAt', 'title',
                           'ackAt', 'employeeComment', 'hrBy', 'hrAt', 'hrNote', 'hrDecision', 'closedAt', 'createdAt', 'createdBy'] loop
    if old.data ? k then new.data := jsonb_set(new.data, array[k], old.data->k); else new.data := new.data - k; end if;
  end loop;
  return new;
end $$;
create trigger hrm_appraisal_guard before update on public.docs for each row execute function public.hrm_appraisal_guard();

-- the employee confirms they received the review in the session (optionally with their own comment)
create or replace function public.hrm_appraisal_ack(aid text, comment text) returns text language plpgsql security definer set search_path = '' as $$
declare d jsonb; me text := public.hrm_my_emp(); now_ts text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  select data into d from public.docs where path = 'appraisals/' || aid for update;
  if d is null or me is null or d->>'empId' <> me then return 'not_found'; end if;
  if d->>'status' <> 'shared' then return 'not_shared'; end if;
  perform set_config('hrm.ack', '1', true);
  update public.docs set data = d || jsonb_build_object('status', 'acknowledged', 'ackAt', now_ts, 'employeeComment', left(coalesce(comment, ''), 2000),
      'history', coalesce(d->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('at', now_ts, 'by', me, 'action', 'acknowledged', 'note', left(coalesce(comment, ''), 300)))),
    updated_by = auth.uid()
  where path = 'appraisals/' || aid;
  perform set_config('hrm.ack', '', true);
  return 'ok';
end $$;
grant execute on function public.hrm_appraisal_ack(text, text) to authenticated;
