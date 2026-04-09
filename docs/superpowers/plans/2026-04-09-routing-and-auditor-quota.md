# Consultant and Auditor Routing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch PinkPepper to mode-based model routing with Consultant on DeepSeek, Auditor on OpenAI, Llama as fallback, and a dedicated Pro-only Auditor quota of 5 messages/day that also consumes normal daily message quota.

**Architecture:** The change is centered in the chat and audit API routes. Tier capabilities and usage counting become mode-aware by replacing the old hidden expert-answer quota with a dedicated Auditor quota and explicit Auditor usage events. Public and dashboard copy should be updated so pricing and settings reflect the new model truth. Smoke testing should verify model routing, gating, quota exhaustion, and image behavior.

**Tech Stack:** Next.js App Router, Supabase, TypeScript, Vitest, ESLint, existing PinkPepper routing and quota helpers.

---

## File Map

### Core quota and policy files

- Modify: `src/lib/tier.ts`
  - Replace `dailyExpertAnswers` with `dailyAuditorMessages`
  - Update tier capability structure and values
- Modify: `src/lib/policy.ts`
  - Extend usage event types to include `auditor_message`
  - Keep shared counting helpers reusable for both message types
- Modify: `src/types/database.types.ts`
  - Ensure `usage_events.event_type` typing tolerates the new `auditor_message` event in local helpers/tests where narrowed unions exist

### Consultant route

- Modify: `src/app/api/chat/stream/route.ts`
  - Remove hidden OpenAI expert-routing logic for text chat
  - Route Consultant text to DeepSeek primary, Llama fallback
  - Keep image path untouched
  - Remove expert quota counting and insertion logic
  - Update product info strings so they mention Auditor quota instead of expert answers

### Auditor route

- Modify: `src/app/api/audit/stream/route.ts`
  - Switch primary provider to OpenAI, fallback to Llama
  - Enforce Pro-only access
  - Enforce both daily message limit and daily Auditor quota
  - Record `auditor_message` usage event in addition to `chat_prompt`
  - Return clear quota-specific error when Auditor quota is exhausted

### Billing / settings / dashboard surfaces

- Modify: `src/app/api/billing/status/route.ts`
  - Replace expert-usage values with auditor-usage values
- Modify: `src/app/dashboard/page.tsx`
  - Show Auditor usage instead of expert-answer usage
- Modify: `src/app/dashboard/settings/page.tsx`
  - Fetch and pass Auditor usage instead of expert usage
- Modify: `src/components/dashboard/SettingsForm.tsx`
  - Rename the usage card/label from expert answers to Auditor messages

### Pricing and copy surfaces

- Modify: `src/app/pricing/page.tsx`
  - Replace any remaining expert-answer framing with `5 Auditor messages/day`
- Modify: `src/i18n/messages/en.json`
  - Replace `dailyExpertAnswers` label and any related wording
- Modify: `src/i18n/messages/pt.json`
- Modify: `src/i18n/messages/de.json`
- Modify: `src/i18n/messages/es.json`
- Modify: `src/i18n/messages/fr.json`
- Modify: `src/i18n/messages/it.json`
  - Same translation key updates for Auditor messaging

### Tests

- Modify: `src/__tests__/chat-route-config.test.ts`
  - Remove hidden expert-routing expectations
  - Add DeepSeek/Llama Consultant routing assertions
- Modify: `src/__tests__/audit-route-config.test.ts`
  - Add OpenAI/Llama Auditor routing assertions and Pro quota references
- Modify: `src/__tests__/tier.test.ts`
  - Replace `dailyExpertAnswers` expectations with `dailyAuditorMessages`
- Modify: `src/__tests__/policy.test.ts`
  - Add `auditor_message` usage counting coverage
- Modify: `src/__tests__/seo-surface.test.ts`
  - Update any pricing/dashboard copy expectations that still mention expert answers
- Consider Modify/Create: route-level tests if existing coverage is too string-based to verify new quota enforcement

## Chunk 1: Quota Model and Shared Types

### Task 1: Replace tier capability field for Auditor quota

**Files:**
- Modify: `src/lib/tier.ts`
- Test: `src/__tests__/tier.test.ts`

- [ ] **Step 1: Write the failing tier tests**

Add or update tests in `src/__tests__/tier.test.ts` so they assert:

