# HACCP Template Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current prompt-only HACCP generation flow with a Pro-only structured HACCP workflow that exports consistent landscape DOCX/PDF documents in the approved company format.

**Architecture:** Add a dedicated HACCP data model and renderer path instead of treating HACCP like the other freeform document types. Keep the existing generic document generation path for other categories, but route `haccp_plan` through structured metadata collection, HACCP-specific content shaping, and deterministic DOCX/PDF rendering with conditional CCP output.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, `docx`, `pdf-lib`, existing billing/tier access utilities

---

## File Map

### Existing files to modify

- `src/components/dashboard/ChatWorkspace.tsx`
  - Replace the current generic HACCP wizard shape with a structured HACCP-specific flow.
- `src/components/dashboard/types.ts`
  - Extend document-related types if the wizard state or artifact payload needs stronger HACCP typing.
- `src/i18n/messages/en.json`
  - Replace current HACCP wizard copy with structured metadata/process/hazard prompts and Pro-only wording.
- `src/lib/documents/types.ts`
  - Add dedicated HACCP schema types alongside the existing `DocumentType` union.
- `src/lib/documents/generate-prompt.ts`
  - Remove HACCP from the generic prompt-only path or reduce it to helper prompts for hazard drafting only.
- `src/lib/documents/render-docx.ts`
  - Add deterministic HACCP DOCX rendering with landscape layout, header/footer, table styling, and conditional CCP section.
- `src/lib/documents/render-pdf.ts`
  - Add matching HACCP PDF rendering using the same structured data and styling rules.
- `src/app/api/documents/generate/route.ts`
  - Route `haccp_plan` through the new structured path, enforce Pro access, and preserve generic generation for other document types.
- `src/lib/tier.ts`
  - Verify capabilities and add any HACCP-specific export gating flags if the existing tier shape is too generic.
- `src/app/pricing/page.tsx`
  - Reflect that advanced HACCP generation with DOCX/PDF export is a Pro capability.

### New files to create

- `src/lib/documents/haccp-schema.ts`
  - Source of truth for HACCP metadata, steps, hazards, and CCP row shapes.
- `src/lib/documents/haccp-wizard.ts`
  - Converts wizard answers to/from structured HACCP data and owns field ordering for the chat wizard.
- `src/lib/documents/haccp-generation.ts`
  - Builds constrained AI prompts for hazard/control drafting and normalizes output into the HACCP schema.
- `src/lib/documents/render-haccp-docx.ts`
  - Focused DOCX section builders for HACCP document layout.
- `src/lib/documents/render-haccp-pdf.ts`
  - Focused PDF section builders for HACCP document layout.
- `src/__tests__/documents/haccp-schema.test.ts`
  - Unit tests for HACCP parsing/normalization/conditional CCP rules.
- `src/__tests__/documents/render-haccp-docx.test.ts`
  - Regression tests for HACCP DOCX structure and formatting markers.
- `src/__tests__/documents/render-haccp-pdf.test.ts`
  - Regression tests for HACCP PDF generation.
- `src/__tests__/documents/haccp-generate-route.test.ts`
  - API coverage for Pro-only access and HACCP generation behavior.
- `src/__tests__/chatbot-haccp-wizard.test.ts`
  - UI/state coverage for the reworked HACCP wizard flow.

## Chunk 1: Define the HACCP Data Model

### Task 1: Add failing schema tests

**Files:**
- Create: `src/__tests__/documents/haccp-schema.test.ts`
- Create: `src/lib/documents/haccp-schema.ts`

- [ ] **Step 1: Write the failing test**

```ts
import {
  normalizeHazardType,
  shouldRenderCcpSection,
  type HaccpDocumentData,
} from "@/lib/documents/haccp-schema";

describe("normalizeHazardType", () => {
  it("accepts only the four approved hazard types", () => {
    expect(normalizeHazardType("biological")).toBe("Biological");
    expect(normalizeHazardType("Chemical")).toBe("Chemical");
    expect(normalizeHazardType("physical")).toBe("Physical");
    expect(normalizeHazardType("allergen")).toBe("Allergen");
  });

  it("rejects unsupported hazard types", () => {
    expect(() => normalizeHazardType("micro")).toThrow("Unsupported hazard type");
  });
});

describe("shouldRenderCcpSection", () => {
  it("returns true when at least one hazard row is marked as CCP", () => {
    const data = {
      hazards: [{ isCcp: "Yes" }],
    } as HaccpDocumentData;

    expect(shouldRenderCcpSection(data)).toBe(true);
  });

  it("returns false when no hazard row is marked as CCP", () => {
    const data = {
      hazards: [{ isCcp: "No" }],
    } as HaccpDocumentData;

    expect(shouldRenderCcpSection(data)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/documents/haccp-schema.test.ts`

