# Portuguese Legal and Consumer Compliance Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace PinkPepper's Irish/template legal baseline with a truthful Portugal-based, six-language legal system and align signup, checkout, API access, refunds, and analytics consent with the published commitments.

**Architecture:** Central typed legal configuration and policy content feed shared English and localized renderers. A minimal append-only acceptance table and one server-side requirement resolver control signup, policy-update, and checkout acceptance; protected product APIs share a capability guard. Optional analytics are rendered only from the consent component and can be withdrawn through a persistent settings control.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, next-intl, Supabase/PostgreSQL/RLS, Stripe Checkout, Vitest, browser verification, Tailwind CSS.

**Design reference:** `docs/superpowers/specs/2026-07-18-portuguese-legal-compliance-design.md`

---

## File structure map

### Legal domain

- `src/lib/legal/config.ts` — operator identity, policy versions, effective instants, locales, and official links.
- `src/lib/legal/types.ts` — policy, clause, block, acceptance, and capability types.
- `src/lib/legal/routes.ts` — legal locale parsing and URL construction.
- `src/lib/legal/content.ts` — static policy registry and parity validation.
- `src/content/legal/<policy>/<locale>.ts` — one policy in one language.
- `src/components/legal/LegalPolicyPage.tsx` — shared policy renderer.
- `src/components/legal/LegalHub.tsx` — legal index and operator disclosure.
- `src/components/legal/LegalLanguageSwitcher.tsx` — six-language policy switcher.

### Acceptance domain

- `supabase/migrations/0033_legal_policy_acceptances.sql` — append-only records and RLS.
- `src/lib/legal/requirements.ts` — cohort/effective-date resolver and persistence.
- `src/lib/legal/access.ts` — route inventory and capability guard.
- `src/app/legal/acceptance/page.tsx` — authenticated acceptance screen.
- `src/components/legal/LegalAcceptanceForm.tsx` — acceptance form and retry state.
- `src/app/api/legal/acceptance/route.ts` — idempotent server insert.
- `src/components/legal/PolicyUpdateNotice.tsx` — existing-user notice/gate.

### Product integration

- `src/components/legal/CheckoutLegalDisclosure.tsx` — checkout disclosures and acceptance.
- `src/components/site/CookieBanner.tsx` — optional analytics consent and withdrawal.
- Existing auth, billing, API, chrome, email, sitemap, and metadata files consume legal helpers.
- `docs/legal/vendor-and-policy-claims-audit.md` — reproducible policy evidence.

---

## Chunk 1: Legal foundation and corrected English policies

### Task 1: Add central legal configuration, types, and route helpers

**Files:**
- Create: `src/lib/legal/config.ts`
- Create: `src/lib/legal/types.ts`
- Create: `src/lib/legal/routes.ts`
- Test: `src/__tests__/legal-config.test.ts`

- [ ] **Step 1: Write failing legal configuration tests**

Assert the exact operator identity and dates, six locales, every policy slug, and English/localized URLs. Include `buildLegalPath(terms, en) === /legal/terms` and `buildLegalPath(terms, pt) === /pt/legal/terms`.

Use direct assertions for `LEGAL_OPERATOR`, `LEGAL_LOCALES`, `LEGAL_POLICY_SLUGS`, and route parsing; do not test only prose descriptions.

Assert legal name `João Pedro Reis`, trading name `PinkPepper`, NIF `256709661`, and `Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal` as exact values.

- [ ] **Step 2: Run the test and confirm RED**

Run: `npx vitest run src/__tests__/legal-config.test.ts`

Expected: FAIL because the legal modules do not exist.

- [ ] **Step 3: Implement the minimal typed legal domain**

Use `2026-07-18T00:00:00+01:00` as publication/new-user effective instant, `2026-08-17T00:00:00+01:00` for existing users, and `2026-07-18` for every policy version. Define `LegalLocale`, `LegalPolicySlug`, `LegalClause`, `LegalBlock`, `AcceptanceSource`, and `LegalCapability`. Keep CNPD, ICO, complaints-book, consumer-dispute, and support links in config.

`LegalBlock` is a discriminated union of `paragraph`, `list`, `table`, `callout`, and `link`. `LegalClause` has `id`, `heading`, and `blocks`.

`LegalDocument` has `slug`, `locale`, `title`, `description`, `navigationLabel`, `version`, `publishedLabel`, `effectiveLabel`, and ordered `clauses`. Export literal unions for the six locales/slugs, `AcceptanceSource = signup | policy_update | checkout`, and `LegalCapability = general | checkout`.

`routes.ts` exports `buildLegalPath(policy, locale)`, `buildLegalHubPath(locale)`, `parseLegalPath(pathname)`, `isLegalLocale(value)`, and `getLegalAlternates(policy?)`; the parser returns `null` for unsupported values.

- [ ] **Step 4: Run the test and confirm GREEN**

