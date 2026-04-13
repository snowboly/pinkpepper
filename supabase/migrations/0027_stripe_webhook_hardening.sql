create table if not exists public.webhook_events_processed (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.webhook_events_processed enable row level security;

create policy "service role manages processed webhook events"
on public.webhook_events_processed
for all
to service_role
using (true)
with check (true);

create or replace function public.sync_subscription_and_profile(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text default null,
  p_status text default 'pending',
  p_tier public.subscription_tier default 'free',
  p_current_period_end timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    status,
    tier,
    current_period_end
  )
  values (
    p_user_id,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_status,
    p_tier,
    p_current_period_end
  )
  on conflict (user_id)
  do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    stripe_price_id = excluded.stripe_price_id,
    status = excluded.status,
    tier = excluded.tier,
    current_period_end = excluded.current_period_end,
    updated_at = timezone('utc', now());

  update public.profiles
  set
    tier = p_tier,
    updated_at = timezone('utc', now())
  where id = p_user_id;
end;
$$;

revoke all on function public.sync_subscription_and_profile(
  uuid,
  text,
  text,
  text,
  text,
  public.subscription_tier,
  timestamptz
) from public;

grant execute on function public.sync_subscription_and_profile(
  uuid,
  text,
  text,
  text,
  text,
  public.subscription_tier,
  timestamptz
) to service_role;
