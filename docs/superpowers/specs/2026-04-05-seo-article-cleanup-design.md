# SEO Article Cleanup Design

Date: 2026-04-05

## Goal

Improve indexability and content quality for the public article cluster by fixing the pages most likely to be holding back Google indexing, while keeping the scope narrow enough to ship quickly.

This pass focuses on:

- `/articles`
- `/about`
- the first batch of detected-but-not-indexed article URLs already surfaced from Search Console

## Problem Summary

The current indexing issue is not primarily a technical SEO problem. The codebase already exposes articles as indexable pages with canonicals and sitemap inclusion. The stronger signal is content quality and cluster hygiene:

- some article bodies are thin
- some migrated content contains cleanup artifacts or awkward phrasing
- multiple pages feel too templated or overlapping
- the `/articles` hub is not yet doing enough to establish clear cluster value and internal-link weight

Because Google has already detected many URLs but is not indexing them, the first pass should prioritize making the weakest pages more index-worthy rather than broad technical tweaks.

## Scope

### Pages in scope

- `/articles`
- `/about`
- first article batch:
  - `building-a-haccp-process-flow-diagram`
  - `cooling-and-reheating-haccp-high-risk-steps`
  - `correcting-non-conformities-in-haccp`
  - `failed-haccp-inspection-consequences-uk`
  - `haccp-ccp-examples-uk-eu`
  - `haccp-checklist-for-new-food-businesses`
  - `haccp-for-artisanal-bakeries-eu`
  - `haccp-for-burger-vans-eu`

### Out of scope for this pass

- full-library rewrite
- backlink strategy
- broad analytics instrumentation changes
- large-scale template or CMS migration

## Approach Options Considered

### 1. Salvage plus merge-candidate triage

Keep the strong or promising URLs, rewrite weak-but-useful pages, and explicitly identify overlapping pages that should be merged or de-indexed in a later pass.

Pros:

- fastest path to better indexing signal
- avoids wasting time saving every weak page
- creates a second-pass cleanup list instead of pretending the whole library is equally valuable

Cons:

- does not fully normalize the library in one pass

### 2. Salvage every existing URL

Preserve all current article URLs and rewrite or pad weak pages without planning any removals or consolidation.

Pros:

- lower immediate content-ops risk

Cons:

- weaker long-term cluster quality
- likely to preserve too much overlap

### 3. Full library normalization

Audit and rewrite the entire article library now.

Pros:

- best long-term consistency

Cons:

- too large for the current pass
- delays the first meaningful indexing improvement

### Recommendation

Use option 1: salvage plus merge-candidate triage.

## Content Strategy

### Articles hub

`/articles` should do more than list posts. It should clearly state what the library is for, what kinds of food businesses it serves, and why these resources are useful in practice.

Changes:

- rewrite hub intro so it reads like a useful knowledge center, not a generic archive
- add clearer framing around HACCP, allergens, audit prep, SOPs, and practical food safety operations
- strengthen internal-link emphasis toward the cleaned article batch and relevant feature pages

### About page

`/about` should be distinct from homepage positioning and not read like brand filler. It should help Google and users understand why the site is authoritative and why the founder background matters.

Changes:

- keep the current brand story, but make the page more useful and specific
- emphasize domain expertise, regulatory focus, and practical food business applicability
- reduce generic marketing phrasing

### Article batch

Each article in scope should have:

- a distinct intent
- a stronger and more specific introduction
- clearer section structure
- less templated phrasing
- stronger internal links to related articles and commercial pages where relevant

Allowed changes:

- title updates if they improve clarity or SEO
- content rewrites
- merge/de-index candidate tagging for later

Slug changes are allowed in principle, but they should only be made when clearly worth the redirect cost. Default preference is to preserve existing slugs in this pass unless a slug is materially poor.

## Page Triage Model

Each article reviewed in this pass will be classified as one of:

- `keep`
- `rewrite`
- `merge candidate`

Definitions:

- `keep`: content is already distinct enough and only needs light cleanup
- `rewrite`: content is valuable but too thin, awkward, or generic in its current form
- `merge candidate`: content overlaps too much with another article or is too weak to justify a standalone URL

This first pass will implement `keep` and `rewrite` work. `merge candidate` decisions will be documented for round two rather than executed blindly.

## Implementation Plan for the First Pass

### 1. Audit and classify the target article set

Review the eight article bodies plus `/articles` and `/about` and classify each item using the triage model.

### 2. Clean the worst body-content issues

Fix:

- imported junk or malformed remnants
- broken or awkward phrasing
- weak intros and conclusions
- section structures that do not support the intent

### 3. Strengthen hub and page positioning

Update:

- `/articles`
- `/about`

with clearer, more index-worthy copy and stronger internal linking.

### 4. Improve internal linking

For the cleaned batch:

- link related articles to each other where the relationship is real
- link relevant articles to feature pages
- make `/articles` a stronger entry point into the cluster

### 5. Produce merge-candidate list for round two

Document which article URLs should likely be merged, redirected, or removed from the sitemap in a later pass.

## Success Criteria

This pass is successful if:

- the cleaned article batch no longer contains obvious junk or thin content
- each cleaned article has a clearer unique purpose
- `/articles` is more useful and authoritative as a hub
- `/about` is more distinct and index-worthy
- a concrete second-pass merge/de-index candidate list exists

## Risks and Mitigations

### Risk: rewriting without improving distinctness

Mitigation:

- classify each article before editing
- prioritize intent separation over word count inflation

### Risk: making too many slug changes

Mitigation:

- preserve slugs by default
- only change titles or slugs where the gain is obvious

### Risk: trying to solve the whole content library at once

Mitigation:

- keep scope limited to the first batch and the two hub pages

## Open Follow-up After This Pass

Round two should likely include:

- acting on merge/de-index candidates
- broader library cleanup
- possible sitemap pruning for low-value URLs
- optional article-template improvements if the current rendering still encourages low-quality structures
