# Plan: Expand Template Pages (Mimicking FoodDocs)

## Context

FoodDocs has 200+ free template pages at `/food-safety-templates/*` covering plans, checklists, logs, posters, and more. PinkPepper currently has **7 template pages** under `/resources/*`. We also have **12 knowledge-base markdown files** in `knowledge-docs/templates/` — several of which don't have corresponding web pages yet.

### Current PinkPepper Templates (7 pages)
1. HACCP plan template
2. Allergen matrix template
3. Food safety audit checklist
4. Cleaning and disinfection SOP
5. Temperature monitoring log template
6. Supplier approval questionnaire
7. EU/UK food safety document checklist

### Knowledge-Base Files WITHOUT Web Pages (5 gaps)
- `food-safety-policy-template.md`
- `personal-hygiene-policy-template.md`
- `pest-control-procedure-template.md`
- `traceability-procedure-template.md`
- `training-record-template.md`
- `waste-management-procedure-template.md`
- `cleaning-schedule-template.md` (we have the SOP page, but not a schedule-specific page)

---

## Proposed New Template Pages

### Priority 1 — Pages backed by existing knowledge-docs (quick wins)
These already have content in `knowledge-docs/templates/` that can inform the page copy:

| # | Slug | Title | Knowledge Doc |
|---|------|-------|---------------|
| 1 | `/resources/food-safety-policy-template` | Food safety policy template | `food-safety-policy-template.md` |
| 2 | `/resources/personal-hygiene-policy-template` | Personal hygiene policy template | `personal-hygiene-policy-template.md` |
| 3 | `/resources/pest-control-procedure-template` | Pest control procedure template | `pest-control-procedure-template.md` |
| 4 | `/resources/traceability-procedure-template` | Traceability procedure template | `traceability-procedure-template.md` |
| 5 | `/resources/training-record-template` | Training record template | `training-record-template.md` |
| 6 | `/resources/waste-management-procedure-template` | Waste management procedure template | `waste-management-procedure-template.md` |
| 7 | `/resources/cleaning-schedule-template` | Cleaning schedule template | `cleaning-schedule-template.md` |

### Priority 2 — New pages inspired by FoodDocs (no existing knowledge-doc)
High-value templates FoodDocs offers that PinkPepper should have, especially for EU/UK focus:

| # | Slug | Title | FoodDocs Equivalent |
|---|------|-------|---------------------|
| 8 | `/resources/food-safety-plan-template` | Food safety plan template | `/food-safety-templates/food-safety-plan` |
| 9 | `/resources/opening-closing-checklist-template` | Opening & closing checklist | `/food-safety-templates/opening-and-closing-checklist-template` |
| 10 | `/resources/food-storage-chart` | Proper food storage chart | `/food-safety-templates/proper-food-storage-chart` |
| 11 | `/resources/eho-inspection-checklist` | EHO inspection checklist | `/food-safety-templates/eho-checklist` (UK-specific — great for PinkPepper's EU/UK focus) |
| 12 | `/resources/deep-cleaning-checklist` | Deep cleaning checklist | `/food-safety-templates/restaurant-deep-cleaning-checklist` |
| 13 | `/resources/food-flow-chart-template` | Food flow chart (HACCP) | `/food-safety-templates/food-flow-chart` |

---

## Implementation Steps

### Step 1 — Create Priority 1 pages (7 pages)
For each page:
1. Read the corresponding `knowledge-docs/templates/*.md` file to extract content structure
2. Create `src/app/resources/<slug>/page.tsx` using the existing `ResourceTemplate` component
3. Add the page to the `resources` array in `src/app/resources/page.tsx`

### Step 2 — Create Priority 2 pages (6 pages)
For each page:
1. Write original content focused on EU/UK food safety regulations
2. Create `src/app/resources/<slug>/page.tsx` using `ResourceTemplate`
3. Add to the resources listing

### Step 3 — Update the resources listing page
- Organize the now-larger list into **categories** (Plans & Policies, Checklists, Logs & Monitoring, SOPs & Procedures) instead of a flat grid
- Update page metadata/SEO copy to reflect the expanded library

### Step 4 — Update cross-links
- Update `relatedLinks` on each template page to cross-reference the new pages
- Ensure the footer Resources link still works correctly

### Step 5 — Verify
- Run `npm run build` to check all pages compile
- Run `npm run lint` and `tsc --noEmit`

---

## Total result: 20 template pages (7 existing + 13 new)

This brings PinkPepper much closer to FoodDocs' breadth while keeping the EU/UK compliance focus that differentiates PinkPepper.
