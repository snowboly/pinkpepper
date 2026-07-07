# Articles Full Load Test Design

## Goal

Test whether rendering the full `/articles` library server-side improves traffic or indexation compared with the current deferred remainder.

## Decision

- Default `/articles` behavior changes to full server-side rendering.
- A server-side environment variable, `ARTICLES_LIBRARY_MODE`, controls the mode.
- Supported values:
  - `full`: render all article cards in the initial HTML
  - `lazy`: preserve the existing first-24-plus-load-more behavior
- Any unset or unknown value falls back to `full`.

## Scope

- Keep the rest of the page unchanged:
  - featured guides
  - rotating discovery block
  - cluster links
- Keep the existing lazy-load component so rollback is just an env change.

## Verification

- Add tests for both modes in `src/__tests__/seo-surface.test.ts`.
- Run the focused SEO surface suite.
- Run TypeScript typechecking.
