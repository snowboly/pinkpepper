# Chatbot Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dashboard chatbot more reliable by fixing stream error handling, preserving evidence metadata across reloads, preventing hidden image-analysis writes on partial failures, and removing visible encoding corruption from chatbot surfaces.

**Architecture:** Keep the current chat architecture intact and harden the seams where state can be lost or misreported. Persist assistant metadata with chat messages, hydrate it back into the workspace on reload, handle SSE error events explicitly in the client, and make the image-analysis route transactional from the user’s perspective. Clean encoding issues in the touched chatbot files only.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest

---

## Chunk 1: Regression Tests

### Task 1: Add failing metadata and encoding tests

**Files:**
- Create: `src/__tests__/chatbot-surface.test.ts`
- Modify: `src/__tests__/citations.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests that assert:
- chat message metadata can carry citations and artifact payloads without loss
- chatbot-facing files do not contain known mojibake fragments such as `cafÃ©`, `âœ…`, `Â·`, or corrupted emoji literals

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts src/__tests__/citations.test.ts`
Expected: FAIL because the current files still contain chatbot mojibake and metadata persistence coverage does not exist yet.

- [ ] **Step 3: Commit the red state tests if useful locally**

```bash
git add src/__tests__/chatbot-surface.test.ts src/__tests__/citations.test.ts
git commit -m "test: cover chatbot metadata and encoding regressions"
```

Only commit if the workspace policy for this branch still favors red-green commits; otherwise continue without committing red.

### Task 2: Add failing tests for stream error handling logic

**Files:**
- Create: `src/__tests__/chat-stream-state.test.ts`
- Create or Modify: `src/components/dashboard/chat-stream-state.ts`

- [ ] **Step 1: Write the failing test**

Cover the case where the stream emits an SSE `error` event after the placeholder assistant message is created. Assert that the pure state transition helper:
- the assistant message is finalized instead of remaining `isStreaming`
- the workspace surfaces the error text or a fallback error
- the user prompt is restored when the stream fails before completion

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npx vitest run src/__tests__/chat-stream-state.test.ts`
Expected: FAIL because the helper does not exist yet or does not handle stream errors correctly.

---

## Chunk 2: Backend Fixes

### Task 3: Persist assistant metadata for streamed chat responses

**Files:**
- Modify: `src/app/api/chat/stream/route.ts`
- Modify: `src/app/api/chat/conversations/[id]/messages/route.ts`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Implement the minimal persistence change**

Persist assistant-side metadata with the saved message, including:
- formatted citations when RAG is enabled
- persona identifiers if needed by the current message shape

Do not redesign the schema; use the existing `metadata` field already returned by the messages endpoint.

- [ ] **Step 2: Hydrate the saved metadata on reload**

Update the message loading path so reopened conversations restore citations and any saved artifact metadata.

- [ ] **Step 3: Run the focused tests**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts src/__tests__/citations.test.ts`
Expected: PASS

### Task 4: Make image-analysis failures consistent from the user’s perspective

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Implement the minimal fix**

Avoid returning a hard failure after messages have already been persisted. Preferred options:
- record usage before message persistence if that preserves correctness, or
- tolerate usage logging failure while still returning success and logging server-side

Keep the change narrow and avoid changing quotas or pricing semantics.

- [ ] **Step 2: Run the focused tests**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

---

## Chunk 3: Client Fixes

### Task 5: Handle SSE error events in the workspace

**Files:**
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/components/dashboard/chat-stream-state.ts`
- Test: `src/__tests__/chat-stream-state.test.ts`

- [ ] **Step 1: Implement the minimal client fix**

When an SSE `error` event is received:
- stop streaming state
- clear typing buffers
- keep any partial assistant content already received
- restore the prompt if the response never meaningfully completed
- surface the backend error message to the user

- [ ] **Step 2: Run the focused test**

Run: `npx vitest run src/__tests__/chat-stream-state.test.ts`
Expected: PASS

### Task 6: Remove chatbot mojibake from UI and prompt surfaces

**Files:**
- Modify: `src/app/api/chat/stream/route.ts`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/components/dashboard/ChatSidebar.tsx`
- Modify: `src/components/dashboard/MessageItem.tsx`
- Modify: any narrowly related chatbot file that still contains the tested corrupted literals
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Replace corrupted literals with ASCII-safe or correct Unicode strings**

Prefer ASCII where possible in source code comments and user-facing copy unless an existing file already uses the corresponding Unicode safely. For emoji or symbols that are product-significant, use valid Unicode literals.

- [ ] **Step 2: Run the focused tests**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

---

## Chunk 4: Full Verification

### Task 7: Run the verification suite

**Files:**
- Modify: none expected

- [ ] **Step 1: Run targeted chatbot verification**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts src/__tests__/chat-stream-state.test.ts src/__tests__/citations.test.ts`
Expected: PASS

- [ ] **Step 2: Run full tests**

Run: `npm test`
Expected: PASS with the known PDF parsing warning still present in `documents/extract.test.ts`

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/stream/route.ts src/app/api/chat/route.ts src/app/api/chat/conversations/[id]/messages/route.ts src/components/dashboard/ChatWorkspace.tsx src/components/dashboard/chat-stream-state.ts src/components/dashboard/ChatSidebar.tsx src/components/dashboard/MessageItem.tsx src/__tests__/chatbot-surface.test.ts src/__tests__/chat-stream-state.test.ts src/__tests__/citations.test.ts docs/superpowers/plans/2026-03-14-chatbot-hardening.md
git commit -m "fix: harden chatbot reliability"
```
