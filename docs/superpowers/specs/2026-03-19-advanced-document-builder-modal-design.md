# Advanced Document Builder Modal

## Goal

Add a proper front-end path for row-heavy document builders inside the workspace without forcing them through the chat wizard.

The new path should let users build structured documents with repeatable rows, review their inputs, and generate the document from the existing `builderData` backend contract.

## Problem

The current workspace has two mismatched states:

- lightweight documents work through a chat-style question flow
- heavy documents already have backend schemas and generation support, but no usable front-end flow

Heavy documents such as cleaning schedules, product data sheets, staff training records, and cleaning SOPs need repeatable rows and section-level review. A chat prompt loop is the wrong UI for that shape of data.

## Product Decision

Use a single `Create Document` entry point in the workspace.

From that one dropdown:

- lightweight documents continue to open the existing conversational wizard
- heavy documents open a dedicated advanced builder modal immediately

This avoids a second document-entry concept while still matching the right interface to the right document complexity.

## Scope

### In scope

- add an advanced document builder modal inside the chat workspace
- expose heavy documents from the existing `Create Document` dropdown
- support four heavy document types:
  - `cleaning_schedule`
  - `product_data_sheet`
  - `staff_training_record`
  - `cleaning_sop`
- render text, date, select, and rows fields from shared builder definitions
- submit structured `builderData` through the existing document generation route
- keep generated output flowing back into the chat thread

### Out of scope

- new backend generation routes
- a full-page document-builder route
- redesigning the entire workspace
- changing the existing lightweight chat wizard
- adding HACCP to this modal in this phase

## UX Model

### Entry point

The empty-state `Create Document` dropdown remains the only document creation entry.

Document items are grouped into:

- `Quick documents`
- `Advanced documents`

Advanced documents should show a small secondary hint such as `Structured builder`.

### Behavior

- quick document click -> existing lightweight wizard
- advanced document click -> open `AdvancedDocumentBuilderModal`

### Modal layout

The modal should be large enough for row-heavy forms and usable on desktop and mobile.

Recommended structure:

1. Header
   - document title
   - short explanatory line
   - close button

2. Body
   - vertically stacked sections from the builder definition
   - metadata section first
   - row-builder sections after content fields

3. Footer
   - cancel
   - generate document

### Section rendering

Fields render from `document-builder-definitions.ts`:

- `text` -> single-line text input
- `date` -> date input
- `select` -> native select
- `rows` -> editable row table/list with:
  - add row
  - remove row
  - inline cell inputs

### Review model

This phase uses one continuous form with a final generate action.

There is no separate “review screen” yet. The form itself is the review surface.

## Data Flow

1. User opens `Create Document`
2. User chooses heavy document
3. Workspace opens advanced modal with the matching builder definition
4. User edits fields and row data
5. Generate action calls `buildDocumentGenerationPayload(builderKey, answers)`
6. Existing `/api/documents/generate` route receives:
   - `documentType`
   - `builderKey`
   - `builderData`
7. Assistant response and export behavior remain unchanged

## Component Design

### New components

- `AdvancedDocumentBuilderModal`
  - owns modal shell and generate/cancel actions
- `AdvancedDocumentBuilderSection`
  - renders one builder section
- `AdvancedDocumentBuilderField`
  - renders text/date/select fields
- `AdvancedDocumentBuilderRows`
  - renders repeatable row editors

These can live under:

- `src/components/dashboard/document-builders/`

### Shared state shape

Use the existing:

- `DocumentBuilderAnswerMap`
- `DocumentBuilderRowValue`

The modal stores answers in the same normalized shape expected by `buildDocumentGenerationPayload`.

## Workspace Integration

### ChatMessages

Update the document starter menu so it includes advanced documents again, but marks them as advanced instead of sending them through the lightweight chat wizard.

### ChatWorkspace

Add state for:

- active advanced builder key
- advanced builder answers
- modal open/closed state
- advanced builder submit loading

Document handling rules become:

- if starter is lightweight -> existing wizard
- if starter is advanced -> open modal

The lightweight path stays unchanged.

## Initial Rollout Order

1. `cleaning_schedule`
2. `product_data_sheet`
3. `staff_training_record`
4. `cleaning_sop`

The first implementation should make the shared modal generic enough that these documents only need definition-based configuration rather than custom UI per doc.

## Validation

Validation should be intentionally light in this phase:

- required scalar fields must be non-empty
- row sections may be empty unless the builder definition requires them later
- within a row, required columns must be filled before generation if the row exists

Do not add overcomplicated schema validation in the UI yet.

## Error Handling

- modal submit failures should surface an inline error message
- failed generation should not destroy entered builder data
- cancel closes the modal without modifying chat state
- successful generation closes the modal and returns to the workspace thread

## Testing

Add focused coverage for:

- document menu grouping and advanced-document presence
- heavy document starter opening modal instead of chat wizard
- modal field rendering from definitions
- row add/remove/edit behavior
- generation payload built from modal answers
- no regression to lightweight document behavior

## Success Criteria

- users can access heavy documents from the existing `Create Document` menu
- heavy docs no longer depend on the chat wizard
- row-heavy documents can be filled in a structured UI
- modal uses shared builder definitions instead of hardcoded per-doc forms
- generation still flows through the existing backend route and chat response path
