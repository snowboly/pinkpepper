# Template-Only Document Experience Design

## Goal

Remove the generated-document builder subsystem from PinkPepper and reposition documents as downloadable templates for Plus and Pro users.

The workspace should stop offering in-chat document generation. Instead, it should surface downloadable templates as the only document-related action, while keeping conversation export intact.

## Product Decision

PinkPepper will no longer pursue complex document builders or chat-driven document generation.

Instead:

- document generation is removed entirely
- downloadable templates remain available
- Free users can see template options but cannot download them
- Plus and Pro users can download templates
- conversation export as PDF/DOCX remains available according to plan tier
- virtual audit remains in the product, but is not expanded in this pass
- expert contact remains separate and email-driven

## Scope

### In Scope

- remove document builder UI from the workspace
- remove advanced and lightweight builder flows
- remove the document-generation API surface
- remove generation/rendering code that only exists for generated documents
- keep template download pages, thumbnails, registry, and gating
- keep conversation export
- update tests to match the new product direction

### Out of Scope

- redesigning virtual audit
- redesigning template pages beyond what is needed for cleanup
- changing conversation export behavior
- changing consultancy / expert-contact flow

## Desired User Experience

### Workspace

The workspace should no longer imply that PinkPepper generates custom documents in chat.

Instead, the document-related entry point becomes template-first:

- users see a templates/download menu in the empty state
- template entries are grouped by category
- Free users see entries in a locked state
- Plus and Pro users can download directly

No builder modal, multi-step wizard, or document-generation prompt flow should remain visible.

### Downloads

The current template system becomes the canonical document experience:

- `src/lib/templates.ts` remains the source of truth
- `/api/templates/[slug]/download` remains the delivery path
- resource pages and template thumbnails remain in use

### Export

Conversation export is not part of this cleanup and must continue to work:

- Plus: PDF conversation export
- Pro: PDF and DOCX conversation export

This export flow is distinct from template downloads and must stay separate in both UI and code.

## Architecture

### Keep

- template registry and template download route
- template resource pages and thumbnails
- conversation export endpoints and rendering
- chat, RAG, audit mode, review/contact, billing gates

### Remove

- `src/components/dashboard/document-builders/*`
- builder-specific state and transitions in `src/components/dashboard/ChatWorkspace.tsx`
- builder-specific starter wiring in `src/components/dashboard/ChatMessages.tsx`
- `/api/documents/generate`
- document generation helpers/renderers used only by that route
- builder-focused tests

### Boundary Rule

If a file or module exists only to support generated custom documents, it should be removed.

If a file supports:

- template downloads
- conversation export
- chat messaging
- virtual audit

it should stay.

## Implementation Shape

### 1. Workspace Simplification

Refactor the workspace so it no longer maintains:

- active lightweight wizard state
- advanced builder modal state
- builder answer maps
- submit flows to `/api/documents/generate`

The remaining document affordance should route only into template download behavior.

### 2. ChatMessages Menu Simplification

The mixed menu currently includes:

- quick document builders
- advanced document builders
- downloadable templates

This should become templates-only.

The shell can remain visually similar if that keeps the UX familiar, but all builder entries should be removed.

### 3. API Removal

Delete `/api/documents/generate` entirely once all references are removed.

The product should not ship a dormant document-generation endpoint if the feature is no longer part of the offering.

### 4. Backend / Library Cleanup

Remove document-generation libraries that are only reachable from `/api/documents/generate`.

Be conservative around shared export code:

- keep conversation export code
- only remove document-specific generation/rendering modules with no remaining live callers

### 5. Test Cleanup

Remove builder-centric tests and update dashboard surface tests so they assert:

- template download entries exist
- builder affordances do not exist
- Free-tier lock treatment still works

## Risks

### Risk 1: Removing code that is still shared

Some document-related modules may appear builder-specific but may also support conversation export or template download.

Mitigation:

- trace imports before deletion
- remove only modules with no remaining valid callers

### Risk 2: UI regressions in the workspace

The workspace currently assumes builder actions in several places.

Mitigation:

- remove state and imports systematically
- verify empty-state menu behavior after the cleanup

### Risk 3: Dead tests and route assumptions

A large part of the test suite may still encode the old product direction.

Mitigation:

- replace builder-surface expectations with template-only expectations
- run build after tests, not just tests alone

## Verification Strategy

Minimum verification for implementation:

- targeted dashboard/tests updated for template-only behavior
- template download gating checks still pass
- `npm run build`

Recommended manual checks:

- Free user sees templates but cannot download
- Plus user can download templates
- Pro user can download templates
- conversation export still appears and works according to plan tier
- no UI path remains that attempts to generate a custom document

## Success Criteria

This cleanup is successful when:

- there is no in-chat document generation path left in the product
- the workspace presents templates as the document experience
- Free users still see locked template options
- Plus/Pro users can download templates
- conversation export still works
- dead builder infrastructure is removed from the codebase
