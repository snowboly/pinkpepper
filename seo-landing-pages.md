# Recommended SEO Landing Pages for PinkPepper

These landing pages target high-intent keywords from food business owners searching for compliance help. Each page should be a Next.js server component under `src/app/`, with a keyword-rich H1, feature explanation, regulatory references, and a clear CTA to `/signup`.

---

## High Priority

### `/haccp-plan-generator`
- **Target keyword:** "HACCP plan generator"
- **Why:** High commercial intent, 1,000+ monthly searches. Core product capability.
- **Content:** Explain how PinkPepper generates hazard analysis, CCPs, monitoring logic, and corrective controls. Reference EC 852/2004 and Codex Alimentarius HACCP principles.

### `/allergen-management`
- **Target keyword:** "allergen management software"
- **Why:** EU Regulation 1169/2011 creates compliance demand across all food businesses. Allergen matrix is a key feature.
- **Content:** Cover allergen declaration requirements, cross-contact controls, color-coded risk matrices, and cleaning verification checkpoints.

---

## Medium Priority

### `/food-safety-sop-templates`
- **Target keyword:** "food safety SOP template"
- **Why:** Long-tail keyword with high conversion intent. Operators searching for templates are ready to act.
- **Content:** Showcase SOP generation for cleaning schedules, temperature monitoring, supplier approval, and delivery checks.

### `/food-safety-audit-checklist`
- **Target keyword:** "food safety audit checklist"
- **Why:** Seasonal demand spikes around EHO inspections and BRCGS audits.
- **Content:** Highlight audit pack generation — SOP evidence, temperature records, corrective action logs, and closure tables.

### `/haccp-for-restaurants`
- **Target keyword:** "HACCP plan for restaurant"
- **Why:** Industry-specific landing page. Restaurants are a primary user segment.
- **Content:** Tailored messaging for restaurant operators — hot/cold service CCPs, allergen menus, kitchen hygiene SOPs.

### `/haccp-for-cafes`
- **Target keyword:** "HACCP plan for cafe"
- **Why:** Matches existing hero demo copy ("Build a HACCP plan for a 25-seat cafe in Dublin"). Natural conversion path.
- **Content:** Cafe-specific examples — pastry display temperatures, milk storage, barista station hygiene.

---

## Location-Specific Pages

### `/food-safety-ireland`
- **Target keyword:** "food safety compliance Ireland"
- **Why:** PinkPepper is Ireland-based. Local SEO captures nearby operators searching for FSAI-aligned tools.
- **Content:** Reference FSAI guidance, Irish food safety legislation (EC 852/2004 as applied in Ireland), and EHO inspection preparation.

### `/food-safety-uk`
- **Target keyword:** "UK food safety compliance"
- **Why:** UK is a major target market. Post-Brexit regulatory divergence creates specific compliance needs.
- **Content:** Reference FSA guidance, Safer Food Better Business (SFBB), and UK-specific HACCP requirements.

---

## Page Template Structure

Each landing page should follow this structure:

```
1. H1 — Keyword-rich title (e.g., "HACCP Plan Generator for Food Businesses")
2. Subtitle — Value proposition in one sentence
3. Feature section — 3-4 cards showing relevant capabilities
4. Regulatory references — Specific EU/UK regulations the page addresses
5. Social proof — Testimonials or trust signals (when available)
6. CTA — "Start free" button → /signup
7. FAQ section — 3-5 questions targeting related long-tail keywords
```

### SEO Metadata Template

Each page should export Next.js metadata:

```tsx
export const metadata: Metadata = {
  title: "HACCP Plan Generator | PinkPepper — AI Food Safety Software",
  description: "Generate HACCP plans, CCPs, and monitoring logs for your food business. Grounded in EC 852/2004 and Codex Alimentarius. Start free.",
};
```

---

## Additional SEO Infrastructure (Already Implemented)

- `src/app/sitemap.ts` — Auto-generates `/sitemap.xml` for all public routes
- `src/app/robots.ts` — Blocks crawling of `/dashboard/`, `/admin/`, `/api/`, `/auth/`
- Root layout metadata — Title, description, and favicon configured
- Pricing page metadata — Added in this sprint

## Future Considerations

- **Structured data (Schema.org):** Add `SoftwareApplication` and `FAQPage` JSON-LD to landing pages
- **Blog/content marketing:** `/resources` could host articles targeting informational keywords (e.g., "what is a HACCP plan", "14 allergens list EU")
- **Backlink strategy:** Partner with food safety consultancies, trade associations (e.g., RAI, FSAI, FSA)
