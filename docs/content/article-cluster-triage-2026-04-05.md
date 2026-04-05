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

## Current Pass Actions

- Strengthen `src/app/articles/page.tsx` with clearer hub positioning, stronger internal-link context, and more explicit framing around HACCP, allergens, audits, and operational compliance.
- Strengthen `src/app/about/page.tsx` so it reads as a useful trust/authority page rather than generic brand filler.
- Rewrite `building-a-haccp-process-flow-diagram` as a clean foundational explainer with a tighter outline, practical process-flow examples, and no migrated HTML/junk.
- Rewrite `failed-haccp-inspection-consequences-uk` as a UK-specific enforcement and remediation guide with legally cautious wording, clearer notice distinctions, and a practical recovery sequence for operators.
- Keep `haccp-checklist-for-new-food-businesses` live with only light cleanup if needed; do not expand it unnecessarily.
- Rewrite `haccp-for-artisanal-bakeries-eu` and `haccp-for-burger-vans-eu` using the same structure: operator context, hazards specific to the business model, critical controls, records staff should keep, what inspectors or auditors check first, and a short action plan. Strip out generic HACCP filler that could apply to any sector.

## Later Consolidation Actions

- Do nothing to `cooling-and-reheating-haccp-high-risk-steps.md` in this pass beyond preserving it as a tracked merge candidate. In a later consolidation round, move the strongest cooling/reheating material into `content/articles/temperature-control-in-haccp-limits-and-monitoring.md`, then keep the source URL in place until redirect mapping is ready.
- Do nothing to `correcting-non-conformities-in-haccp.md` in this pass beyond preserving it as a hold-for-later merge candidate. Revisit it only when a dedicated corrective-action page is added to the cluster, then keep the source URL in place until redirect mapping is ready.
- Do nothing to `haccp-ccp-examples-uk-eu.md` in this pass beyond preserving it as a tracked merge candidate. In a later consolidation round, move the strongest CCP examples into `content/articles/how-to-create-a-haccp-plan-step-by-step.md`, then keep the source URL in place until redirect mapping is ready.
