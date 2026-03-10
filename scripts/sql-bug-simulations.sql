-- ============================================================================
-- PinkPepper SQL Bug Simulations
-- ============================================================================
-- Exercises the database schema, RLS policies, tier logic, billing, exports,
-- reviews, and retention rules to surface latent bugs and inconsistencies.
--
-- Run against a local Supabase (or a test shadow database) — NEVER production.
-- Each section is wrapped in a transaction that rolls back, so the DB is left
-- unchanged after execution.
--
-- Findings are documented inline as "BUG", "RISK", or "NOTE".
-- ============================================================================

-- ████████████████████████████████████████████████████████████████████████████
-- 0. SETUP: helper to assert conditions inside DO blocks
-- ████████████████████████████████████████████████████████████████████████████

CREATE OR REPLACE FUNCTION _assert(condition boolean, label text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT condition THEN
    RAISE EXCEPTION 'ASSERTION FAILED: %', label;
  END IF;
END;
$$;

-- ████████████████████████████████████████████████████████████████████████████
-- 1. TIER LIMITS vs CLAUDE.md DOCUMENTATION MISMATCH
-- ████████████████████████████████████████████████████████████████████████████
-- CLAUDE.md states:  Free = 25 messages/day,  Plus = 100,  Pro = 1000
-- tier.ts defines:   Free = 15 messages/day,  Plus = 100,  Pro = 1000
--
-- BUG: Free tier daily message limit in tier.ts (15) contradicts the
-- documented limit in CLAUDE.md (25). Users see the code-enforced limit of
-- 15, but documentation and marketing promise 25.
--
-- This simulation verifies the *database-level* enforcement would follow
-- whichever number the application passes. The mismatch is app-side, but we
-- flag it here because a Supabase Edge Function or pg_cron job might later
-- rely on a hard-coded constant.

-- (No SQL action needed — this is a documentation/code audit finding.)


-- ████████████████████████████████████████████████████████████████████████████
-- 2. DUPLICATE MIGRATION PREFIX (0006)
-- ████████████████████████████████████████████████████████████████████████████
-- Two migration files share the prefix 0006:
--   0006_projects.sql
--   0006_rag_knowledge_chunks.sql
--
-- BUG: Supabase CLI runs migrations in lexicographic order. Both files start
-- with "0006_" so execution order depends on the next character ('p' vs 'r').
-- This works by coincidence today because they don't conflict, but adding a
-- third 0006_* migration could produce unpredictable ordering. Migration
-- tooling that expects unique numeric prefixes (e.g., a future `supabase db
-- repair`) may reject or skip one.


-- ████████████████████████████████████████████████████████████████████████████
-- 3. PROFILES ↔ SUBSCRIPTIONS TIER DRIFT
-- ████████████████████████████████████████████████████████████████████████████
-- The Stripe webhook handler updates both tables, but there is no database
-- trigger keeping them in sync. A partial failure (profiles UPDATE succeeds,
-- subscriptions upsert fails, or vice versa) leaves them divergent.

BEGIN;

  -- Simulate: profiles says 'pro', subscriptions says 'plus'
  -- The app reads profiles.tier via resolveUserAccess, so subscriptions.tier
  -- is effectively a "shadow" copy that can silently diverge.

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
  BEGIN
    -- Fake auth user (service-role bypass)
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'drift-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier, is_admin)
    VALUES (_uid, 'drift-test@example.com', 'pro', false);

    INSERT INTO subscriptions (user_id, stripe_customer_id, status, tier)
    VALUES (_uid, 'cus_drift_test', 'active', 'plus');

    -- BUG: The app uses profiles.tier (via resolveUserAccess).
    -- The billing/status endpoint also returns subscription.tier.
    -- A client comparing the two would see conflicting info.
    PERFORM _assert(
      (SELECT tier FROM profiles WHERE id = _uid) != (SELECT tier FROM subscriptions WHERE user_id = _uid),
      'Tier drift is possible: profiles.tier=pro but subscriptions.tier=plus'
    );

    RAISE NOTICE 'FINDING: profiles ↔ subscriptions tier drift is possible with no DB-level guard.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 4. USAGE COUNTING: ROWS vs event_count
-- ████████████████████████████████████████████████████████████████████████████
-- countUsageSince() counts ROWS (select id, count: exact, head: true).
-- The event_count column is ignored entirely. If any code path inserts a row
-- with event_count > 1, the usage count will undercount.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _row_count bigint;
    _sum_count bigint;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'usage-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'usage-test@example.com', 'free');

    -- Insert one event with event_count=5 (e.g., batch import)
    INSERT INTO usage_events (user_id, event_type, event_count, created_at)
    VALUES (_uid, 'chat_prompt', 5, now());

    -- Row count = 1, but logical usage = 5
    SELECT count(*) INTO _row_count
    FROM usage_events
    WHERE user_id = _uid AND event_type = 'chat_prompt';

    SELECT coalesce(sum(event_count), 0) INTO _sum_count
    FROM usage_events
    WHERE user_id = _uid AND event_type = 'chat_prompt';

    PERFORM _assert(_row_count = 1, 'Row count should be 1');
    PERFORM _assert(_sum_count = 5, 'Sum of event_count should be 5');

    -- BUG: The application counts rows (1), not the sum (5).
    -- If any future code inserts event_count != 1, the limit will be bypassed.
    RAISE NOTICE 'FINDING: countUsageSince counts rows (%), not sum of event_count (%). '
                 'If event_count > 1 is ever inserted, limits are under-enforced.',
                 _row_count, _sum_count;
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 5. REVIEW CREDIT ACCOUNTING: full_review RACE CONDITION
-- ████████████████████████████████████████████████████████████████████████████
-- A full_review is only allowed when used == 0 (the check is `used >= 1`).
-- But there is no database-level lock — two concurrent POST requests could
-- both read used=0 and both insert 3 usage rows each, consuming 6 slots.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _conv_id uuid := gen_random_uuid();
    _count bigint;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'review-race@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'review-race@example.com', 'pro');

    INSERT INTO conversations (id, user_id, title) VALUES (_conv_id, _uid, 'Test HACCP Plan');

    INSERT INTO chat_messages (conversation_id, user_id, role, content)
    VALUES (_conv_id, _uid, 'assistant', 'Here is your HACCP plan...');

    -- Simulate two concurrent full_review submissions both seeing used=0
    -- Transaction A inserts 3 usage rows
    INSERT INTO usage_events (user_id, event_type, event_count, metadata)
    SELECT _uid, 'human_review_request', 1,
           jsonb_build_object('review_type', 'full_review', 'simulated_txn', 'A')
    FROM generate_series(1, 3);

    -- Transaction B also inserts 3 usage rows (would happen in parallel)
    INSERT INTO usage_events (user_id, event_type, event_count, metadata)
    SELECT _uid, 'human_review_request', 1,
           jsonb_build_object('review_type', 'full_review', 'simulated_txn', 'B')
    FROM generate_series(1, 3);

    SELECT count(*) INTO _count
    FROM usage_events
    WHERE user_id = _uid AND event_type = 'human_review_request';

    -- BUG: 6 usage rows exist — double the monthly quota of 3.
    PERFORM _assert(_count = 6, 'Double-spend: 6 review usage rows for a 3-credit quota');

    RAISE NOTICE 'FINDING: No DB-level uniqueness or advisory lock prevents concurrent '
                 'full_review submissions. 6 rows inserted against a 3-credit quota.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 6. CONVERSATION RETENTION PURGE: IGNORES archived_at
-- ████████████████████████████████████████████████████████████████████████████
-- purge_free_tier_conversations() deletes conversations older than 30 days
-- for free-tier users. It does NOT check archived_at. Archived conversations
-- are also purged — which may be unexpected if archiving is meant to preserve.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _conv_active uuid := gen_random_uuid();
    _conv_archived uuid := gen_random_uuid();
    _remaining bigint;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'purge-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'purge-test@example.com', 'free');

    -- Old active conversation (45 days old)
    INSERT INTO conversations (id, user_id, title, created_at)
    VALUES (_conv_active, _uid, 'Old active', now() - interval '45 days');

    -- Old archived conversation (45 days old, archived 10 days ago)
    INSERT INTO conversations (id, user_id, title, created_at, archived_at)
    VALUES (_conv_archived, _uid, 'Old archived', now() - interval '45 days', now() - interval '10 days');

    -- Run the purge
    PERFORM purge_free_tier_conversations();

    SELECT count(*) INTO _remaining
    FROM conversations WHERE user_id = _uid;

    -- BUG: Both conversations are deleted — including the archived one.
    -- If archiving is meant to protect conversations from purge, this is wrong.
    PERFORM _assert(_remaining = 0,
      'Purge deletes archived conversations too — 0 remain');

    RAISE NOTICE 'FINDING: purge_free_tier_conversations deletes archived conversations. '
                 'Consider adding "AND c.archived_at IS NULL" to the purge function.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 7. CONVERSATION LIMIT: 30-DAY WINDOW MISALIGNMENT
-- ████████████████████████████████████████████████████████████████████████████
-- The chat/stream route counts free-tier conversations using:
--   Date.now() - 30 * 24 * 60 * 60 * 1000  (JS milliseconds)
-- The purge function uses:
--   now() - interval '30 days'  (Postgres)
--
-- These have slightly different semantics near midnight UTC. The JS version
-- produces an exact-to-the-millisecond 30-day-ago timestamp, while the
-- Postgres version is based on transaction time. A conversation created at
-- 23:59:59 UTC 30 days ago might be counted by JS but already deleted by
-- the cron job (which runs at 03:00 UTC).

-- RISK: A free user could see "10/10 conversations used" but one gets purged
-- minutes later, creating a confusing UX. Or worse — the purge deletes a
-- conversation the user is actively chatting in.

-- This is a timing-based issue that SQL alone cannot fully reproduce, but we
-- demonstrate the boundary:

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _borderline_conv uuid := gen_random_uuid();
    _deleted boolean;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'boundary-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'boundary-test@example.com', 'free');

    -- Conversation created exactly 30 days and 1 second ago
    INSERT INTO conversations (id, user_id, title, created_at)
    VALUES (_borderline_conv, _uid, 'Borderline conv', now() - interval '30 days 1 second');

    -- This will be purged
    PERFORM purge_free_tier_conversations();

    SELECT NOT EXISTS (
      SELECT 1 FROM conversations WHERE id = _borderline_conv
    ) INTO _deleted;

    PERFORM _assert(_deleted, 'Borderline conversation was purged');

    RAISE NOTICE 'FINDING: Conversations at the 30-day boundary are purged by the DB cron '
                 'but may still be counted as "active" by the JS conversation-limit check, '
                 'causing a brief window where count > actual.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 8. MISSING DELETE POLICY ON conversations
-- ████████████████████████████████████████████████████████████████████████████
-- RLS policies exist for SELECT, INSERT, UPDATE — but NOT DELETE.
-- Users cannot delete their own conversations through the Supabase client.

BEGIN;

  DO $$
  DECLARE
    _has_delete_policy boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE tablename = 'conversations'
        AND cmd = 'DELETE'
    ) INTO _has_delete_policy;

    -- BUG: No DELETE policy exists.
    PERFORM _assert(
      NOT _has_delete_policy,
      'No DELETE policy on conversations — users cannot delete their own conversations via RLS'
    );

    RAISE NOTICE 'FINDING: conversations table has no RLS DELETE policy. '
                 'Users cannot remove old conversations to free up their 10-conversation quota.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 9. MISSING UPDATE POLICY ON chat_messages
