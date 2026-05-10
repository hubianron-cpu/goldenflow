alter table public.tasks
  add column if not exists is_automated boolean not null default false;

create table if not exists public.task_automations_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  rule_type text not null check (rule_type in ('new_lead', 'followup_24h')),
  created_at timestamptz not null default now(),
  unique (lead_id, rule_type)
);

create index if not exists task_automations_log_lead_rule_idx
on public.task_automations_log (lead_id, rule_type);

alter table public.task_automations_log enable row level security;

drop policy if exists "task_automations_log_select_own" on public.task_automations_log;
create policy "task_automations_log_select_own"
on public.task_automations_log
for select
to authenticated
using (
  exists (
    select 1
    from public.leads
    where leads.id = task_automations_log.lead_id
      and leads.user_id = auth.uid()
  )
);

drop policy if exists "task_automations_log_insert_own" on public.task_automations_log;
create policy "task_automations_log_insert_own"
on public.task_automations_log
for insert
to authenticated
with check (
  exists (
    select 1
    from public.leads
    where leads.id = task_automations_log.lead_id
      and leads.user_id = auth.uid()
  )
);

notify pgrst, 'reload schema';
