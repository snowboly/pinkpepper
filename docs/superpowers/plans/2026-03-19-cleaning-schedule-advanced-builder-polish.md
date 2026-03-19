# Cleaning Schedule Advanced Builder Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the advanced document builder modal production-ready by adding shared validation and submit gating, while turning `cleaning_schedule` into the first guided heavy-document workflow with seeded starter rows.

**Architecture:** Keep the existing advanced modal structure and backend document route unchanged. Add shared validation/default helpers in the advanced-builder layer, use cleaning-schedule schema defaults as the seeded row source, and surface the results through the existing modal components.

**Tech Stack:** Next.js App Router, React, TypeScript, next-intl, Vitest, existing cleaning schedule schema defaults

---

## File Map

### Existing files to modify

- `src/components/dashboard/document-builders/advanced-doc-builder.ts`
  - Add validation helpers and seeded-answer helpers.
- `src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx`
  - Add submit gating and inline error messaging.
- `src/components/dashboard/document-builders/AdvancedDocumentBuilderField.tsx`
  - Add invalid-state rendering.
- `src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx`
  - Add empty-state guidance and row-level required-column checks.
- `src/components/dashboard/ChatWorkspace.tsx`
  - Use seeded advanced-builder answers on open and preserve error state cleanly.
- `src/__tests__/documents/advanced-doc-builder.test.tsx`
  - Add helper and rendering assertions for validation/default behavior.

### Existing files to read/reference

- `src/lib/documents/cleaning-schedule-schema.ts`
  - Use exported defaults as the only source of seeded cleaning-schedule row content.
- `src/components/dashboard/document-builders/document-builder-definitions.ts`
  - Use definition metadata for required-field logic.

## Chunk 1: Shared Validation Helpers

### Task 1: Add advanced-builder validation logic

**Files:**
- Modify: `src/components/dashboard/document-builders/advanced-doc-builder.ts`
- Test: `src/__tests__/documents/advanced-doc-builder.test.tsx`

- [ ] **Step 1: Write the failing test**

Add tests like:

```tsx
it("reports missing required scalar fields for advanced builders", () => {
  const result = getAdvancedBuilderValidation("cleaningSchedule", {
    businessName: "",
    approvedBy: "",
    reviewDate: "",
  });

  expect(result.isValid).toBe(false);
  expect(result.missingRequiredFields).toEqual([
    "businessName",
    "approvedBy",
    "reviewDate",
  ]);
});

it("accepts valid cleaning schedule metadata without requiring rows", () => {
  const result = getAdvancedBuilderValidation("cleaningSchedule", {
    businessName: "PinkPepper Kitchen",
    approvedBy: "Ops Manager",
    reviewDate: "2026-12-31",
  });

  expect(result.isValid).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.tsx`

Expected: FAIL because validation helpers do not exist.

- [ ] **Step 3: Write minimal implementation**

In `advanced-doc-builder.ts`, add:

- `getAdvancedBuilderValidation(builderKey, answers)`
- validation based on required non-row fields from the builder definition
- row validation only when rows exist and a required column is blank

Return a compact result object:

- `isValid`
- `missingRequiredFields`
- `rowErrors`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/advanced-doc-builder.ts src/__tests__/documents/advanced-doc-builder.test.tsx
git commit -m "feat: add advanced builder validation helpers"
```

## Chunk 2: Cleaning Schedule Seeded Answers

### Task 2: Seed cleaning schedule with default rows

**Files:**
- Modify: `src/components/dashboard/document-builders/advanced-doc-builder.ts`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Test: `src/__tests__/documents/advanced-doc-builder.test.tsx`

- [ ] **Step 1: Write the failing test**

Add tests like:

```tsx
it("seeds cleaning schedule with default row content", () => {
  const answers = getInitialAdvancedBuilderAnswers("cleaningSchedule");

  expect(Array.isArray(answers.chemicalReference)).toBe(true);
  expect((answers.chemicalReference as Array<Record<string, string>>).length).toBeGreaterThan(0);
  expect(Array.isArray(answers.dailyTasks)).toBe(true);
  expect(Array.isArray(answers.weeklyTasks)).toBe(true);
  expect(Array.isArray(answers.monthlyTasks)).toBe(true);
  expect(Array.isArray(answers.atpTargets)).toBe(true);
});

