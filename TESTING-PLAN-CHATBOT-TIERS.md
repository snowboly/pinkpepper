# Chatbot Tier Testing Plan

This plan splits testing into two categories:
- **You (User)** — requires a running app, real browser sessions, Supabase/Stripe accounts, and visual/UX verification
- **Claude** — can write automated tests, review logic correctness, and validate code paths statically

---

## Prerequisites

Before testing, you need **4 test accounts** in Supabase:

| Account | Tier | How to set up |
|---------|------|---------------|
| `free@test.com` | free | Default (no Stripe subscription) |
| `plus@test.com` | plus | Complete Stripe checkout with `STRIPE_PLUS_PRICE_ID` (use Stripe test card `4242...`) |
| `pro@test.com` | pro | Complete Stripe checkout with `STRIPE_PRO_PRICE_ID` |
| `admin@test.com` | admin | Set `is_admin = true` in `profiles` table, or add email to `ADMIN_EMAILS` env var |

---

## 1. Text Chat — Message Limits

### You (User) — Manual Testing

| # | Test | Tier | Steps | Expected |
|---|------|------|-------|----------|
| 1.1 | Send a message | Free | Log in as free user, type any food safety question, send | Stream response appears, usage counter increments |
| 1.2 | Send a message | Plus | Same as above with plus account | Same result |
| 1.3 | Send a message | Pro | Same as above with pro account | Same result |
| 1.4 | Send a message | Admin | Same as above with admin account | Same result, no usage limit shown |
| 1.5 | Hit daily limit | Free | Send 25 messages in one day (or set usage_events count to 25 via SQL) | 402 error: "Daily message limit reached for your plan. Upgrade to continue today." |
| 1.6 | Hit daily limit | Plus | Send 100 messages (or set usage to 100 via SQL) | Same 402 error |
| 1.7 | Hit daily limit | Pro | Send 1000 messages (or set usage to 1000 via SQL) | Same 402 error |
| 1.8 | Admin bypass | Admin | Send messages past any limit | No limit enforced, messages always go through |
| 1.9 | Usage counter in stream | All | After a message, check the `done` SSE event | `usage.used` and `usage.limit` reflect correct tier values |

**Shortcut for limit testing:** Instead of sending hundreds of messages, insert fake usage rows directly:
```sql
INSERT INTO usage_events (user_id, event_type, event_count, created_at)
SELECT '<user-id>', 'chat_prompt', 1, now()
FROM generate_series(1, 25); -- adjust count per tier
```

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C1.1 | Write unit tests for `countUsageSince()` to verify it counts correctly |
| C1.2 | Write unit tests for `resolveUserAccess()` — verify free/plus/pro/admin mapping |
| C1.3 | Write unit tests for `normalizeTier()` — verify edge cases (null, undefined, invalid strings) |
| C1.4 | Review `stream/route.ts` lines 89–97 to confirm limit check logic is correct |
| C1.5 | Verify the daily limit check uses `>=` (not `>`) so limit is exactly N messages |
| C1.6 | Verify admin users skip the limit check (`if (!isAdmin && used >= caps.dailyMessages)`) |

---

## 2. Query Mode Detection

### You (User) — Manual Testing

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.1 | Q&A mode | Ask: "What temperature should I store chicken at?" | General Q&A answer, `mode: "qa"` in usage metadata |
| 2.2 | Document mode | Ask: "Create a HACCP plan for a bakery" | Structured document with version block, `mode: "document"` |
| 2.3 | Audit mode | Ask: "Audit my kitchen compliance" | Findings with ✅/⚠️/🔴/🚫 ratings, `mode: "audit"` |
| 2.4 | Verify mode in DB | After each test, check `usage_events.metadata->mode` | Matches expected mode |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C2.1 | Write unit tests for `detectQueryMode()` covering all keyword lists |
| C2.2 | Verify audit keywords take priority over document keywords (audit checked first) |
| C2.3 | Test edge cases: empty string, mixed keywords, case sensitivity |

---

## 3. Image / Photo Analysis

### You (User) — Manual Testing

| # | Test | Tier | Steps | Expected |
|---|------|------|-------|----------|
| 3.1 | Upload image | Free | Upload a food photo | Analysis returned, usage incremented |
| 3.2 | Upload image | Plus | Same | Same |
| 3.3 | Upload image | Pro | Same | Same |
| 3.4 | Hit image limit | Free | Upload 2nd image in same day | 402: "Daily photo limit reached (1/day on free plan)" |
| 3.5 | Hit image limit | Plus | Upload 4th image in same day | 402: "Daily photo limit reached (3/day on plus plan)" |
| 3.6 | Hit image limit | Pro | Upload 21st image | 402 with 20/day limit |
| 3.7 | Admin bypass | Admin | Upload unlimited images | No limit enforced |
| 3.8 | Invalid file type | Any | Upload a `.txt` file renamed to `.jpg` | 400: "Only JPEG, PNG, WebP, and GIF images are supported." |
| 3.9 | Oversized file | Any | Upload a >5MB image | 400: "Image must be under 5MB." |
| 3.10 | Image upload UI | Free | Check if upload button is available | Button enabled (free gets 1/day) |
| 3.11 | Disabled upload UI | N/A | If a tier had 0 image uploads | Disabled button with "Upgrade for photo analysis" tooltip |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C3.1 | Review image validation logic (file type, size checks) |
| C3.2 | Verify `canUploadImages` derivation in `ChatWorkspace.tsx` |
| C3.3 | Confirm image usage tracks `image_upload` event type (not `chat_prompt`) |
| C3.4 | Verify free tier gets `dailyImageUploads: 1` (not 0) — button should be enabled |

