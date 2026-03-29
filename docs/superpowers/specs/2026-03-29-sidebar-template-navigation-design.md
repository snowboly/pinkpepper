# Sidebar Template Navigation Design

## Goal

Move downloadable templates out of the chat-area dropdown and into the left sidebar so the dashboard has one clean, reliable document entry point.

## Decision

- Use the left sidebar as the only template navigation surface.
- Show only real downloadable templates from `src/lib/templates.ts`.
- Remove the existing template dropdown from the chat empty state.
- Keep locked template visibility for lower tiers.

## Behavior

- Sidebar shows a `Download templates` section.
- Templates are grouped by category and sorted alphabetically within each category.
- Free users still see the list, but entries remain locked and trigger the existing upgrade flow.
- Eligible users download directly through the existing `/api/templates/[slug]/download` path.

## Boundaries

- Do not add new generated-document builders.
- Do not change conversation export behavior.
- Do not add a second template menu anywhere else in the dashboard.

## Implementation Shape

- Add a sorted grouping helper in `src/lib/templates.ts`.
- Render the grouped template list inside `src/components/dashboard/ChatSidebar.tsx`.
- Reuse the existing download logic from `ChatWorkspace`.
- Remove the old dropdown/template starter UI from `ChatMessages`.

## Verification

- Sidebar shows only templates from the registry.
- Categories and titles are sorted consistently.
- Free users see locks and get upgrade gating.
- Eligible tiers can trigger downloads.
- `npm run lint`
- `npm run build`