Run: `npx vitest run src/__tests__/legal-config.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Step 5: Commit exact config, route, and test files**

Run: `git add src/lib/legal/config.ts src/lib/legal/types.ts src/lib/legal/routes.ts src/__tests__/legal-config.test.ts`

Run: `git commit -m 'feat: add central legal configuration'`

### Task 2: Create a reproducible vendor and policy-claims audit

**Files:**
- Create: `docs/legal/vendor-and-policy-claims-audit.md`
- Test: `src/__tests__/legal-claims-audit.test.ts`
- Inspect: `src/app/api/**/route.ts`
- Inspect: `src/lib/ratelimit.ts`
- Inspect: `src/lib/email.ts`
- Inspect: `src/lib/billing/stripe.ts`
- Inspect: `src/lib/rag/embeddings.ts`
- Inspect: `src/components/site/CookieBanner.tsx`
- Inspect: `src/app/layout.tsx`
- Inspect: `supabase/migrations/0014_conversation_retention_purge.sql`

- [ ] **Step 1: Write the failing audit-coverage test**

Require evidence rows for Supabase, Vercel hosting/Analytics/Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Require retention, deletion, security, transfers, training use, and cookies sections.

The test parses every matrix row and requires non-empty `data categories`, `storage/region`, `purpose/role`, `retention/deletion path`, `international transfer mechanism`, `encryption`, `access control`, `logging`, `backups`, `certifications`, `training use`, `repository evidence`, `official source`, `verified on`, `status`, and `policy wording` fields.

- [ ] **Step 2: Run the test and confirm RED**

Run: `npx vitest run src/__tests__/legal-claims-audit.test.ts`

Expected: FAIL because the audit document is absent.

- [ ] **Step 3: Audit repository evidence and current official vendor terms**

Record service/claim, repository evidence, official vendor source, verification date, result (`verified`, `qualified`, or `remove`), controller/processor role, and resulting wording. Never print environment secrets. Use primary vendor documentation for current regions, transfer status, or training commitments.

Inventory account/profile/auth data, customer prompts/files/generated output, billing identifiers, support/review email, operational logs, rate-limit keys, analytics identifiers/cookies, backups, and deletion/retention jobs. Trace each from collection through vendor/storage, access, export, deletion, and backup expiry.

- [ ] **Step 4: Write the evidence document**

Flag facts requiring operator contract/dashboard confirmation. Policies must qualify those facts rather than treating an audit gap as verified.

Add explicit rows for regional hosting, encryption at rest/in transit, staff/vendor access, audit logging, backup retention, subprocessors, SCC/adequacy safeguards, AI training defaults, and certifications. A blank or dashboard-only fact must be `qualified` or `remove`, never `verified`.

- [ ] **Step 5: Run the test and confirm GREEN**

Run: `npx vitest run src/__tests__/legal-claims-audit.test.ts`

Expected: PASS with every required service/category represented.

- [ ] **Step 6: Commit exact audit files and tests**

Run: `git add docs/legal/vendor-and-policy-claims-audit.md src/__tests__/legal-claims-audit.test.ts`

Run: `git commit -m 'docs: audit legal policy claims'`

### Task 3: Add typed English content in three policy-family cycles

**Files:**
- Create: `src/lib/legal/content.ts`
- Create: `src/content/legal/hub/en.ts`
- Create: `src/content/legal/terms/en.ts`
- Create: `src/content/legal/privacy/en.ts`
- Create: `src/content/legal/cookies/en.ts`
- Create: `src/content/legal/dpa/en.ts`
- Create: `src/content/legal/acceptable-use/en.ts`
- Create: `src/content/legal/refund/en.ts`
- Test: `src/__tests__/legal-content.test.ts`
- Modify: `src/__tests__/terms.test.ts`

- [ ] **Step 1: Write the shared registry test and the Terms/Refund/Hub family tests**

Require stable clause IDs. Terms: operator, service, accounts, acceptable-use, billing, withdrawal, IP, liability, termination, changes, law, disputes, contact. Privacy: controller, data, purposes, lawful-bases, retention, recipients, transfers, AI, rights, security, cookies, complaints, changes. Add equivalent IDs for Cookies, DPA, Acceptable Use, Refund, and Hub.

Assert João/Portuguese law/CNPD/full 14-day initial-purchase refund. Reject Ireland, Irish courts/DPC, the ODR URL, and a processor 72-hour promise.

Also assert the legal name, full address, NIF, support/contact route, CNPD and complaints/ADR links, ICO link plus candid unresolved UK-representative wording, exact initial-subscription refund scope/process/exclusions, and validity of every internal legal link. The hub must not claim Electronic Complaints Book registration.

- [ ] **Step 2: Run the Terms/Refund/Hub tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-content.test.ts src/__tests__/terms.test.ts`

Expected: FAIL only for the missing registry and first policy family.

- [ ] **Step 3: Implement only the registry, Terms, Refund, and Hub modules**

Use explicit static imports. Each module exports `LegalDocument` with current version, date copy, and ordered clauses. Implement the tested identity, Portuguese-law/consumer-rights, refund, complaints, and dispute facts; no placeholder text.

- [ ] **Step 4: Run the first family and confirm GREEN**

Run: `npx vitest run src/__tests__/legal-content.test.ts src/__tests__/terms.test.ts`

Expected: the Terms, Refund, Hub, registry, forbidden-claim, and internal-link cases pass; Privacy/Cookies/DPA/Acceptable Use remain explicitly skipped for the next RED cycles.

- [ ] **Step 5: Enable Privacy/Cookies contract cases and confirm RED**

Run: `npx vitest run src/__tests__/legal-content.test.ts src/__tests__/terms.test.ts`

Expected: FAIL only for missing Privacy/Cookies content, including data categories, lawful bases, retention paths, complete audited vendors, transfers, AI roles, rights, security qualifications, cookies, CNPD/ICO, and change notices.

- [ ] **Step 6: Implement Privacy/Cookies from the evidence matrix and confirm GREEN**

Qualify dashboard/contract facts exactly as the audit requires; state the unresolved UK representative position candidly. Run the same focused command and expect the new family to pass.

- [ ] **Step 7: Enable DPA/Acceptable-Use cases and confirm RED**

Require every GDPR Article 28 term, subprocessor/transfer/security/return-or-delete/audit language, controller/processor role separation, countersignature route, and detailed prohibited-use categories.

Run the focused content tests and expect failure only for DPA/Acceptable Use. The DPA test rejects any processor breach promise of `72 hours` and requires `without undue delay`.

- [ ] **Step 8: Implement DPA/Acceptable Use and confirm GREEN**

Cover controller-instructed content, Article 28 duties, incorporation through Terms, and email countersignature. Run both focused suites; expect every English policy and internal link to pass.

- [ ] **Step 9: Run typecheck**

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Step 10: Commit**

