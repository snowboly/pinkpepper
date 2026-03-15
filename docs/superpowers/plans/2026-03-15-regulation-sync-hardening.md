# Regulation Sync Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair regulation RAG automation so core food-law regulations can be refreshed from official EUR-Lex current-version pages and the cron pipeline can be inspected and run safely.

**Architecture:** Replace brittle discovery with a curated core-regulations manifest in the EUR-Lex client, keep the existing chunk/embed/upsert flow, and make sync logging optional so missing schema does not abort ingestion. Add a small protected health route that reports sync state from chunk metadata and optional logs.

**Tech Stack:** Next.js route handlers, Supabase admin client, official EUR-Lex HTML pages, Vitest

---

## Chunk 1: Discovery And Parsing Tests

### Task 1: Add failing tests for current-version parsing

**Files:**
- Create: `src/__tests__/regulation-sync.test.ts`
- Modify: `src/lib/rag/cellar-client.ts`
- Test: `src/__tests__/regulation-sync.test.ts`

- [ ] **Step 1: Write the failing test**

Add tests for:
- extracting the current consolidated CELEX from EUR-Lex HTML
- deriving canonical source names from consolidated CELEX values

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/regulation-sync.test.ts`
Expected: FAIL because the parser helpers do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add helper functions and a curated regulation manifest in `src/lib/rag/cellar-client.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/regulation-sync.test.ts`
Expected: PASS

## Chunk 2: Sync Resilience

### Task 2: Make sync work without the log table

**Files:**
- Modify: `src/lib/rag/regulation-sync.ts`
- Modify: `src/__tests__/regulation-sync.test.ts`
- Test: `src/__tests__/regulation-sync.test.ts`

- [ ] **Step 1: Write the failing test**

Add a regression proving sync logging failures caused by a missing `regulation_sync_log` table do not abort the sync result.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/regulation-sync.test.ts`
Expected: FAIL because the current sync path assumes the log table exists.

- [ ] **Step 3: Write minimal implementation**

Wrap sync-log access in optional helpers, add `loggingAvailable` to the sync result, and keep chunk ingestion successful even if logging is unavailable.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/regulation-sync.test.ts`
Expected: PASS

## Chunk 3: Health Visibility

### Task 3: Add a protected sync health route

**Files:**
- Create: `src/app/api/cron/sync-regulations/health/route.ts`
- Modify: `src/lib/rag/regulation-sync.ts`
- Modify: `src/__tests__/regulation-sync.test.ts`
- Test: `src/__tests__/regulation-sync.test.ts`

- [ ] **Step 1: Write the failing test**

Add a test for health-state aggregation from regulation chunk metadata and optional log availability.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/regulation-sync.test.ts`
Expected: FAIL because the health helper/route does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add a helper that inspects regulation chunks and log-table availability, then expose it through a protected route.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/regulation-sync.test.ts`
Expected: PASS

## Chunk 4: Verification

### Task 4: Verify repo and runtime behavior

**Files:**
- Modify: `src/lib/rag/cellar-client.ts`
- Modify: `src/lib/rag/regulation-sync.ts`
- Create: `src/app/api/cron/sync-regulations/health/route.ts`
- Create: `src/__tests__/regulation-sync.test.ts`

- [ ] **Step 1: Run focused tests**

Run: `npx vitest run src/__tests__/regulation-sync.test.ts`
Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Run one manual regulation sync against the connected environment**

Run a one-off authenticated invocation of the sync flow and inspect the returned result.
Expected: non-zero regulations processed or skipped, no fatal error, and health output that reflects the live regulation corpus.
