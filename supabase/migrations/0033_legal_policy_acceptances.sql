create table if not exists public.legal_policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  refund_version text not null,
  locale text not null check (locale in ('en', 'fr', 'de', 'es', 'it', 'pt')),
  source text not null check (source in ('signup', 'policy_update', 'checkout')),
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  constraint legal_policy_acceptances_current_unique unique (user_id, terms_version, privacy_version, refund_version, source)
);

alter table public.legal_policy_acceptances enable row level security;

drop policy if exists legal_acceptances_select_own on public.legal_policy_acceptances;
create policy legal_acceptances_select_own
  on public.legal_policy_acceptances
  for select
  using (auth.uid() = user_id);

revoke all on public.legal_policy_acceptances from anon;
grant select on public.legal_policy_acceptances to authenticated;
