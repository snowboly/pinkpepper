# Chatbot Access And Surface Fix Design

## Goal

Fix the chatbot so paid Pro users do not get false message-limit blocks, and simplify the workspace back toward a ChatGPT-style interface by removing artifact/evidence/promotional card surfaces.

## Problem

The current chat access path depends on `profiles.tier` at server-render and request time. If Stripe/subscription state is correct but `profiles.tier` lags, the user can still be treated as a lower tier and receive a `402` limit response from the chatbot.

Separately, the workspace UI has drifted away from the desired presentation. It still shows:

- artifact cards above the conversation
- evidence/citation controls on assistant messages
- premium workflow promo cards in the empty state
- an extra human-review promo block in the empty state

That is inconsistent with the requested simpler ChatGPT-style workspace.

## Chosen Approach

Use subscription-backed access as a server-side fallback for chat and dashboard surfaces when `profiles.tier` is stale, while preserving `profiles.tier` as the normal source of truth when it is current.

In the UI, remove the extra promotional and evidence surfaces instead of restyling them. Keep the core sidebar history, message list, input, and review/export controls that still represent live product actions.

## Scope

### Access And Gating

- add a shared access resolver that can combine `profiles` and `subscriptions`
- use that resolver in dashboard bootstrapping and chat endpoints
- ensure Pro subscriptions continue to receive Pro message limits even if the profile row is stale
- add regressions around access resolution and chatbot gating assumptions

### Workspace Simplification

- remove the artifact strip from the top of the workspace
- remove evidence/citation UI from assistant message cards
- remove premium workflow cards from the empty state
- remove the human-review promo block from the empty state
- keep the sidebar conversation list and normal workspace controls

## Non-Goals

- no broad rewrite of the chatbot shell
- no removal of the sidebar conversation history
- no rework of Stripe webhook behavior beyond what is needed for authoritative access fallback
- no changes to review/export backend behavior

## Files Likely To Change

- `src/lib/access.ts`
- `src/app/dashboard/page.tsx`
- `src/app/api/billing/status/route.ts`
- `src/app/api/chat/stream/route.ts`
- `src/app/api/chat/route.ts`
- `src/components/dashboard/ChatWorkspace.tsx`
- `src/components/dashboard/ChatMessages.tsx`
- `src/components/dashboard/MessageItem.tsx`
- `src/__tests__/access.test.ts`
- `src/__tests__/chatbot-surface.test.ts`

## Testing Strategy

- add failing tests for subscription-backed access fallback
- add failing tests for the removed workspace surfaces
- run focused Vitest coverage first
- run a production build after the targeted fixes land
