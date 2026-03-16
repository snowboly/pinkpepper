# HACCP Template Redesign

Date: 2026-03-16
Status: Approved design

## Goal

Replace the current overbuilt HACCP draft approach with a lean, operational HACCP plan format that matches how the user runs the document in a real food business.

The new HACCP plan should be:
- simple
- landscape-oriented
- table-driven
- easy to generate from structured inputs
- easy to review and edit
- clearly separated from broader policy/manual content

## Scope

This design applies only to the `haccp_plan` document type.

It does not redesign:
- cleaning SOPs
- allergen policies
- food safety manuals
- company profile storage
- other document templates

## Tiering

The redesigned HACCP document flow should be available only to `Pro` users.

Recommended packaging:
- `Plus`: standard document generation
- `Pro`: advanced HACCP generation with `DOCX` and `PDF` export

Reasoning:
- HACCP generation is higher-value and more business-critical than simpler documents
- the structured HACCP workflow is a premium capability
- `DOCX` and `PDF` export for HACCP align with a professional `Pro` deliverable

## User Requirements

The user wants the HACCP plan to contain only operational HACCP content, not manual-style sections.

Required document sections:
1. Process Flow
2. Process Steps Table
3. Hazard Analysis Table
4. CCP Table, only if needed

Required document framing for all generated documents:
- landscape orientation
- header with logo, company name, version, and date
- footer with created by, approved by, and page number

Document metadata does not need to come from fixed profile settings. It can be edited at generation time.

## Recommended Structure

### 1. Process Flow

Use a simple numbered process flow, not a graphical diagram.

Reasoning:
- easier to generate reliably
- easier to render in DOCX/PDF
- easier for users to review and edit
- fits both small and large processes

### 2. Process Steps Table

Columns:
- `Step No.`
- `Step Name`
- `Full Step Description`

Purpose:
- define the operational sequence clearly
- provide the base input for hazard analysis

### 3. Hazard Analysis Table

Columns:
- `Step No.`
- `Step Name`
- `Hazard Type`
- `Hazard Description`
- `Control Measure`
- `Is CCP?`

Rules:
- one row per hazard per step
- `Hazard Type` should use exactly one of: `Biological`, `Chemical`, `Physical`, `Allergen`
- `Control Measure` is mandatory because hazard analysis is incomplete without it
- `Is CCP?` should drive whether the CCP section is rendered
- `Is CCP?` should be rendered visibly as `Yes` or `No`

### 4. CCP Table

Render only when one or more hazards are marked as CCP.

Columns:
- `CCP No.`
- `Step Name`
- `Hazard`
- `Critical Limit`
- `Monitoring`
- `Corrective Action`

Reasoning:
- avoids empty or irrelevant CCP sections
- keeps the plan lean for lower-risk processes
- preserves proper HACCP structure when CCPs do exist

`Critical Limit` is required for a valid CCP record.

## Shared Document Frame

All HACCP exports should follow the user's document standard.

### Page Setup

- landscape orientation

### Typography and Visual Style

- font family: `Calibri` throughout
- minimum body text size: `10pt`
- table header text size: `11pt`
- table legends or captions: `10pt`
- section titles: `14pt`
- overall visual style: light, clean, and not heavy
- table header cells should use a light blue fill
- body tables should keep subtle borders and restrained contrast suitable for audit documents

### Table Captions

Table captions or legends are optional.

If rendered, they should:
- use `10pt` text
- follow a simple format such as `Table 1. Process Steps`
- stay visually restrained

If omitted, the document should still remain clear and audit-friendly.

### Header

Fields:
- `Logo` optional
- `Company Name`
- `Version`
- `Date`

### Footer

Fields:
- `Created by`
- `Approved by`
- `Page number`

These values should be editable at generation time, not pulled from fixed business profile settings.

## Input Model

The new HACCP flow should use structured inputs instead of a freeform prompt-only approach.

### Metadata Inputs

Ask for:
- company name
- logo optional
- version
- date
- created by
- approved by

### HACCP Content Inputs

Ask for:
- ordered process steps
- full step descriptions
- hazards per step
- control measures per hazard
- CCP details only where applicable

## Generation Strategy

The current system largely generates documents from prompt instructions. That is not a good fit for HACCP.

The recommended model is:
- fixed export layout
- structured data collection
- conditional section rendering
- AI assistance only where it adds value

### Recommended Approach

Use structured JSON plus a rendered template.

That means:
- collect metadata and HACCP inputs in structured form
- generate or refine hazard rows in a constrained format
- render the final document into a fixed layout

### AI Usage

AI should help with:
- drafting hazard descriptions
- suggesting control measures
- suggesting CCP monitoring and corrective action wording

AI should not control:
- overall document structure
- section order
- table layout
- header/footer format

## Exclusions

The HACCP plan should not include:
- broad food safety manual sections
- embedded SOP summaries
- generic policy filler
- company profile setup dependencies

Those belong in separate document types.

## Implementation Direction

Implementation should move toward this architecture:

1. Replace the current HACCP prompt-only flow with a structured HACCP schema.
2. Update the wizard so it captures the required metadata and operational HACCP fields.
3. Render the HACCP document from a fixed landscape layout.
4. Only include the CCP section when needed.
5. Keep HACCP separate from manual/policy content.

## Risks

- If hazards are collected only as free text, the resulting table will still be inconsistent.
- If the system keeps relying on fully freeform generation, the output will drift away from the desired format.
- If header/footer metadata is not treated as first-class structured input, document consistency will remain weak.

## Success Criteria

The redesign is successful when:
- generated HACCP plans contain only the 4 defined sections, with the CCP section rendered only when applicable
- the document exports in landscape orientation
- header and footer follow the company standard
- users can edit metadata at generation time
- hazard analysis is row-based and structured
- CCP content appears only when applicable
- the output reads like a practical HACCP plan, not a food safety manual