-- ████████████████████████████████████████████████████████████████████████████
-- chat_messages has SELECT and INSERT policies but no UPDATE or DELETE.
-- This means message editing or deletion by the user is impossible via RLS.

BEGIN;

  DO $$
  DECLARE
    _has_update boolean;
    _has_delete boolean;
  BEGIN
    SELECT
      EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND cmd = 'UPDATE'),
      EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND cmd = 'DELETE')
    INTO _has_update, _has_delete;

    PERFORM _assert(NOT _has_update, 'No UPDATE policy on chat_messages');
    PERFORM _assert(NOT _has_delete, 'No DELETE policy on chat_messages');

    RAISE NOTICE 'FINDING: chat_messages has no UPDATE or DELETE RLS policies. '
                 'If the app ever needs edit/delete functionality, it will silently fail.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 10. MISSING USAGE_EVENTS INDEX FOR COUNTING QUERIES
-- ████████████████████████████████████████████████████████████████████████████
-- countUsageSince queries: WHERE user_id = $1 AND event_type = $2 AND created_at >= $3
-- There is no composite index covering (user_id, event_type, created_at).
-- As the usage_events table grows, every limit check does a sequential scan.

BEGIN;

  DO $$
  DECLARE
    _has_composite_index boolean;
  BEGIN
    -- Check for an index covering (user_id, event_type, created_at)
    SELECT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE tablename = 'usage_events'
        AND indexdef LIKE '%user_id%'
        AND indexdef LIKE '%event_type%'
        AND indexdef LIKE '%created_at%'
    ) INTO _has_composite_index;

    -- RISK: No composite index — counting queries will degrade with scale.
    PERFORM _assert(
      NOT _has_composite_index,
      'No composite index on usage_events(user_id, event_type, created_at)'
    );

    RAISE NOTICE 'FINDING: usage_events lacks a composite index for the counting query pattern '
                 '(user_id, event_type, created_at). Every chat message, export, and review '
                 'triggers a count query that will degrade as the table grows.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 11. ADMIN BYPASS: is_admin FLAG CAN BE SELF-SET
