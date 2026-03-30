# Cleaning Schedule Advanced Builder Polish

## Goal

Make the new advanced document builder modal feel production-ready by polishing the `cleaning_schedule` workflow first and applying the shared improvements to the rest of the heavy-document modal path.

## Problem

The heavy builder path now exists, but it is still a thin shell:

- required fields are not validated
- row sections start completely blank
- generate can be clicked even when obviously incomplete
- cleaning schedule, the most operationally row-heavy document, does not yet feel guided or opinionated

The backend can already handle structured cleaning-schedule data. The gap is front-end quality and usability.

## Product Decision

Use `cleaning_schedule` as the benchmark heavy workflow.

This pass improves:

- the shared modal shell
- row editing behavior
- required-field validation
- submit gating
- starter defaults for cleaning schedule

Other heavy documents should benefit from the shared improvements, but only `cleaning_schedule` gets document-specific starter content in this phase.

## Scope

### In scope

- inline required-field validation in the advanced modal
- disable generate when required scalar fields are missing
- preserve entered values on failed submit
- better empty-state messaging for row sections
- seeded starter rows for `cleaning_schedule`
- better CTA text and supporting hints in the advanced modal

### Out of scope

- full per-document custom UIs
- deep schema validation beyond obvious required checks
- redesigning the heavy builder architecture
- changing backend generation logic

## UX Model

### Shared modal improvements

1. Validation
   - required scalar fields show inline error styling when empty after interaction or submit
   - generate button stays disabled while required scalar fields are empty

2. Row section empty state
   - if a row section has no rows, show a short hint like:
     - `No rows added yet`
     - `Add your own rows or start from defaults`

3. Submit behavior
   - submit remains in-modal while loading
   - modal does not close on error
   - inline error stays visible above footer

### Cleaning schedule experience

`cleaning_schedule` should open with useful starter content already present:

- chemical reference starter rows
- daily task starter rows
- weekly task starter rows
- monthly task starter rows
- ATP target starter rows

This should use the existing schema defaults already defined in the cleaning-schedule generation/schema layer, not duplicate a new second source of truth.

## Data Strategy

### Required-field validation

For this phase, validation rules are:

- required non-row fields must be non-empty
- row sections may remain optional
- if a row exists, required columns in that row must be non-empty

Do not add more advanced cross-field logic yet.

### Starter defaults

When the advanced modal opens for `cleaning_schedule`:

- use scalar defaults from builder definitions
- prefill row sections from the existing cleaning schedule defaults

When it opens for other heavy documents:

- keep scalar defaults
- row sections start empty

## Technical Design

### Shared helper additions

Add helper functions in the advanced-builder layer for:

- reading required scalar fields from a definition
- validating current answers
- creating seeded advanced-builder answer maps for specific docs

### Cleaning schedule defaults source

Use the existing exported defaults from:

- `cleaning-schedule-schema.ts`

The modal should not invent its own separate starter dataset.

### Modal rendering changes

- `AdvancedDocumentBuilderField`
  - support inline invalid state
- `AdvancedDocumentBuilderRows`
  - show empty hint
  - show row-level required-column validation if a partially filled row exists
- `AdvancedDocumentBuilderModal`
  - compute validity from current answers
  - disable generate until valid
  - surface shared validation errors more clearly

## Testing

Add focused coverage for:

- required scalar validation helper behavior
- cleaning schedule starter answers include seeded rows
- modal render includes row-empty hint for non-seeded docs
- generate button is disabled when required scalar fields are missing
- generate button is enabled for valid seeded cleaning-schedule start state once required metadata is present

## Success Criteria

- `cleaning_schedule` opens with meaningful starter rows instead of a blank table experience
- required scalar fields are enforced in the advanced modal
- users cannot submit obviously incomplete heavy documents
- modal errors do not destroy entered data
- the shared heavy-builder experience feels stable enough to extend to the remaining heavy docs
