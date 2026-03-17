# Document Builder Question Blueprints Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace shallow prompt-led document wizards with document-specific structured builders that collect the fields each renderer actually needs.

**Architecture:** Keep the existing chat entry point in the workspace, but move document collection into explicit builder schemas and reusable UI steps. Implement shared metadata and row-builder primitives first, then migrate document types in the approved rollout order so each route, generator, and renderer consumes structured values instead of guessed prose.

**Tech Stack:** Next.js App Router, React, TypeScript, `zod`, existing document renderers in `src/lib/documents`, Vitest

---

## File Structure

**Existing files to modify**
- `src/components/dashboard/ChatWorkspace.tsx`
  - Current document wizard entry point and state holder.
- `src/components/dashboard/ChatMessages.tsx`
  - Workspace starter menu for document builders.
- `src/components/dashboard/types.ts`
  - Shared dashboard types if builder state or starter metadata needs expansion.
- `src/app/api/documents/generate/route.ts`
  - Main generation route; will need structured payload handling per document type.
- `src/lib/documents/types.ts`
  - Shared document type definitions.
- `src/lib/documents/temperature-log-generation.ts`
- `src/lib/documents/cleaning-schedule-generation.ts`
- `src/lib/documents/product-data-sheet-generation.ts`
- `src/lib/documents/training-record-generation.ts`
- `src/lib/documents/cleaning-sop-generation.ts`
- `src/lib/documents/sop-generation.ts`
  - Existing generation mappers that must stop depending on broad freeform answers.
- `src/lib/documents/temperature-log-schema.ts`
- `src/lib/documents/cleaning-schedule-schema.ts`
- `src/lib/documents/product-data-sheet-schema.ts`
- `src/lib/documents/training-record-schema.ts`
- `src/lib/documents/cleaning-sop-schema.ts`
- `src/lib/documents/sop-schema.ts`
  - Existing schemas to extend or replace with builder-specific structured input types.

**Existing tests to extend**
- `src/__tests__/chatbot-surface.test.ts`
- `src/__tests__/documents/temperature-log-schema.test.ts`
- `src/__tests__/documents/cleaning-schedule-schema.test.ts`
- `src/__tests__/documents/render-temperature-log-docx.test.ts`
- `src/__tests__/documents/render-cleaning-schedule-docx.test.ts`
- `src/__tests__/documents/render-product-data-sheet-docx.test.ts`
- `src/__tests__/documents/render-training-record-docx.test.ts`
- `src/__tests__/documents/render-cleaning-sop-docx.test.ts`
- `src/__tests__/documents/haccp-generate-route.test.ts`
  - Add new route and builder regressions alongside renderer/schema coverage.

**New files to create**
- `src/components/dashboard/document-builders/shared-document-metadata.ts`
  - Shared metadata field definitions and defaults.
- `src/components/dashboard/document-builders/shared-row-builder.ts`
  - Reusable row-builder configuration and helpers.
- `src/components/dashboard/document-builders/document-builder-types.ts`
  - Stable builder config types shared by UI and submission logic.
- `src/components/dashboard/document-builders/document-builder-definitions.ts`
  - Per-document builder definitions for approved blueprints.
- `src/components/dashboard/document-builders/document-builder-payload.ts`
  - Helpers to serialize reviewed builder state into API payloads.
- `src/__tests__/documents/document-builder-definitions.test.ts`
  - Coverage for shared builder metadata, presets, and required-field rules.
- `src/__tests__/documents/document-builder-payload.test.ts`
  - Coverage for payload serialization and conditional sections.

If the UI logic grows too large inside `ChatWorkspace.tsx`, split the builder step rendering into:
- `src/components/dashboard/document-builders/DocumentBuilderModal.tsx`
- `src/components/dashboard/document-builders/DocumentBuilderReview.tsx`

## Chunk 1: Shared Builder Infrastructure

### Task 1: Lock builder contract and shared metadata model

**Files:**
- Create: `src/components/dashboard/document-builders/document-builder-types.ts`
- Create: `src/components/dashboard/document-builders/shared-document-metadata.ts`
- Test: `src/__tests__/documents/document-builder-definitions.test.ts`

- [ ] **Step 1: Write the failing test**

Add coverage for:
- required metadata fields shared across builders
- optional fields like `createdBy` and `reviewDate`
- field typing for text, select, multiselect, and row-builder shapes

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/document-builder-definitions.test.ts`
Expected: FAIL because the shared builder modules do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement:
- shared builder field/type definitions
- shared metadata field factory
- explicit support for conditional fields and default values

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/document-builder-definitions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/document-builder-types.ts src/components/dashboard/document-builders/shared-document-metadata.ts src/__tests__/documents/document-builder-definitions.test.ts
git commit -m "feat: add shared document builder metadata model"
```