Run: `git add src/lib/legal/content.ts src/content/legal/hub/en.ts src/content/legal/terms/en.ts src/content/legal/privacy/en.ts src/content/legal/cookies/en.ts src/content/legal/dpa/en.ts src/content/legal/acceptable-use/en.ts src/content/legal/refund/en.ts src/__tests__/legal-content.test.ts src/__tests__/terms.test.ts`

Run: `git commit -m 'feat: add corrected English legal content'`

### Task 4: Render English legal pages from shared content

**Files:**
- Create: `src/components/legal/LegalPolicyPage.tsx`
- Create: `src/components/legal/LegalHub.tsx`
- Modify: `src/app/legal/page.tsx`
- Modify: `src/app/legal/terms/page.tsx`
- Modify: `src/app/legal/privacy/page.tsx`
- Modify: `src/app/legal/cookies/page.tsx`
- Modify: `src/app/legal/dpa/page.tsx`
- Modify: `src/app/legal/acceptable-use/page.tsx`
- Modify: `src/app/legal/refund/page.tsx`
- Modify: `src/app/legal/layout.tsx`
- Test: `src/__tests__/legal-rendering.test.tsx`
- Test: `src/__tests__/legal-metadata.test.ts`

- [ ] **Step 1: Write failing block-renderer tests**

Assert semantic rendering for every block variant, one `h1`, ordered clause `h2` IDs, safe links, dates, version, and navigation.

- [ ] **Step 2: Run the tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-rendering.test.tsx`

Expected: FAIL because `LegalPolicyPage` does not exist.

- [ ] **Step 3: Implement `LegalPolicyPage` only and confirm GREEN**

Implement the tested discriminated-block switch, headings, dates, version, and navigation. Run `legal-rendering.test.tsx`; expect PASS.

- [ ] **Step 4: Add a failing Hub test, implement it, and confirm GREEN**

Require all policies/versions, legal name/trading name/NIF/address/contact, CNPD, Electronic Complaints Book, and applicable ADR resources. Reject any completed-registration claim. Implement `LegalHub`, run `legal-rendering.test.tsx`, and expect PASS.

- [ ] **Step 5: Add failing metadata/route tests, then convert the seven English routes**

In `legal-metadata.test.ts`, require exact canonical/indexability choices and thin route delegation. Convert the hub then one policy route at a time, rerunning the focused test after each; no route may embed policy prose.

- [ ] **Step 6: Run focused regressions and typecheck**

Run: `npx vitest run src/__tests__/legal-rendering.test.tsx src/__tests__/legal-content.test.ts src/__tests__/legal-metadata.test.ts src/__tests__/seo-surface.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Step 7: Typecheck, then commit exact renderer, route, and test files**

Run: `npm run typecheck`

Expected: exit 0.

Run: `git add src/components/legal/LegalPolicyPage.tsx src/components/legal/LegalHub.tsx src/app/legal/page.tsx src/app/legal/terms/page.tsx src/app/legal/privacy/page.tsx src/app/legal/cookies/page.tsx src/app/legal/dpa/page.tsx src/app/legal/acceptable-use/page.tsx src/app/legal/refund/page.tsx src/app/legal/layout.tsx src/__tests__/legal-rendering.test.tsx src/__tests__/legal-metadata.test.ts`

Run: `git commit -m 'refactor: render legal pages from shared content'`

## Chunk 2: Six-language content, routes, chrome, and links

### Task 5: Add full FR/DE/ES/IT/PT policy modules

**Files:**
- Create: `src/content/legal/{hub,terms,privacy,cookies,dpa,acceptable-use,refund}/{fr,de,es,it,pt}.ts`
- Modify: `src/lib/legal/content.ts`
- Test: `src/__tests__/legal-localization.test.ts`

- [ ] **Step 1: Write failing translation-parity tests**

For every policy and locale, require the English clause IDs in the same order, localized title/navigation/date labels, non-empty blocks, current version, and no English-only fallback marker. Assert key localized Portugal terms: `direito português`, `droit portugais`, `portugiesischem Recht`, `legge portoghese`, and `Derecho portugués`.

For every locale, assert operator/NIF/address, Portuguese law, CNPD/complaints/ADR, full 14-day initial-subscription refund, complete audited vendor names, Article 28 DPA anchors, UK-representative caveat, and valid localized internal links. Reject Ireland/DPC/Irish courts, ODR, processor `72 hours`, and any complaints-book registration claim in all modules.

