# SEO Article Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve indexability for the stuck article cluster by strengthening `/articles`, `/about`, and the first eight weak article URLs with clearer intent, better copy, and stronger internal linking.

**Architecture:** This is a content-first cleanup pass over the existing file-based article system. The implementation keeps the current article loader and rendering pipeline intact, improves hub-page copy where it affects index-worthiness, rewrites weak article bodies in-place, and records merge/de-index candidates for a later round instead of changing the entire cluster at once.

**Tech Stack:** Next.js App Router, local Markdown article files under `content/articles`, TypeScript, Vitest, ESLint

---

## File Structure

### Core content sources

- Modify: `content/articles/building-a-haccp-process-flow-diagram.md`
- Modify: `content/articles/cooling-and-reheating-haccp-high-risk-steps.md`
- Modify: `content/articles/correcting-non-conformities-in-haccp.md`
- Modify: `content/articles/failed-haccp-inspection-consequences-uk.md`
- Modify: `content/articles/haccp-ccp-examples-uk-eu.md`
- Modify: `content/articles/haccp-checklist-for-new-food-businesses.md`
- Modify: `content/articles/haccp-for-artisanal-bakeries-eu.md`
- Modify: `content/articles/haccp-for-burger-vans-eu.md`

### Public hub pages

- Modify: `src/app/articles/page.tsx`
- Modify: `src/app/about/page.tsx`

### Article rendering / link surfaces

- Modify: `src/components/homepage/RandomArticleLinks.tsx`
- Reference: `src/app/articles/[slug]/page.tsx`
- Reference: `src/lib/articles.ts`
- Reference: `src/lib/article-content.ts`

### Audit / documentation outputs

- Create: `docs/content/article-cluster-triage-2026-04-05.md`

### Verification

- Test: `src/__tests__/seo-surface.test.ts`

## Chunk 1: Audit And Triage The First Batch

### Task 1: Create the triage note

**Files:**
- Create: `docs/content/article-cluster-triage-2026-04-05.md`

- [ ] **Step 1: Create the triage file skeleton**

Add sections for:
- scope
- article-by-article classification
- keep / rewrite / merge-candidate decision
- next-round recommendations

- [ ] **Step 2: Review the eight target articles and `/about` and `/articles`**

Read:
- `content/articles/building-a-haccp-process-flow-diagram.md`
- `content/articles/cooling-and-reheating-haccp-high-risk-steps.md`
- `content/articles/correcting-non-conformities-in-haccp.md`
- `content/articles/failed-haccp-inspection-consequences-uk.md`
- `content/articles/haccp-ccp-examples-uk-eu.md`
- `content/articles/haccp-checklist-for-new-food-businesses.md`
- `content/articles/haccp-for-artisanal-bakeries-eu.md`
- `content/articles/haccp-for-burger-vans-eu.md`
- `src/app/articles/page.tsx`
- `src/app/about/page.tsx`

Expected output:
- each target gets a classification and one-paragraph rationale

- [ ] **Step 3: Save initial keep / rewrite / merge-candidate decisions**

Write the triage note with explicit entries for all ten in-scope pages.

- [ ] **Step 4: Commit**

Run:
`git add docs/content/article-cluster-triage-2026-04-05.md`

Commit:
`git commit -m "document first article cleanup triage"`

## Chunk 2: Strengthen The Hub Pages

### Task 2: Improve `/articles`

**Files:**
- Modify: `src/app/articles/page.tsx`
- Test: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Write the failing test**

Add assertions to `src/__tests__/seo-surface.test.ts` that `/articles`:
- clearly describes the library as practical guidance for HACCP, allergens, audits, and operational compliance
- reads like a curated resource hub rather than a simple archive

- [ ] **Step 2: Run test to verify it fails**

Run:
`npx vitest run src/__tests__/seo-surface.test.ts`

Expected:
- one or more assertions fail against the old hub wording

- [ ] **Step 3: Rewrite the hub intro**

Update `src/app/articles/page.tsx` so the hero copy:
- gives clearer value framing
- names the main content themes
- sounds more index-worthy and less generic

