# Workspace Expert Button Removal Design

## Goal

Remove the broken `Ask an expert` button from the chatbot workspace and remove the duplicate bottom `PRO` upsell badge in the workspace shell.

## Current State

The dashboard workspace sidebar still renders an `Ask an expert` button wired from `ChatWorkspace` into `ChatSidebar`, but the user reports it leads nowhere useful. The bottom workspace chrome also shows a duplicate tier/upgrade-style `PRO` badge, which makes the shell feel cluttered.

## Design

- remove the sidebar expert-review button entirely
- remove the `onAskExpert` prop wiring between `ChatWorkspace` and `ChatSidebar`
- remove the duplicate bottom `PRO` badge from the workspace control row
- leave the rest of the workspace controls untouched

## Testing

Add a focused source-level regression that ensures:

- `ChatSidebar` no longer exposes `onAskExpert`
- `ChatWorkspace` no longer wires `onAskExpert`
- the workspace shell no longer renders the duplicate bottom tier pill