- [ ] **Step 2: Run the tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-localization.test.ts`

Expected: FAIL because five locale sets are absent.

- [ ] **Step 3: Add Hub and Terms for all five locales; rerun and isolate remaining failures**

Create complete, meaning-equivalent modules with stable IDs and localized legal links. Expect only the five unimplemented policy families to remain failing.

- [ ] **Step 4: Add Privacy and Cookies for all five locales; rerun**

Run: `npx vitest run src/__tests__/legal-localization.test.ts`

Expected: only DPA, Acceptable Use, and Refund remain failing.

- [ ] **Step 5: Add DPA for all five locales; rerun**

Expected: DPA clause/Article 28/forbidden-claim cases pass.

- [ ] **Step 6: Add Acceptable Use and Refund one family at a time; rerun after each**

Expected: the complete six-language suite passes with no fallback markers or broken links.

- [ ] **Step 7: Typecheck, then commit exact content and localization test files**

Run: `npm run typecheck`

Expected: exit 0.

Run: `git add src/content/legal/hub/fr.ts src/content/legal/hub/de.ts src/content/legal/hub/es.ts src/content/legal/hub/it.ts src/content/legal/hub/pt.ts src/content/legal/terms/fr.ts src/content/legal/terms/de.ts src/content/legal/terms/es.ts src/content/legal/terms/it.ts src/content/legal/terms/pt.ts src/content/legal/privacy/fr.ts src/content/legal/privacy/de.ts src/content/legal/privacy/es.ts src/content/legal/privacy/it.ts src/content/legal/privacy/pt.ts src/content/legal/cookies/fr.ts src/content/legal/cookies/de.ts src/content/legal/cookies/es.ts src/content/legal/cookies/it.ts src/content/legal/cookies/pt.ts src/content/legal/dpa/fr.ts src/content/legal/dpa/de.ts src/content/legal/dpa/es.ts src/content/legal/dpa/it.ts src/content/legal/dpa/pt.ts src/content/legal/acceptable-use/fr.ts src/content/legal/acceptable-use/de.ts src/content/legal/acceptable-use/es.ts src/content/legal/acceptable-use/it.ts src/content/legal/acceptable-use/pt.ts src/content/legal/refund/fr.ts src/content/legal/refund/de.ts src/content/legal/refund/es.ts src/content/legal/refund/it.ts src/content/legal/refund/pt.ts src/lib/legal/content.ts src/__tests__/legal-localization.test.ts`

Run: `git commit -m 'feat: localize legal policies in six languages'`

### Task 6: Add localized legal routes and metadata

**Files:**
- Create: `src/app/[locale]/legal/page.tsx`
- Create: `src/app/[locale]/legal/[policy]/page.tsx`
- Create: `src/app/[locale]/legal/layout.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/proxy.ts`
- Modify: `src/components/site/RouteChrome.tsx`
- Modify: `src/lib/google-analytics.ts`
- Modify: `src/app/sitemap.ts`
- Test: `src/__tests__/localized-legal-routes.test.ts`
- Test: `src/__tests__/google-analytics.test.ts`

- [ ] **Step 1: Write failing localized-route tests**

Require `/fr|de|es|it|pt/legal` and each policy route, self-canonical metadata, six `hreflang` values plus `x-default`, `/en/legal/...` redirect preservation, 404 for unsupported locales/slugs, legal chrome selection, and no analytics on any legal locale.

Assert `/es/about` and `/it/pricing` remain 404. Assert `/en/legal/refund?from=billing` returns permanent 308 to `/legal/refund?from=billing`, preserving slug and query exactly.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/localized-legal-routes.test.ts src/__tests__/google-analytics.test.ts`

Expected: FAIL because localized legal routes and matching logic are absent.

- [ ] **Step 3: Implement routing without launching ES/IT marketing pages**

Let the parent `[locale]` layout accept all six configured locales. Keep each marketing wrapper's existing `isPublicLocale` check so `/es/about` and `/it/pricing` remain 404. Generate localized legal params from `LEGAL_LOCALES`; update proxy locale headers and route-chrome matching for prefixed legal paths.

- [ ] **Step 4: Implement metadata and sitemap policy**

