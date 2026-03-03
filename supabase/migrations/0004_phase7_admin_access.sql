-- Phase 7 - admin access controls

alter table public.profiles
add column if not exists is_admin boolean not null default false;

create index if not exists profiles_is_admin_idx on public.profiles (is_admin);
