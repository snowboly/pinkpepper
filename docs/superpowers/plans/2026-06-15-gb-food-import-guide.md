# Great Britain Food Import Guide Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a legally cautious, illustrated guide to importing food into Great Britain from non-EU countries.

**Architecture:** Add the article through the existing `content/articles` Markdown and manifest pipeline. Use a remote Pexels image for the hero and local SVG files for stable, accessible process diagrams.

**Tech Stack:** Next.js, TypeScript, Vitest, HTML-in-Markdown, SVG.

---

## Chunk 1: Article Contract

### Task 1: Add a failing article regression test

**Files:**
- Modify: `src/__tests__/articles.test.ts`

- [ ] Add a test that loads the production article manifest and article.
- [ ] Assert the slug, publication metadata, GB-only scope, Pexels hero, and both SVG references.
- [ ] Assert the article does not call canned tuna a composite product and does not state that all low-risk animal products can enter at any port.
- [ ] Run `npm test -- src/__tests__/articles.test.ts` and confirm the test fails because the article is missing.

## Chunk 2: Visual Assets

### Task 2: Add deterministic diagrams

**Files:**
- Create: `public/articles/gb-food-import-workflow.svg`
- Create: `public/articles/gb-food-import-decision-tree.svg`

- [ ] Build responsive 1200-pixel-wide SVGs using the existing navy, slate, and rose palette.
- [ ] Keep labels concise and avoid changing legal thresholds.
- [ ] Validate both files as XML and inspect their dimensions and text.

## Chunk 3: Article

### Task 3: Add the corrected article and manifest entry

**Files:**
- Create: `content/articles/how-to-import-food-into-great-britain-from-non-eu-countries.md`
- Modify: `content/articles/manifest.json`

- [ ] Select a port or food-logistics hero through the Pexels API.
- [ ] Rewrite the supplied draft using verified official sources and explicit live-check instructions.
- [ ] Include the workflow and decision-tree figures with alt text and captions.
- [ ] Add the article summary to the manifest in publication-date order.
- [ ] Run the focused article test and confirm it passes.

## Chunk 4: Verification

### Task 4: Run project checks

**Files:**
- No additional files.

- [ ] Run `npm test -- src/__tests__/articles.test.ts src/__tests__/seo-surface.test.ts`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Review `git diff --check` and the final diff.
- [ ] Commit the article, diagrams, tests, spec, and plan.
