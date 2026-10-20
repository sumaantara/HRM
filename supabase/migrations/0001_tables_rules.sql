-- applied 0001_tables_rules
create table if not exists hrm.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level text not null check (level in ('owner')),
  created_at timestamptz not null default now()
);
create table if not exists hrm.leases (path text primary key, holder text not null, expires_at timestamptz not null);
create table if not exists hrm.snapshots (
  id bigserial primary key,
  taken_at timestamptz not null default now(),
  kind text not null default 'daily',
  doc_count int not null,
  bytes int not null,
  data jsonb not null
);
create table if not exists hrm.changelog (
  id bigserial primary key,
  at timestamptz not null default now(),
  user_id uuid,
  op text not null,
  path text not null
);
create index if not exists changelog_at on hrm.changelog(at);

create table if not exists public.docs (
  path text primary key
    check (path ~ '^[A-Za-z0-9_.~:@+-]{1,200}(/[A-Za-z0-9_.~:@+-]{1,200}){1,13}$')
    check (array_length(string_to_array(path, '/'), 1) % 2 = 0),
  col text generated always as (regexp_replace(path, '/[^/]+$', '')) stored,
  data jsonb not null default '{}'::jsonb check (octet_length(data::text) <= 900000),
  version int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create index if not exists docs_col on public.docs(col);
create index if not exists docs_emp_user on public.docs ((data->>'userId')) where col = 'employees';

create or replace function hrm.docs_stamp() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.path <> old.path then raise exception 'path is immutable'; end if;
    new.version := old.version + 1;
  else
    new.version := 1;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
create trigger docs_stamp before insert or update on public.docs for each row execute function hrm.docs_stamp();

create or replace function hrm.docs_log() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.path, old.path) like 'pv/%' or coalesce(new.path, old.path) like 'sync/%' then return null; end if;
  insert into hrm.changelog(user_id, op, path) values (auth.uid(), lower(tg_op), coalesce(new.path, old.path));
  return null;
end $$;
create trigger docs_log after insert or update or delete on public.docs for each row execute function hrm.docs_log();

create or replace function public.hrm_level() returns int language sql stable security definer set search_path = '' as $$
  select case
    when auth.uid() is null then -1
    when exists (select 1 from hrm.members m where m.user_id = auth.uid() and m.level = 'owner') then 3
    else coalesce((
      select case when coalesce((d.data->>'admin')::boolean, false) or d.data->>'role' in ('hrd', 'gm') then 2 else 1 end
      from public.docs d
      where d.col = 'employees' and d.data->>'userId' = auth.uid()::text and coalesce(d.data->>'status', '') <> 'Resigned'
      order by 1 desc limit 1), 0)
  end
$$;

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
  end if;
  return lvl;
end $$;

alter table public.docs enable row level security;
create policy docs_read on public.docs for select to authenticated
  using ((select public.hrm_level()) >= public.hrm_rule_level(path, 'read', (select auth.uid())::text));
create policy docs_insert on public.docs for insert to authenticated
  with check ((select public.hrm_level()) >= public.hrm_rule_level(path, 'write', (select auth.uid())::text));
create policy docs_update on public.docs for update to authenticated
  using ((select public.hrm_level()) >= public.hrm_rule_level(path, 'write', (select auth.uid())::text))
  with check ((select public.hrm_level()) >= public.hrm_rule_level(path, 'write', (select auth.uid())::text));
create policy docs_delete on public.docs for delete to authenticated
  using ((select public.hrm_level()) >= public.hrm_rule_level(path, 'write', (select auth.uid())::text));
grant select, insert, update, delete on public.docs to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;