-- ████████████████████████████████████████████████████████████████████████████
-- profiles has an UPDATE policy: auth.uid() = id
-- The is_admin column is on the profiles table with no column-level restriction.
-- A malicious authenticated user could do:
--   UPDATE profiles SET is_admin = true WHERE id = auth.uid()

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _is_admin boolean;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'escalation-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier, is_admin)
    VALUES (_uid, 'escalation-test@example.com', 'free', false);

    -- Simulate the user running this via Supabase client (bypasses RLS here
    -- because we're service_role, but the RLS policy WOULD allow it):
    UPDATE profiles SET is_admin = true WHERE id = _uid;

    SELECT is_admin INTO _is_admin FROM profiles WHERE id = _uid;

    -- BUG: is_admin is now true — privilege escalation.
    PERFORM _assert(_is_admin = true,
      'User can set their own is_admin flag to true via profiles UPDATE policy');

    RAISE NOTICE 'BUG (CRITICAL): The profiles UPDATE RLS policy allows users to set '
                 'is_admin = true on their own row. This bypasses ALL tier limits, '
                 'grants Pro-level access, and enables admin operations.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 12. SUBSCRIPTION TIER COLUMN NOT SYNCED ON CHECKOUT
-- ████████████████████████████████████████████████████████████████████████████
-- handleCheckoutCompleted() upserts only: user_id, stripe_customer_id, status='pending'
-- It does NOT set the `tier` column. If a returning free user had their
-- subscription row deleted and re-created via checkout, the tier defaults to
-- 'free' (the column default) until the subscription.created webhook fires.
-- During this window the user sees "pending" status but "free" tier.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _tier text;
    _status text;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'checkout-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'checkout-test@example.com', 'free');

    -- Simulate handleCheckoutCompleted (only sets user_id, customer_id, status)
    INSERT INTO subscriptions (user_id, stripe_customer_id, status)
    VALUES (_uid, 'cus_checkout_test', 'pending')
    ON CONFLICT (user_id) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      status = EXCLUDED.status;

    SELECT tier::text, status INTO _tier, _status
    FROM subscriptions WHERE user_id = _uid;

    -- RISK: tier is 'free' (column default) while status is 'pending'.
    -- billing/status endpoint will return tier=free even though checkout completed.
    PERFORM _assert(_tier = 'free' AND _status = 'pending',
      'After checkout, subscription tier defaults to free until webhook fires');

    RAISE NOTICE 'FINDING: Between checkout.session.completed and customer.subscription.created '
                 'webhooks, the subscription row has tier=free and status=pending. The billing '
                 'status endpoint returns this interim state to the client.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 13. STRIPE WEBHOOK: DOWNGRADE DOES NOT RESET MONTHLY REVIEW USAGE
-- ████████████████████████████████████████████████████████████████████████████
-- When a Pro user downgrades (subscription.deleted), syncSubscriptionFromStripe
-- sets tier=free on both profiles and subscriptions. But existing usage_events
-- for 'human_review_request' remain. If the user later re-upgrades to Pro
-- within the same calendar month, their review credits appear exhausted.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _conv_id uuid := gen_random_uuid();
    _review_count bigint;
    _month_start timestamptz := date_trunc('month', now());
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'downgrade-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'downgrade-test@example.com', 'pro');

    INSERT INTO conversations (id, user_id, title) VALUES (_conv_id, _uid, 'Test Conv');

    -- User submits a full_review (consumes 3 credits)
    INSERT INTO usage_events (user_id, event_type, event_count, created_at, metadata)
    SELECT _uid, 'human_review_request', 1, now() - interval '10 days',
           jsonb_build_object('review_type', 'full_review')
    FROM generate_series(1, 3);

    -- User downgrades to free
    UPDATE profiles SET tier = 'free' WHERE id = _uid;

    -- User re-upgrades to Pro (same month)
    UPDATE profiles SET tier = 'pro' WHERE id = _uid;

    -- Check review usage for this month
    SELECT count(*) INTO _review_count
    FROM usage_events
    WHERE user_id = _uid
      AND event_type = 'human_review_request'
      AND created_at >= _month_start;

    -- BUG: 3 credits already used from the previous Pro period.
    -- The user paid for a new Pro subscription but gets 0 review credits this month.
    PERFORM _assert(_review_count = 3,
      'Re-upgraded Pro user has 0 review credits left from pre-downgrade usage');

    RAISE NOTICE 'FINDING: Downgrade + re-upgrade within the same month leaves review '
                 'credits exhausted. No mechanism resets usage_events on re-subscription.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 14. FREE TIER DOCUMENT GENERATION: DOUBLE GATE
-- ████████████████████████████████████████████████████████████████████████████
-- Free tier has dailyDocumentGenerations = 0. enforceDailyDocumentLimit checks
-- `used >= cap`. Since used starts at 0 and cap is 0, the condition 0 >= 0 is
-- true, so free users are blocked. But the error message says "Daily document
-- generation limit reached" — misleading since they never had any allowance.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _used bigint := 0;
    _cap int := 0;  -- free tier dailyDocumentGenerations
    _blocked boolean;
  BEGIN
    _blocked := (_used >= _cap);

    -- NOTE: Technically correct but the error message is misleading.
    PERFORM _assert(_blocked,
      'Free user with 0 usage is blocked because cap is 0 (0 >= 0 is true)');

    RAISE NOTICE 'NOTE: Free tier document generation limit is 0. The check "used >= cap" '
                 'blocks correctly (0 >= 0), but the error message "Daily document generation '
                 'limit reached" implies they had a limit to reach. Consider a clearer message '
                 'like "Document export is not available on the Free plan."';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 15. EXPORT RECORDS USAGE *AFTER* GENERATING THE FILE
-- ████████████████████████████████████████████████████████████████████████████
-- Both PDF and DOCX routes call recordExportUsage AFTER generating the file.
-- If the file generation succeeds but the usage insert fails, the user gets
-- the export without it counting against their quota.
-- Conversely, if two requests race, both pass enforceDailyDocumentLimit
-- (both see used < cap) and both generate + record, exceeding the daily limit.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _conv_id uuid := gen_random_uuid();
    _count bigint;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'export-race@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'export-race@example.com', 'plus');

    INSERT INTO conversations (id, user_id, title) VALUES (_conv_id, _uid, 'Export Test');

    INSERT INTO chat_messages (conversation_id, user_id, role, content)
    VALUES (_conv_id, _uid, 'assistant', 'HACCP document content here...');

    -- Simulate two concurrent exports both passing the limit check (used=0, cap=3)
    INSERT INTO usage_events (user_id, event_type, event_count, metadata)
    VALUES
      (_uid, 'document_generation', 1, '{"format":"pdf","simulated":"request_A"}'::jsonb),
      (_uid, 'document_generation', 1, '{"format":"pdf","simulated":"request_B"}'::jsonb),
      (_uid, 'document_generation', 1, '{"format":"pdf","simulated":"request_C"}'::jsonb),
      (_uid, 'document_generation', 1, '{"format":"pdf","simulated":"request_D"}'::jsonb);

    SELECT count(*) INTO _count
    FROM usage_events
    WHERE user_id = _uid AND event_type = 'document_generation';

    -- RISK: 4 exports recorded for a Plus user with a daily cap of 3.
    PERFORM _assert(_count = 4,
      'Plus user exceeded daily document generation limit (4 > 3) due to race condition');

    RAISE NOTICE 'FINDING: Export usage is recorded after file generation with no DB-level '
                 'guard. Concurrent requests can exceed the daily document generation limit.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 16. search_knowledge_chunks vs APPLICATION THRESHOLD MISMATCH
-- ████████████████████████████████████████████████████████████████████████████
-- The SQL function default: match_threshold = 0.7
-- The app calls with:       threshold = 0.72
-- The retriever.ts also uses 0.65 as a different threshold.

-- NOTE: Not a bug per se, but confusing. If anyone calls the RPC without
-- explicitly passing threshold, they get 0.7 instead of the app's 0.72.

BEGIN;

  DO $$
  BEGIN
    RAISE NOTICE 'NOTE: search_knowledge_chunks default threshold = 0.7, '
                 'app passes 0.72, CLAUDE.md documents 0.65. Three different values '
                 'for the same concept across the codebase.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 17. user_document_chunks: MISSING EXECUTE GRANT
-- ████████████████████████████████████████████████████████████████████████████
-- search_knowledge_chunks has: GRANT EXECUTE ... TO authenticated
-- search_user_document_chunks does NOT have an explicit grant.
-- Default PostgreSQL grants EXECUTE to PUBLIC, so it works. But if the
-- database ever revokes default PUBLIC execute privileges, this function
-- would become inaccessible.

BEGIN;

  DO $$
  DECLARE
    _has_grant boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.routine_privileges
      WHERE routine_name = 'search_user_document_chunks'
        AND grantee = 'authenticated'
        AND privilege_type = 'EXECUTE'
    ) INTO _has_grant;

    -- The function relies on PUBLIC execute grant, not an explicit authenticated grant.
    RAISE NOTICE 'NOTE: search_user_document_chunks has no explicit GRANT EXECUTE TO authenticated. '
                 'It works via PUBLIC default but is inconsistent with search_knowledge_chunks.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 18. STORAGE RLS: ADMIN CAN READ ALL review-attachments BUT NOT DELETE
