# Plan: Improve PLUS tier copy + Replace PRO review credits with consultancy hours

## Problem

1. **PLUS copy is negative** — "No generated compliance documents on Plus - use chat, uploads, and conversation export instead" leads with what's missing rather than what's included. The first bullet of a paid tier should never start with "No".

2. **PRO review credits → consultancy hours** — Instead of "3 specialist review credits/month", PRO now offers **3 hours of food safety consultancy per month** covering: document review, document generation support, async Q&A, and more. Extra hours available pay-as-you-go.

---

## Proposed copy changes

### A. PLUS tier — reframe positively

**Current first bullet (pricing page):**
> "No generated compliance documents on Plus - use chat, uploads, and conversation export instead"

**Proposed replacement bullets (whole PLUS card):**
1. "100 AI queries per day — 7× the Free limit for deeper compliance analysis"
2. "Upload documents and photos for instant food safety feedback"
3. "Export conversations as PDF for filing, handover, or internal review"
4. "25 voice transcriptions per day — ask questions hands-free"
5. "Unlimited saved conversations with full history"

**Rationale:** Lead with the strongest value prop (volume), then capabilities (uploads, export, voice), then retention. No negative framing.

**"What changes as you move up" section — PLUS card:**
> Current: "Move from basic chat to stronger analysis, file uploads, and PDF export for chat conversations."
> Proposed: "Move from basic chat to higher daily limits, document uploads, voice transcription, and PDF export for ongoing compliance work."

**Top summary cards — PLUS:**
> Current subtitle: "Upload, analyse, and export chat conversations without losing your working context."
> Proposed: "Higher limits, document uploads, voice transcription, and PDF export — everything you need for day-to-day compliance work."

**Entitlement detail — PLUS:**
> Current: "100 queries/day, 3 images/day, 25 transcriptions/day, no document generation, PDF export for chat conversations."
> Proposed: "100 queries/day, 3 images/day, 25 transcriptions/day, PDF conversation export, unlimited saved conversations."

### B. PRO tier — consultancy hours model

**Core concept change:**
- `monthlyHumanReviews: 3` → rename/repurpose to `monthlyConsultancyHours: 3`
- `reviewTurnaround` → keep but update copy

**Pricing page PRO card bullets:**
1. "Generate audit-ready HACCP plans, SOPs, logs, and compliance documents"
2. "Export in both PDF and DOCX for internal editing and external sharing"
3. "3 hours of food safety consultancy each month — document review, generation support, async Q&A, and more"
4. "Run Virtual Audit workflows before inspections or internal reviews"
5. (highlighted) "Extra consultancy hours available pay-as-you-go"

**PRO summary card subtitle:**
> Current: "Advanced HACCP generation with DOCX and PDF export, plus qualified food safety specialist review when the work matters most."
> Proposed: "Document generation, DOCX and PDF export, plus 3 hours of food safety consultancy each month with a qualified specialist."

**"What changes" — PRO:**
> Current: "Add advanced HACCP generation, DOCX export, virtual audits, and qualified food safety specialist review when the consequences of getting it wrong are higher."
> Proposed: "Add document generation, DOCX export, virtual audits, and 3 hours/month of food safety consultancy for review, generation support, and async Q&A."

**Entitlement detail — PRO:**
> Current: "...3 review credits/month."
> Proposed: "...3 consultancy hours/month. Extra hours available pay-as-you-go."

**Schema.org structured data — PRO:**
> Current: "Virtual audit workflows, PDF and DOCX export, 3 specialist review credits per month."
> Proposed: "Document generation, virtual audit workflows, PDF and DOCX export, 3 hours of food safety consultancy per month."

### C. FAQ updates

Replace the review-credits FAQ entries:

| Current Q | New Q |
|---|---|
| "How do review credits work?" | "How do consultancy hours work?" |
| "How long does a review take?" | "What does consultancy cover?" |
| "What types of documents can I submit for review?" | "Can I buy extra consultancy hours?" |
| "Can unused review credits roll over?" | "Do unused consultancy hours roll over?" |

**New FAQ answers:**

1. **How do consultancy hours work?**
   "Pro users receive 3 hours of food safety consultancy each month. Use them for document review, document generation support, async Q&A, or any other food safety guidance. Hours are tracked in 15-minute increments."

2. **What does consultancy cover?**
   "Your consultancy hours can be used for reviewing AI-generated documents, helping produce compliance documentation, answering complex food safety questions, and providing specialist guidance. All consultancy is delivered by qualified food safety professionals."

