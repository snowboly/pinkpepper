# Article Cluster Triage - 2026-04-05

## Scope
Reviewed the HACCP content cluster for the SEO cleanup batch and classified each target as `keep`, `rewrite`, or `merge candidate`.

In scope:
- `src/app/articles/page.tsx`
- `src/app/about/page.tsx`
- `content/articles/building-a-haccp-process-flow-diagram.md`
- `content/articles/cooling-and-reheating-haccp-high-risk-steps.md`
- `content/articles/correcting-non-conformities-in-haccp.md`
- `content/articles/failed-haccp-inspection-consequences-uk.md`
- `content/articles/haccp-ccp-examples-uk-eu.md`
- `content/articles/haccp-checklist-for-new-food-businesses.md`
- `content/articles/haccp-for-artisanal-bakeries-eu.md`
- `content/articles/haccp-for-burger-vans-eu.md`

## Classification

| File | Decision | Rationale |
| --- | --- | --- |
| `content/articles/building-a-haccp-process-flow-diagram.md` | `rewrite` | Core topic is useful, but the page is long, repetitive, and structurally messy. It needs a tighter outline and cleaner examples rather than pruning. |
| `content/articles/cooling-and-reheating-haccp-high-risk-steps.md` | `merge candidate` | Narrow topic that overlaps heavily with `content/articles/temperature-control-in-haccp-limits-and-monitoring.md`. Best treated as a section inside a broader temperature-control article, not as a standalone page. |
| `content/articles/correcting-non-conformities-in-haccp.md` | `merge candidate` | Thin, generic corrective-action content that overlaps with inspection failures and audit non-conformities. Best held for later consolidation once a dedicated corrective-action page exists. |
| `content/articles/failed-haccp-inspection-consequences-uk.md` | `rewrite` | High-risk rewrite. The current copy mixes consequences, notices, and remediation with misleading process/legal claims, so it needs factual tightening before it can stay standalone. |
| `content/articles/haccp-ccp-examples-uk-eu.md` | `merge candidate` | Useful theme, but it repeats concepts already covered in `content/articles/how-to-create-a-haccp-plan-step-by-step.md`. Any temperature examples worth preserving can later be folded into the temperature-control article separately. |
| `content/articles/haccp-checklist-for-new-food-businesses.md` | `keep` | Clear launch intent, practical structure, and distinct utility for new operators. This is one of the cleaner pages in the set. |
| `content/articles/haccp-for-artisanal-bakeries-eu.md` | `rewrite` | Strong long-tail vertical, but the page needs factual cleanup, less noise, and a more disciplined structure before it is safe to keep as-is. |
| `content/articles/haccp-for-burger-vans-eu.md` | `rewrite` | Also a strong vertical page, but it is repetitive and needs accuracy cleanup plus better scoping. Better to rewrite than merge away. |
| `src/app/articles/page.tsx` | `keep` | Keep as the article index, but it should stay highly index-worthy because it is the primary hub for the cluster. |
| `src/app/about/page.tsx` | `keep` | Keep, but position it as a strong brand/trust page that supports the content ecosystem rather than a generic company page. |

## Completed In This Pass

- Strengthened `src/app/articles/page.tsx` with clearer hub positioning, stronger internal-link context, and more explicit framing around HACCP, allergens, audits, and operational compliance.
- Strengthened `src/app/about/page.tsx` so it reads as a useful trust and authority page rather than generic brand filler, and removed the remaining encoding junk from the source.
- Rewrote `building-a-haccp-process-flow-diagram` as a clean foundational explainer with a tighter outline, practical process-flow guidance, and no migrated HTML fragments.
- Rewrote `failed-haccp-inspection-consequences-uk` as a UK-specific enforcement and remediation guide with more careful consequence framing and a clearer recovery sequence for operators.
- Kept `haccp-checklist-for-new-food-businesses` live without expanding it in this round because it still serves a distinct checklist intent.
- Rewrote `haccp-for-artisanal-bakeries-eu` and `haccp-for-burger-vans-eu` around operator-specific hazards, controls, and records instead of generic HACCP filler.
- Reweighted `src/components/homepage/RandomArticleLinks.tsx` toward the cleaned evergreen pages and away from the tracked merge-candidate URLs.
- Rewrote `cooling-and-reheating-haccp-high-risk-steps`, `correcting-non-conformities-in-haccp`, and `haccp-ccp-examples-uk-eu` as narrower support pages that stay live for now while pointing readers toward the stronger parent articles in the cluster.

## Round Two Merge Candidates

- `cooling-and-reheating-haccp-high-risk-steps.md` can stay live as a focused support page for now, but remains a candidate for later consolidation into `content/articles/temperature-control-in-haccp-limits-and-monitoring.md` once redirect mapping is ready.
- `correcting-non-conformities-in-haccp.md` can stay live as a corrective-action explainer for now, but remains a candidate for later consolidation if a stronger corrective-action or CAPA pillar page is added.
- `haccp-ccp-examples-uk-eu.md` can stay live as a support page for now, but remains a candidate for later consolidation into `content/articles/how-to-create-a-haccp-plan-step-by-step.md` once redirect mapping is ready.