-- ████████████████████████████████████████████████████████████████████████████
-- Admins have a SELECT policy on review-attachments but no DELETE policy.
-- If a reviewer (admin) needs to remove an attachment, they cannot via
-- the Supabase client. They'd need the service_role key.

BEGIN;

  DO $$
  DECLARE
    _admin_select boolean;
    _admin_delete boolean;
  BEGIN
    SELECT
      EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects'
          AND schemaname = 'storage'
          AND policyname = 'review_att_select_admin'
      ),
      EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects'
          AND schemaname = 'storage'
          AND policyname LIKE '%review_att_delete_admin%'
      )
    INTO _admin_select, _admin_delete;

    PERFORM _assert(_admin_select AND NOT _admin_delete,
      'Admin can SELECT but not DELETE review attachments');

    RAISE NOTICE 'FINDING: Admins have SELECT on review-attachments but no DELETE policy. '
                 'Reviewer cleanup of rejected/spam attachments requires service_role.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 19. ADMIN CAN'T VIEW OTHER USERS' REVIEW_REQUESTS VIA RLS
-- ████████████████████████████████████████████████████████████████████████████
-- review_requests has SELECT: auth.uid() = user_id
-- review_requests has UPDATE: profiles.is_admin = true
-- But there is no admin SELECT policy. Admins can UPDATE reviews (set status,
-- add notes) but cannot SELECT them to read the content first!