- [ ] **Step 4: Strengthen internal-link context on the hub**

In `src/app/articles/page.tsx`, add a compact supporting section or stronger helper copy that:
- points readers toward templates, audit prep, and HACCP feature pages
- increases contextual linkage into the commercial cluster without stuffing

- [ ] **Step 5: Run test to verify it passes**

Run:
`npx vitest run src/__tests__/seo-surface.test.ts`

Expected:
- all SEO surface tests pass

- [ ] **Step 6: Commit**

Run:
`git add src/app/articles/page.tsx src/__tests__/seo-surface.test.ts`

Commit:
`git commit -m "strengthen articles hub positioning"`

### Task 3: Improve `/about`

**Files:**
- Modify: `src/app/about/page.tsx`
- Test: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Extend or adjust the SEO assertions if needed**

Only add test coverage if the new `/about` copy needs an explicit regression for:
- distinct authority positioning
- clearer explanation of Consultant / Auditor / human review

- [ ] **Step 2: Rewrite the highest-value about copy**

Update `src/app/about/page.tsx` so the page:
- reinforces authority and founder credibility
- stays distinct from homepage and pricing
- explains the product stack more clearly without repeating generic sales copy

- [ ] **Step 3: Verify no mojibake or copy regressions**

Run:
`npx vitest run src/__tests__/seo-surface.test.ts`

Expected:
- all tests pass

- [ ] **Step 4: Commit**

Run:
`git add src/app/about/page.tsx src/__tests__/seo-surface.test.ts`

Commit:
`git commit -m "strengthen about page authority copy"`

## Chunk 3: Rewrite The First Article Batch

### Task 4: Clean obvious junk and weak structure in the first four articles

**Files:**
- Modify: `content/articles/building-a-haccp-process-flow-diagram.md`
- Modify: `content/articles/cooling-and-reheating-haccp-high-risk-steps.md`
- Modify: `content/articles/correcting-non-conformities-in-haccp.md`
- Modify: `content/articles/failed-haccp-inspection-consequences-uk.md`

- [ ] **Step 1: Rewrite `building-a-haccp-process-flow-diagram.md`**

Focus:
- remove any migrated HTML artifacts or broken phrasing
- give it a specific intro and practical section flow

- [ ] **Step 2: Rewrite `cooling-and-reheating-haccp-high-risk-steps.md`**

Focus:
- deepen the article beyond a thin summary
- make cooling vs reheating controls more explicit and operational

- [ ] **Step 3: Rewrite `correcting-non-conformities-in-haccp.md`**

Focus:
- strengthen depth and specificity
- make it clearly distinct from broader audit-failure content

- [ ] **Step 4: Rewrite `failed-haccp-inspection-consequences-uk.md`**

Focus:
- keep it UK-specific
- clarify likely enforcement, remediation, and operator consequences

- [ ] **Step 5: Sanity-check frontmatter and body integrity**

Verify each file still has:
- valid frontmatter
- distinct excerpt
- no malformed heading structure

- [ ] **Step 6: Commit**

Run:
`git add content/articles/building-a-haccp-process-flow-diagram.md content/articles/cooling-and-reheating-haccp-high-risk-steps.md content/articles/correcting-non-conformities-in-haccp.md content/articles/failed-haccp-inspection-consequences-uk.md`

Commit:
`git commit -m "rewrite first batch of weak haccp articles"`

### Task 5: Rewrite the second four articles

**Files:**
- Modify: `content/articles/haccp-ccp-examples-uk-eu.md`
- Modify: `content/articles/haccp-checklist-for-new-food-businesses.md`
- Modify: `content/articles/haccp-for-artisanal-bakeries-eu.md`
- Modify: `content/articles/haccp-for-burger-vans-eu.md`

- [ ] **Step 1: Rewrite `haccp-ccp-examples-uk-eu.md`**

Focus:
- make the examples concrete
- avoid generic filler and overlapping explanation from other HACCP guides

- [ ] **Step 2: Rewrite `haccp-checklist-for-new-food-businesses.md`**

Focus:
- make it checklist-driven and operator-friendly
- ensure it earns its own intent instead of duplicating general setup pages

