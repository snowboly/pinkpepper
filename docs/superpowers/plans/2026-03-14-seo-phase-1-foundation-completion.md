# SEO Phase 1 Foundation Completion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish PinkPepper's SEO Phase 1 by aligning shared metadata, validating crawl/index controls, and strengthening messaging plus internal linking across the core public marketing pages.

**Architecture:** Keep the work constrained to the existing Next.js App Router marketing surface. Use small, focused edits to shared SEO infrastructure first, then improve public-page copy and links where they materially reinforce the approved category narrative and crawl paths.

**Tech Stack:** Next.js App Router, TypeScript, React Server Components, Vitest, existing repo lint/type/build scripts

---

## File Structure

- Modify: `src/app/layout.tsx`
  - Shared metadata, OG/Twitter copy, canonical positioning, organization/site schema wording.
- Modify: `src/app/sitemap.ts`
  - Confirm public-route coverage and exclude non-public surfaces.
- Review/possibly modify: `src/app/robots.ts`
  - Keep crawl disallow rules aligned with the public sitemap.
- Modify: `src/app/page.tsx`
  - Homepage category narrative, supporting commercial terms, internal links.
- Modify: `src/app/pricing/page.tsx`
  - Messaging alignment and stronger links into features/use cases/resources.
- Modify: `src/app/about/page.tsx`
  - Clear compliance-software positioning and relevant internal links.
- Modify: `src/app/security/page.tsx`
  - Positioning consistency and links to pricing/features/contact.
- Modify: `src/app/contact/page.tsx`
  - Positioning consistency and links to feature/use-case/pricing paths.
- Modify: `src/app/features/page.tsx`
  - Descriptive links to feature detail pages and pricing.
- Modify: `src/app/use-cases/page.tsx`
  - Descriptive links to use-case detail pages and pricing/features.
- Modify: `src/app/compare/page.tsx`
  - Descriptive links to comparison detail pages and conversion pages.
- Modify: `src/app/resources/page.tsx`
  - Resource intro copy plus links to adjacent commercial pages.
- Create or modify tests: `src/app/__tests__/seo-surface.test.ts` or nearest existing SEO/public-page test file
  - Regression coverage for metadata text, sitemap inclusion/exclusion, and key internal links on touched hub pages.

## Chunk 1: Shared SEO Infrastructure

### Task 1: Add regression tests for metadata and crawl controls

**Files:**
- Test: `src/app/__tests__/seo-surface.test.ts`
- Review: `src/app/layout.tsx`
- Review: `src/app/sitemap.ts`
- Review: `src/app/robots.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("SEO surface", () => {
  it("uses the Phase 1 compliance software positioning in shared metadata", () => {
    expect(String(metadata.title)).toContain("Food Safety Compliance Software");
    expect(metadata.description).toContain("EU and UK food businesses");
  });

  it("points social metadata at the generated OG image route", () => {
    expect(metadata.openGraph?.images?.[0]).toMatchObject({ url: "/og-image" });
    expect(metadata.twitter?.images).toContain("/og-image");
  });

  it("includes public marketing pages and excludes auth/dashboard routes from sitemap and robots", () => {
    const entries = sitemap().map((entry) => entry.url);
    expect(entries).toContain("https://pinkpepper.io/features");
    expect(entries).not.toContain("https://pinkpepper.io/login");
    expect(robots().rules).toMatchObject({
      disallow: expect.arrayContaining(["/dashboard/", "/admin/", "/api/", "/auth/"]),
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/__tests__/seo-surface.test.ts`
Expected: FAIL because current metadata copy and/or OG image path do not match the approved positioning.

- [ ] **Step 3: Write minimal implementation**

Update `src/app/layout.tsx`, `src/app/sitemap.ts`, and if needed `src/app/robots.ts` so that:
- root title/description/social copy use the approved compliance-software narrative
- OG image references consistently use the app’s generated OG route
- sitemap and robots stay aligned with the intended public surface

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts src/app/__tests__/seo-surface.test.ts
git commit -m "test: lock shared SEO metadata and crawl controls"
```

## Chunk 2: Public Messaging and Internal Links

### Task 2: Add failing tests for public hub-page messaging and links

**Files:**
- Test: `src/app/__tests__/seo-surface.test.ts`
- Review: `src/app/page.tsx`
- Review: `src/app/pricing/page.tsx`
- Review: `src/app/about/page.tsx`
- Review: `src/app/security/page.tsx`
- Review: `src/app/contact/page.tsx`
- Review: `src/app/features/page.tsx`
- Review: `src/app/use-cases/page.tsx`
- Review: `src/app/compare/page.tsx`
- Review: `src/app/resources/page.tsx`

- [ ] **Step 1: Extend the failing test**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

const readPage = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), "utf8");

describe("public SEO copy and linking", () => {
  it("aligns the homepage with the compliance software category narrative", () => {
    const homepage = readPage("src/app/page.tsx");
    expect(homepage).toContain("AI food safety compliance software");
    expect(homepage).toContain("/features/haccp-plan-generator");
    expect(homepage).toContain("/pricing");
  });

  it("gives public hub pages descriptive links into commercial detail pages", () => {
    const pricing = readPage("src/app/pricing/page.tsx");
    const features = readPage("src/app/features/page.tsx");
    const useCases = readPage("src/app/use-cases/page.tsx");
    const compare = readPage("src/app/compare/page.tsx");
    const resources = readPage("src/app/resources/page.tsx");

    expect(pricing).toContain("/features/");
    expect(features).toContain("/pricing");
    expect(useCases).toContain("/features/");
    expect(compare).toContain("/pricing");
    expect(resources).toContain("/features/");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/__tests__/seo-surface.test.ts`
Expected: FAIL because one or more pages do not yet contain the required narrative or internal-link targets.

- [ ] **Step 3: Write minimal implementation**

Edit the listed public pages to:
- use the approved compliance-software framing in headings/opening copy where needed
- add descriptive internal links to relevant feature, use-case, comparison, resource, and pricing pages
- keep the current design system and structure intact

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/pricing/page.tsx src/app/about/page.tsx src/app/security/page.tsx src/app/contact/page.tsx src/app/features/page.tsx src/app/use-cases/page.tsx src/app/compare/page.tsx src/app/resources/page.tsx src/app/__tests__/seo-surface.test.ts
git commit -m "feat: align public SEO messaging and internal linking"
```

## Chunk 3: Full Verification

### Task 3: Run repo verification for the touched surface

**Files:**
- Verify only

- [ ] **Step 1: Run focused tests**

Run: `npx vitest run src/app/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 2: Run type/build verification**

Run: `npm run build`
Expected: successful production build with no errors

- [ ] **Step 3: Review diff and touched files**

Run: `git diff --stat`
Expected: only the intended SEO files and tests are changed

- [ ] **Step 4: Commit final adjustments if needed**

```bash
git add src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts src/app/page.tsx src/app/pricing/page.tsx src/app/about/page.tsx src/app/security/page.tsx src/app/contact/page.tsx src/app/features/page.tsx src/app/use-cases/page.tsx src/app/compare/page.tsx src/app/resources/page.tsx src/app/__tests__/seo-surface.test.ts
git commit -m "chore: finish SEO phase 1 verification"
```
