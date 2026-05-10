alter table public.leads
  add column if not exists closed_at timestamptz;

update public.leads
set closed_at = coalesce(last_contact_date, updated_at, created_at)
where status = 'נסגר' and closed_at is null;

notify pgrst, 'reload schema';