```ts
it("dailyAuditorMessages is 0 for free", () => {
  expect(TIER_CAPABILITIES.free.dailyAuditorMessages).toBe(0);
});

it("dailyAuditorMessages is 0 for plus", () => {
  expect(TIER_CAPABILITIES.plus.dailyAuditorMessages).toBe(0);
});

it("dailyAuditorMessages is 5 for pro", () => {
  expect(TIER_CAPABILITIES.pro.dailyAuditorMessages).toBe(5);
});
```

Also replace structure assertions so `dailyExpertAnswers` is no longer required and `dailyAuditorMessages` is.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/__tests__/tier.test.ts`
Expected: FAIL because `dailyAuditorMessages` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/tier.ts`:

- rename `dailyExpertAnswers` to `dailyAuditorMessages` in `TierCapabilities`
- set values:
  - free: `0`
  - plus: `0`
  - pro: `5`

- [ ] **Step 4: Re-run tests**

Run: `npx vitest run src/__tests__/tier.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/tier.ts src/__tests__/tier.test.ts
git commit -m "refactor: replace expert quota with auditor quota"
```

### Task 2: Extend shared usage counting for Auditor messages

**Files:**
- Modify: `src/lib/policy.ts`
- Test: `src/__tests__/policy.test.ts`

- [ ] **Step 1: Write the failing policy tests**

Add a test that counts `auditor_message` exactly like other usage events:

```ts
await countUsageSince({
  supabase,
  userId: "user-1",
  eventType: "auditor_message",
  sinceIso: "2026-04-09T00:00:00.000Z",
});
```

Assert it queries `usage_events` with `event_type = auditor_message`.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/__tests__/policy.test.ts`
Expected: FAIL because `auditor_message` is not accepted yet.

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/policy.ts` to add `auditor_message` to the local `UsageEventType` union and any helper narrowing.

- [ ] **Step 4: Re-run tests**

Run: `npx vitest run src/__tests__/policy.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/policy.ts src/__tests__/policy.test.ts
git commit -m "feat: add auditor usage event type"
```

## Chunk 2: Consultant Routing

### Task 3: Remove hidden expert text routing from Consultant

**Files:**
- Modify: `src/app/api/chat/stream/route.ts`
- Test: `src/__tests__/chat-route-config.test.ts`

- [ ] **Step 1: Write the failing route-config tests**

Update `src/__tests__/chat-route-config.test.ts` so it asserts:

```ts
expect(resolveChatModels("deepseek-chat")).toEqual({
  primary: "deepseek-chat",
  fallback: "llama-3.3-70b-versatile",
});
```

And remove tests that depend on:

- `shouldPreferOpenAIForQuery`
- `shouldUsePremiumExpertModel`
- `isPremiumExpertResponse`

Replace them with assertions that ordinary chat does not automatically escalate to OpenAI.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/__tests__/chat-route-config.test.ts`
Expected: FAIL because current route still exposes hidden OpenAI expert-routing behavior.

- [ ] **Step 3: Write minimal implementation**

Update `src/app/api/chat/stream/route.ts` to:

- set `PRIMARY_CHAT_MODEL` to `deepseek-chat`
- set `FALLBACK_CHAT_MODEL` to `llama-3.3-70b-versatile`
- remove `HIGH_RISK_OPENAI_MODEL` text-chat routing usage
- remove `shouldPreferOpenAIForQuery`, `shouldUsePremiumExpertModel`, and `isPremiumExpertResponse`
- simplify `resolveChatModels()` so Consultant always resolves to DeepSeek primary and Llama fallback
- add DeepSeek request support in `requestStreamingCompletion(...)`
- keep usage tracking to `chat_prompt` only for text chat
- update any plan/product-info prompt text that still mentions expert answers

- [ ] **Step 4: Re-run tests**

Run: `npx vitest run src/__tests__/chat-route-config.test.ts`
Expected: PASS

- [ ] **Step 5: Run focused verification**

Run:

```bash
npx eslint src/app/api/chat/stream/route.ts src/__tests__/chat-route-config.test.ts
npm run typecheck
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/api/chat/stream/route.ts src/__tests__/chat-route-config.test.ts
git commit -m "feat: route consultant chat through deepseek"
```

## Chunk 3: Auditor Routing and Dual Quota Enforcement

### Task 4: Switch Auditor to OpenAI primary with Llama fallback

**Files:**
- Modify: `src/app/api/audit/stream/route.ts`
- Test: `src/__tests__/audit-route-config.test.ts`

- [ ] **Step 1: Write the failing audit route-config tests**

Update `src/__tests__/audit-route-config.test.ts` to assert the route source contains:

- `OPENAI_API_KEY`
- `gpt-4.1`
- `GROQ_MODEL ?? "llama-3.3-70b-versatile"`

And no longer assumes Groq/Llama is primary.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/__tests__/audit-route-config.test.ts`
Expected: FAIL because the route still uses Groq as primary.

