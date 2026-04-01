# PRO Tier Manual Testing Checklist

## Context
This checklist is for a **PRO subscription user** to manually test all PinkPepper features and surface bugs, gaps, or regressions. It covers every user-facing flow, API behaviour, tier-gated feature, and edge case discovered in the codebase.

---

## 1. Authentication & Account

- [ ] **Sign up** with email + password (min 8 chars) — verify confirmation email arrives. YES
- [ ] **Sign up with magic link** — verify OTP email arrives and logs you in. YES
- [ ] **Sign up with existing email** — verify no email-enumeration leak (should not say "email taken"). YEs, email already exists.
- [ ] **Log in** with password — redirects to `/dashboard`. yes, logs to dashboard.
- [ ] **Log in with magic link** — verify OTP flow works end-to-end. YES
- [ ] **Log in with wrong password** — verify clear error message. YES, Invalid login credentials.
- [ ] **Forgot password** — verify reset email arrives, link works, password updates. YES, works.
- [ ] **Update password** — min 8 chars enforced, confirm-password must match. YES
- [ ] **Cross-device magic link** — open magic link on a different device/browser; expect clear error ("use same device"). Yes, shows use same device.
- [ ] **Expired auth link** — wait for link to expire; expect "link expired" message. 
- [ ] **Sign out** — from Settings page, verify redirect to homepage and session is cleared. Yes, clear signed out. 

---

## 2. Onboarding

- [ ] **First login** — OnboardingModal appears asking business type. Yes
- [ ] **Select business type** (e.g. "Restaurant/Cafe") and submit — modal closes, selection persists. Yes. (although there is not added value to this answers nor any diff features).
- [ ] **Skip/close without selecting** — verify modal reappears on next page load. YES
- [ ] **Network error during onboarding** — disconnect network, submit; expect "Network error" message. YES

---

## 3. Chat — Text Messages