---

## 4. Conversation Limits (Free Tier)

### You (User) — Manual Testing

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.1 | Create conversations | Free user: start 10 new conversations within 30 days | All 10 succeed |
| 4.2 | Exceed limit | Free user: start 11th conversation | 402: "Free tier allows up to 10 saved conversations." |
| 4.3 | Continue existing | Free user at limit: send message in existing conversation | Works fine (no new conversation created) |
| 4.4 | Plus/Pro unlimited | Plus/Pro user: create many conversations | No limit |
| 4.5 | 30-day window | Free user: verify old conversations (>30 days) don't count toward limit | Old ones excluded |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C4.1 | Review the 30-day sliding window logic in `stream/route.ts` lines 114–133 |
| C4.2 | Verify `maxSavedConversations` is `null` for plus/pro (meaning unlimited) |
| C4.3 | Confirm conversation limit check is skipped for admin and non-free tiers |

---

## 5. Conversation History Depth

### You (User) — Manual Testing

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 5.1 | History depth (free/plus) | Send 15+ messages in one conversation, check if AI remembers message #1 | AI only sees last 10 messages |
| 5.2 | History depth (pro/admin) | Same test | AI sees last 20 messages |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C5.1 | Verify `historyLimit` logic: `isAdmin \|\| tier === "pro" ? 20 : 10` (in `stream/route.ts`) |
| C5.2 | Note: `route.ts` (non-streaming) uses hardcoded `limit(10)` — potential inconsistency to flag |

---

## 6. PDF Export

### You (User) — Manual Testing

| # | Test | Tier | Steps | Expected |
|---|------|------|-------|----------|
| 6.1 | Export PDF | Free | Try exporting a conversation as PDF | 403: "PDF export is not available for your plan." |
| 6.2 | Export PDF | Plus | Export a conversation as PDF | PDF downloads successfully |
| 6.3 | Export PDF | Pro | Same | Same |
| 6.4 | Daily doc limit | Plus | Export 4th document in a day | 402: "Daily document generation limit reached" |
| 6.5 | Daily doc limit | Pro | Export 21st document | Same 402 |
| 6.6 | Admin bypass | Admin | Export unlimited | No limit |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C6.1 | Write tests for `canExportPdf()` across all tiers |
| C6.2 | Verify daily document generation limit enforcement logic |

---

## 7. DOCX Export

### You (User) — Manual Testing

| # | Test | Tier | Steps | Expected |
|---|------|------|-------|----------|
| 7.1 | Export DOCX | Free | Try exporting as DOCX | 403: "DOCX export is only available on Pro." |
| 7.2 | Export DOCX | Plus | Same | Same 403 |
| 7.3 | Export DOCX | Pro | Export as DOCX | DOCX downloads successfully |
| 7.4 | Admin bypass | Admin | Export as DOCX | Works |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C7.1 | Write tests for `canExportDocx()` across all tiers |
| C7.2 | Verify `allowWordExport` is only `true` for pro |

---

## 8. Human Review Requests

### You (User) — Manual Testing

| # | Test | Tier | Steps | Expected |
|---|------|------|-------|----------|
| 8.1 | Request review | Free | Try to request a review | 403: "Expert document review is available on Pro." |
| 8.2 | Request review | Plus | Same | Same 403 |
| 8.3 | Quick review | Pro | Request a quick check (1 credit) | Succeeds, 1 credit consumed |
| 8.4 | Full review | Pro | Request a full document review (3 credits) | Succeeds, all 3 credits consumed |
| 8.5 | Exhausted credits | Pro | Request another review after using 3 credits | 402: "Monthly review credits exhausted" |
| 8.6 | Full review after partial use | Pro | Use 1 credit, then request full review | 402: not enough credits for full review |
| 8.7 | Admin bypass | Admin | Request unlimited reviews | No limit |
| 8.8 | Review UI visibility | Free/Plus | Check dashboard | Review button not shown |
| 8.9 | Review UI visibility | Pro/Admin | Check dashboard | Review button visible |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C8.1 | Review monthly credit counting logic (uses `utcMonthStartIso`) |
| C8.2 | Verify full review credit cost (3) vs quick check (1) |
| C8.3 | Verify `reviewEligible` derivation in `ChatWorkspace.tsx` |