it("leaves non-cleaning-schedule row sections empty by default", () => {
  const answers = getInitialAdvancedBuilderAnswers("productDataSheet");

  expect(answers.nutritionRows).toBe("");
});
```

Adjust the second expectation to the real default shape you implement; the point is proving only cleaning schedule gets seeded rows in this phase.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.tsx`

Expected: FAIL because seeded advanced-builder answers do not exist.

- [ ] **Step 3: Write minimal implementation**

In `advanced-doc-builder.ts`:

- add `getInitialAdvancedBuilderAnswers(builderKey)`
- for `cleaningSchedule`, merge builder scalar defaults with the cleaning schedule schema defaults
- for all other heavy docs, return normal scalar defaults with empty row arrays

In `ChatWorkspace.tsx`:

- replace the current heavy-builder modal start answers with `getInitialAdvancedBuilderAnswers(...)`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/advanced-doc-builder.ts src/components/dashboard/ChatWorkspace.tsx src/__tests__/documents/advanced-doc-builder.test.tsx
git commit -m "feat: seed cleaning schedule advanced builder rows"
```

## Chunk 3: Modal and Row UX

### Task 3: Add inline validation and row empty-state guidance

**Files:**
- Modify: `src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx`
- Modify: `src/components/dashboard/document-builders/AdvancedDocumentBuilderField.tsx`
- Modify: `src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx`
- Test: `src/__tests__/documents/advanced-doc-builder.test.tsx`

- [ ] **Step 1: Write the failing test**

Add rendering assertions like:

```tsx
it("renders empty-state guidance for row sections without rows", () => {
  const definition = getAdvancedDocumentBuilder("productDataSheet");

  const html = renderToStaticMarkup(
    <AdvancedDocumentBuilderModal
      open
      definition={definition ?? null}
      answers={{
        businessName: "PinkPepper",
        productName: "Soup",
        productCode: "S1",
        category: "Ready meal",
        description: "Tomato soup",
        countryOfOrigin: "Portugal",
        ingredients: "Tomatoes",
        storageConditions: "Keep chilled",
        shelfLifeUnopened: "3 days",
      }}
      loading={false}
      error={null}
      onClose={() => {}}
      onChange={() => {}}
      onSubmit={() => {}}
    />,
  );

  expect(html).toContain("No rows added yet");
});

it("disables generate when required scalar fields are missing", () => {
  const definition = getAdvancedDocumentBuilder("cleaningSchedule");

  const html = renderToStaticMarkup(
    <AdvancedDocumentBuilderModal
      open
      definition={definition ?? null}
      answers={{}}
      loading={false}
      error={null}
      onClose={() => {}}
      onChange={() => {}}
      onSubmit={() => {}}
    />,
  );

  expect(html).toContain("disabled");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.tsx`

Expected: FAIL because the modal does not yet render these states.

- [ ] **Step 3: Write minimal implementation**

Implement:

- `AdvancedDocumentBuilderModal`
  - compute validation result via shared helper
  - disable generate button when invalid
- `AdvancedDocumentBuilderField`
  - support invalid border/message state via props
- `AdvancedDocumentBuilderRows`
  - show `No rows added yet`
  - show `Add your own rows or start from defaults` or equivalent
  - optionally flag blank required cells in existing rows

Keep the UI restrained and consistent with the current dashboard style.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx src/components/dashboard/document-builders/AdvancedDocumentBuilderField.tsx src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx src/__tests__/documents/advanced-doc-builder.test.tsx
git commit -m "feat: add validation and empty-state polish to advanced builder"
```

## Chunk 4: Workspace Integration Verification

### Task 4: Verify workspace wiring still works with seeded heavy docs

**Files:**
- Modify only if regressions appear
- Test: `src/__tests__/chatbot-surface.test.ts`
- Test: `src/__tests__/documents/advanced-doc-builder.test.tsx`

- [ ] **Step 1: Add any needed workspace regression assertions**

If the current surface tests do not already prove the advanced path sufficiently, add one focused assertion for:

- `cleaningSchedule` staying in the advanced group
- heavy docs still opening modal path instead of lightweight wizard

- [ ] **Step 2: Run focused tests**

Run:

```bash
npm test -- --run src/__tests__/documents/advanced-doc-builder.test.tsx src/__tests__/chatbot-surface.test.ts
```

Expected: PASS

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: PASS

- [ ] **Step 5: Commit final cleanup if needed**

```bash
git add <any final touched files>
git commit -m "test: verify cleaning schedule advanced builder polish"
```
