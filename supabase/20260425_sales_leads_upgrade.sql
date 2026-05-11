create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  value numeric not null default 0,
  source text not null,
  status text not null,
  reason_not_closed text,
  notes text,
  last_contact_date timestamptz,
  next_action_date timestamptz,
  next_action_type text,
  deal_probability integer default 0,
  priority text default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  linked_lead_id uuid references public.leads(id) on delete set null,
  status text not null default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists phone text,
  add column if not exists value numeric not null default 0,
  add column if not exists source text,
  add column if not exists status text,
  add column if not exists reason_not_closed text,
  add column if not exists notes text,
  add column if not exists last_contact_date timestamptz,
  add column if not exists next_action_date timestamptz,
  add column if not exists next_action_type text,
  add column if not exists deal_probability integer default 0,
  add column if not exists priority text default 'medium',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.tasks
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists due_date date,
  add column if not exists linked_lead_id uuid references public.leads(id) on delete set null,
  add column if not exists status text not null default 'open',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.leads set source = 'לא ידוע' where source is null or btrim(source) = '';
update public.leads set status = 'ליד חדש' where status is null or btrim(status) = '';
update public.leads set priority = 'medium' where priority is null or btrim(priority) = '';
update public.leads set deal_probability = 0 where deal_probability is null;
update public.leads set value = 0 where value is null;
update public.tasks set status = 'open' where status is null or btrim(status) = '';

update public.leads
set status = case status
  when 'New' then 'ליד חדש'
  when 'Contacted' then 'אין מענה'
  when 'Call Scheduled' then 'נקבעה שיחה'
  when 'Won' then 'ניתנה הצעת מחיר'
  when 'Lost' then 'שיחה לא התקיימה'
  else status
end
where status in ('New', 'Contacted', 'Call Scheduled', 'Won', 'Lost');

alter table public.leads
  alter column user_id set not null,
  alter column full_name set not null,
  alter column phone set not null,
  alter column value set default 0,
  alter column value set not null,
  alter column source set not null,
  alter column status set default 'ליד חדש',
  alter column status set not null,
  alter column deal_probability set default 0,
  alter column priority set default 'medium',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.tasks
  alter column user_id set not null,
  alter column title set not null,
  alter column status set default 'open',
  alter column status set not null,
  alter column created_at set default now(),
  alter column updated_at set default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leads_deal_probability_range') then
    alter table public.leads
      add constraint leads_deal_probability_range
      check (deal_probability >= 0 and deal_probability <= 100);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'leads_priority_values') then
    alter table public.leads
      add constraint leads_priority_values
      check (priority in ('high', 'medium', 'low'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'tasks_status_values') then
    alter table public.tasks
      add constraint tasks_status_values
      check (status in ('open', 'done'));
  end if;
end $$;

alter table public.leads drop constraint if exists leads_next_action_type_values;
alter table public.leads
  add constraint leads_next_action_type_values
  check (next_action_type is null or next_action_type in ('call', 'message', 'meeting', 'follow-up'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "leads_select_own" on public.leads;
drop policy if exists "leads_insert_own" on public.leads;
drop policy if exists "leads_update_own" on public.leads;
drop policy if exists "leads_delete_own" on public.leads;
drop policy if exists "Users manage their leads" on public.leads;

create policy "leads_select_own"
on public.leads for select
to authenticated
using (user_id = auth.uid());

create policy "leads_insert_own"
on public.leads for insert
to authenticated
with check (user_id = auth.uid());

create policy "leads_update_own"
on public.leads for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "leads_delete_own"
on public.leads for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;
drop policy if exists "Users manage their tasks" on public.tasks;

create policy "tasks_select_own"
on public.tasks for select
to authenticated
using (user_id = auth.uid());

create policy "tasks_insert_own"
on public.tasks for insert
to authenticated
with check (user_id = auth.uid());

create policy "tasks_update_own"
on public.tasks for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "tasks_delete_own"
on public.tasks for delete
to authenticated
using (user_id = auth.uid());

notify pgrst, 'reload schema';