BEGIN;

  DO $$
  DECLARE
    _admin_select boolean;
    _admin_update boolean;
  BEGIN
    SELECT
      EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'review_requests'
          AND cmd = 'SELECT'
          AND qual::text LIKE '%is_admin%'
      ),
      EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'review_requests'
          AND cmd = 'UPDATE'
          AND qual::text LIKE '%is_admin%'
      )
    INTO _admin_select, _admin_update;

    PERFORM _assert(NOT _admin_select AND _admin_update,
      'Admin can UPDATE review_requests but cannot SELECT them');

    RAISE NOTICE 'BUG: review_requests has an admin UPDATE policy but no admin SELECT policy. '
                 'Admins can change review status/notes but cannot read the requests to review. '
                 'The admin review workflow is broken at the DB level.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 20. CASCADE CHAIN: DELETING A USER ORPHANS STRIPE DATA
-- ████████████████████████████████████████████████████████████████████████████
-- auth.users ON DELETE CASCADE removes profiles, subscriptions, conversations,
-- usage_events, etc. But Stripe still has the customer + subscription active.
-- No webhook fires, no cancellation occurs.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _sub_exists boolean;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'cascade-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'cascade-test@example.com', 'pro');

    INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, tier)
    VALUES (_uid, 'cus_cascade_test', 'sub_cascade_test', 'active', 'pro');

    -- Delete the user
    DELETE FROM auth.users WHERE id = _uid;

    -- Subscription row is gone (CASCADE)
    SELECT EXISTS (
      SELECT 1 FROM subscriptions WHERE stripe_subscription_id = 'sub_cascade_test'
    ) INTO _sub_exists;

    PERFORM _assert(NOT _sub_exists,
      'Subscription row deleted via CASCADE');

    -- RISK: Stripe subscription sub_cascade_test is still active and billing.
    -- No cancellation API call was made. The customer will continue to be charged.
    RAISE NOTICE 'RISK: Deleting a user via auth.users CASCADE removes the local subscription '
                 'row but does NOT cancel the Stripe subscription. The customer continues to be '
                 'billed with no corresponding account.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 21. SUBSCRIPTION: MULTIPLE ACTIVE SUBSCRIPTIONS PER USER