Expected: FAIL because `haccp-schema.ts` and exported helpers do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export type HaccpHazardType = "Biological" | "Chemical" | "Physical" | "Allergen";
export type YesNo = "Yes" | "No";

export type HaccpMetadata = {
  companyName: string;
  logoUrl?: string | null;
  version: string;
  date: string;
  createdBy: string;
  approvedBy: string;
};

export type HaccpProcessStep = {
  stepNo: number;
  stepName: string;
  fullStepDescription: string;
};

export type HaccpHazardRow = {
  stepNo: number;
  stepName: string;
  hazardType: HaccpHazardType;
  hazardDescription: string;
  controlMeasure: string;
  isCcp: YesNo;
};

export type HaccpCcpRow = {
  ccpNo: number;
  stepName: string;
  hazard: string;
  criticalLimit: string;
  monitoring: string;
  correctiveAction: string;
};

export type HaccpDocumentData = {
  metadata: HaccpMetadata;
  processFlow: string[];
  steps: HaccpProcessStep[];
  hazards: HaccpHazardRow[];
  ccps: HaccpCcpRow[];
};

const HAZARD_TYPES: HaccpHazardType[] = ["Biological", "Chemical", "Physical", "Allergen"];

export function normalizeHazardType(input: string): HaccpHazardType {
  const normalized = input.trim().toLowerCase();
  const match = HAZARD_TYPES.find((value) => value.toLowerCase() === normalized);
  if (!match) throw new Error("Unsupported hazard type");
  return match;
}

