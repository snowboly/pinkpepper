-- Conversation retention purge
-- Deletes conversations (and cascaded chat_messages) for free-tier users
-- that were created more than 30 days ago. Runs daily via pg_cron.

-- pg_cron is available on Supabase Pro; enable it once in the dashboard under
-- Database → Extensions → pg_cron, then this migration wires up the schedule.
create extension if not exists pg_cron with schema extensions;

-- Grant cron usage to postgres role (required on Supabase)
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- ── Purge function ────────────────────────────────────────────────────────────

create or replace function public.purge_free_tier_conversations()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.conversations c
  using public.profiles p
  where c.user_id = p.id
    and p.tier = 'free'
    and c.created_at < now() - interval '30 days';
end;
$$;

-- ── Daily schedule ────────────────────────────────────────────────────────────
-- Runs at 03:00 UTC every day. Unschedule first to make migration idempotent.

select cron.unschedule('purge-free-tier-conversations');

select cron.schedule(
  'purge-free-tier-conversations',
  '0 3 * * *',
  $$ select public.purge_free_tier_conversations(); $$
);
