-- Repair migration for the dashboard money features.
-- Fixes:
-- - 42703: column leads.closed_at does not exist
-- - PGRST204: daily_target missing from users schema cache

alter table public.leads
  add column if not exists closed_at timestamptz;

alter table public.users
  add column if not exists daily_target numeric default 3000;

update public.users
set daily_target = 3000
where daily_target is null;

notify pgrst, 'reload schema';
