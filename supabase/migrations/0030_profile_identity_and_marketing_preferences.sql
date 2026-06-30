alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists company_name text,
  add column if not exists marketing_email_opt_in boolean not null default false,
  add column if not exists marketing_email_opted_at timestamptz,
  add column if not exists marketing_email_unsubscribed_at timestamptz;
