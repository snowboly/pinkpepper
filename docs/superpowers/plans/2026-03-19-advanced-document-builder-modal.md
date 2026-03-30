# Advanced Document Builder Modal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a structured heavy-document builder modal to the workspace so row-heavy documents can be created from the existing `Create Document` menu without using the chat wizard.

**Architecture:** Keep one document entry point in the workspace, but split the behavior by complexity. Lightweight documents stay on the current conversational wizard, while heavy documents open a reusable modal that renders from shared builder definitions and submits existing `builderData` payloads to the current generation route.

**Tech Stack:** Next.js App Router, React, TypeScript, next-intl, Vitest, existing dashboard document-builder helpers

---

## File Map

### Existing files to modify

- `src/components/dashboard/ChatMessages.tsx`
  - Add advanced document starters back into the menu and visually separate quick vs advanced groups.
- `src/components/dashboard/ChatWorkspace.tsx`
  - Add modal state, launch heavy builders from starter clicks, store heavy-builder answers, and submit generation requests.
- `src/components/dashboard/document-builders/document-builder-definitions.ts`
  - Expose which builder keys are advanced vs lightweight in a single source of truth.
- `src/components/dashboard/document-builders/document-builder-payload.ts`
  - Reuse as the submit adapter for advanced builders.
- `src/__tests__/chatbot-surface.test.ts`
  - Extend workspace/menu assertions for advanced document availability and routing.

### New files to create

- `src/components/dashboard/document-builders/advanced-doc-builder.ts`
  - Shared advanced-builder helpers, including heavy-builder key lists and optional default row helpers.
- `src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx`
  - Main modal shell, section rendering, and generate/cancel controls.
- `src/components/dashboard/document-builders/AdvancedDocumentBuilderSection.tsx`
  - Render one definition section and dispatch field changes.
- `src/components/dashboard/document-builders/AdvancedDocumentBuilderField.tsx`
  - Render text/date/select fields from definition metadata.
- `src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx`
  - Render repeatable row tables with add/remove/update behavior.
- `src/__tests__/documents/advanced-doc-builder.test.ts`
  - Unit coverage for advanced-builder helper logic.

### Existing tests likely to touch

- `src/__tests__/documents/lightweight-doc-wizard.test.ts`
  - Keep lightweight behavior stable while adding advanced paths.
- `src/__tests__/documents/haccp-generate-route.test.ts`
  - Optional if route assertions need updates because of broader menu availability.

## Chunk 1: Shared Advanced Builder Wiring

### Task 1: Define heavy document starter metadata

**Files:**
- Create: `src/components/dashboard/document-builders/advanced-doc-builder.ts`
- Modify: `src/components/dashboard/document-builders/document-builder-definitions.ts`
- Test: `src/__tests__/documents/advanced-doc-builder.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  ADVANCED_DOCUMENT_BUILDER_KEYS,
  getAdvancedDocumentBuilder,
  isAdvancedDocumentBuilderKey,
} from "@/components/dashboard/document-builders/advanced-doc-builder";

describe("advanced document builder helpers", () => {
  it("marks heavy builders as advanced", () => {
    expect(ADVANCED_DOCUMENT_BUILDER_KEYS).toEqual([
      "cleaningSchedule",
      "productDataSheet",
      "staffTrainingRecord",
      "cleaningSop",
    ]);
    expect(isAdvancedDocumentBuilderKey("cleaningSchedule")).toBe(true);
    expect(isAdvancedDocumentBuilderKey("tempLog")).toBe(false);
  });

  it("returns builder definitions for advanced documents", () => {
    const definition = getAdvancedDocumentBuilder("productDataSheet");

    expect(definition?.documentType).toBe("product_data_sheet");
    expect(definition?.sections.some((section) =>
      section.fields.some((field) => field.type === "rows"),
    )).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: FAIL because `advanced-doc-builder.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `advanced-doc-builder.ts` with:

- `ADVANCED_DOCUMENT_BUILDER_KEYS`
- `isAdvancedDocumentBuilderKey(key: string)`
- `getAdvancedDocumentBuilder(key: string)` delegating to `getDocumentBuilderDefinition`