---

## 9. RAG (Knowledge Base Retrieval)

### You (User) — Manual Testing

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9.1 | RAG-enabled response | Ask about a topic covered in ingested knowledge docs | Response includes citations, `ragEnabled: true` |
| 9.2 | No RAG match | Ask about something not in knowledge base | No citations, `ragEnabled: false`, still gets a response |
| 9.3 | Citation display | Check `MessageItem` for citation rendering | Citations shown with source/chunk references |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C9.1 | Review similarity threshold: streaming uses 0.72, non-streaming uses 0.65 — flag inconsistency |
| C9.2 | Review `topK` difference: streaming uses 8, non-streaming uses 5 — flag inconsistency |
| C9.3 | Write tests for `formatCitations()` and `buildRAGPrompt()` |

---

## 10. Rate Limiting

### You (User) — Manual Testing

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 10.1 | Chat rate limit | Send 11+ messages within 1 minute | 429: "Too many requests. Please slow down." |
| 10.2 | Vision rate limit | Upload 6+ images within 1 minute | Same 429 |
| 10.3 | Export rate limit | Trigger 6+ exports within 1 minute | Same 429 |
| 10.4 | Billing rate limit | Hit checkout/portal 6+ times in 1 minute | Same 429 |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C10.1 | Review rate limiter config values (10/min chat, 5/min vision, 5/min export, 5/min billing) |
| C10.2 | Verify rate limit applies equally to all tiers (including admin) |

---

## 11. Virtual Audit Mode (UI)

### You (User) — Manual Testing

| # | Test | Tier | Steps | Expected |
|---|------|------|-------|----------|
| 11.1 | Access audit mode | Free | Try to enter virtual audit mode | Upgrade modal shown |
| 11.2 | Access audit mode | Plus | Same | Upgrade modal shown |
| 11.3 | Access audit mode | Pro | Same | Audit mode activates |
| 11.4 | Access audit mode | Admin | Same | Audit mode activates |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C11.1 | Review audit mode gate in `ChatWorkspace.tsx` (tier check at line ~525) |

---

## 12. Billing Flow

### You (User) — Manual Testing

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 12.1 | Checkout (Plus) | Click upgrade, select Plus, complete with test card | Tier updates to "plus" in profiles |
| 12.2 | Checkout (Pro) | Same for Pro | Tier updates to "pro" |
| 12.3 | Customer portal | Click manage subscription | Stripe portal opens |
| 12.4 | Cancel subscription | Cancel in portal | Tier reverts to "free" at period end |
| 12.5 | Webhook processing | After checkout, verify webhook fires | `profiles.tier` updated, `subscriptions` row created |
| 12.6 | Billing status refresh | After upgrade, check `/api/billing/status` | Returns correct new tier |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C12.1 | Review Stripe webhook handler for correct tier mapping |
| C12.2 | Verify origin validation on checkout/portal endpoints |

---

## 13. Edge Cases & Security

### You (User) — Manual Testing

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 13.1 | Unauthenticated access | Call `/api/chat/stream` without auth cookie | 401 |
| 13.2 | Wrong conversation owner | Try to send message to another user's conversation ID | 404 |
| 13.3 | Empty message | Send empty/whitespace-only message | 400: "Message is required." |
| 13.4 | Off-topic question | Ask "What is the capital of France?" | Polite redirect to food safety topics |

### Claude — Automated / Code Review

| # | What Claude can do |
|---|---|
| C13.1 | Review auth checks across all API routes |
| C13.2 | Verify conversation ownership checks |
| C13.3 | Check for SQL injection / input sanitization |

---

## Known Inconsistencies Found During Review

These should be investigated regardless of testing:

1. **RAG threshold mismatch**: `stream/route.ts` uses `threshold: 0.72`, `route.ts` uses `threshold: 0.65`
2. **RAG topK mismatch**: `stream/route.ts` uses `topK: 8`, `route.ts` uses `topK: 5`
3. **History limit mismatch**: `stream/route.ts` uses tier-aware `historyLimit` (10 or 20), `route.ts` hardcodes `limit(10)`
4. **System prompt mismatch**: `stream/route.ts` has a detailed system prompt, `route.ts` has a shorter one
5. **Duplicate endpoints**: Both `route.ts` and `stream/route.ts` handle text chat — clarify which the client actually uses

---

## Recommended Testing Order

1. Set up the 4 test accounts (prerequisite)
2. Test text chat (section 1) — core functionality
3. Test query modes (section 2) — verify AI behavior
4. Test image analysis (section 3) — secondary input method
5. Test conversation limits (section 4) — free tier restriction
6. Test exports (sections 6–7) — tier-gated features
7. Test reviews (section 8) — pro-only feature
8. Test rate limiting (section 10) — protection layer
9. Test billing flow (section 12) — tier transitions
10. Test edge cases (section 13) — security