### Task 2: Add reusable row-builder config helpers

**Files:**
- Create: `src/components/dashboard/document-builders/shared-row-builder.ts`
- Test: `src/__tests__/documents/document-builder-definitions.test.ts`

- [ ] **Step 1: Write the failing test**

Add coverage for:
- row column definitions
- required cell validation flags
- default row presets
- add/remove row capability metadata

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/document-builder-definitions.test.ts`
Expected: FAIL because row-builder helpers are missing.

- [ ] **Step 3: Write minimal implementation**

Implement a row-builder config helper used by chemicals, ATP targets, qualifications, microbiology rows, and waste segregation rows.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/document-builder-definitions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/shared-row-builder.ts src/__tests__/documents/document-builder-definitions.test.ts
git commit -m "feat: add reusable document row builder config"
```

## Chunk 2: Builder Definitions and Workspace Wiring

### Task 3: Encode approved builder definitions

**Files:**
- Create: `src/components/dashboard/document-builders/document-builder-definitions.ts`
- Modify: `src/components/dashboard/ChatMessages.tsx`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Test: `src/__tests__/documents/document-builder-definitions.test.ts`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Write the failing tests**

Add coverage for:
- stable builder IDs for all approved document types
- approved temperature-log fridge preset defaulting to `0C to 4C`
- workspace starters only exposing supported builder IDs

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/__tests__/documents/document-builder-definitions.test.ts src/__tests__/chatbot-surface.test.ts`
Expected: FAIL because the document builders are still shallow prompt configs.

- [ ] **Step 3: Write minimal implementation**

Implement:
- document-specific builder configs for:
  - `temperature_log`
  - `cleaning_schedule`
  - `product_data_sheet`
  - `staff_training_record`
  - `cleaning_sop`
  - `traceability_procedure`
  - `pest_control_procedure`
  - `waste_management_procedure`
  - `food_safety_policy`
- stable mapping from starter suggestion key to builder definition
- removal of old broad question-count logic where the new builder applies

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/documents/document-builder-definitions.test.ts src/__tests__/chatbot-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/document-builder-definitions.ts src/components/dashboard/ChatMessages.tsx src/components/dashboard/ChatWorkspace.tsx src/__tests__/documents/document-builder-definitions.test.ts src/__tests__/chatbot-surface.test.ts
git commit -m "feat: add document-specific builder definitions"
```

### Task 4: Serialize reviewed builder data into route payloads

**Files:**
- Create: `src/components/dashboard/document-builders/document-builder-payload.ts`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Test: `src/__tests__/documents/document-builder-payload.test.ts`

- [ ] **Step 1: Write the failing test**

Add coverage for:
- metadata serialization
- row serialization
- omission of conditional sections like CCP or microbiology when disabled
- temperature-log fridge preset persistence

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/document-builder-payload.test.ts`
Expected: FAIL because payload serialization helpers do not exist.

- [ ] **Step 3: Write minimal implementation**

Implement payload conversion from reviewed builder state into structured API JSON, without changing the route contract for unsupported document types.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/document-builder-payload.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/document-builder-payload.ts src/components/dashboard/ChatWorkspace.tsx src/__tests__/documents/document-builder-payload.test.ts
git commit -m "feat: serialize structured document builder payloads"
```

## Chunk 3: Deterministic Builders First

### Task 5: Rebuild `temperature_log` as a deterministic builder

**Files:**
- Modify: `src/lib/documents/temperature-log-generation.ts`
- Modify: `src/lib/documents/temperature-log-schema.ts`
- Modify: `src/app/api/documents/generate/route.ts`
- Test: `src/__tests__/documents/temperature-log-schema.test.ts`
- Test: `src/__tests__/documents/render-temperature-log-docx.test.ts`

- [ ] **Step 1: Write the failing tests**

Add coverage for:
- required fields from the blueprint
- fridge preset forcing `0C to 4C`
- created-by and approved-by persistence
- checks-per-day and probe-count mapping

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/__tests__/documents/temperature-log-schema.test.ts src/__tests__/documents/render-temperature-log-docx.test.ts`
Expected: FAIL because the current mapper still only uses shallow answers.

- [ ] **Step 3: Write minimal implementation**

Replace prompt-dependent parsing with direct structured mapping from the new builder payload.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/documents/temperature-log-schema.test.ts src/__tests__/documents/render-temperature-log-docx.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/documents/temperature-log-generation.ts src/lib/documents/temperature-log-schema.ts src/app/api/documents/generate/route.ts src/__tests__/documents/temperature-log-schema.test.ts src/__tests__/documents/render-temperature-log-docx.test.ts
git commit -m "feat: rebuild temperature log builder"
```

### Task 6: Rebuild `cleaning_schedule` as a row-driven builder

