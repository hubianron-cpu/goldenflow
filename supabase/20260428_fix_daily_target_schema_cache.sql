-- Fix PGRST204 for the daily target editor.
-- The dashboard stores per-user settings in public.users.
alter table public.users
  add column if not exists daily_target numeric default 3000;

update public.users
set daily_target = 3000
where daily_target is null;

notify pgrst, 'reload schema';