- [ ] **Step 3: Write minimal implementation**

Refactor `src/app/api/audit/stream/route.ts` to:

- require `OPENAI_API_KEY` as primary credential
- keep `GROQ_API_KEY` for fallback
- add a shared streaming request helper similar to chat route behavior
- send Auditor prompts to `gpt-4.1` first
- fall back to Llama on retryable OpenAI failure
- persist upstream metadata with `provider` and `model`

- [ ] **Step 4: Re-run tests**

Run: `npx vitest run src/__tests__/audit-route-config.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/audit/stream/route.ts src/__tests__/audit-route-config.test.ts
git commit -m "feat: route auditor mode through openai"
```

### Task 5: Enforce Auditor quota and dual consumption

**Files:**
- Modify: `src/app/api/audit/stream/route.ts`
- Test: add or extend existing route tests near `src/__tests__/audit-route-config.test.ts`

- [ ] **Step 1: Write failing quota tests**

Add tests for:

- Pro can use Auditor while `auditorUsed < 5`
- Pro is blocked when `auditorUsed >= 5`
- Free/Plus remain gated
- Auditor responses consume both `chat_prompt` and `auditor_message`

If the current string-based test file is not enough, create a new route helper test file, for example:

- `src/__tests__/audit-usage-policy.test.ts`

Example assertions:

```ts
expect(canUseAuditor({ tier: "pro", isAdmin: false, used: 10, limit: 100, auditorUsed: 4, auditorLimit: 5 })).toBe(true);
expect(canUseAuditor({ tier: "pro", isAdmin: false, used: 10, limit: 100, auditorUsed: 5, auditorLimit: 5 })).toBe(false);
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/__tests__/audit-route-config.test.ts src/__tests__/audit-usage-policy.test.ts`
Expected: FAIL until helper logic exists.

- [ ] **Step 3: Write minimal implementation**

In `src/app/api/audit/stream/route.ts`:

- count `chat_prompt` usage as today
- count `auditor_message` usage separately
- block when:
  - normal daily message limit is exhausted, or
  - daily Auditor limit is exhausted
- on successful response persistence, insert:
  - one `chat_prompt` event
  - one `auditor_message` event

Prefer extracting a small helper for audit access/quota decision if that makes testing easier.

- [ ] **Step 4: Re-run tests**

Run: `npx vitest run src/__tests__/audit-route-config.test.ts src/__tests__/audit-usage-policy.test.ts`
Expected: PASS

- [ ] **Step 5: Run focused verification**

Run:

```bash
npx eslint src/app/api/audit/stream/route.ts src/__tests__/audit-route-config.test.ts src/__tests__/audit-usage-policy.test.ts
npm run typecheck
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/api/audit/stream/route.ts src/__tests__/audit-route-config.test.ts src/__tests__/audit-usage-policy.test.ts
git commit -m "feat: enforce auditor usage quota"
```

## Chunk 4: Billing, Dashboard, and Copy Surfaces

### Task 6: Replace expert usage with Auditor usage in status and settings

**Files:**
- Modify: `src/app/api/billing/status/route.ts`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/components/dashboard/SettingsForm.tsx`

- [ ] **Step 1: Write failing UI/status tests**

Update tests that currently expect `dailyExpertAnswers` or expert usage labels. Add/adjust assertions so they expect Auditor usage instead.

Candidate files:

- `src/__tests__/seo-surface.test.ts`
- any dashboard/status-specific test that references `expertUsageLimit`

- [ ] **Step 2: Run tests to verify failure**

Run the smallest relevant test set, for example:

```bash
npx vitest run src/__tests__/seo-surface.test.ts
```

Expected: FAIL on old expert-answer wording or payload keys.

- [ ] **Step 3: Write minimal implementation**

Update these files so:

- billing status returns Auditor usage counts and limit
- dashboard page fetches `auditor_message` usage instead of `expert_answer`
- settings page shows Auditor usage instead of expert usage
- settings form label changes from expert answers to Auditor messages

- [ ] **Step 4: Re-run tests**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/billing/status/route.ts src/app/dashboard/page.tsx src/app/dashboard/settings/page.tsx src/components/dashboard/SettingsForm.tsx src/__tests__/seo-surface.test.ts
git commit -m "refactor: expose auditor usage in billing and dashboard"
```