Terms, Privacy, and Hub keep intended indexability; DPA, Refund, Cookies, and Acceptable Use retain `noindex`. Emit only indexable URLs in sitemap and exclude all legal paths from optional analytics.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `npx vitest run src/__tests__/localized-legal-routes.test.ts src/__tests__/google-analytics.test.ts src/__tests__/seo-surface.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit exact localized route files and tests**

Run: `git add src/app/[locale]/layout.tsx src/app/[locale]/legal src/proxy.ts src/components/site/RouteChrome.tsx src/lib/google-analytics.ts src/app/sitemap.ts src/__tests__/localized-legal-routes.test.ts src/__tests__/google-analytics.test.ts`

Run: `git commit -m 'feat: add localized legal routes'`

### Task 7: Localize legal chrome, product links, and bounded email links

**Files:**
- Modify: `src/components/site/chrome.tsx`
- Modify: `src/components/site/CookieBanner.tsx`
- Modify: `src/app/signup/SignupForm.tsx`
- Modify: `src/app/security/page.tsx`
- Modify: `src/lib/public-routes.ts`
- Modify: `src/lib/email-wrapper.ts`
- Modify: `src/lib/auth-emails.ts`
- Modify: `src/app/api/auth/welcome/route.ts`
- Modify: `src/lib/review-emails.ts`
- Modify: `src/lib/billing/email-templates.ts`
- Verify: `src/lib/supabase-auth-templates/*.html`
- Test: `src/__tests__/legal-link-localization.test.ts`
- Test: `src/__tests__/public-localization.test.ts`

- [ ] **Step 1: Write failing link-localization tests**

Assert legal header/footer navigation stays in the current legal locale; signup, cookie, security, and public footer links use localized legal URLs; operator disclosure is visible; app-generated emails use a supported account/profile locale and English fallback. Assert static Supabase templates intentionally retain canonical English links.

Assert the language switcher preserves the current hub/policy slug across all six destinations and every hub/cross-policy link stays localized. The unprefixed security page uses only a validated `NEXT_LOCALE` cookie, falling back to English.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-link-localization.test.ts src/__tests__/public-localization.test.ts`

Expected: FAIL because current helpers return English legal paths.

- [ ] **Step 3: Implement focused legal link helpers**

Use `buildLegalPath` for legal routes rather than expanding Spanish/Italian marketing locales. Pass the current legal locale into `LegalSiteHeader` and `LegalSiteFooter`. Add concise footer text naming João Pedro Reis trading as PinkPepper and link the full hub.

Render `LegalLanguageSwitcher` only now that every destination exists; its `{ locale, policy? }` props preserve the current hub/policy through shared route builders.

- [ ] **Step 4: Bound email behavior**

Add optional supported locale input to app-generated wrapper/auth email links. Unsupported/missing values use English. Do not translate full email bodies or try to add recipient-specific logic to static Supabase HTML templates.

Thread stored profile/account locale through welcome, review, billing, and auth-email production call sites; test builder invocations, not only helper output.

- [ ] **Step 5: Run tests and typecheck**

Run: `npx vitest run src/__tests__/legal-link-localization.test.ts src/__tests__/public-localization.test.ts src/__tests__/signup-surface.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit**

Stage only the named Task 7 components, pages, email builders/call sites, `legal-link-localization.test.ts`, and `public-localization.test.ts`; do not stage directory globs.

Run: `git commit -m 'feat: localize legal links and disclosures'`

## Chunk 3: Versioned acceptance, resolver, and authentication flow

### Task 8: Add the append-only acceptance table and types

**Files:**
- Create: `supabase/migrations/0033_legal_policy_acceptances.sql`
- Modify: `src/types/database.types.ts`
- Test: `src/__tests__/legal-acceptance-migration.test.ts`
- Test: `src/__tests__/database-types.test.ts`

- [ ] **Step 1: Write failing migration-contract tests**

Require non-null `user_id`, three version columns, `locale`, `source`, and server-default `accepted_at`; foreign key cascade; source/locale checks; uniqueness across user + versions + source; RLS; own-row SELECT only; and no client INSERT/UPDATE/DELETE policy.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-acceptance-migration.test.ts src/__tests__/database-types.test.ts`

Expected: FAIL because migration/table types are absent.

- [ ] **Step 3: Implement migration and generated-type equivalent**

Use an identity primary key and exact constraint:

```sql
unique (user_id, terms_version, privacy_version, refund_version, source)
```

Allow only `signup`, `policy_update`, and `checkout`; allow only the six legal locales. Enable RLS and create `legal_acceptances_select_own` using `auth.uid() = user_id`. Server inserts use the service-role admin client.

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `npx vitest run src/__tests__/legal-acceptance-migration.test.ts src/__tests__/database-types.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add supabase/migrations/0033_legal_policy_acceptances.sql src/types/database.types.ts src/__tests__/legal-acceptance-migration.test.ts src/__tests__/database-types.test.ts`

Run: `git commit -m 'feat: store versioned legal acceptances'`

### Task 9: Implement the shared requirements resolver and route inventory

**Files:**
- Create: `src/lib/legal/requirements.ts`
- Create: `src/lib/legal/access.ts`
- Test: `src/__tests__/legal-requirements.test.ts`
- Test: `src/__tests__/legal-access-inventory.test.ts`

- [ ] **Step 1: Write failing resolver boundary tests**

Cover instants immediately before/at publication and existing-user effectiveness in UTC. New accounts (`created_at >= 2026-07-17T23:00:00Z`) require acceptance immediately. Existing accounts see a notice before `2026-08-16T23:00:00Z` and a gate at that instant. Any current source satisfies general access; checkout additionally needs `source=checkout`.

- [ ] **Step 2: Write failing access-inventory tests**

Protected: chat/stream, audit/stream, chat/transcribe, chat image route, document upload, DOCX/PDF generation, review submission/contact, paid template download, and billing checkout. Exempt: legal/auth, acceptance, read-only conversations/documents, existing file download, profile/account deletion, billing portal/status/reconcile, support, admin, cron, and webhooks.

- [ ] **Step 3: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-requirements.test.ts src/__tests__/legal-access-inventory.test.ts`

Expected: FAIL because resolver and inventory do not exist.

- [ ] **Step 4: Implement the authoritative pure resolver contract**

Return `{ cohort, phase: new_user_gate | existing_notice | existing_gate | accepted, requiredVersions: { terms, privacy, refund }, publishedAt, existingEffectiveAt, hasCurrentGeneralAcceptance, hasCurrentCheckoutAcceptance, mustBlock }`. Parse configured timestamps once; no consumer reconstructs versions or effective-date state.

- [ ] **Step 5: Implement and test the DB adapter**

Query only rows matching all three current versions. Test general-source aggregation, checkout-source filtering, empty results, database errors, and fail-closed behavior.

- [ ] **Step 6: Implement capability guard contract**

`requireLegalCapability` accepts authenticated user ID, Supabase/admin dependency, capability, and optional `now`; it returns success or a structured 428 response with `code: LEGAL_ACCEPTANCE_REQUIRED` and acceptance URL. Keep route inventory exported for tests.

- [ ] **Step 7: Run tests and confirm GREEN**

Run: `npx vitest run src/__tests__/legal-requirements.test.ts src/__tests__/legal-access-inventory.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

Run: `git add src/lib/legal/requirements.ts src/lib/legal/access.ts src/__tests__/legal-requirements.test.ts src/__tests__/legal-access-inventory.test.ts`

Run: `git commit -m 'feat: resolve legal acceptance requirements'`

### Task 10: Add acceptance UI/API and integrate auth callbacks

**Files:**
- Create: `src/app/legal/acceptance/page.tsx`
- Create: `src/components/legal/LegalAcceptanceForm.tsx`
- Create: `src/app/api/legal/acceptance/route.ts`
- Create: `src/components/legal/PolicyUpdateNotice.tsx`
- Modify: `src/app/auth/callback/route.ts`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/proxy.ts`
- Test: `src/__tests__/legal-acceptance-route.test.ts`
- Modify: `src/__tests__/auth-callback.test.ts`
- Test: `src/__tests__/policy-update-notice.test.tsx`

- [ ] **Step 1: Write failing API and UI tests**

Assert unauthenticated rejection, same-origin CSRF, unchecked control, server-owned versions, locale validation, service-role INSERT, exact-unique-conflict idempotence, all other DB errors, retry UI, and safe redirect validation. Marketing consent remains independent.

Require localized Terms/Privacy/Refund links and the exact meaning: the user agrees to Terms and acknowledges Privacy and Refund. The request carries only acknowledgement, supported locale, and safe return target.

- [ ] **Step 2: Extend callback tests for cohorts**

New users without acceptance redirect to `/legal/acceptance`; existing users before the effective instant reach their destination with a notice; existing users at/after it redirect to acceptance. Preserve session cookies, cross-device OTP fallback, profile completion, and welcome-email behavior.

- [ ] **Step 3: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-acceptance-route.test.ts src/__tests__/auth-callback.test.ts src/__tests__/policy-update-notice.test.tsx`

Expected: FAIL because acceptance surfaces and callback resolution are absent.

- [ ] **Step 4: Implement acceptance page and route**

The public URL checks authentication server-side and redirects unauthenticated users to localized login. POST reads no client versions, INSERTs current versions with resolver-selected `signup` or `policy_update`, and returns the validated in-app destination. Treat only the named acceptance uniqueness constraint violation as success; never update `locale` or `accepted_at`.

- [ ] **Step 5: Integrate callback and dashboard notice**

Call the shared resolver after authentication/profile lookup. Keep the notice non-blocking before the existing-user effective instant. After it, show the gate while leaving legal, cancellation, account deletion, and support access visible.

The localized notice renders publication date, existing-user effective date, concise change summary, and Terms/Privacy/Refund links. Preserve auth/signout, read-only conversations/documents, owned-file downloads, account/profile settings, billing portal/status/reconcile, privacy exports/rights, deletion, legal/acceptance, and support; block only inventoried paid/generative capabilities.

- [ ] **Step 6: Run tests and typecheck**

Run: `npx vitest run src/__tests__/legal-acceptance-route.test.ts src/__tests__/auth-callback.test.ts src/__tests__/auth-callback-route.test.ts src/__tests__/policy-update-notice.test.tsx src/__tests__/auth-flow-surface.test.ts src/__tests__/proxy-onboarding-gate.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Step 7: Commit**

Run: `git add src/app/legal/acceptance/page.tsx src/components/legal/LegalAcceptanceForm.tsx src/app/api/legal/acceptance/route.ts src/components/legal/PolicyUpdateNotice.tsx src/app/auth/callback/route.ts src/app/dashboard/page.tsx src/proxy.ts src/__tests__/legal-acceptance-route.test.ts src/__tests__/auth-callback.test.ts src/__tests__/policy-update-notice.test.tsx src/__tests__/auth-callback-route.test.ts src/__tests__/auth-flow-surface.test.ts src/__tests__/proxy-onboarding-gate.test.ts`

Stage only those named files; do not stage `src/__tests__` as a directory.

Run: `git commit -m 'feat: require versioned legal acceptance'`

## Chunk 4: Checkout, protected APIs, analytics withdrawal, and release verification

### Task 11: Add checkout disclosures and checkout-source acceptance

**Files:**
- Create: `src/components/legal/CheckoutLegalDisclosure.tsx`
- Modify: `src/components/pricing/PricingActions.tsx`
- Modify: `src/components/dashboard/UpgradeModal.tsx`
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/fr.json`
- Modify: `src/i18n/messages/de.json`
- Modify: `src/i18n/messages/es.json`
- Modify: `src/i18n/messages/it.json`
- Modify: `src/i18n/messages/pt.json`
- Modify: `src/app/api/billing/checkout/route.ts`
- Modify: `src/__tests__/billing-routes.test.ts`
- Modify: `src/__tests__/pricing-billing-ui.test.ts`

- [ ] **Step 1: Write failing checkout disclosure tests**

Require selected plan/interval, recurring billing, VAT, cancellation timing, 14-day initial consumer refund, localized Terms/Privacy/Refund links, and an initially unchecked required control on both pricing and upgrade surfaces.

Use `CheckoutLegalDisclosureProps { locale, plan, interval, accepted, onAcceptedChange }`. Pricing supplies validated route locale; dashboard supplies supported profile locale with English fallback. Add every disclosure string to all six message catalogs.

- [ ] **Step 2: Write failing server tests**

Reject missing/false legal acknowledgement with 428 before Stripe/customer creation. Ignore client version values, persist current non-null versions with `source=checkout`, treat uniqueness conflict as success, and abort Stripe creation on any other persistence failure. Billing portal remains exempt.

Request is `{ plan, interval, legalAccepted: true }`; no locale/version fields are trusted. Structured failure is `{ code: LEGAL_CHECKOUT_ACCEPTANCE_REQUIRED, acceptanceUrl }` with 428. Locale comes from the authenticated supported profile locale or English fallback.

- [ ] **Step 3: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/billing-routes.test.ts src/__tests__/pricing-billing-ui.test.ts`

Expected: FAIL because checkout has no disclosure or acceptance record.

- [ ] **Step 4: Implement the shared UI only and confirm its test GREEN**

Both UI launchers reuse the typed component and remain disabled until checked. Rerun `pricing-billing-ui.test.ts`; expect PASS while server cases remain RED.

- [ ] **Step 5: Implement server enforcement through the shared resolver**

Call `resolveLegalRequirements`, INSERT the current checkout tuple, treat only the named uniqueness conflict as success, and verify a current checkout-source tuple before any Stripe/customer side effect. Never upsert or mutate evidence.

- [ ] **Step 6: Run tests and confirm GREEN**

Run: `npx vitest run src/__tests__/billing-routes.test.ts src/__tests__/pricing-billing-ui.test.ts src/__tests__/seo-surface.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

Stage the named component, two launchers, checkout route, six message catalogs, `billing-routes.test.ts`, and `pricing-billing-ui.test.ts` only.

Run: `git commit -m 'feat: collect checkout legal acceptance'`

### Task 12: Enforce acceptance on paid/generative API boundaries

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Guarded image branch: `POST src/app/api/chat/route.ts` multipart/form-data image-analysis path; no separate chat-image route exists in the current API tree.
- Modify: `src/app/api/chat/stream/route.ts`
- Modify: `src/app/api/chat/transcribe/route.ts`
- Modify: `src/app/api/audit/stream/route.ts`
- Modify: `src/app/api/documents/upload/route.ts`
- Modify: `src/app/api/export/docx/route.ts`
- Modify: `src/app/api/export/pdf/route.ts`
- Modify: `src/app/api/reviews/route.ts`
- Modify: `src/app/api/review-contact/route.ts`
- Modify: `src/app/api/templates/[slug]/download/route.ts`
- Test: `src/__tests__/legal-api-guard.test.ts`
- Modify: `src/__tests__/legal-access-inventory.test.ts`

- [ ] **Step 1: Write failing guard-integration tests**

For every protected route, assert the shared capability guard runs after authentication but before model calls, uploads, quota writes, review creation, document generation, or paid download. Assert the route returns structured 428 when blocked. Assert every exact exempt route-method listed below does not import the guard.

Inventory protected methods explicitly: `POST /api/chat` including the multipart image-analysis branch, `POST /api/chat/stream`, `POST /api/chat/transcribe`, `POST /api/audit/stream`, `POST /api/documents/upload`, `POST /api/export/docx`, `POST /api/export/pdf`, `POST /api/reviews`, `POST /api/review-contact`, `POST /api/billing/checkout`, and `GET /api/templates/[slug]/download`. Map checkout only to `checkout`; all others to `general`.

Inventory exempt methods explicitly and make the test fail if any imports the guard:

`PATCH /api/profile`, `DELETE /api/account/delete`, `GET /api/billing/status`, `POST /api/billing/portal`, `POST /api/billing/reconcile`, `POST /api/auth/signout`, `POST /api/auth/welcome`, `GET /api/chat/conversations`, `DELETE /api/chat/conversations/[id]`, `PATCH /api/chat/conversations/[id]`, `GET /api/chat/conversations/[id]/messages`, `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/[id]`, `DELETE /api/projects/[id]`, `GET /api/reviews`, `GET /api/reviews/[id]/file`, `GET /api/admin/reviews`, `PATCH /api/admin/reviews/[id]`, `GET /api/cron/sync-regulations`, `GET /api/cron/sync-regulations/health`, `GET /api/cron/indexnow`, `POST /api/webhooks/resend`, and `POST /api/webhook/stripe`.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/legal-api-guard.test.ts src/__tests__/legal-access-inventory.test.ts`

Expected: FAIL because feature routes do not enforce acceptance.

- [ ] **Step 3: Add the guard with minimal route-specific code**

Reuse each route's authenticated user and Supabase client. Map chat/transcription/audit/document/review/download capabilities explicitly. Do not guard the exact exempt route-method inventory from Step 1.

Runtime tests mock auth, guard, and first side effect, then compare invocation order. For a blocked guard, assert every model/upload/quota/write/generation/download mock has zero calls. Add focused success/blocked regressions for upload, PDF, reviews, transcription, template download, and billing checkout.

- [ ] **Step 4: Run guard and feature regressions**

Run: `npx vitest run src/__tests__/legal-api-guard.test.ts src/__tests__/legal-access-inventory.test.ts src/__tests__/chatbot-surface.test.ts src/__tests__/audit-usage-policy.test.ts src/__tests__/docx-export-route.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/app/api/chat/route.ts src/app/api/chat/stream/route.ts src/app/api/chat/transcribe/route.ts src/app/api/audit/stream/route.ts src/app/api/documents/upload/route.ts src/app/api/export/docx/route.ts src/app/api/export/pdf/route.ts src/app/api/reviews/route.ts src/app/api/review-contact/route.ts src/app/api/templates/[slug]/download/route.ts src/app/api/billing/checkout/route.ts src/__tests__/legal-api-guard.test.ts src/__tests__/legal-access-inventory.test.ts`

Run: `git commit -m 'feat: enforce legal acceptance on paid APIs'`

### Task 13: Make optional analytics consent reversible

**Files:**
- Modify: `src/components/site/CookieBanner.tsx`
- Create: `src/components/site/CookieSettingsButton.tsx`
- Modify: `src/components/site/chrome.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/content/legal/cookies/en.ts`
- Modify: `src/content/legal/cookies/fr.ts`
- Modify: `src/content/legal/cookies/de.ts`
- Modify: `src/content/legal/cookies/es.ts`
- Modify: `src/content/legal/cookies/it.ts`
- Modify: `src/content/legal/cookies/pt.ts`
- Modify: `src/__tests__/cookie-banner-and-homepage.test.ts`
- Modify: `src/__tests__/google-analytics.test.ts`

- [ ] **Step 1: Write failing consent lifecycle tests**

Assert Google Analytics, Vercel Analytics, and Speed Insights render only after `accepted`; essential-only renders none; a persistent settings button reopens choices; withdrawal saves `essential`, sends Google consent-denied when present, expires visible `_ga`/`_ga_*` first-party cookies, and requests one reload.

Even when accepted, assert all three telemetry providers stay absent on `/legal/*` and `/{locale}/legal/*`. `CookieBanner` receives normalized pathname and calls shared `shouldLoadOptionalAnalytics(pathname)`; no provider has independent eligibility logic.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npx vitest run src/__tests__/cookie-banner-and-homepage.test.ts src/__tests__/google-analytics.test.ts`

Expected: FAIL because Speed Insights is unconditional and settings cannot reopen.

- [ ] **Step 3: Consolidate optional telemetry under CookieBanner**

Move `<SpeedInsights />` from root layout into the accepted branch beside Vercel Analytics and optional GA. Expose a small event-driven `CookieSettingsButton` in the footer. Keep `pp-cookie-consent` for one year and use `essential` to record withdrawal.

Use one browser event constant `pp:cookie-settings-open`; the button dispatches it and the banner listener reopens choices without changing consent. Render the button in both normal and legal footers through `chrome.tsx`.

- [ ] **Step 4: Implement exact withdrawal cleanup**

Call `gtag('consent', 'update', { analytics_storage: 'denied' })` when available; expire `_ga` and every visible `_ga_*` cookie for `/`; then reload once so analytics components unmount. Document that third-party-domain cookies cannot be removed by PinkPepper.

Add a narrow `Window.gtag` declaration, a pure visible-cookie-name parser, and a ref/state reload guard. Test repeated withdrawal/click events produce one save, cleanup pass, and reload.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `npx vitest run src/__tests__/cookie-banner-and-homepage.test.ts src/__tests__/google-analytics.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Run: `git add src/components/site/CookieBanner.tsx src/components/site/CookieSettingsButton.tsx src/components/site/chrome.tsx src/app/layout.tsx src/content/legal/cookies/en.ts src/content/legal/cookies/fr.ts src/content/legal/cookies/de.ts src/content/legal/cookies/es.ts src/content/legal/cookies/it.ts src/content/legal/cookies/pt.ts src/__tests__/cookie-banner-and-homepage.test.ts src/__tests__/google-analytics.test.ts`

Stage only those named consent files.

Run: `git commit -m 'feat: support analytics consent withdrawal'`

### Task 14: Reconcile adjacent claims and complete release verification

**Files:**
- Modify: `src/app/security/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/site/chrome.tsx`
- Create: `docs/legal/production-compliance-checklist.md`
- Test: `src/__tests__/legal-release.test.ts`

- [ ] **Step 1: Write a failing release-contract test**

Search user-facing source for Irish law/courts/DPC, obsolete ODR URL, processor 72-hour text, brand-only operator identity, unqualified unsupported encryption/region/certification claims, and unconditional Speed Insights. Require Portuguese operator disclosure and complaints/UK-risk checklist entries.

Scan `src/app`, `src/components`, `src/content`, and `src/lib`, excluding test fixtures. Forbid case-insensitive `Irish law`, `courts of Ireland`, `Data Protection Commission`, `ec.europa.eu/consumers/odr`, and processor/breach text containing `72 hours`. Read `remove`/`qualified` audit rows into exact rejected/required phrase assertions. Test identity only at hub/footer/schema surfaces so legitimate PinkPepper branding elsewhere remains allowed.

- [ ] **Step 2: Run the test and confirm RED**

Run: `npx vitest run src/__tests__/legal-release.test.ts`

Expected: FAIL on remaining old or unverified claims.

- [ ] **Step 3: Reconcile security, schema, and footer copy**

Use the claims audit to remove or qualify unsupported security statements. Update Organization/WebSite schema identity/languages where appropriate. Keep the footer disclosure concise and link the complete operator information.

- [ ] **Step 4: Write the production compliance checklist**

List: qualified Portuguese/UK legal review; professional review of five translations; Electronic Complaints Book registration; applicable Portuguese ADR confirmation; UK representative appointment or written exemption opinion; Stripe production Terms URL/consent configuration; migration deployment; authorized existing-customer notice; and production deployment. State that repository work does not complete these external actions.

The release test requires those exact checklist headings plus explicit unchecked status for complaints-book registration and UK representative, owner, evidence link/location, and completion date columns.

- [ ] **Step 5: Run all automated verification**

Run: `npx vitest run src/__tests__/legal-config.test.ts src/__tests__/legal-claims-audit.test.ts src/__tests__/legal-content.test.ts src/__tests__/legal-localization.test.ts src/__tests__/legal-rendering.test.tsx src/__tests__/localized-legal-routes.test.ts src/__tests__/legal-link-localization.test.ts src/__tests__/legal-acceptance-migration.test.ts src/__tests__/legal-requirements.test.ts src/__tests__/legal-access-inventory.test.ts src/__tests__/legal-acceptance-route.test.ts src/__tests__/policy-update-notice.test.tsx src/__tests__/billing-routes.test.ts src/__tests__/legal-api-guard.test.ts src/__tests__/cookie-banner-and-homepage.test.ts src/__tests__/legal-release.test.ts`

Expected: PASS.

Run: `npx vitest run src/__tests__/pricing-billing-ui.test.ts src/__tests__/google-analytics.test.ts src/__tests__/database-types.test.ts src/__tests__/auth-callback.test.ts src/__tests__/auth-callback-route.test.ts src/__tests__/auth-flow-surface.test.ts src/__tests__/proxy-onboarding-gate.test.ts src/__tests__/seo-surface.test.ts`

Expected: PASS.

Run: `npm test`

Expected: full Vitest suite passes.

Run: `npm run typecheck`

Expected: exit 0.

Run: `npm run lint`

Expected: exit 0.

Run: `npm run build`

Expected: production build succeeds.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 6: Verify in the in-app browser with concrete fixtures**

Start the app with `npm run dev -- --hostname 127.0.0.1 --port 3000`; if port 3000 is taken, use the next free port and record the URL in the verification notes. Use seeded Supabase test users or mocked local auth fixtures for: a new user created after `2026-07-17T23:00:00Z`, an existing user before `2026-08-16T23:00:00Z`, and the same existing user at/after that instant. Control the clock with the existing test harness if present; otherwise inject a server test override only for local verification and remove it before commit.

Browser assertions: hub plus six policies render at `/legal` and `/fr|de|es|it|pt/legal`; every language switcher link lands on the matching policy; tables fit at 390px and desktop widths; keyboard focus reaches language, complaints, CNPD, ADR, UK-risk, refund, and contact links; cookie accept loads optional analytics outside legal pages; cookie withdrawal stores `essential`, removes visible `_ga` cookies, and reloads once; signup acceptance creates a current `signup` row; existing users see notice before the effective instant and a blocking acceptance screen at/after it; checkout shows plan/interval/VAT/refund disclosures and requires the checkbox; protected API fixtures return 428 before acceptance; billing portal, account deletion, support, legal pages, and owned-file download remain reachable. Reset seeded users, acceptance rows, cookies, and local storage after the browser pass.

- [ ] **Step 7: Commit final reconciliation**

Run: `git add src/app/security/page.tsx src/app/layout.tsx src/components/site/chrome.tsx docs/legal/production-compliance-checklist.md src/__tests__/legal-release.test.ts`

Run: `git commit -m 'docs: finalize Portuguese legal compliance baseline'`

---

## Execution notes

- Follow TDD strictly: no implementation before the named failing test exists and has been observed failing for the intended reason.
- Preserve the unrelated untracked `CODEX_HANDOFF.md`.
- Do not send customer email, deploy, register external services, issue refunds, change Stripe production settings, or appoint a representative during repository execution.
- After all tasks pass, use `superpowers:verification-before-completion`, then `superpowers:requesting-code-review`, and finally `superpowers:finishing-a-development-branch`.
