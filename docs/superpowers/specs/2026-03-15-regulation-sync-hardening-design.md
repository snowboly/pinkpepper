# Regulation Sync Hardening Design

## Goal

Make regulation RAG updates reliable by replacing the broken EUR-Lex discovery query, preventing the cron from failing when sync-log infrastructure is missing, and exposing enough runtime state to verify whether the sync is actually operating.

## Current Problems

1. The live corpus is still the older manual markdown ingest, not the newer automated regulation sync.
2. The current EUR-Lex SPARQL query returns zero results, so the automated sync discovers nothing.
3. The connected Supabase project is missing `public.regulation_sync_log`, but the sync code expects it and can fail after ingesting chunks.
4. The sync state is not easy to inspect at runtime, so “is cron working?” is hard to answer.

## Design

### 1. Replace Discovery With Curated Core Regulations

Instead of relying on EuroVoc label matching, define a curated list of core EU food-law regulations PinkPepper must keep current:

- 178/2002
- 852/2004
- 853/2004
- 1935/2004
- 2073/2005
- 1169/2011

For each regulation:

- fetch the official EUR-Lex ELI page for the original act
- parse the `Access current version` CELEX when available
- fetch the current consolidated text from EUR-Lex
- hash and sync chunks as before

This gives a small, high-value, deterministic corpus instead of a brittle broad search.

### 2. Canonical Metadata And Legacy Replacement

Store canonical regulation metadata in chunk metadata:

- `celexNumber`
- `baseCelexNumber`
- `currentVersionDate`
- `syncedAt`

When syncing a regulation, delete both:

- the canonical source name derived from CELEX
- known legacy manual source aliases for that same regulation

That prevents the old manual corpus and new automated corpus from coexisting as duplicates.

### 3. Non-Fatal Log Table Handling

Treat `regulation_sync_log` as optional at runtime:

- if the table exists, write success/error entries as designed
- if it is missing, continue syncing and mark logging as unavailable in the sync result

This keeps the cron operational even when the deployment schema is behind the repo.

### 4. Health Visibility

Add a protected health route for the sync pipeline that reports:

- whether the log table is available
- count of regulation chunks
- latest synced timestamp inferred from chunk metadata
- distinct regulation sources present

This is enough to inspect runtime health without guessing from code.

## Testing

Add focused regression coverage for:

- parsing `Access current version` CELEX data from EUR-Lex HTML
- formatting canonical source names from consolidated CELEX numbers
- tolerating a missing sync-log table without aborting the whole sync
- health route behavior when only chunk metadata is available
