# Compare Surface Removal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the public comparison hub and both leaf comparison pages, along with their supporting internal references.

**Architecture:** Delete the compare route files and then update sitemap/test expectations plus any direct internal links that still point to those pages. Keep the change narrow and focused on removal, not replacement.

**Tech Stack:** Next.js App Router, React, Vitest, ESLint

---

## Chunk 1: Compare Route Removal

### Task 1: Remove compare pages and references

**Files:**
- Delete: `src/app/compare/page.tsx`
- Delete: `src/app/compare/pinkpepper-vs-consultant/page.tsx`
- Delete: `src/app/compare/haccp-software-alternatives/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Review current compare references**

Read:
- `src/app/sitemap.ts`
- `src/__tests__/seo-surface.test.ts`
- any direct references found via search

- [ ] **Step 2: Remove the routes and update references**

Change:
- delete the compare route files
- remove compare URLs from sitemap
- remove compare expectations from SEO tests
- remove any remaining direct internal marketing links

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
git add src/app/sitemap.ts src/__tests__/seo-surface.test.ts docs/superpowers/specs/2026-03-25-compare-surface-removal-design.md docs/superpowers/plans/2026-03-25-compare-surface-removal.md
git add -u src/app/compare
git commit -m "chore: remove compare marketing pages"
```
