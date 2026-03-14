# SEO Phase 1 Foundation Completion Design

## Goal

Finish the Phase 1 SEO foundation on `seo/phase-1-foundation` by tightening technical SEO, aligning public-page messaging to one category narrative, and improving internal linking across core money pages.

## Scope

This design covers only the public marketing surface and shared SEO infrastructure.

Included:
- shared metadata and social preview consistency
- sitemap and robots verification
- homepage and core public-page messaging alignment
- internal-linking fixes that strengthen crawl paths and conversion paths

Excluded:
- dashboard, auth, admin, billing, chat, or export product work
- unrelated visual redesign
- new Phase 2 landing-page expansion beyond targeted cleanup

## Problem Summary

The branch already includes the major Phase 1 page set: feature pages, use-case pages, comparison pages, and resources. The remaining gaps are consistency and signal quality:

- shared metadata still leans on the older "AI Food Safety Assistant" positioning instead of the Phase 1 category narrative
- OG image references need to match the actual app route/asset behavior
- some public pages likely underuse descriptive internal links
- some public messaging may not consistently reinforce the intended category and supporting terms

These are cross-site issues, so cleaning them up now improves ranking and CTR signals across the entire marketing surface.

## Recommended Positioning

Primary category narrative:

`AI food safety compliance software for EU and UK food businesses`

Supporting terms:
- HACCP plan generation
- allergen documentation
- SOP generation
- audit preparation
- food safety records

Rule:
- shared metadata and key above-the-fold copy should lead with the category narrative
- supporting terms should reinforce the category instead of replacing it

## Technical Design

### Shared metadata

Update the root metadata to reflect the Phase 1 category narrative consistently across:
- title
- description
- Open Graph title and description
- Twitter title and description

Keep the existing brand and regulatory focus, but shift wording away from the more generic "assistant" framing toward "software" and "compliance" framing.

### Social preview

Verify that the metadata image reference matches the project’s actual OG image implementation. If the app relies on `src/app/og-image.tsx`, shared metadata should point to that route cleanly and consistently.

### Crawl controls

Verify that:
- the sitemap contains the intended public pages only
- auth, admin, dashboard, and API routes remain out of crawlable sitemap entries
- robots rules continue to disallow the correct non-public path groups

If the current sitemap is valid, changes should be minimal and limited to consistency or omissions.

## Content Design

### Priority pages

Review and tighten the highest-leverage public pages first:
- `/`
- `/pricing`
- `/about`
- `/security`
- `/contact`
- public hub/index pages for features, use cases, compare, and resources

Review supporting landing pages only where weak messaging or missing links materially reduce SEO value.

### Messaging rules

For priority pages:
- make the primary headline or opening copy clearly support the category narrative
- keep copy specific to EU and UK food businesses
- mention the strongest commercial jobs: HACCP plans, allergen documentation, SOPs, audit prep
- avoid vague assistant-style phrasing when a compliance-software framing is stronger

### Internal linking rules

Ensure major public pages link into:
- `/pricing`
- at least one relevant feature page
- at least one relevant use-case or comparison page where contextually appropriate
- relevant resources where they support trust or intent capture

Link text should be descriptive, not generic.

## File Areas Likely Affected

- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/page.tsx`
- `src/app/pricing/page.tsx`
- `src/app/about/page.tsx`
- `src/app/security/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/features/page.tsx`
- `src/app/use-cases/page.tsx`
- `src/app/compare/page.tsx`
- `src/app/resources/page.tsx`

Additional feature/use-case/resource detail pages should only be touched if the review finds material SEO gaps.

## Testing and Verification

Verification should cover:
- type-safe build/test commands already used in this repo
- sitemap output sanity
- metadata/OG path sanity
- spot review of updated internal links on the touched pages

No completion claim should be made without running concrete verification commands and checking their output.

## Success Criteria

Phase 1 is complete when:
- shared metadata reflects the approved category positioning
- OG image references are internally consistent
- sitemap and robots are confirmed correct for the intended public surface
- key public pages consistently reinforce the same category narrative
- internal linking between money pages and supporting content is materially stronger