Keep it small and definition-driven. Do not duplicate the actual builder config.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/advanced-doc-builder.ts src/__tests__/documents/advanced-doc-builder.test.ts
git commit -m "test: add advanced document builder helpers"
```

## Chunk 2: Modal UI Foundation

### Task 2: Add the reusable advanced builder modal shell

**Files:**
- Create: `src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx`
- Create: `src/components/dashboard/document-builders/AdvancedDocumentBuilderSection.tsx`
- Create: `src/components/dashboard/document-builders/AdvancedDocumentBuilderField.tsx`
- Create: `src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx`
- Modify: `src/components/dashboard/document-builders/advanced-doc-builder.ts`
- Test: `src/__tests__/documents/advanced-doc-builder.test.ts`

- [ ] **Step 1: Write the failing test**

Add cases like:

```ts
import { render, screen } from "@testing-library/react";
import AdvancedDocumentBuilderModal from "@/components/dashboard/document-builders/AdvancedDocumentBuilderModal";
import { getAdvancedDocumentBuilder } from "@/components/dashboard/document-builders/advanced-doc-builder";

test("renders advanced builder sections and row controls", () => {
  const definition = getAdvancedDocumentBuilder("cleaningSchedule")!;

  render(
    <AdvancedDocumentBuilderModal
      open
      definition={definition}
      answers={{}}
      loading={false}
      error={null}
      onClose={() => {}}
      onChange={() => {}}
      onSubmit={() => {}}
    />,
  );

  expect(screen.getByText("Cleaning schedule")).toBeInTheDocument();
  expect(screen.getByText("Document metadata")).toBeInTheDocument();
  expect(screen.getByText("Chemical reference")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /add row/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: FAIL because the modal components do not exist.

- [ ] **Step 3: Write minimal implementation**

Implement:

- a modal shell with `open`, `definition`, `answers`, `loading`, `error`, `onClose`, `onChange`, `onSubmit`
- section renderer looping through `definition.sections`
- field renderer for `text`, `date`, `select`
- row renderer for `rows` with:
  - header labels from row config
  - one blank row add action
  - remove row action
  - inline cell updates

Keep styling aligned with existing dashboard shell; no redesign.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx src/components/dashboard/document-builders/AdvancedDocumentBuilderSection.tsx src/components/dashboard/document-builders/AdvancedDocumentBuilderField.tsx src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx src/components/dashboard/document-builders/advanced-doc-builder.ts src/__tests__/documents/advanced-doc-builder.test.ts
git commit -m "feat: add advanced document builder modal shell"
```

## Chunk 3: Workspace Integration

### Task 3: Launch heavy documents from the existing Create Document menu

**Files:**
- Modify: `src/components/dashboard/ChatMessages.tsx`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/components/dashboard/document-builders/advanced-doc-builder.ts`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Write the failing test**

Extend `chatbot-surface.test.ts` with assertions like:

```ts
it("keeps one create document menu but exposes advanced documents separately", () => {
  const messages = readWorkspaceFile("src/components/dashboard/ChatMessages.tsx");

  expect(messages).toContain("Quick documents");
  expect(messages).toContain("Advanced documents");
  expect(messages).toContain('{ key: "cleaningSchedule" }');
  expect(messages).toContain('{ key: "productDataSheet" }');
});

it("routes advanced document starters into the modal path instead of the chat wizard", () => {
  const workspace = readWorkspaceFile("src/components/dashboard/ChatWorkspace.tsx");

  expect(workspace).toContain("isAdvancedDocumentBuilderKey");
  expect(workspace).toContain("setActiveAdvancedBuilder");
  expect(workspace).not.toContain('startDocumentWizard(suggestion);\\n                return;\\n              }\\n              if (workspaceMode === "virtual_audit")');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/chatbot-surface.test.ts`

Expected: FAIL because heavy docs are still absent from the menu and there is no modal state in the workspace.

- [ ] **Step 3: Write minimal implementation**

In `ChatMessages.tsx`:

- add advanced document items to the dropdown
- visually separate quick vs advanced groups
- add a small hint text like `Structured builder` for advanced items

In `ChatWorkspace.tsx`:

- add advanced-builder state:
  - active builder definition/key
  - answers
  - loading
  - error
- route starter clicks:
  - lightweight -> current wizard
  - advanced -> open modal
- render `AdvancedDocumentBuilderModal`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/chatbot-surface.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ChatMessages.tsx src/components/dashboard/ChatWorkspace.tsx src/components/dashboard/document-builders/advanced-doc-builder.ts src/__tests__/chatbot-surface.test.ts
git commit -m "feat: route heavy documents through advanced builder modal"
```

## Chunk 4: Submission Flow

### Task 4: Submit advanced builder data through the existing generation route

**Files:**
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/components/dashboard/document-builders/document-builder-payload.ts`
- Test: `src/__tests__/documents/advanced-doc-builder.test.ts`

- [ ] **Step 1: Write the failing test**

Add a payload-focused test like:

```ts
import { buildDocumentGenerationPayload } from "@/components/dashboard/document-builders/document-builder-payload";

test("builds payloads for advanced builders with row data", () => {
  const payload = buildDocumentGenerationPayload("cleaningSchedule", {
    businessName: "PinkPepper Kitchen",
    chemicalReference: [
      {
        chemicalName: "Sanitiser",
        product: "S1",
        dilution: "1:10",
        contactTime: "5 min",
        activeIngredient: "QAC",
        coshhLocation: "Folder A",
      },
    ],
  });

  expect(payload.builderData).toEqual({
    businessName: "PinkPepper Kitchen",
    chemicalReference: [
      {
        chemicalName: "Sanitiser",
        product: "S1",
        dilution: "1:10",
        contactTime: "5 min",
        activeIngredient: "QAC",
        coshhLocation: "Folder A",
      },
    ],
  });
});
```

Also add a modal-submit behavior test if practical.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: FAIL if modal state or payload submission is incomplete.

- [ ] **Step 3: Write minimal implementation**

In `ChatWorkspace.tsx`:

- add `handleAdvancedBuilderSubmit`
- use `buildDocumentGenerationPayload(builderKey, answers)`
- post to `/api/documents/generate`
- preserve modal answers on failure
- close modal on success
- append assistant/user messages consistent with current document-generation flow

Do not create a new route.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ChatWorkspace.tsx src/components/dashboard/document-builders/document-builder-payload.ts src/__tests__/documents/advanced-doc-builder.test.ts
git commit -m "feat: submit advanced builder documents from workspace"
```

## Chunk 5: Cleaning Schedule End-to-End First-Class Path

### Task 5: Make cleaning schedule the first polished heavy workflow

**Files:**
- Modify: `src/components/dashboard/document-builders/advanced-doc-builder.ts`
- Modify: `src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx`
- Modify: `src/components/dashboard/document-builders/document-builder-definitions.ts`
- Test: `src/__tests__/documents/advanced-doc-builder.test.ts`

- [ ] **Step 1: Write the failing test**

Add a targeted test for starter-row behavior:

```ts
test("creates empty cleaning schedule row objects from definition columns", () => {
  const row = createEmptyAdvancedBuilderRow("chemicalReference");

  expect(row).toEqual({
    chemicalName: "",
    product: "",
    dilution: "",
    contactTime: "",
    activeIngredient: "",
    coshhLocation: "",
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: FAIL because empty-row creation helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add helper(s) to:

- create empty row objects from row-column definitions
- ensure cleaning schedule rows can be added without hardcoding each cell in the modal

Keep the implementation generic enough for later docs.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/advanced-doc-builder.ts src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx src/__tests__/documents/advanced-doc-builder.test.ts
git commit -m "feat: support cleaning schedule row editing in advanced builder"
```

## Chunk 6: Product Data Sheet and Training Record Support

### Task 6: Ensure additional heavy documents work through the same modal

**Files:**
- Modify: `src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx`
- Modify: `src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx`
- Test: `src/__tests__/documents/advanced-doc-builder.test.ts`
- Test: `src/__tests__/chatbot-surface.test.ts`

- [ ] **Step 1: Write the failing test**

Add cases asserting:

- `productDataSheet` renders nutrition and microbiology row sections
- `staffTrainingRecord` renders qualification and training row sections

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts src/__tests__/chatbot-surface.test.ts`

Expected: FAIL if section rendering or menu grouping is incomplete.

- [ ] **Step 3: Write minimal implementation**

Make the modal fully definition-driven so these docs work without bespoke component branches.

Only add document-specific UI if the definition-driven approach proves insufficient.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts src/__tests__/chatbot-surface.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/document-builders/AdvancedDocumentBuilderModal.tsx src/components/dashboard/document-builders/AdvancedDocumentBuilderRows.tsx src/__tests__/documents/advanced-doc-builder.test.ts src/__tests__/chatbot-surface.test.ts
git commit -m "feat: extend advanced builder to product and training docs"
```

## Chunk 7: Verification and Cleanup

### Task 7: Final verification

**Files:**
- Modify only if verification reveals regressions

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm test -- --run src/__tests__/documents/advanced-doc-builder.test.ts src/__tests__/documents/lightweight-doc-wizard.test.ts src/__tests__/chatbot-surface.test.ts
```

Expected: PASS

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS

- [ ] **Step 4: Commit final cleanup if needed**

```bash
git add <any final touched files>
git commit -m "test: verify advanced document builder modal"
```
