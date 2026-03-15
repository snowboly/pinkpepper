# Chatbot Top Banner Removal Design

## Goal

Remove the top `ASK`/mode banner from the chatbot workspace while keeping the bottom mode controls and all workspace behavior intact.

## Current State

`ChatWorkspace.tsx` renders a top chrome strip above the message list that shows:

- the current mode badge (`ASK` or `Virtual Audit`)
- an optional persona pill
- a short mode description
- a `Generate report` action in virtual audit mode

The same workspace already has a bottom control row with the mode switch and remaining chat controls, so the top strip is redundant.

## Design

- delete the top mode banner block from the main chat area
- keep the bottom mode toggle row unchanged
- keep the virtual audit mode itself unchanged
- keep input placeholders and other mode-dependent behavior unchanged

## Testing

Add a small regression that verifies the top banner source block is no longer present in `ChatWorkspace.tsx`.
