# SEO Phase 1 Baseline Report

## Purpose

This report captures the current public SEO sources of truth and converts the active Search Console issue buckets into concrete URL classes. It is the baseline for Phase 1 technical cleanup.

## Current SEO Sources of Truth

### Canonical metadata

- `src/app/layout.tsx`
  - root metadata
  - shared homepage canonical
  - shared Open Graph and Twitter descriptions
- `src/lib/seo/public-metadata.ts`
  - metadata builder for localized public pages
  - `x-default` and language alternates
- page-level metadata on English-only routes such as:
  - `src/app/about/page.tsx`
  - `src/app/articles/page.tsx`
  - `src/app/resources/page.tsx`
  - `src/app/pricing/page.tsx`
  - `src/app/articles/[slug]/page.tsx`

### Public localized routes

- `src/i18n/public.ts`
  - public locale list
  - public content route list
  - public auth route list
- `src/lib/public-routes.ts`
  - route localization helper
  - locale switching helper
- `src/app/[locale]/layout.tsx`
  - localized route wrapper and static params
- `middleware.ts`
  - host canonicalization
  - now also handles legacy `/en/...` redirects to root-English equivalents

### Sitemap and discovery

- `src/app/sitemap.ts`
  - public marketing URLs
  - resource URLs from shared registry
  - article URLs gated by index policy
- `src/app/robots.ts`
  - sitemap reference and disallow rules
- `src/app/api/cron/indexnow/route.ts`
  - IndexNow URL submission list

### Resource URLs

- `src/lib/resources.ts`
  - canonical resource registry
  - featured-resource list

### Article index eligibility

- `src/lib/articles.ts`
  - article manifest loading
  - localized article manifest loading
  - intended home for article index policy

## Current Baseline Findings

### 1. Legacy `/en` routes were still behaving like first-class public URLs

Before this pass:
- `localizePublicPath("en", "/pricing")` returned `/en/pricing`
- localized metadata treated `/en/...` as the English alternate
- localized static params generated an `en` route
- middleware did not redirect `/en/...` to root-English equivalents

This is the clearest canonical ambiguity in the current public routing stack.

### 2. Sitemap and article-index logic are drifting

Current `src/app/sitemap.ts` imports `isArticlePreferredForIndexing` from `src/lib/articles.ts`, but the function is not exported from that file on this branch state. The result is runtime/test failure when sitemap tries to filter articles.

This is not a theoretical issue. It currently breaks parts of the focused SEO test suite and needs to be fixed in the discovery cleanup chunk.

### 3. Search Console cleanup has been mostly URL-by-URL

The current route/code shape still encourages one-off fixes:
- some legacy public paths redirect
- some are intentionally excluded
- some remain indexable duplicates

What is missing is a written rule matrix per issue class so future fixes do not depend on memory.

### 4. Public content surface size

- English article markdown files in `content/articles`: `71`
- Resource pages are now centrally represented through `src/lib/resources.ts`

The library is large enough that canonical/indexing mistakes can waste crawl effort quickly.

### 5. Focused canonical regression status at the start of implementation

After adding targeted tests for `/en` behavior:
- the targeted `/en` tests failed for the expected reason
- the broader focused SEO suite also exposed unrelated branch drift:
  - sitemap/article-index failure
  - stale expectations around current article/resources surfaces

That means the canonical bug is real, but the branch also carries separate SEO/test cleanup work that belongs to later chunks.

## Search Console Issue Buckets -> URL Classes

| Search Console bucket | Example URLs seen in this project | Likely cause | Desired handling rule |
|---|---|---|---|
| Excluded by `noindex` | weak imported articles, auth surfaces, non-public routes | deliberate exclusion or weak content policy | keep excluded if intentional; remove from sitemap/internal promotion |
| Page with redirect | `http://pinkpepper.io/`, `http://www.pinkpepper.io/`, legacy `www`, legacy `/en/...` | canonical host/protocol/path normalization | keep redirecting permanently; ensure redirected URLs are not linked or listed in sitemap |
| Alternative page with proper canonical | locale/host duplicates such as `/en/...` vs root English | duplicate public entry points | collapse to one canonical route shape; avoid self-canonicalizing duplicates |
| Crawled - currently not indexed | lower-value articles, thin imported pages, mixed-intent hubs | weak uniqueness or low perceived value | decide intentionally: improve, deindex, or stop promoting internally |
| Not found (404) | removed compare leaves, old article/resource paths, bucket assets | stale internal links or missing redirect coverage | either add explicit redirect or remove internal references |
| Error de redirection / redirect error | malformed or chained legacy redirects | inconsistent redirect rules | tighten redirect logic so one request maps to one destination |
| Detected - currently not indexed | newly added but weakly linked pages | discovery lag or low priority | improve discovery and internal links before expanding content volume |
| Duplicate without user-selected canonical | localized/public duplicates or parameterized routes | multiple crawlable entry points | canonicalize or redirect at the route layer |
| Google chose different canonical than user | conflicting internal signals | metadata, host, links, or redirects disagree | align metadata, sitemap, internal links, and redirects |

## Immediate Ownership Map

| Area | Primary files |
|---|---|
| host and path canonicalization | `middleware.ts`, `src/lib/public-routes.ts`, `src/app/[locale]/layout.tsx` |
| shared localized metadata | `src/lib/seo/public-metadata.ts` |
| sitemap/discovery | `src/app/sitemap.ts`, `src/app/api/cron/indexnow/route.ts`, `src/lib/resources.ts`, `src/lib/articles.ts` |
| public snippet quality | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/articles/page.tsx`, `src/app/resources/page.tsx` |
| regression safety | `src/__tests__/seo-surface.test.ts`, `src/__tests__/public-localization.test.ts`, `src/__tests__/middleware-host-canonicalization.test.ts`, `src/__tests__/resource-audit-surface.test.ts`, `src/__tests__/localized-articles.test.ts` |

## Completed in This Initial Pass

The following targeted canonical fixes are already applied in the worktree:

- root English is now the canonical output for `localizePublicPath("en", ...)`
- localized static params exclude `en`
- middleware permanently redirects legacy `/en/...` public routes to root-English equivalents

## Verification Evidence So Far

Targeted canonical regression run:

`npm test -- --run src/__tests__/seo-surface.test.ts src/__tests__/public-localization.test.ts src/__tests__/middleware-host-canonicalization.test.ts -t "builds locale alternates|identifies public locales|preserves supported public routes|creates localized route wrappers|permanently redirects legacy /en"`

Result:
- `3` test files passed
- `5` targeted tests passed

## Next Work

The next cleanup slice should focus on discovery drift:

1. fix sitemap/article index gating so discovery tests execute cleanly
2. align IndexNow with the same canonical assumptions
3. then clean remaining public-snippet inconsistencies
