# Workspace Expert Button Removal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the broken workspace `Ask an expert` button and the duplicate bottom `PRO` badge from the chatbot workspace.

**Architecture:** This is a small UI cleanup across `ChatWorkspace` and `ChatSidebar`. A narrow source-level regression in `chatbot-surface.test.ts` will guard against reintroducing the removed prop wiring and duplicate workspace badge.

**Tech Stack:** React, Next.js, Vitest

---

## Chunk 1: Regression And UI Cleanup

### Task 1: Remove the broken workspace controls safely

**Files:**
- Create: `docs/superpowers/specs/2026-03-15-workspace-expert-button-removal-design.md`
- Create: `docs/superpowers/plans/2026-03-15-workspace-expert-button-removal.md`
- Modify: `src/__tests__/chatbot-surface.test.ts`
- Modify: `src/components/dashboard/ChatSidebar.tsx`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Write the failing test**

Add assertions proving the workspace no longer uses `onAskExpert` and no longer renders the duplicate bottom tier pill.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: FAIL because the workspace still contains the broken button wiring and duplicate badge.

- [ ] **Step 3: Write minimal implementation**

Remove the sidebar button, remove the `onAskExpert` prop, and remove the bottom tier pill from the workspace row.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

## Chunk 2: Verification

### Task 2: Verify the workspace still builds

**Files:**
- Modify: `src/components/dashboard/ChatSidebar.tsx`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Run focused test**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS
