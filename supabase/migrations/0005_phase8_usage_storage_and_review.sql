-- Phase 8 - storage metadata and human review workflow foundations

create extension if not exists pgcrypto;

create type public.review_type as enum ('quick_check', 'full_review');
create type public.review_status as enum ('queued', 'in_review', 'completed', 'rejected');
create type public.review_priority as enum ('standard', 'priority');

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  file_name text not null,
  file_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  storage_path text not null unique,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  review_type public.review_type not null default 'quick_check',
  status public.review_status not null default 'queued',
  priority public.review_priority not null default 'standard',
  notes text,
  snapshot_content text not null,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.files enable row level security;
alter table public.review_requests enable row level security;

create policy "files_select_own" on public.files
for select using (auth.uid() = user_id);

create policy "files_insert_own" on public.files
for insert with check (auth.uid() = user_id);

create policy "files_delete_own" on public.files
for delete using (auth.uid() = user_id);

create policy "review_requests_select_own" on public.review_requests
for select using (auth.uid() = user_id);

create policy "review_requests_insert_own" on public.review_requests
for insert with check (auth.uid() = user_id);

create policy "review_requests_update_admin" on public.review_requests
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

create index if not exists idx_files_user_created_at on public.files(user_id, created_at desc);
create index if not exists idx_files_expires_at on public.files(expires_at) where deleted_at is null;
create index if not exists idx_review_requests_user_created_at on public.review_requests(user_id, created_at desc);
create index if not exists idx_review_requests_status on public.review_requests(status, created_at asc);

drop trigger if exists review_requests_set_updated_at on public.review_requests;
create trigger review_requests_set_updated_at
before update on public.review_requests
for each row execute procedure public.set_updated_at();
