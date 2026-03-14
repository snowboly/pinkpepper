# Stripe Webhook Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Stripe webhook processing resilient to event ordering, preserve cancelled plan names in emails, and lock the behavior with focused regression tests.

**Architecture:** Keep the webhook route as the public integration point, but extract small pure helpers for tier semantics and customer-to-user resolution so the failure-prone logic is easy to test in isolation. Update the webhook sync path to upsert missing subscription rows from Stripe customer metadata rather than depending on checkout ordering.

**Tech Stack:** Next.js route handlers, Stripe SDK, Supabase admin client, Vitest

---

## Chunk 1: Stripe Semantics Tests

### Task 1: Add failing tier semantics regression tests

**Files:**
- Modify: `src/__tests__/tier.test.ts`
- Test: `src/__tests__/tier.test.ts`

- [ ] **Step 1: Write the failing test**

Add assertions covering the difference between inferred billed plan tier and downgraded effective access tier for cancelled subscriptions.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/tier.test.ts`
Expected: FAIL because the current billing parser does not expose both semantics separately.

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/billing/tier-mapping.ts` so Stripe subscription parsing returns the inferred plan tier alongside the effective access tier.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/tier.test.ts`
Expected: PASS

## Chunk 2: Webhook Recovery Tests

### Task 2: Add failing webhook recovery regressions

**Files:**
- Create: `src/__tests__/stripe-webhook.test.ts`
- Modify: `src/app/api/webhook/stripe/route.ts`
- Test: `src/__tests__/stripe-webhook.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests for:
- subscription sync recovering when no subscription row exists but Stripe customer metadata contains `user_id`
- cancellation emails using the paid plan tier on deleted subscriptions

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/stripe-webhook.test.ts`
Expected: FAIL because the current webhook throws on missing rows and cancellation emails use the downgraded tier.

- [ ] **Step 3: Write minimal implementation**

Refactor the Stripe webhook route into testable helpers, recover missing rows from Stripe customer metadata, and pass billed plan tier into cancellation email composition.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/stripe-webhook.test.ts`
Expected: PASS

## Chunk 3: Verification

### Task 3: Run focused and full verification

**Files:**
- Modify: `src/app/api/webhook/stripe/route.ts`
- Modify: `src/lib/billing/tier-mapping.ts`
- Modify: `src/__tests__/tier.test.ts`
- Create: `src/__tests__/stripe-webhook.test.ts`

- [ ] **Step 1: Run focused billing tests**

Run: `npx vitest run src/__tests__/tier.test.ts src/__tests__/stripe-webhook.test.ts`
Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS
