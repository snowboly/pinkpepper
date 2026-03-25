# Pricing Page Rewrite Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the pricing page so it matches current product entitlements and reads like a tighter human-written commercial page.

**Architecture:** Keep the work mostly scoped to `src/app/pricing/page.tsx`, preserving the existing plan actions component and route structure. Update metadata and on-page plan descriptions to align with the current tier model in `src/lib/tier.ts`, and verify no SEO or build regressions are introduced.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Vitest, ESLint

---

## Chunk 1: Pricing Page Rewrite

### Task 1: Rewrite pricing copy and structure

**Files:**
- Modify: `src/app/pricing/page.tsx`
- Inspect: `src/lib/tier.ts`
- Test: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Review the live entitlement source of truth**

Read:
- `src/lib/tier.ts`
- `src/app/pricing/page.tsx`

- [ ] **Step 2: Rewrite the pricing page**

Change:
- simplify the hero
- tighten the tier grid
- remove outdated PDF/export claims
- align Plus/Pro language with current templates, DOCX export, virtual audit, uploads, and consultancy behavior
- reduce repeated plan copy

- [ ] **Step 3: Run targeted regression test**

Run:
```bash
npm test -- --run src/__tests__/seo-surface.test.ts
```

Expected:
- tests pass

- [ ] **Step 4: Run lint and build**

Run:
```bash
npm run lint
npm run build
```

Expected:
- no lint errors
- build passes

- [ ] **Step 5: Commit**

```bash
git add src/app/pricing/page.tsx docs/superpowers/specs/2026-03-25-pricing-page-rewrite-design.md docs/superpowers/plans/2026-03-25-pricing-page-rewrite.md
git commit -m "feat: rewrite pricing page copy"
```