### Task 7: Update pricing and translated usage copy

**Files:**
- Modify: `src/app/pricing/page.tsx`
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/pt.json`
- Modify: `src/i18n/messages/de.json`
- Modify: `src/i18n/messages/es.json`
- Modify: `src/i18n/messages/fr.json`
- Modify: `src/i18n/messages/it.json`
- Test: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Write failing copy tests**

Update `src/__tests__/seo-surface.test.ts` so it expects:

- Pro pricing mentions `5 Auditor messages/day`
- no user-facing `expert answers today` wording remains on the pricing surface

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: FAIL on outdated pricing or copy expectations.

- [ ] **Step 3: Write minimal implementation**

Update:

- pricing bullets and plan copy
- translation keys and labels
- any remaining mode copy that still uses old expert-answer terminology for text chat

Do not change unrelated marketing copy unless it directly conflicts with the new routing truth.

- [ ] **Step 4: Re-run tests**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Run focused verification**

Run:

```bash
npx eslint src/app/pricing/page.tsx src/i18n/messages/en.json src/i18n/messages/pt.json src/i18n/messages/de.json src/i18n/messages/es.json src/i18n/messages/fr.json src/i18n/messages/it.json
npm run typecheck
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/pricing/page.tsx src/i18n/messages/en.json src/i18n/messages/pt.json src/i18n/messages/de.json src/i18n/messages/es.json src/i18n/messages/fr.json src/i18n/messages/it.json src/__tests__/seo-surface.test.ts
git commit -m "chore: align pricing and copy with auditor quota"
```

## Chunk 5: Final Verification and Smoke Test

### Task 8: Run automated verification

**Files:**
- No code changes expected

- [ ] **Step 1: Run targeted automated checks**

Run:

```bash
npx vitest run src/__tests__/tier.test.ts src/__tests__/policy.test.ts src/__tests__/chat-route-config.test.ts src/__tests__/audit-route-config.test.ts src/__tests__/audit-usage-policy.test.ts src/__tests__/seo-surface.test.ts
npm run typecheck
npx eslint src/lib/tier.ts src/lib/policy.ts src/app/api/chat/stream/route.ts src/app/api/audit/stream/route.ts src/app/api/billing/status/route.ts src/app/dashboard/page.tsx src/app/dashboard/settings/page.tsx src/components/dashboard/SettingsForm.tsx src/app/pricing/page.tsx src/__tests__/tier.test.ts src/__tests__/policy.test.ts src/__tests__/chat-route-config.test.ts src/__tests__/audit-route-config.test.ts src/__tests__/audit-usage-policy.test.ts src/__tests__/seo-surface.test.ts
```

Expected: PASS

- [ ] **Step 2: Commit verification-driven cleanups if needed**

If any lint/type/test failures require small cleanup changes, commit them:

```bash
git add <fixed-files>
git commit -m "test: finalize routing and auditor quota checks"
```

### Task 9: Manual smoke test

**Files:**
- No code changes expected

- [ ] **Step 1: Smoke test Consultant**

Run one Consultant prompt that should use DeepSeek:

`Create a short opening checklist for a sandwich takeaway in Germany covering fridge checks, cleaning, and allergen information readiness.`

Expected:

- successful response
- usage metadata shows `deepseek` primary unless fallback was needed

- [ ] **Step 2: Smoke test Auditor**

Run one Auditor prompt that should use OpenAI:

`Audit this small takeaway in Germany. This is a prompt-based preliminary audit only. Staff say allergen information is in the manager's head, prepacked sandwiches are sometimes labelled later in the day, and fridge checks were missed twice last week.`

Expected:

- successful audit-style response
- usage metadata shows `openai` primary unless fallback was needed

- [ ] **Step 3: Smoke test Pro Auditor quota**

Verify:

- Auditor responses decrement both normal daily messages and Auditor quota
- the sixth Auditor turn for a Pro user is blocked with the correct upgrade/limit message
- Consultant remains usable if normal daily messages are still available

- [ ] **Step 4: Smoke test Free/Plus gating**

Verify Free or Plus:

- can see Auditor mode
- cannot send in Auditor mode
- receives correct upgrade prompt

- [ ] **Step 5: Smoke test image path**

Upload one food label or packaging image.

Expected:

- image analysis still succeeds
- no text routing regression

- [ ] **Step 6: Final commit if any tiny smoke-test fixes are needed**

```bash
git add <fixed-files>
git commit -m "fix: polish routing smoke test issues"
```