- [ ] **Send a simple question** (e.g. "What is HACCP?") — response streams token-by-token. YES
- [ ] **Send a complex/document query** (e.g. "Write me a cleaning SOP") — verify larger model is used (longer, more detailed response). YES. Created typed in document (no download).
- [ ] **Send an audit-keyword query** (e.g. "Run a gap analysis on my kitchen") — verify audit-mode response style. YES, Query in normal chat, it analized the current conversation flow for any info and returned a list of gaps (all gaps since no information was passed thru for that audit. On audit mode, it started the actual audit requesting scope and docs and areas.
- [ ] **Verify RAG citations** — ask about a regulation (e.g. "EC 852/2004"); check SourceCards appear with title, similarity %, excerpt. No rag citations needed. I removed that. Regarding the regulations, i asked about the arsenic levels in fish. It went to the KB to retrieve info but there are newer regulations from 2025, like the 1891. I asked about that new regulation and it answered "I'm a large language model, my training data only goes up to 2023, and I may not have the latest information on new regulations." I cannot have a model that doesnt know the latest regulations and that says it stopped in 2023. We need to work on that. 
- [ ] **Expand/collapse citations** — click chevron on SourceCard. no need for the citations cards. It was very clunky. 
- [ ] **"Show more sources"** — if >3 citations returned, verify expand button works. No need citations.
- [ ] **Streaming interruption** — click Stop button mid-stream; verify partial response is preserved and UI is usable. Yes, usable. 
- [ ] **Empty message** — try submitting with no text/image/doc; send button should be disabled. YES
- [ ] **Max length (2500 chars)** — type exactly 2500 chars; verify counter shows 0 remaining, send works. YES
- [ ] **Over max length** — type 2501+ chars; verify counter turns red, submit is blocked or truncated. YES
- [ ] **Copy assistant message** — click copy icon; verify clipboard has message text, icon changes to checkmark for ~2s. YES
- [ ] **Persona consistency** — send multiple messages in same conversation; verify same persona avatar/name throughout. YES, same persona.
- [ ] **New conversation gets different persona** — start a new chat; persona may differ (hash-based). Yes, diff persona.

---

## 4. Chat — Image Analysis (PRO: 15/day)

- [ ] **Upload JPEG image** via button — preview thumbnail appears, send; verify OpenAI vision response about food safety. YES, all OK.
- [ ] **Upload PNG image** — same flow. YES, all OK.
- [ ] **Upload WebP image** — same flow. YES, all OK.
- [ ] **Upload GIF image** — same flow. YES, all OK.
- [ ] **Drag-and-drop image** onto chat area — verify drop zone activates, image attaches. YES, all OK.
- [ ] **Remove attached image** before sending — click X on preview; verify image cleared. YES, all OK.
- [ ] **Unsupported image format** (e.g. .bmp, .tiff) — verify rejection with clear error. Yes, all OK.
- [ ] **Image > 5MB** — verify rejection with size error. YES, all ok.
- [ ] **Send image with text prompt** — verify both are processed. Yes, all OK.
- [ ] **Send image without text** — verify image-only analysis works. Yes, all OK.
- [ ] **Upload 15 images in one day** — all should succeed (PRO limit). Yes, all ok.
- [ ] **Upload 16th image** — verify 402 error / upgrade modal with "daily image limit reached". Yes, all ok.

---

## 5. Chat — Document Upload & User RAG

- [ ] **Upload PDF document** — verify filename tag appears, document is ingested for RAG. Yes, all ok.
- [ ] **Upload DOCX document** — same flow. Yes, all ok.
- [ ] **Upload TXT file** — same flow.Yes, all ok.
- [ ] **Upload MD file** — same flow. Yes, all ok.
- [ ] **Upload file > 10MB** — verify rejection. Yes, all ok.
- [ ] **Ask question referencing uploaded doc** — verify user-doc RAG chunks appear in response (similarity ≥ 0.65). Yes, all ok.
- [ ] **Remove attached document** before sending — click X; verify cleared. Yes, all ok.

---

## 6. Chat — Voice Transcription (PRO: 200/day)

- [ ] **Record audio** — click mic icon, speak, stop; verify transcription appears in input
- [ ] **Cancel recording** — press Escape during recording; verify cancelled cleanly
- [ ] **Transcription error** — simulate by recording in noisy environment; verify error message shown
- [ ] **Recording states** — verify UI transitions: idle → red (recording) → orange/spinner (transcribing) → text in input
- [ ] **Record 200 transcriptions in a day** — all should succeed
- [ ] **201st transcription** — verify limit error / upgrade modal

---

## 7. Document Generation Wizards (PRO: 20/day)

- [ ] **HACCP Plan wizard** — trigger from empty-state suggestion or menu; answer all questions; verify document generated
- [ ] **Cleaning SOP wizard** — same flow
- [ ] **Temperature Monitoring Log wizard** — same flow
- [ ] **Supplier Approval wizard** — same flow
- [ ] **Cancel mid-wizard** — verify state resets, no partial generation
- [ ] **Generate as JSON** — verify structured response in chat
- [ ] **Generate as PDF** — verify PDF file downloads with header, disclaimer, content
- [ ] **Generate as DOCX** — verify DOCX file downloads (PRO-only feature)
- [ ] **Generate 20 documents in a day** — all should succeed
- [ ] **21st generation** — verify 402 / upgrade modal

---

## 8. Virtual Audit Mode (PRO-only)

- [ ] **Switch to Virtual Audit workspace** — verify mode change, different UI/prompt
- [ ] **Audit conversation flow** — verify auditor asks business type, scope, works through areas one at a time
- [ ] **Provide evidence** — verify auditor acknowledges and records findings
- [ ] **Request audit report** — verify structured report with Compliant/Minor NC/Major NC/Critical NC findings
- [ ] **Switch back to Ask mode** — verify normal chat resumes
- [ ] **Audit uses RAG** — verify citations from knowledge base appear (topK: 10)

---

## 9. Export (PRO: PDF + DOCX)

- [ ] **Export conversation as PDF** — click export; verify PDF downloads with PinkPepper header, date, disclaimer, content
- [ ] **Export conversation as DOCX** — verify DOCX downloads with heading, date, disclaimer, paragraphs
- [ ] **Export empty conversation** — verify 404 or clear "no content to export" message
- [ ] **Export while loading** — verify button shows spinner, prevents double-click
- [ ] **Multi-page PDF** — generate long response, export; verify pagination works
- [ ] **Rate limit (5 req/min)** — rapidly export 6 times; verify 429 on 6th

---

## 10. Expert Review System (PRO: 3 credits/month)

- [ ] **Request review on PDF document** — select `produced_pdf` category; verify submission
- [ ] **Request review on DOCX document** — select `produced_docx` category
- [ ] **Request review on Q&A conversation** — select `async_qa` category
- [ ] **Add notes** to review request (up to 1000 chars) — verify notes saved
- [ ] **Submit review** — verify success confirmation with "Request submitted" card
- [ ] **Check credit counter** — should show "Used 1/3 credits" after quick check
- [ ] **Submit full review (3 credits)** — verify all credits consumed
- [ ] **Submit review when credits exhausted** — verify 402 error / "Out of reviews" message
- [ ] **Track reviews** — navigate to `/dashboard/reviews`; verify list shows submitted reviews
- [ ] **Filter by status** — test All, Queued, In Review, Completed, Rejected tabs
- [ ] **Expand review card** — verify notes, submitted content preview, reviewer feedback (if any)
- [ ] **Download reviewer's annotated file** — if completed with file upload, verify download works
- [ ] **"Open conversation" link** — verify navigates to original conversation
- [ ] **Pagination** — if >20 reviews, verify Previous/Next buttons work
- [ ] **Review on short message (<800 chars)** — review button should still appear for PRO
- [ ] **Email notifications** — verify confirmation email received after submitting review

---

## 11. Conversation Management

- [ ] **Create new conversation** — click "New Chat"; verify new empty conversation
- [ ] **Rename conversation** — hover, click rename; type new title (1–100 chars); press Enter
- [ ] **Rename with empty title** — verify validation error
- [ ] **Rename with >100 chars** — verify truncation or error
- [ ] **Archive conversation** — hover, click archive; verify it disappears from sidebar
- [ ] **Delete conversation** — hover, click delete; verify confirmation modal, then removal
- [ ] **Cancel delete** — click cancel on confirmation; verify conversation preserved
- [ ] **Search conversations** — type in search box; verify live filtering by title
- [ ] **Search with no results** — verify empty state message
- [ ] **Time grouping** — verify conversations grouped: Today, Yesterday, Previous 7 Days, Previous 30 Days, Older
- [ ] **Load conversation history** — click older conversation; verify up to 200 messages load
- [ ] **Unlimited saved conversations** — PRO has no conversation count limit (unlike Free's 10)

---

## 12. Project Management

- [ ] **Create project** — click + icon; select emoji, enter name; verify project folder appears
- [ ] **Rename project** — hover, click rename; verify inline edit works
- [ ] **Delete project** — hover, click delete; verify conversations inside get unlinked (project_id → null), not deleted
- [ ] **Move conversation into project** — drag conversation onto project folder; verify it moves
- [ ] **Move conversation out of project** — drag back to "All Chats"; verify unlinked
- [ ] **Expand/collapse project** — click folder; verify conversations show/hide
- [ ] **Project emoji picker** — verify 8 preset emojis work
- [ ] **Project with empty name** — verify validation prevents creation
- [ ] **Project name >100 chars** — verify truncation or error

---

## 13. Settings Page

- [ ] **View profile** — verify email displayed (read-only), tier badge shows "Pro" (green)
- [ ] **Change UI language** — switch to French, German, Spanish, Italian, Portuguese; verify page reloads with new locale
- [ ] **Change chatbot language** — select different language, save; verify AI responds in that language on next message
- [ ] **Change password** — enter current password, new password (8+ chars), confirm; verify success
- [ ] **Change password — wrong current password** — verify "Current password incorrect" error
- [ ] **Change password — too short** — enter <8 chars; verify "Password too short" error
- [ ] **Change password — mismatch** — different confirm; verify "Passwords don't match" error
- [ ] **Manage Billing** — click "Manage Billing"; verify redirect to Stripe Customer Portal
- [ ] **View Plans** — click "View Plans"; verify redirect to `/pricing`

---

## 14. Billing & Subscription

- [ ] **Verify PRO status** — call `/api/billing/status` or check sidebar badge; confirm tier=pro
- [ ] **Stripe Customer Portal** — access via Settings; verify can update payment method, view invoices
- [ ] **Cancel subscription** — via Stripe portal; verify cancellation email received, access continues until period end
- [ ] **Resubscribe after cancel** — verify checkout flow works, tier reactivates
- [ ] **Payment failure** — if testable, verify payment failure notification email

---

## 15. Usage Limits & Rate Limiting (PRO Tier)

- [ ] **Daily message limit (1000)** — verify counter in sidebar updates with each message
- [ ] **Hit message limit** — send 1000 messages; verify 402 + upgrade modal with "daily limit reached"
- [ ] **Chat rate limit (10 req/min)** — send 11 rapid messages; verify 429 error
- [ ] **Chat burst limit (5 req/30s)** — send 6 messages in 30s; verify rate limit
- [ ] **Vision rate limit (5 req/min)** — upload 6 images rapidly; verify 429
- [ ] **Export rate limit (5 req/min)** — export 6 times rapidly; verify 429
- [ ] **Transcription rate limit (6 req/min)** — transcribe 7 times rapidly; verify 429
- [ ] **Usage resets daily** — verify counter resets at midnight (or billing day)

---

## 16. Empty States & Edge Cases

- [ ] **Empty conversation** — new chat shows logo, "Ask me anything about food safety", 6 suggestion buttons
- [ ] **Premium Workflows banner** — should be HIDDEN for PRO users (only shown for Free/Plus)
- [ ] **Suggestion buttons** — click each of the 6 suggestions; verify they populate input or trigger wizard
- [ ] **Network disconnect during chat** — verify error message, ability to retry
- [ ] **Network disconnect during export** — verify error handling
- [ ] **Refresh page mid-stream** — verify conversation state is preserved (partial response saved or not)
- [ ] **Multiple tabs** — open dashboard in 2 tabs; send message in one; verify other tab doesn't break
- [ ] **Mobile responsive** — test on mobile viewport:
  - [ ] Sidebar collapses/opens via hamburger
  - [ ] Chat input is usable
  - [ ] Modals display correctly
  - [ ] Touch targets are large enough
- [ ] **Drag-and-drop file onto chat** — verify drag overlay appears, file attaches correctly
- [ ] **Paste image from clipboard** — if supported, verify it attaches

---

## 17. Security & Authorization

- [ ] **Access other user's conversation** — manually change conversation ID in URL; verify 404
- [ ] **Access other user's review** — manually change review ID; verify 403
- [ ] **Unauthenticated API calls** — call any API route without auth cookie; verify 401
- [ ] **XSS in chat input** — send `<script>alert('xss')</script>`; verify it renders as text, not executed
- [ ] **XSS in conversation title** — rename to include HTML/script; verify escaped
- [ ] **SQL injection in search** — type SQL in conversation search; verify no error/leak
- [ ] **CSRF on billing checkout** — verify origin validation (NEXT_PUBLIC_SITE_URL check)
- [ ] **Stripe webhook signature** — verify only valid Stripe events are processed

---

## 18. Email Notifications

- [ ] **Welcome email** — sent once after email confirmation; verify content and formatting
- [ ] **Subscription activation** — after checkout; verify email received
- [ ] **Subscription update** — after plan change; verify email
- [ ] **Subscription cancellation** — verify email with period end date
- [ ] **Payment failure** — verify email with retry date info
- [ ] **Review submitted (user confirmation)** — verify email with category, priority, turnaround
- [ ] **Review picked up (in_review)** — verify email notification
- [ ] **Review completed** — verify email with feedback summary
- [ ] **Review rejected** — verify email with rejection reason

---

## 19. Potential Gaps & Areas to Probe

- [ ] **Tier downgrade protection** — if subscription lapses, does the UI handle gracefully? (TIER_RANK check prevents visual downgrade, but does data access change?)
- [ ] **Review credit reset timing** — do credits reset on billing cycle or calendar month?
- [ ] **Full review blocking** — after submitting a full review (3 credits), can you still submit in the same month? (Should not be able to)
- [ ] **Conversation retention for PRO** — PRO has unlimited retention; verify old conversations are accessible
- [ ] **Max response tokens (8192 for PRO)** — ask a very detailed question; verify response isn't truncated at lower tier limits
- [ ] **Language preference persistence** — change chatbot language, close browser, reopen; verify language persists
- [ ] **Concurrent document generation + chat** — generate a document while chatting; verify no interference
- [ ] **Image in audit mode** — can you upload an image during virtual audit? (May not be supported — test for clear error)
- [ ] **Document upload in audit mode** — same question
- [ ] **Admin features hidden** — verify you do NOT see admin review queue link (should only appear for admins)
- [ ] **Billing success/cancel URL params** — after checkout, verify `?billing=success` shows confirmation; `?billing=cancelled` on pricing page

---

## Verification Approach

1. **Manual walkthrough**: Follow this checklist top-to-bottom in a browser logged in as a PRO user
2. **Network tab**: Monitor browser DevTools Network tab for unexpected errors (4xx/5xx)
3. **Console errors**: Watch browser console for JS errors during all interactions
4. **Email inbox**: Check email for all notification flows
5. **Stripe test mode**: Use Stripe test cards for billing flows
6. **Mobile testing**: Repeat critical flows (chat, export, review) on mobile viewport
