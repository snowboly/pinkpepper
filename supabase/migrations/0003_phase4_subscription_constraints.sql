-- Phase 4 - billing hardening

create unique index if not exists subscriptions_user_id_key on public.subscriptions(user_id);
create unique index if not exists subscriptions_customer_id_key on public.subscriptions(stripe_customer_id);
create unique index if not exists subscriptions_subscription_id_key on public.subscriptions(stripe_subscription_id);
