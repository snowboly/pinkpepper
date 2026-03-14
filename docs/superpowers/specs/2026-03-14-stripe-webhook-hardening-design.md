# Stripe Webhook Hardening Design

## Goal

Fix the known Stripe billing defects without widening scope: recover cleanly from webhook event reordering, send correct cancellation plan emails, and add regression coverage around those flows.

## Current Problems

1. `customer.subscription.*` events assume a `subscriptions` row already exists for the Stripe customer. That row is only seeded by `checkout.session.completed`, so normal Stripe delivery reordering can produce a `500`.
2. Cancellation emails use the effective access tier after downgrade, not the plan that was actually cancelled.
3. Billing/webhook behavior has no focused regression coverage.

## Design

### Webhook Resilience

When a subscription webhook arrives and no `subscriptions` row exists yet:

- read the Stripe customer id from the subscription
- resolve the application user from Stripe customer metadata
- upsert the `subscriptions` row from webhook data instead of throwing

This keeps the webhook path robust even if `checkout.session.completed` is delayed or retried later.

### Tier Semantics

Separate two meanings in the webhook flow:

- `effective tier`: the access level stored in `subscriptions` and `profiles`
- `plan tier`: the paid plan inferred from the Stripe price id for user-facing billing copy

For cancelled subscriptions, the database can correctly downgrade to `free` while the email still says the cancelled plan was `Plus` or `Pro`.

### Testing

Add targeted Stripe regression tests that verify:

- missing subscription rows are recovered through Stripe customer metadata instead of failing
- cancellation emails use the billed plan tier, not the downgraded access tier
- tier parsing continues to expose both plan and effective access semantics cleanly

## Scope Guardrails

- no billing UI changes
- no schema migration unless implementation proves customer metadata is unavailable
- no broad billing refactor beyond the minimum extraction needed for testable webhook logic
