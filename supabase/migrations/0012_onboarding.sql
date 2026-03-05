-- Add onboarding fields to profiles
alter table public.profiles
  add column if not exists business_type text,
  add column if not exists onboarding_completed boolean not null default false;
