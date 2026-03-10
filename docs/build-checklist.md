# PinkPepper Build Checklist

Status date: 2026-03-02
Rule: End-to-end flow testing will be executed after all implementation phases are complete.

## Completed
- [x] Phase 1: Marketing foundation and legal structure
- [x] Phase 2: Supabase auth flows + protected dashboard + RLS baseline
- [x] Phase 3: Chat workspace + Groq API route + tier gating + chat schema
- [x] Phase 4: Stripe billing APIs + webhook tier sync + billing portal + Resend email hooks
- [x] Phase 5: PDF/DOCX export routes with strict server-side tier gating + dashboard export actions
- [x] Phase 6: Dashboard hardening (conversation list, loading states, billing refresh, delete/history UX)
- [x] Phase 7: Admin dashboard route + server-side unlimited chat/export access for admin users
- [x] Supabase SQL migrations executed (`0001`, `0002`, `0003`)

## Final QA (Run now)
- [ ] Auth: signup, email verification, login, logout, reset password
- [ ] Session protection: `/dashboard` blocked when logged out
- [ ] Chat: prompt -> Groq response -> persisted conversation/messages
- [ ] Conversation history: list, reopen, delete
- [ ] Tier usage limits enforced by plan (`free`, `plus`, `pro`)
- [ ] Admin access: `/admin` restricted to admin users and admin usage is unlimited in chat/export
- [ ] Stripe checkout creates/updates subscription
- [ ] Webhook updates `profiles.tier` and subscription status idempotently
- [ ] Billing UI reflects latest plan status and portal opens
- [ ] Export gating: Free blocked, Plus PDF only, Pro PDF + DOCX
- [ ] Legal pages reachable and linked from footer
- [ ] Build passes (`npm run build`)
- [ ] Production deploy smoke test on Vercel

## Build Failure Triage: `DOMMatrix` / `ImageData` / `Path2D` in API routes

If build fails with errors like:

- `Warning: Cannot polyfill DOMMatrix/ImageData/Path2D`
- `ReferenceError: DOMMatrix is not defined`
- `Failed to collect page data for /api/...`

Use this minimal-risk sequence before changing dependencies:

1. Identify the failing route from build logs (example: `/api/documents/upload`).
2. Inspect only that route's direct imports first.
3. Remove top-level imports for browser/rendering-only packages (for example libraries that rely on Canvas or browser globals).
4. Move those imports to `await import(...)` inside the request handler so build-time module evaluation does not execute browser-only code on the server.
5. Keep upload parsing/text extraction on Node-safe libraries only; do not use renderer code paths in API routes.
6. Re-run checks in order:
   - `npm run typecheck`
   - `npm run build`
7. If still failing, continue through the import chain (shared util modules often hide browser-only imports).

Guardrails:

- Prefer server-only modules for route handlers (`*.server.ts` split if needed).
- Avoid importing client components/utilities into `src/app/api/**`.
- Set explicit runtime when required by the parser package (Node runtime for filesystem/buffer-heavy processing).

## Deployment Readiness
- [ ] `.env` values configured for Production in Vercel
- [ ] Supabase project settings verified (Auth redirect URLs, RLS active)
- [ ] Stripe webhook endpoint set to production domain
- [ ] Resend domain and sender verified
- [ ] Monitoring/alerts configured (Vercel + Supabase + Stripe webhooks)

## Admin Setup
- [ ] Run SQL migration `0004_phase7_admin_access.sql`
- [ ] Mark your account as admin in `profiles.is_admin = true` or set `ADMIN_EMAILS` in environment
