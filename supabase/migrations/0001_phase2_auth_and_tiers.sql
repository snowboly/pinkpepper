-- Phase 2 - auth, profile tier, subscriptions, usage

create type public.subscription_tier as enum ('free', 'plus', 'pro');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  tier public.subscription_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive',
  tier public.subscription_tier not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_count integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "subscriptions_select_own" on public.subscriptions
for select using (auth.uid() = user_id);

create policy "usage_select_own" on public.usage_events
for select using (auth.uid() = user_id);

create policy "usage_insert_own" on public.usage_events
for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, tier)
  values (new.id, new.email, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();