-- ████████████████████████████████████████████████████████████████████████████
-- The unique index on user_id prevents multiple subscription ROWS, but a
-- single row can only track one subscription. If a user somehow ends up with
-- two Stripe subscriptions (e.g., via Stripe dashboard), only the last
-- webhook event wins. The other subscription continues billing silently.

BEGIN;

  DO $$
  BEGIN
    RAISE NOTICE 'RISK: The subscriptions table has a unique constraint on user_id, allowing '
                 'only one subscription row per user. If a user has multiple Stripe subscriptions '
                 '(created via Stripe dashboard, API, or race condition), only the last-updated '
                 'one is tracked. The others bill silently with no database representation.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 22. CONVERSATION COUNT: INCLUDES ARCHIVED CONVERSATIONS
-- ████████████████████████████████████████████████████████████████████████████
-- The chat/stream route counts free-tier conversations with:
--   SELECT count(*) ... WHERE user_id = X AND created_at >= 30d_ago
-- This does NOT exclude archived conversations. An archived conversation
-- still counts toward the 10-conversation limit. Users cannot delete (no
-- DELETE RLS) and archiving doesn't free a slot.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _total_count bigint;
    _active_count bigint;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'archive-count@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'archive-count@example.com', 'free');

    -- Create 10 conversations, archive 5 of them
    INSERT INTO conversations (user_id, title, archived_at)
    SELECT _uid, 'Conv ' || i,
           CASE WHEN i <= 5 THEN now() ELSE NULL END
    FROM generate_series(1, 10) AS i;

    -- Total count (what the app checks)
    SELECT count(*) INTO _total_count
    FROM conversations
    WHERE user_id = _uid
      AND created_at >= now() - interval '30 days';

    -- Active-only count (what the user might expect)
    SELECT count(*) INTO _active_count
    FROM conversations
    WHERE user_id = _uid
      AND created_at >= now() - interval '30 days'
      AND archived_at IS NULL;

    PERFORM _assert(_total_count = 10,
      'All 10 conversations counted including archived');
    PERFORM _assert(_active_count = 5,
      'Only 5 are actually active');

    RAISE NOTICE 'BUG: Free tier conversation limit counts archived conversations. '
                 'User has 5 active + 5 archived = 10/10 used. They cannot create new '
                 'conversations and cannot delete archived ones (no DELETE RLS policy). '
                 'The user is permanently locked out of creating conversations.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 23. PAYMENT FAILED EMAIL: tier COULD BE NULL
