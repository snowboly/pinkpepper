-- Track processed Stripe webhook events for idempotency.
-- Prevents duplicate email sends and double-processing on event replays.

create table if not exists public.webhook_events_processed (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- Auto-purge events older than 30 days to keep the table small.
create index idx_webhook_events_processed_at on public.webhook_events_processed (processed_at);

-- Atomically sync subscription tier to both subscriptions and profiles tables.
-- Prevents inconsistent state if one write succeeds and the other fails.
create or replace function public.sync_subscription_and_profile(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_status text,
  p_tier text,
  p_current_period_end timestamptz
) returns void language plpgsql security definer as $$
begin
  insert into public.subscriptions (
    user_id, stripe_customer_id, stripe_subscription_id,
    stripe_price_id, status, tier, current_period_end
  ) values (
    p_user_id, p_stripe_customer_id, p_stripe_subscription_id,
    p_stripe_price_id, p_status, p_tier, p_current_period_end
  )
  on conflict (user_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    stripe_price_id = excluded.stripe_price_id,
    status = excluded.status,
    tier = excluded.tier,
    current_period_end = excluded.current_period_end;

  update public.profiles set tier = p_tier where id = p_user_id;
end;
$$;
