# SQL Logic Checks

Run these in the Supabase SQL editor.

The first four are read-only diagnostics.

The last two are transactional tests and end with `rollback`.

## 1. Tier mismatch: profile tier vs subscription tier/status

```sql
select
  p.id as user_id,
  p.tier as profile_tier,
  s.tier as subscription_tier,
  s.status,
  s.current_period_end
from profiles p
left join subscriptions s on s.user_id = p.id
where coalesce(p.is_admin, false) = false
  and (
    s.user_id is null
    or p.tier is distinct from coalesce(s.tier, 'free')
  )
order by p.id;
```

## 2. Exports incorrectly counted as document generation

If this returns rows, export events are polluting document-generation quota.

```sql
select
  user_id,
  count(*) as export_events_counted_as_doc_generation
from usage_events
where event_type = 'document_generation'
  and coalesce(metadata->>'format', '') in ('pdf', 'docx')
group by user_id
having count(*) > 0
order by export_events_counted_as_doc_generation desc;
```

## 3. Review-credit anomalies

Full review should consume all monthly credits.

Quick checks should consume 1 each.

```sql
with monthly_usage as (
  select
    user_id,
    date_trunc('month', created_at) as month_bucket,
    count(*) filter (where event_type = 'human_review_request') as credits_used
  from usage_events
  group by 1,2
),
monthly_requests as (
  select
    user_id,
    date_trunc('month', created_at) as month_bucket,
    count(*) filter (where review_type = 'quick_check') as quick_checks,
    count(*) filter (where review_type = 'full_review') as full_reviews
  from review_requests
  group by 1,2
)
select
  r.user_id,
  r.month_bucket,
  r.quick_checks,
  r.full_reviews,
  u.credits_used
from monthly_requests r
left join monthly_usage u
  on u.user_id = r.user_id
 and u.month_bucket = r.month_bucket
where u.credits_used is distinct from (r.quick_checks + (r.full_reviews * 3))
order by r.month_bucket desc, r.user_id;
```

## 4. Free-tier users exceeding allowed saved conversations in last 30 days

```sql
select
  c.user_id,
  count(*) as recent_conversations
from conversations c
join profiles p on p.id = c.user_id
where coalesce(p.tier, 'free') = 'free'
  and coalesce(p.is_admin, false) = false
  and c.archived_at is null
  and c.created_at >= now() - interval '30 days'
group by c.user_id
having count(*) > 10
order by recent_conversations desc;
```

## 5. Transactional test: simulate export pollution check

Replace `PUT-USER-ID-HERE` before running.

```sql
begin;

select count(*) as before_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

insert into usage_events (user_id, event_type, event_count, metadata)
values (
  '77a5b46a-beed-433e-a9a7-3bb11c227725',
  'document_generation',
  1,
  jsonb_build_object('conversation_id', 'debug-export-test', 'format', 'pdf')
);

select count(*) as after_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

rollback;
```

## 6. Transactional test: review-credit edge case

Replace `PUT-USER-ID-HERE` and `PUT-CONVERSATION-ID-HERE` before running.

```sql
begin;

insert into review_requests (
  user_id,
  conversation_id,
  review_type,
  document_category,
  status,
  priority,
  snapshot_content
) values (
  'begin;

select count(*) as before_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

insert into usage_events (user_id, event_type, event_count, metadata)
values (
  '77a5b46a-beed-433e-a9a7-3bb11c227725',
  'document_generation',
  1,
  jsonb_build_object('conversation_id', 'debug-export-test', 'format', 'pdf')
);

select count(*) as after_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

rollback;',
  'PUT-CONVERSATION-ID-HERE',
  'full_review',
  'full_haccp_plan',
  'queued',
  'priority',
  'debug only'
);

insert into usage_events (user_id, event_type, event_count, metadata)
select
  'begin;

select count(*) as before_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

insert into usage_events (user_id, event_type, event_count, metadata)
values (
  '77a5b46a-beed-433e-a9a7-3bb11c227725',
  'document_generation',
  1,
  jsonb_build_object('conversation_id', 'debug-export-test', 'format', 'pdf')
);

select count(*) as after_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

rollback;',
  'human_review_request',
  1,
  jsonb_build_object('review_type', 'full_review', 'debug', true)
from generate_series(1,3);

select
  count(*) filter (where event_type = 'human_review_request') as credits_now
from usage_events
where user_id = 'begin;

select count(*) as before_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

insert into usage_events (user_id, event_type, event_count, metadata)
values (
  '77a5b46a-beed-433e-a9a7-3bb11c227725',
  'document_generation',
  1,
  jsonb_build_object('conversation_id', 'debug-export-test', 'format', 'pdf')
);

select count(*) as after_count
from usage_events
where user_id = '77a5b46a-beed-433e-a9a7-3bb11c227725'
  and event_type = 'document_generation'
  and created_at >= date_trunc('day', now());

rollback;'
  and created_at >= date_trunc('month', now());

rollback;
```

## Best first runs

Run these first:

- `#2`
- `#3`
- `#4`

These are the fastest way to catch real logic issues.