**Files:**
- Modify: `src/lib/documents/cleaning-schedule-generation.ts`
- Modify: `src/lib/documents/cleaning-schedule-schema.ts`
- Modify: `src/app/api/documents/generate/route.ts`
- Test: `src/__tests__/documents/cleaning-schedule-schema.test.ts`
- Test: `src/__tests__/documents/render-cleaning-schedule-docx.test.ts`

- [ ] **Step 1: Write the failing tests**

Add coverage for:
- chemicals rows
- daily/weekly/monthly task rows
- ATP custom vs default behavior
- review date and approved-by persistence

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/__tests__/documents/cleaning-schedule-schema.test.ts src/__tests__/documents/render-cleaning-schedule-docx.test.ts`
Expected: FAIL because the current mapper still falls back to defaults instead of structured rows.

- [ ] **Step 3: Write minimal implementation**

Map the new builder rows directly into the schedule schema and keep defaults only when explicitly chosen.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/documents/cleaning-schedule-schema.test.ts src/__tests__/documents/render-cleaning-schedule-docx.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/documents/cleaning-schedule-generation.ts src/lib/documents/cleaning-schedule-schema.ts src/app/api/documents/generate/route.ts src/__tests__/documents/cleaning-schedule-schema.test.ts src/__tests__/documents/render-cleaning-schedule-docx.test.ts
git commit -m "feat: rebuild cleaning schedule builder"
```

## Chunk 4: Structured Product and Training Builders

### Task 7: Complete `product_data_sheet` structured inputs

**Files:**
- Modify: `src/lib/documents/product-data-sheet-generation.ts`
- Modify: `src/lib/documents/product-data-sheet-schema.ts`
- Modify: `src/app/api/documents/generate/route.ts`
- Test: `src/__tests__/documents/render-product-data-sheet-docx.test.ts`

- [ ] **Step 1: Write the failing test**

Add coverage for:
- approved-by persistence
- allergen split fields (`contains`, `may contain`, `free from`)
- optional nutrition rows
- optional microbiology rows

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/render-product-data-sheet-docx.test.ts`
Expected: FAIL because the current mapper leaves these sections blank or inferred.

- [ ] **Step 3: Write minimal implementation**

Directly map structured product inputs into the renderer schema and only leave sections blank when the user explicitly chooses that path.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/render-product-data-sheet-docx.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/documents/product-data-sheet-generation.ts src/lib/documents/product-data-sheet-schema.ts src/app/api/documents/generate/route.ts src/__tests__/documents/render-product-data-sheet-docx.test.ts
git commit -m "feat: complete product data sheet builder inputs"
```

### Task 8: Rebuild `staff_training_record`

**Files:**
- Modify: `src/lib/documents/training-record-generation.ts`
- Modify: `src/lib/documents/training-record-schema.ts`
- Modify: `src/app/api/documents/generate/route.ts`
- Test: `src/__tests__/documents/render-training-record-docx.test.ts`

- [ ] **Step 1: Write the failing test**

Add coverage for:
- employee metadata
- induction completion flow
- optional qualifications rows
- optional on-the-job training starter rows

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/render-training-record-docx.test.ts`
Expected: FAIL because current mapping still leaves most of the record blank.

- [ ] **Step 3: Write minimal implementation**

Map structured employee, induction, and optional row inputs into the record schema.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/render-training-record-docx.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/documents/training-record-generation.ts src/lib/documents/training-record-schema.ts src/app/api/documents/generate/route.ts src/__tests__/documents/render-training-record-docx.test.ts
git commit -m "feat: rebuild staff training record builder"
```

## Chunk 5: Procedure and Policy Builders

### Task 9: Rebuild `cleaning_sop`

**Files:**
- Modify: `src/lib/documents/cleaning-sop-generation.ts`
- Modify: `src/lib/documents/cleaning-sop-schema.ts`
- Modify: `src/app/api/documents/generate/route.ts`
- Test: `src/__tests__/documents/cleaning-sop-schema.test.ts`
- Test: `src/__tests__/documents/render-cleaning-sop-docx.test.ts`

- [ ] **Step 1: Write the failing tests**

Add coverage for:
- responsible/verification roles
- chemical rows
- chosen frequency set
- corrective action and record options

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/__tests__/documents/cleaning-sop-schema.test.ts src/__tests__/documents/render-cleaning-sop-docx.test.ts`
Expected: FAIL because the current builder is still too broad.

- [ ] **Step 3: Write minimal implementation**

Map structured cleaning SOP inputs into its dedicated schema and only use AI for optional prose sections.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/documents/cleaning-sop-schema.test.ts src/__tests__/documents/render-cleaning-sop-docx.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/documents/cleaning-sop-generation.ts src/lib/documents/cleaning-sop-schema.ts src/app/api/documents/generate/route.ts src/__tests__/documents/cleaning-sop-schema.test.ts src/__tests__/documents/render-cleaning-sop-docx.test.ts
git commit -m "feat: rebuild cleaning sop builder"
```

