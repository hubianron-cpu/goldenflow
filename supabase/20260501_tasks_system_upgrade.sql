alter table public.tasks
  add column if not exists priority text default 'בינונית',
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists completed_at timestamptz,
  add column if not exists deleted_at timestamptz;

alter table public.tasks
  drop constraint if exists tasks_status_values,
  drop constraint if exists tasks_priority_values;

update public.tasks
set status = case
  when status = 'done' then 'הושלמה'
  when status = 'open' then 'פתוחה'
  when status is null or btrim(status) = '' then 'פתוחה'
  else status
end;

update public.tasks
set priority = 'בינונית'
where priority is null or btrim(priority) = '';

update public.tasks
set assigned_to = coalesce(assigned_to, user_id)
where assigned_to is null;

update public.tasks
set completed_at = coalesce(completed_at, updated_at, now())
where status = 'הושלמה' and completed_at is null;

alter table public.tasks
  alter column priority set default 'בינונית',
  alter column status set default 'פתוחה';

alter table public.tasks
  add constraint tasks_status_values
    check (status in ('פתוחה', 'בתהליך', 'הושלמה', 'נדחתה')),
  add constraint tasks_priority_values
    check (priority in ('נמוכה', 'בינונית', 'גבוהה', 'דחוף'));

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

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
