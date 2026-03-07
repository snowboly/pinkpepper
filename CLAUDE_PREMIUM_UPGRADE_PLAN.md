# Premium Upgrade Plan (for Claude)

## Plan First (premium-upgrade roadmap)

1. **Stabilize Core Quality (Week 1)**
- Fix conversation context retrieval to use recent turns, not oldest turns.
- Fix PDF pagination bug so multi-page exports render correctly.
- Add regression tests for chat context assembly and export generation.
- Add production error taxonomy (safe user error + internal log ID).

2. **Security Hardening (Week 2)**
- Add CSP + HSTS + stricter headers in Next config.
- Add CSRF/origin checks for all state-changing routes (billing, reviews, project/chat mutations).
- Add rate limiting (per-user + per-IP burst + endpoint-specific quotas).
- Add security logging/audit trail for admin actions and billing route calls.

3. **Performance & Reliability (Week 3)**
- Remove 20ms UI typing interval re-render loop; switch to batched animation frame updates.
- Cache/reuse retrieval and conversation metadata where safe.
- Add streaming resilience: retry/backoff and explicit partial-save recovery path.
- Add performance budgets (TTFB, API p95 latency, token-stream start time).

4. **UI/UX Premium Pass (Week 4)**
- Build a stronger product voice system (type scale, spacing, visual hierarchy) across dashboard + marketing.
- Improve empty/loading/error states to feel deliberate and trust-building.
- Add session continuity UX (draft restore, upload recovery, clearer mode switching).
- Upgrade conversation navigation/search and power-user shortcuts.

5. **Trust & Ops (Week 5)**
- Align legal/security claims with implemented controls (retention/deletion guarantees).
- Publish status page + incident process + SLA language.
- Add CI gates: tests, lint, typecheck, basic security scan, and perf smoke checks.

## Review Findings (ordered by severity)

1. **PDF export pagination is broken for multi-page documents**  
Reference: `src/app/api/export/pdf/route.ts` (around lines 89, 91)  
Issue: after overflow, `newPage` is created once for that line, but subsequent lines still draw to original `page`.

2. **Chat history fed to model is oldest-first limited, not recent context window**  
Reference: `src/app/api/chat/route.ts` (around lines 353-354), `src/app/api/chat/stream/route.ts` (around line 151), `src/app/api/audit/stream/route.ts` (around line 102)  
Issue: this degrades answer quality in long conversations and feels non-premium quickly.

3. **Security headers are incomplete for a production SaaS**  
Reference: `next.config.ts` (security headers block)  
Issue: no CSP/HSTS configured.

4. **No visible CSRF/origin verification on sensitive billing POST routes**  
Reference: `src/app/api/billing/checkout/route.ts` (around line 59), `src/app/api/billing/portal/route.ts` (around line 31)  
Issue: routes rely on auth cookie but don’t add explicit origin checks for defense-in-depth.

5. **Internal error messages are returned directly to clients in export endpoints**  
Reference: `src/app/api/export/pdf/route.ts` (around line 122), `src/app/api/export/docx/route.ts` (around line 96)  
Issue: potential information leakage and inconsistent UX.

6. **Streaming UI update loop causes avoidable re-render pressure**  
Reference: `src/components/dashboard/ChatWorkspace.tsx` (around line 224)  
Issue: `setInterval` at 20ms with frequent `setMessages` updates can hurt responsiveness on weaker devices.

7. **Retention claims likely need implementation verification**  
Reference: `src/app/security/page.tsx` (around line 184), `src/app/legal/privacy/page.tsx` (around line 90), `src/lib/storage.ts` (around line 252)  
Issue: policy states automatic 30-day conversation deletion; found purge logic for files, not conversations.

