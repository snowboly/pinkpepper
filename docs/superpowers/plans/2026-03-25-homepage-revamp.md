# Homepage Revamp Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage workflow-story section with a more concise, product-led value narrative and tighten the overall homepage composition.

**Architecture:** Keep the implementation scoped to `src/app/page.tsx`. Rework copy and section composition without changing the broader site shell or adding new components unless necessary. Preserve SEO-critical strings and links already enforced by tests.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Vitest, ESLint

---

## Chunk 1: Homepage Structure

### Task 1: Update homepage composition

**Files:**
- Modify: `src/app/page.tsx`
- Test: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Review the current homepage sections and test expectations**

Read:
- `src/app/page.tsx`
- `src/__tests__/seo-surface.test.ts`

- [ ] **Step 2: Write the minimal homepage redesign in `src/app/page.tsx`**

Change:
- tighten the hero copy and CTA layout
- add a concise proof strip
- replace the workflow-story section with a “What PinkPepper helps you do” section
- keep required feature/pricing links and SEO-tested phrases present in rendered content

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
git add src/app/page.tsx docs/superpowers/specs/2026-03-25-homepage-revamp-design.md docs/superpowers/plans/2026-03-25-homepage-revamp.md
git commit -m "feat: revamp homepage value narrative"
```
