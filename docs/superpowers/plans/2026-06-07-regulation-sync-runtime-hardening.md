# Regulation Sync Runtime Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the monthly regulation sync tolerate slow source feeds, avoid unnecessary seed re-ingestion, and stop cleanly before the Vercel execution deadline.

**Architecture:** Keep source discovery independent from ingestion. UK feed requests run concurrently and return successful candidates plus per-feed failures. Seed idempotency uses both sync-log hashes and active knowledge-chunk version metadata. The orchestrator enforces a time budget and records a run-level completion marker only when discovery and candidate processing complete.

**Tech Stack:** TypeScript, Next.js route handlers, Supabase/PostgREST, Vitest.

---

## Chunk 1: Discovery Reliability

### Task 1: Make UK feed discovery bounded and tolerant

**Files:**
- Modify: `src/lib/rag/cellar-client.ts`
- Test: `src/__tests__/regulation-sync.test.ts`

- [ ] Add a failing test proving one timed-out UK feed does not discard candidates from successful feeds.
- [ ] Run the focused test and confirm the current sequential implementation fails.
- [ ] Fetch UK feeds concurrently with a short per-feed timeout and collect failures without rejecting the full discovery operation.
- [ ] Return successful deduplicated candidates and expose feed failure counts for logging.
- [ ] Run the focused tests.

## Chunk 2: Idempotency And Cursor Safety

### Task 2: Fall back to active chunk metadata when sync logs are incomplete

**Files:**
- Modify: `src/lib/rag/regulation-sync.ts`
- Test: `src/__tests__/regulation-sync.test.ts`

- [ ] Add failing tests for matching an already-active `source_key` and `version_key`.
- [ ] Implement a metadata lookup fallback before downloading and embedding unchanged seed text.
- [ ] Preserve content-hash comparison when a completed sync-log entry exists.
- [ ] Run the focused tests.

### Task 3: Separate run completion from per-regulation success

**Files:**
- Modify: `src/lib/rag/regulation-sync.ts`
- Test: `src/__tests__/regulation-sync.test.ts`

- [ ] Add a failing test proving the discovery cursor ignores ordinary regulation success rows.
- [ ] Write a `RUN_COMPLETE` log row only after all candidates have been considered.
- [ ] Read the next discovery cursor only from `RUN_COMPLETE` rows.
- [ ] Do not advance the cursor after a time-budget stop or discovery failure.
- [ ] Run the focused tests.

## Chunk 3: Runtime Budget

### Task 4: Stop cleanly before the route deadline

**Files:**
- Modify: `src/lib/rag/regulation-sync.ts`
- Test: `src/__tests__/regulation-sync.test.ts`

- [ ] Add tests for the time-budget helper and result reporting.
- [ ] Stop starting new candidates when the remaining budget is below the safety reserve.
- [ ] Return `completed`, `stoppedEarly`, and `remainingRegulations` fields.
- [ ] Keep already activated versions intact and leave remaining candidates for the next run.
- [ ] Run related tests, typecheck, and commit.

