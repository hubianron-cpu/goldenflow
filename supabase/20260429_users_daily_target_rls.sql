-- Secure own-row access for user settings.
-- Required for saving public.users.daily_target with the authenticated client.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  daily_target numeric default 3000,
  created_at timestamptz default now()
);

alter table public.users
  add column if not exists first_name text,
  add column if not exists daily_target numeric default 3000,
  add column if not exists created_at timestamptz default now();

update public.users
set daily_target = 3000
where daily_target is null;

alter table public.users enable row level security;

drop policy if exists "Users can select own profile" on public.users;
create policy "Users can select own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

notify pgrst, 'reload schema';
