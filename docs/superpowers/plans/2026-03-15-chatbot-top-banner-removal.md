# Chatbot Top Banner Removal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the top chatbot workspace mode banner without changing the bottom mode controls or mode behavior.

**Architecture:** This is a single-component UI trim in `ChatWorkspace.tsx`. A narrow source-level regression in `chatbot-surface.test.ts` will guard against reintroducing the removed top banner block.

**Tech Stack:** React, Next.js, Vitest

---

## Chunk 1: Regression And Implementation

### Task 1: Remove the top banner safely

**Files:**
- Create: `docs/superpowers/specs/2026-03-15-chatbot-top-banner-removal-design.md`
- Create: `docs/superpowers/plans/2026-03-15-chatbot-top-banner-removal.md`
- Modify: `src/__tests__/chatbot-surface.test.ts`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Write the failing test**

Add a source-level assertion proving the top mode banner block is not present in `ChatWorkspace.tsx`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: FAIL because the top mode banner block still exists.

- [ ] **Step 3: Write minimal implementation**

Remove the top mode banner block and any now-unused derived values from `ChatWorkspace.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

## Chunk 2: Verification

### Task 2: Verify the workspace still builds

**Files:**
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Run focused test**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS
