# Articles Full Load Test Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/articles` render the full library by default while preserving a lazy fallback behind an environment variable.

**Architecture:** The articles page reads a server-side mode flag and decides whether to render all article cards in the initial grid or keep the deferred remainder component. Existing featured and discovery sections remain untouched.

**Tech Stack:** Next.js App Router, React server components, Vitest, TypeScript

---

## Chunk 1: Mode Toggle

### Task 1: Add page-level mode selection

**Files:**
- Modify: `src/app/articles/page.tsx`

- [ ] **Step 1: Write the failing test**

Use `src/__tests__/seo-surface.test.ts` to assert:
- default mode renders article 25+
- `ARTICLES_LIBRARY_MODE=lazy` keeps the deferred remainder

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/seo-surface.test.ts`

- [ ] **Step 3: Write minimal implementation**

Read `process.env.ARTICLES_LIBRARY_MODE` in `src/app/articles/page.tsx` and switch between:
- full: render all articles in the main grid
- lazy: render first 24 and pass the remainder to `ArticleLibraryRemainder`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/seo-surface.test.ts`

- [ ] **Step 5: Clean up dead props**

Remove the unused `locale` prop from `src/components/articles/ArticleLibraryRemainder.tsx`.

## Chunk 2: Verification

### Task 2: Verify the final surface

**Files:**
- Modify: `src/__tests__/seo-surface.test.ts`
- Verify: `src/app/articles/page.tsx`
- Verify: `src/components/articles/ArticleLibraryRemainder.tsx`

- [ ] **Step 1: Run focused test suite**

Run: `npm test -- --run src/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS
