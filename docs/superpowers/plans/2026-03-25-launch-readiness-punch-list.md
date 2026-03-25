# Launch Readiness Punch List

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate whether PinkPepper is ready for paid traffic by pressure-testing trust, core UX, entitlements, and source quality.

**Architecture:** This is an operational QA plan, not a feature build. Work moves from highest-risk user trust paths outward: live chat behavior, export/gating, KB/source quality, then final live-surface checks. Capture findings and only ship fixes that directly improve sale readiness.

**Tech Stack:** Next.js, Supabase, Vitest, ESLint, production build checks, live app/API QA

---

## Chunk 1: Core Chat Trust QA

### Task 1: Validate live chat behavior

**Files:**
- Inspect: `src/app/api/chat/stream/route.ts`
- Inspect: `src/lib/rag/*`
- Notes: `docs/superpowers/plans/2026-03-25-launch-readiness-punch-list.md`

- [ ] Run real multi-turn chat scenarios focused on memory, cutoff-language, weak-retrieval fallback, and citation quality.
- [ ] Record failures precisely enough to reproduce.
- [ ] If failures are code bugs, patch only the directly responsible code and rerun focused verification.

### Task 2: Validate uploads and export

**Files:**
- Inspect: `src/app/api/export/docx/route.ts`
- Inspect: `src/components/dashboard/ChatWorkspace.tsx`

- [ ] Verify DOCX export on real conversations.
- [ ] Verify uploaded-file and image-assisted chat paths still work.
- [ ] Fix any regressions found and rerun focused checks.

## Chunk 2: Commercial Gating QA

### Task 3: Verify tier entitlements

**Files:**
- Inspect: `src/lib/tier.ts`
- Inspect: relevant API routes under `src/app/api`

- [ ] Check Free, Plus, and Pro gating for templates, exports, uploads, and daily limits.
- [ ] Confirm on-page/product copy matches actual API behavior.
- [ ] Fix mismatches and rerun targeted tests.

## Chunk 3: Source Trust QA

### Task 4: Spot-check KB answer quality

**Files:**
- Inspect: `knowledge-docs/*`
- Inspect: `src/lib/rag/*`

- [ ] Test recent EU/UK food-safety questions against retrieved sources.
- [ ] Confirm answers cite relevant authority and do not overstate certainty.
- [ ] Fix source/routing issues if found.

## Chunk 4: Live Surface Readiness

### Task 5: Final marketing/product surface sweep

**Files:**
- Inspect: `src/app/page.tsx`
- Inspect: `src/app/features/page.tsx`
- Inspect: `src/components/site/chrome.tsx`

- [ ] Check homepage, features, resources, pricing, and contact flows in the built app.
- [ ] Confirm removed pages are gone cleanly and no dead navigation remains.
- [ ] Run final `npm run lint`, targeted tests, and `npm run build`.
