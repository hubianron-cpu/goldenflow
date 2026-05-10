create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  daily_target numeric default 3000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users
  add column if not exists first_name text,
  add column if not exists daily_target numeric default 3000,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.users
set daily_target = 3000
where daily_target is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, first_name, daily_target)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''), 3000)
  on conflict (id) do update
    set first_name = coalesce(excluded.first_name, public.users.first_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.users (id, first_name)
select id, nullif(btrim(raw_user_meta_data ->> 'first_name'), '')
from auth.users
on conflict (id) do update
  set first_name = coalesce(excluded.first_name, public.users.first_name),
      updated_at = now();

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;

create policy "users_select_own"
on public.users for select
to authenticated
using (id = auth.uid());

create policy "users_insert_own"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "users_update_own"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

notify pgrst, 'reload schema';
