alter table public.tasks
  drop constraint if exists tasks_status_values;

update public.tasks
set status = case
  when status in ('open', 'pending', 'todo') then 'פתוחה'
  when status in ('in_progress', 'progress') then 'בתהליך'
  when status in ('done', 'completed', 'complete') then 'הושלמה'
  when status in ('postponed', 'deferred') then 'נדחתה'
  when status is null or btrim(status) = '' then 'פתוחה'
  when status in ('פתוחה', 'בתהליך', 'הושלמה', 'נדחתה') then status
  else 'פתוחה'
end;

alter table public.tasks
  add constraint tasks_status_values
  check (status in ('פתוחה', 'בתהליך', 'הושלמה', 'נדחתה'));

alter table public.tasks
  alter column status set default 'פתוחה';

notify pgrst, 'reload schema';