### Task 10: Split the procedure/policy family into document-specific builders

**Files:**
- Modify: `src/lib/documents/sop-generation.ts`
- Modify: `src/lib/documents/sop-schema.ts`
- Modify: `src/app/api/documents/generate/route.ts`
- Test: `src/__tests__/documents/sop-schema.test.ts`

- [ ] **Step 1: Write the failing tests**

Add per-document coverage for:
- `traceability_procedure`
- `pest_control_procedure`
- `waste_management_procedure`
- `food_safety_policy`

Test the fields unique to each blueprint, especially retention periods, contractor details, waste streams, policy commitments, and mock-recall options.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/__tests__/documents/sop-schema.test.ts`
Expected: FAIL because the current shared procedure mapper cannot satisfy document-specific fields.

- [ ] **Step 3: Write minimal implementation**

Refactor the shared SOP generation path so each of the four document types consumes its own structured builder payload and only shares common low-level renderer helpers where appropriate.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/documents/sop-schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/documents/sop-generation.ts src/lib/documents/sop-schema.ts src/app/api/documents/generate/route.ts src/__tests__/documents/sop-schema.test.ts
git commit -m "feat: split procedure and policy document builders"
```

## Chunk 6: Integration, Regression, and HACCP Follow-through

### Task 11: Integrate reviewed builder UX in `ChatWorkspace`

**Files:**
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Create: `src/components/dashboard/document-builders/DocumentBuilderModal.tsx`
- Create: `src/components/dashboard/document-builders/DocumentBuilderReview.tsx`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Write the failing test**

Add coverage for:
- metadata-first builder flow
- row add/remove review behavior
- conditional field appearance
- submit path sending structured payload rather than flat answer arrays

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/chatbot-surface.test.ts`
Expected: FAIL because the workspace still uses the old linear question flow.

- [ ] **Step 3: Write minimal implementation**

Implement the reviewed builder UX in the workspace and keep HACCP on its dedicated advanced path.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/chatbot-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ChatWorkspace.tsx src/components/dashboard/document-builders/DocumentBuilderModal.tsx src/components/dashboard/document-builders/DocumentBuilderReview.tsx src/__tests__/chatbot-surface.test.ts
git commit -m "feat: add reviewed structured document builder ui"
```

### Task 12: Final verification and docs sync

**Files:**
- Modify: `docs/superpowers/specs/2026-03-17-document-builder-question-blueprints-design.md` if implementation notes need tightening
- Test: all touched test files

- [ ] **Step 1: Run focused document builder suite**

Run:
`npm test -- --run src/__tests__/documents/document-builder-definitions.test.ts src/__tests__/documents/document-builder-payload.test.ts src/__tests__/documents/temperature-log-schema.test.ts src/__tests__/documents/cleaning-schedule-schema.test.ts src/__tests__/documents/render-temperature-log-docx.test.ts src/__tests__/documents/render-cleaning-schedule-docx.test.ts src/__tests__/documents/render-product-data-sheet-docx.test.ts src/__tests__/documents/render-training-record-docx.test.ts src/__tests__/documents/cleaning-sop-schema.test.ts src/__tests__/documents/render-cleaning-sop-docx.test.ts src/__tests__/documents/sop-schema.test.ts src/__tests__/chatbot-surface.test.ts`

Expected: PASS

- [ ] **Step 2: Run full verification**

Run:
- `npm test`
- `npm run lint`
- `npm run build`

Expected:
- all tests pass
- lint passes
- production build succeeds

- [ ] **Step 3: Commit final integration**

```bash
git add src docs
git commit -m "feat: rebuild structured document builders"
```

## Notes

- Keep `haccp_plan` on its existing dedicated advanced path. Do not regress the Pro-only HACCP builder while introducing the shared document-builder infrastructure.
- Preserve tier behavior already agreed elsewhere:
  - `Plus`: no generated documents
  - `Pro`: generated documents
  - chat conversation export remains available separately
- Prefer introducing new focused builder helper files over making `ChatWorkspace.tsx` larger.
- Defaults must remain explicit user choices. Do not silently inject ATP targets, microbiology rows, or qualifications unless the builder flow asked for them.

## Execution Order

1. Shared builder contract
2. Shared row-builder helpers
3. Builder definitions and starter wiring
4. Payload serialization
5. `temperature_log`
6. `cleaning_schedule`
7. `product_data_sheet`
8. `staff_training_record`
9. `cleaning_sop`
10. procedure/policy split
11. reviewed builder UX integration
12. full verification

Plan complete and saved to `docs/superpowers/plans/2026-03-17-document-builder-question-blueprints.md`. Ready to execute?
