# Features Services Revamp Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the `/features` page into a concise services-style commercial page that sells PinkPepper's broader capability set in human language.

**Architecture:** Keep the work scoped to `src/app/features/page.tsx` plus any directly affected SEO tests. Replace the simple hub layout with a service-led page structure, richer service cards, and clearer CTAs while preserving internal linking and metadata quality.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Vitest, ESLint

---

## Chunk 1: Services Page Rewrite

### Task 1: Rewrite the features page as a services page

**Files:**
- Modify: `src/app/features/page.tsx`
- Test: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Review current page and SEO expectations**

Read:
- `src/app/features/page.tsx`
- `src/__tests__/seo-surface.test.ts`

- [ ] **Step 2: Update the page structure and copy**

Change:
- hero copy and CTA to `Talk to us`
- expand to 6-8 richer service cards
- add concise supporting sections
- keep internal links to relevant product/pricing paths

- [ ] **Step 3: Run the targeted SEO regression test**

Run:
```bash
npm test -- --run src/__tests__/seo-surface.test.ts
```

Expected:
- all tests pass

- [ ] **Step 4: Run lint**

Run:
```bash
npm run lint
```

Expected:
- no lint errors

- [ ] **Step 5: Commit**

```bash
git add src/app/features/page.tsx docs/superpowers/specs/2026-03-25-features-services-revamp-design.md docs/superpowers/plans/2026-03-25-features-services-revamp.md
git commit -m "feat: revamp features page as services hub"
```
