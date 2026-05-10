alter table public.tasks
  add column if not exists priority text default 'בינונית',
  add column if not exists assigned_to uuid,
  add column if not exists completed_at timestamptz,
  add column if not exists deleted_at timestamptz;

notify pgrst, 'reload schema';
