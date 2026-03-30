# Sidebar Template Navigation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move real downloadable templates into the dashboard left sidebar and remove the stale chat-area dropdown.

**Architecture:** Keep the template registry in `src/lib/templates.ts` as the source of truth, add a small grouping helper there, render the grouped list in `ChatSidebar`, and route all clicks back through the existing template download flow in `ChatWorkspace`. Remove the duplicate empty-state dropdown from `ChatMessages`.

**Tech Stack:** Next.js, React, TypeScript, next-intl, Vitest

---

## Chunk 1: Template Data And Tests

### Task 1: Add grouped template helper

**Files:**
- Modify: `src/lib/templates.ts`
- Create: `src/__tests__/templates.test.ts`

- [ ] Add a helper that returns templates grouped by category and sorted alphabetically by category and title.
- [ ] Write a focused test that proves the helper only reflects the registry order through deterministic sorting, not insertion order.
- [ ] Run: `npm test -- --run src/__tests__/templates.test.ts`
- [ ] Commit if working in batches.

## Chunk 2: Sidebar UI And Workspace Wiring

### Task 2: Render the template list in the left sidebar

**Files:**
- Modify: `src/components/dashboard/ChatSidebar.tsx`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`

- [ ] Add sidebar props for template download handling and template-download gating.
- [ ] Render a new template section in `ChatSidebar` using the grouped helper from `src/lib/templates.ts`.
- [ ] Reuse existing `chat` translation keys for labels to avoid a locale sweep.
- [ ] Show locked state for Free and allow direct download for eligible tiers.

### Task 3: Remove the stale empty-state dropdown

**Files:**
- Modify: `src/components/dashboard/ChatMessages.tsx`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`

- [ ] Remove the chat empty-state dropdown and any template-specific quick-suggestion wiring that only existed for that menu.
- [ ] Keep other chat starter behavior intact.
- [ ] Ensure no stale template/document starter entries remain in the empty state.

## Chunk 3: Verification

### Task 4: Verify the dashboard cleanup

**Files:**
- Verify only

- [ ] Run: `npm test -- --run src/__tests__/templates.test.ts`
- [ ] Run: `npm run lint`
- [ ] Run: `npm run build`
- [ ] Confirm the sidebar is now the single template entry point and the chat dropdown is gone.