3. **Can I buy extra consultancy hours?**
   "Yes. Additional consultancy is available pay-as-you-go on an hourly basis. Contact us or request extra hours from your dashboard."

4. **Do unused consultancy hours roll over?**
   "No. Consultancy hours reset at the start of each billing month and do not carry over."

### D. Upgrade modal (en.json) changes

**Plus highlights** (keep as-is, already positive):
- "Analyse uploads and get faster answers"
- "PDF export for chat conversations"
- "Unlimited saved conversations"
- "Higher daily chat, image, and voice limits"

**Pro highlights:**
- Current: `"3 specialist review credits/month"`
- Proposed: `"3h food safety consultancy/month"`
- Add: `"Extra consultancy hours pay-as-you-go"`

**Trigger copy for "review":**
- Current heading: "Get expert review"
- Proposed: "Get food safety consultancy"
- Current body: "Have a qualified food safety specialist review your documents before you use them operationally."
- Proposed: "Get document review, generation support, and async Q&A from a qualified food safety specialist."

### E. Email templates (`email-templates.ts`)

**TIER_FEATURES for plus:**
Current (outdated — mentions review credits Plus doesn't have):
```
"Up to 3 expert quick-check reviews per month",
"Priority queue over Free users",
"Full AI chat history",
"PDF &amp; DOCX document export",
```
Proposed:
```
"100 AI queries per day",
"PDF conversation export",
"Document and photo uploads",
"Unlimited saved conversations",
"25 voice transcriptions per day",
```

**TIER_FEATURES for pro:**
Current:
```
"Up to 5 expert reviews per month (including full document reviews)",
"Priority review queue",
"Full HACCP plan &amp; operations manual reviews",
"PDF &amp; DOCX document export",
"Dedicated food safety consultant support",
```
Proposed:
```
"3 hours of food safety consultancy per month",
"Document generation (HACCP plans, SOPs, logs, and more)",
"PDF &amp; DOCX export",
"Virtual Audit workflows",
"Extra consultancy hours available pay-as-you-go",
```

### F. `tier.ts` capability naming

Rename for clarity (optional, can defer):
- `monthlyHumanReviews` → `monthlyConsultancyHours` (value stays `3` for pro)
- `reviewTurnaround` → `consultancyResponseTime`
- Update value from `"3-5 working days"` to `"within 2 working days"`

**Impact:** This rename touches `tier.ts`, `tier.test.ts`, the review API route, review panel component, and anywhere `monthlyHumanReviews` is referenced. This is a broader refactor — recommend deferring to a separate PR unless you want it bundled.

### G. Review panel (`en.json` review section + review UI)

The review submission UI still uses "credits" language. Update:
- `"creditsUsed"` → `"hoursUsed"` with copy "Hours used this month:"
- `"quickCheck"` / `"fullDocumentReview"` categories → may need rethinking since it's now hour-based
- `"fullReviewCostNote"` → "Consultancy is tracked in 15-minute increments against your 3 monthly hours."
- `"turnaroundTimes"` → "Responses within 2 working days."

**Note:** The review submission flow itself may need UX changes beyond copy (e.g., replacing the credit-based submission with an hours-based request). Recommend a separate task for that.

---

## Files to modify (copy-only changes in this PR)

| # | File | What changes |
|---|---|---|
| 1 | `src/app/pricing/page.tsx` | PLUS bullets, PRO bullets, summary cards, entitlement detail, FAQs, schema.org |
| 2 | `src/i18n/messages/en.json` | Upgrade modal triggers, plan highlights, review section copy |
| 3 | `src/lib/billing/email-templates.ts` | TIER_FEATURES for plus and pro |

## Files to modify later (separate PRs)

| File | What changes |
|---|---|
| `src/lib/tier.ts` | Rename `monthlyHumanReviews` → `monthlyConsultancyHours`, `reviewTurnaround` |
| `src/__tests__/tier.test.ts` | Update snapshot tests for renamed fields |
| `src/app/api/reviews/route.ts` | Update to hours-based tracking |
| Review submission UI components | UX changes for hours vs credits |
| Stripe product/price setup | Add pay-as-you-go consultancy product |

---

## Summary

This plan separates **copy changes** (this PR) from **structural/code changes** (future PRs). The copy changes alone will fix the PLUS negative framing and communicate the new PRO consultancy model across the pricing page, upgrade modals, and emails.
