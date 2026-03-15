# Chatbot Access And Surface Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make chat access honor active Pro subscriptions even when `profiles.tier` is stale, and simplify the chatbot workspace to the requested ChatGPT-style surface.

**Architecture:** Introduce a shared effective-access resolver that can merge profile and subscription state, then use it in the dashboard and chat endpoints. In the UI, remove non-essential artifact, evidence, and promo surfaces rather than trying to cosmetically restyle them.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase, Vitest

---

## Chunk 1: Access Fallback

### Task 1: Add access fallback coverage

**Files:**
- Modify: `src/__tests__/access.test.ts`
- Modify: `src/lib/access.ts`

- [ ] **Step 1: Write the failing test**

Add tests that prove effective access resolves to `pro` when subscription state is paid but `profiles.tier` is stale or missing.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/access.test.ts`
Expected: FAIL because the resolver only reads `profiles.tier`

- [ ] **Step 3: Write minimal implementation**

Add a shared helper in `src/lib/access.ts` that accepts both profile tier and subscription tier/status and returns the highest valid effective tier.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/access.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/access.ts src/__tests__/access.test.ts
git commit -m "fix: derive effective chatbot access from subscription state"
```

### Task 2: Use effective access in server chat surfaces

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/api/billing/status/route.ts`
- Modify: `src/app/api/chat/stream/route.ts`
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Write the failing test**

Extend access tests or add a focused integration-style test that exercises chat/dashboard access inputs and verifies active Pro subscription fallback wins.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/access.test.ts`
Expected: FAIL because the routes still rely on `profiles.tier` only

- [ ] **Step 3: Write minimal implementation**

Fetch subscription tier/status where needed and route all access decisions through the shared effective-access helper.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/access.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/api/billing/status/route.ts src/app/api/chat/stream/route.ts src/app/api/chat/route.ts src/lib/access.ts src/__tests__/access.test.ts
git commit -m "fix: use effective access across chatbot surfaces"
```

## Chunk 2: Workspace Simplification

### Task 3: Lock in the desired chatbot surface with tests

**Files:**
- Modify: `src/__tests__/chatbot-surface.test.ts`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/components/dashboard/ChatMessages.tsx`
- Modify: `src/components/dashboard/MessageItem.tsx`

- [ ] **Step 1: Write the failing test**

Add tests that assert the workspace no longer contains the artifact strip, evidence UI, premium workflow cards, or empty-state human-review promo block.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: FAIL because those strings and sections still exist

- [ ] **Step 3: Write minimal implementation**

Remove the artifact strip from `ChatWorkspace`, remove promo cards from `ChatMessages`, and strip citation/evidence UI from `MessageItem` while keeping message rendering intact.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ChatWorkspace.tsx src/components/dashboard/ChatMessages.tsx src/components/dashboard/MessageItem.tsx src/__tests__/chatbot-surface.test.ts
git commit -m "refactor: simplify chatbot workspace surfaces"
```

## Chunk 3: Verification

### Task 4: Run focused verification

**Files:**
- Modify: none

- [ ] **Step 1: Run focused tests**

Run: `npx vitest run src/__tests__/access.test.ts src/__tests__/chatbot-surface.test.ts`
Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: successful Next.js production build

- [ ] **Step 3: Summarize residual risk**

Document whether any live runtime gap remains, especially if no browser/e2e chatbot harness exists.