export function shouldRenderCcpSection(data: Pick<HaccpDocumentData, "hazards">): boolean {
  return data.hazards.some((hazard) => hazard.isCcp === "Yes");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/documents/haccp-schema.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/documents/haccp-schema.ts src/__tests__/documents/haccp-schema.test.ts
git commit -m "feat: add structured haccp document schema"
```

## Chunk 2: Rework the HACCP Wizard

### Task 2: Add failing wizard-state coverage

**Files:**
- Create: `src/__tests__/chatbot-haccp-wizard.test.ts`
- Create: `src/lib/documents/haccp-wizard.ts`
- Modify: `src/components/dashboard/ChatWorkspace.tsx`
- Modify: `src/i18n/messages/en.json`

- [ ] **Step 1: Write the failing test**

```ts
import { buildHaccpWizardDefinition } from "@/lib/documents/haccp-wizard";

describe("buildHaccpWizardDefinition", () => {
  it("starts with editable document metadata questions", () => {
    const wizard = buildHaccpWizardDefinition();
    expect(wizard.questions[0].key).toBe("companyName");
    expect(wizard.questions[1].key).toBe("version");
    expect(wizard.questions[2].key).toBe("date");
  });

  it("collects process steps before hazard rows", () => {
    const wizard = buildHaccpWizardDefinition();
    const keys = wizard.questions.map((question) => question.key);
    expect(keys.indexOf("processSteps")).toBeLessThan(keys.indexOf("hazards"));
  });

  it("collects CCP details only conditionally", () => {
    const wizard = buildHaccpWizardDefinition();
    expect(wizard.conditionalSections).toContain("ccpDetails");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/chatbot-haccp-wizard.test.ts`

Expected: FAIL because the HACCP wizard helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
type HaccpWizardQuestion = {
  key: string;
  prompt: string;
};

export function buildHaccpWizardDefinition() {
  return {
    questions: [
      { key: "companyName", prompt: "Company name" },
      { key: "version", prompt: "Version" },
      { key: "date", prompt: "Date" },
      { key: "createdBy", prompt: "Created by" },
      { key: "approvedBy", prompt: "Approved by" },
      { key: "processSteps", prompt: "List the process steps in order" },
      { key: "hazards", prompt: "List hazards for each step" },
    ] satisfies HaccpWizardQuestion[],
    conditionalSections: ["ccpDetails"],
  };
}
```

Then wire `ChatWorkspace.tsx` to:
- use the helper for `haccp_plan`
- stop relying on the current 6-question generic HACCP wizard
- keep other document types on the existing wizard path

Update `src/i18n/messages/en.json` so the HACCP prompts reflect:
- metadata
- process flow
- process steps
- hazards
- conditional CCP details

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/chatbot-haccp-wizard.test.ts`

Expected: PASS

- [ ] **Step 5: Run focused workspace regression**

Run: `npx vitest run src/__tests__/chatbot-surface.test.ts src/__tests__/chatbot-haccp-wizard.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/documents/haccp-wizard.ts src/components/dashboard/ChatWorkspace.tsx src/i18n/messages/en.json src/__tests__/chatbot-haccp-wizard.test.ts
git commit -m "feat: replace haccp wizard with structured metadata and hazard flow"
```

## Chunk 3: Add HACCP-Specific Generation Logic

### Task 3: Add failing generation-path tests

**Files:**
- Create: `src/lib/documents/haccp-generation.ts`
- Modify: `src/lib/documents/generate-prompt.ts`
- Modify: `src/app/api/documents/generate/route.ts`
- Create: `src/__tests__/documents/haccp-generate-route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { POST } from "@/app/api/documents/generate/route";

describe("HACCP document generation route", () => {
  it("rejects HACCP generation for Plus users", async () => {
    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "haccp_plan",
          format: "docx",
          answers: [],
        }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("uses the structured HACCP path for Pro users", async () => {
    // mock authenticated Pro user + model call
    // assert the route calls the HACCP-specific builder instead of the generic prompt builder
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/documents/haccp-generate-route.test.ts`

Expected: FAIL because the route still allows `haccp_plan` through the generic document-generation path.

- [ ] **Step 3: Write minimal implementation**

Add `src/lib/documents/haccp-generation.ts` with helpers like:

```ts
import type { HaccpDocumentData } from "@/lib/documents/haccp-schema";

export function buildHaccpModelPrompt(data: HaccpDocumentData): string {
  return [
    "Return only structured HACCP enrichment for the supplied process steps and hazards.",
    "Do not add new sections.",
    "Keep hazard types limited to Biological, Chemical, Physical, Allergen.",
    JSON.stringify(data),
  ].join("\n\n");
}
```

Update `src/app/api/documents/generate/route.ts` to:
- return `403` for `haccp_plan` when `tier !== "pro"` and not admin
- branch `haccp_plan` to the HACCP-specific path
- keep non-HACCP document types on the existing generic generation path
- support `docx` and `pdf` for HACCP from the same structured content

Reduce `src/lib/documents/generate-prompt.ts` so HACCP is no longer treated as a normal generic prompt document.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/documents/haccp-generate-route.test.ts`

Expected: PASS

- [ ] **Step 5: Run tier regression**

Run: `npx vitest run src/__tests__/tier.test.ts src/__tests__/documents/haccp-generate-route.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/documents/haccp-generation.ts src/lib/documents/generate-prompt.ts src/app/api/documents/generate/route.ts src/__tests__/documents/haccp-generate-route.test.ts
git commit -m "feat: gate haccp generation to pro and add structured route"
```

## Chunk 4: Render HACCP DOCX/PDF with Fixed Layout

### Task 4: Add failing DOCX/PDF render tests

**Files:**
- Create: `src/lib/documents/render-haccp-docx.ts`
- Create: `src/lib/documents/render-haccp-pdf.ts`
- Modify: `src/lib/documents/render-docx.ts`
- Modify: `src/lib/documents/render-pdf.ts`
- Create: `src/__tests__/documents/render-haccp-docx.test.ts`
- Create: `src/__tests__/documents/render-haccp-pdf.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { renderHaccpDocx } from "@/lib/documents/render-haccp-docx";
import { renderHaccpPdf } from "@/lib/documents/render-haccp-pdf";

const sample = {
  metadata: {
    companyName: "PinkPepper Foods",
    version: "1.0",
    date: "2026-03-16",
    createdBy: "Joao",
    approvedBy: "QA Manager",
  },
  processFlow: ["Receive", "Store chilled", "Prepare", "Serve"],
  steps: [
    { stepNo: 1, stepName: "Receive", fullStepDescription: "Receive chilled goods from approved suppliers." },
  ],
  hazards: [
    {
      stepNo: 1,
      stepName: "Receive",
      hazardType: "Biological",
      hazardDescription: "Temperature abuse on receipt.",
      controlMeasure: "Reject deliveries above limit.",
      isCcp: "No",
    },
  ],
  ccps: [],
};

describe("renderHaccpDocx", () => {
  it("creates a landscape document with the approved HACCP sections", async () => {
    const buffer = await renderHaccpDocx(sample);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});

describe("renderHaccpPdf", () => {
  it("creates a PDF with header/footer metadata and no CCP section when not needed", async () => {
    const bytes = await renderHaccpPdf(sample);
    expect(bytes.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/documents/render-haccp-docx.test.ts src/__tests__/documents/render-haccp-pdf.test.ts`

Expected: FAIL because the HACCP-specific renderers do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement dedicated HACCP renderers that enforce:
- landscape layout
- Calibri
- 10pt minimum body text
- 11pt table headers with light blue fill
- optional 10pt table captions
- 14pt section titles
- header with logo/company/version/date
- footer with created by/approved by/page number
- conditional CCP section

Then have `render-docx.ts` and `render-pdf.ts` delegate to the HACCP renderers when `doc.documentType === "haccp_plan"` and structured HACCP data is present.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/documents/render-haccp-docx.test.ts src/__tests__/documents/render-haccp-pdf.test.ts`

Expected: PASS

- [ ] **Step 5: Run focused document regression**

Run: `npx vitest run src/__tests__/documents/render-haccp-docx.test.ts src/__tests__/documents/render-haccp-pdf.test.ts src/__tests__/documents/haccp-schema.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/documents/render-haccp-docx.ts src/lib/documents/render-haccp-pdf.ts src/lib/documents/render-docx.ts src/lib/documents/render-pdf.ts src/__tests__/documents/render-haccp-docx.test.ts src/__tests__/documents/render-haccp-pdf.test.ts
git commit -m "feat: render structured haccp documents in docx and pdf"
```

## Chunk 5: Update Product Messaging and Safeguards

### Task 5: Add failing messaging/access tests

**Files:**
- Modify: `src/app/pricing/page.tsx`
- Modify: `src/lib/tier.ts`
- Modify: `src/i18n/messages/en.json`
- Modify: `src/__tests__/tier.test.ts`
- Modify: `src/__tests__/seo-surface.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
it("reserves advanced haccp generation and docx/pdf export for pro", () => {
  expect(TIER_CAPABILITIES.plus).not.toMatchObject({
    advancedHaccpGeneration: true,
  });
  expect(TIER_CAPABILITIES.pro).toMatchObject({
    advancedHaccpGeneration: true,
  });
});
```

Add a surface test that expects pricing copy to mention:
- standard documents on Plus
- advanced HACCP generation with DOCX/PDF export on Pro

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/tier.test.ts src/__tests__/seo-surface.test.ts`

Expected: FAIL because the capability flag and pricing language do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Update:
- `src/lib/tier.ts` with `advancedHaccpGeneration`
- `src/app/pricing/page.tsx` to position HACCP DOCX/PDF as Pro-only
- `src/i18n/messages/en.json` if the dashboard doc-gen UI needs explicit Pro-only copy for HACCP

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/tier.test.ts src/__tests__/seo-surface.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/tier.ts src/app/pricing/page.tsx src/i18n/messages/en.json src/__tests__/tier.test.ts src/__tests__/seo-surface.test.ts
git commit -m "feat: position advanced haccp generation as pro only"
```

## Chunk 6: Full Verification

### Task 6: Run end-to-end local verification

**Files:**
- No new files

- [ ] **Step 1: Run focused HACCP suite**

Run:

```bash
npx vitest run src/__tests__/documents/haccp-schema.test.ts src/__tests__/chatbot-haccp-wizard.test.ts src/__tests__/documents/haccp-generate-route.test.ts src/__tests__/documents/render-haccp-docx.test.ts src/__tests__/documents/render-haccp-pdf.test.ts
```

Expected: PASS

- [ ] **Step 2: Run broader regression coverage**

Run:

```bash
npx vitest run src/__tests__/tier.test.ts src/__tests__/seo-surface.test.ts src/__tests__/chatbot-surface.test.ts
```

Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npm test`

Expected: PASS

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 5: Commit final verification if needed**

```bash
git status
```

If verification surfaced required final fixes, commit them with a focused message before opening or updating a PR.

## Notes for Execution

- Do not widen this work into redesigning the non-HACCP document types.
- Keep the generic document generation path intact for other templates.
- Prefer small helper files over growing `ChatWorkspace.tsx` or the generic document renderers further.
- Keep the final HACCP render deterministic; AI should enrich content, not control layout.
- If the current document artifact schema is too generic to carry structured HACCP payloads cleanly, add a narrow extension rather than a broad document-system rewrite.