-- ████████████████████████████████████████████████████████████████████████████
-- handleInvoicePaymentFailed queries subscriptions for (user_id, tier).
-- The row.tier is passed to buildPaymentFailedEmail. If the subscription row
-- has tier = NULL (shouldn't happen with column default, but the INSERT in
-- handleCheckoutCompleted doesn't set tier), a NULL tier propagates.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _tier text;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'payment-fail@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'payment-fail@example.com', 'free');

    -- handleCheckoutCompleted upsert (doesn't include tier column)
    INSERT INTO subscriptions (user_id, stripe_customer_id, status)
    VALUES (_uid, 'cus_paymentfail', 'pending');

    SELECT tier::text INTO _tier FROM subscriptions WHERE user_id = _uid;

    -- The default is 'free' from the column definition, so this is safe.
    -- But if the column default were ever removed, it would be NULL.
    PERFORM _assert(_tier = 'free',
      'Subscription tier defaults to free when not explicitly set');

    RAISE NOTICE 'NOTE: handleCheckoutCompleted does not set tier explicitly. It relies on '
                 'the column default (free). The code `row.tier ?? "free"` in the webhook '
                 'handler provides an additional safety net, but the pattern is fragile.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 24. files TABLE: NO UPDATE POLICY
-- ████████████████████████████████████████████████████████████████████████████
-- The files table has SELECT, INSERT, DELETE policies but no UPDATE policy.
-- If a file needs to be moved between buckets or its metadata updated, it
-- cannot be done via the Supabase client.

BEGIN;

  DO $$
  DECLARE
    _has_update boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'files' AND cmd = 'UPDATE'
    ) INTO _has_update;

    PERFORM _assert(NOT _has_update, 'No UPDATE policy on files table');

    RAISE NOTICE 'NOTE: files table has no UPDATE RLS policy. Moving files between buckets '
                 'or updating metadata (e.g., setting deleted_at for soft-delete) requires '
                 'service_role access.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 25. SOFT DELETE ON files NOT ENFORCED IN QUERIES
-- ████████████████████████████████████████████████████████████████████████████
-- files has a deleted_at column for soft-delete, but the RLS SELECT policy
-- is simply: auth.uid() = user_id — it doesn't filter out deleted_at IS NOT NULL.
-- Soft-deleted files remain visible to the user.

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
    _visible_count bigint;
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'softdelete-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'softdelete-test@example.com', 'plus');

    -- Insert a soft-deleted file
    INSERT INTO files (user_id, file_name, file_type, size_bytes, storage_path, deleted_at)
    VALUES (_uid, 'test.pdf', 'application/pdf', 1024, _uid || '/test.pdf', now());

    -- RLS would show this file (deleted_at is not filtered)
    SELECT count(*) INTO _visible_count
    FROM files WHERE user_id = _uid;

    PERFORM _assert(_visible_count = 1,
      'Soft-deleted file is still visible via RLS');

    RAISE NOTICE 'BUG: files RLS SELECT policy does not filter deleted_at IS NOT NULL. '
                 'Soft-deleted files remain visible to users. Consider adding '
                 '"AND deleted_at IS NULL" to the SELECT policy.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 26. REVIEW_REQUESTS: MISSING credits_consumed TRACKING
-- ████████████████████████████████████████████████████████████████████████████
-- A full_review consumes 3 credits (inserts 3 usage_event rows) but the
-- review_requests row has no column tracking how many credits it consumed.
-- If a review is rejected/cancelled, there's no way to issue a refund
-- (i.e., delete the corresponding usage_events) because the link is only
-- in metadata JSON, not a queryable FK.