- [ ] **Step 3: Rewrite `haccp-for-artisanal-bakeries-eu.md`**

Focus:
- make bakery-specific hazards and controls explicit
- reduce template feel

- [ ] **Step 4: Rewrite `haccp-for-burger-vans-eu.md`**

Focus:
- emphasize mobile food operation realities
- separate it clearly from generic food-truck content

- [ ] **Step 5: Review excerpts and titles for search clarity**

Only adjust titles if the gain is obvious.
Preserve slugs unless a slug is clearly poor enough to justify redirects later.

- [ ] **Step 6: Commit**

Run:
`git add content/articles/haccp-ccp-examples-uk-eu.md content/articles/haccp-checklist-for-new-food-businesses.md content/articles/haccp-for-artisanal-bakeries-eu.md content/articles/haccp-for-burger-vans-eu.md`

Commit:
`git commit -m "rewrite second batch of weak haccp articles"`

## Chunk 4: Improve Internal Linking And Cluster Signals

### Task 6: Update article-link surfaces

**Files:**
- Modify: `src/components/homepage/RandomArticleLinks.tsx`
- Modify: `src/app/articles/page.tsx`

- [ ] **Step 1: Review current article-link surfaces**

Check whether the current random pool under-represents the rewritten batch or over-links weaker pages.

- [ ] **Step 2: Adjust `RandomArticleLinks.tsx`**

Bias the link pool toward stronger evergreen pages and cleaned pages where useful.
Do not turn it into a full manual curation system unless needed.

- [ ] **Step 3: Add or tighten supporting links from `/articles`**

Ensure the hub gives the rewritten batch a stronger path from the public surface.

- [ ] **Step 4: Commit**

Run:
`git add src/components/homepage/RandomArticleLinks.tsx src/app/articles/page.tsx`

Commit:
`git commit -m "improve article cluster internal linking"`

## Chunk 5: Final Verification And Triage Output

### Task 7: Finish the triage note and verify the pass

**Files:**
- Modify: `docs/content/article-cluster-triage-2026-04-05.md`
- Test: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Update the triage note with final classifications**

For each in-scope article, record:
- final status
- short rationale
- merge/de-index candidates for round two

- [ ] **Step 2: Run the verification suite**

Run:
`npm run typecheck`

Expected:
- PASS

- [ ] **Step 3: Run SEO surface tests**

Run:
`npx vitest run src/__tests__/seo-surface.test.ts`

Expected:
- PASS

- [ ] **Step 4: Run targeted lint**

Run:
`npx eslint src/app/articles/page.tsx src/app/about/page.tsx src/components/homepage/RandomArticleLinks.tsx src/__tests__/seo-surface.test.ts`

Expected:
- PASS

- [ ] **Step 5: Review the edited article files manually**

Check for:
- malformed frontmatter
- broken markdown or HTML fragments
- duplicated intros/outros
- obvious tone or formatting drift

- [ ] **Step 6: Commit**

Run:
`git add docs/content/article-cluster-triage-2026-04-05.md content/articles/building-a-haccp-process-flow-diagram.md content/articles/cooling-and-reheating-haccp-high-risk-steps.md content/articles/correcting-non-conformities-in-haccp.md content/articles/failed-haccp-inspection-consequences-uk.md content/articles/haccp-ccp-examples-uk-eu.md content/articles/haccp-checklist-for-new-food-businesses.md content/articles/haccp-for-artisanal-bakeries-eu.md content/articles/haccp-for-burger-vans-eu.md src/app/articles/page.tsx src/app/about/page.tsx src/components/homepage/RandomArticleLinks.tsx src/__tests__/seo-surface.test.ts`

Commit:
`git commit -m "complete first seo article cleanup pass"`

## Notes For Execution

- Do not expand scope beyond the eight target articles, `/articles`, and `/about` in this pass.
- Preserve existing slugs by default.
- Prefer stronger distinctness over simply adding more words.
- Record merge/de-index candidates, but do not remove URLs in this pass unless a page is clearly broken.
- Keep `docs/manual-bot-qa-questions.md` uncommitted.