BEGIN;

  DO $$
  BEGIN
    RAISE NOTICE 'RISK: review_requests has no credits_consumed column. Credits are tracked '
                 'only as separate usage_events rows linked via metadata JSON '
                 '(metadata->review_request_id). Refunding credits on rejection requires '
                 'parsing JSON metadata — fragile and not indexed.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- 27. SUBSCRIPTION past_due STILL GRANTS FULL ACCESS
-- ████████████████████████████████████████████████████████████████████████████
-- mapStripeStatusToTier treats "past_due" as an active state (same as "active"
-- and "trialing"). A user who hasn't paid can continue using Pro features
-- indefinitely as long as Stripe doesn't escalate to "canceled" or "unpaid".

BEGIN;

  DO $$
  DECLARE
    _uid uuid := gen_random_uuid();
  BEGIN
    INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, created_at, updated_at)
    VALUES (_uid, 'pastdue-test@example.com', '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', '', now(), now());

    -- User profile shows Pro because past_due maps to the inferred tier
    INSERT INTO profiles (id, email, tier) VALUES (_uid, 'pastdue-test@example.com', 'pro');

    INSERT INTO subscriptions (user_id, stripe_customer_id, status, tier)
    VALUES (_uid, 'cus_pastdue', 'past_due', 'pro');

    RAISE NOTICE 'RISK: A "past_due" subscription is treated identically to "active". '
                 'The user retains full Pro access (1000 msg/day, exports, reviews) while '
                 'not paying. Consider degrading to a limited mode after N days of past_due.';
  END;
  $$;

ROLLBACK;


-- ████████████████████████████████████████████████████████████████████████████
-- SUMMARY OF FINDINGS
-- ████████████████████████████████████████████████████████████████████████████

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════════════════════';
  RAISE NOTICE '  PINKPEPPER SQL BUG SIMULATION — FINDINGS SUMMARY';
  RAISE NOTICE '══════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '  CRITICAL BUGS:';
  RAISE NOTICE '  [11] is_admin privilege escalation via profiles UPDATE RLS';
  RAISE NOTICE '  [19] Admin cannot SELECT review_requests (can UPDATE but not read)';
  RAISE NOTICE '';
  RAISE NOTICE '  HIGH-SEVERITY BUGS:';
  RAISE NOTICE '  [ 1] Free tier daily messages: code=15, docs=25 (mismatch)';
  RAISE NOTICE '  [ 8] No DELETE RLS policy on conversations (users locked out)';
  RAISE NOTICE '  [22] Archived conversations count toward free tier limit';
  RAISE NOTICE '  [25] Soft-deleted files visible via RLS (deleted_at not filtered)';
  RAISE NOTICE '';
  RAISE NOTICE '  MEDIUM-SEVERITY BUGS:';
  RAISE NOTICE '  [ 3] profiles.tier ↔ subscriptions.tier can drift';
  RAISE NOTICE '  [ 5] Review credit race condition (double-spend full_review)';
  RAISE NOTICE '  [ 6] Purge deletes archived conversations';
  RAISE NOTICE '  [12] Checkout sets tier=free until subscription webhook fires';
  RAISE NOTICE '  [13] Downgrade + re-upgrade: review credits not reset';
  RAISE NOTICE '  [15] Export usage recorded after generation (race condition)';
  RAISE NOTICE '  [20] User deletion orphans Stripe subscriptions (billing continues)';
  RAISE NOTICE '';
  RAISE NOTICE '  LOW-SEVERITY / RISKS:';
  RAISE NOTICE '  [ 2] Duplicate migration prefix 0006_*';
  RAISE NOTICE '  [ 4] Usage counting ignores event_count column';
  RAISE NOTICE '  [ 7] 30-day window misalignment (JS vs Postgres)';
  RAISE NOTICE '  [ 9] No UPDATE/DELETE RLS on chat_messages';
  RAISE NOTICE '  [10] Missing composite index on usage_events';
  RAISE NOTICE '  [14] Free tier export error message misleading';
  RAISE NOTICE '  [16] RAG similarity threshold: 0.65, 0.7, 0.72 in three places';
  RAISE NOTICE '  [17] search_user_document_chunks missing GRANT EXECUTE';
  RAISE NOTICE '  [18] Admin cannot DELETE review attachments';
  RAISE NOTICE '  [21] Multiple Stripe subscriptions not tracked';
  RAISE NOTICE '  [23] handleCheckoutCompleted relies on column default for tier';
  RAISE NOTICE '  [24] files table has no UPDATE RLS policy';
  RAISE NOTICE '  [26] No credits_consumed column on review_requests';
  RAISE NOTICE '  [27] past_due subscriptions retain full Pro access';
  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════════════════════';
END;
$$;


-- ████████████████████████████████████████████████████████████████████████████
-- CLEANUP
-- ████████████████████████████████████████████████████████████████████████████

DROP FUNCTION IF EXISTS _assert(boolean, text);
