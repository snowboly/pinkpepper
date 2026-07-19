# Portuguese Legal and Consumer Compliance Design

**Status:** Approved design  
**Approved:** 18 July 2026  
**Owner:** João Pedro Reis, trading as PinkPepper

## Summary

PinkPepper's current legal pages use Irish governing law, identify only the brand rather than the contracting person, point EU privacy complaints to Ireland, link to the discontinued EU Online Dispute Resolution platform, and make several product and data-processing promises that are not tied to verified application behaviour. The legal pages are also available only in English even though PinkPepper supports six application languages.

This project will replace that baseline with a Portugal-based legal framework for a Portuguese sole trader, publish a complete and synchronized legal set in English, French, German, Spanish, Italian, and Portuguese, and align signup, checkout, refund, cookie-consent, and policy-acceptance behaviour with the published terms.

The implementation creates a strong operational baseline. It does not replace review by a qualified Portuguese lawyer, UK counsel, or professional legal translators.

## Approved business facts

- Legal operator: **João Pedro Reis**, trading as **PinkPepper**.
- Portuguese tax number (NIF): **256709661**.
- Business address: **Rua Duarte Galvão, 14, r/c dto., 1500-254 Lisboa, Portugal**.
- Contact email: **support@pinkpepper.io**.
- Business form: Portuguese sole trader.
- Customers: both businesses/professionals and private consumers.
- Current state: paid subscriptions are live.
- Intended markets: EU/EEA and UK.
- Legal languages: English (`en`), French (`fr`), German (`de`), Spanish (`es`), Italian (`it`), and Portuguese (`pt`).
- Consumer withdrawal policy: a full refund for an EU/UK private consumer who withdraws within 14 days of the initial subscription purchase.
- Governing law: Portuguese law, subject to mandatory rights and jurisdiction rules that protect consumers in their country of residence.
- Published instant: 18 July 2026 at 00:00 Europe/Lisbon (`2026-07-18T00:00:00+01:00`).
- Effective instant for new users: the published instant.
- Effective instant for existing users: 17 August 2026 at 00:00 Europe/Lisbon (`2026-08-17T00:00:00+01:00`).

All database and resolver comparisons parse these ISO instants and compare them in UTC. A new user is an account whose `created_at` is at or after the published instant; an existing user is an account created before it.

## Goals

1. Correct the operator identity, governing law, regulator, consumer-dispute, and withdrawal information.
2. Make every policy factually consistent with the application and vendor relationships.
3. Provide full, structurally equivalent legal policies in all six configured languages.
4. Make policy acceptance explicit, versioned, minimal, and auditable across signup and checkout.
5. Give users an equally easy way to withdraw optional analytics consent.
6. Prevent future translation drift and reintroduction of obsolete or false claims through automated tests.
7. Preserve mandatory EU/EEA and UK consumer and data-protection rights rather than attempting to contract around them.

## Non-goals

- Sending notices or emails to live customers.
- Deploying the changes to production.
- Registering João with the Portuguese Electronic Complaints Book on his behalf.
- Selecting, contracting, or appointing a UK GDPR representative.
- Providing a legal opinion that the UK GDPR representative exemption applies.
- Certifying security controls, vendor locations, transfer mechanisms, or retention behaviour that cannot be verified from implementation and current contracts.
- Translating the rest of the public marketing site into Spanish or Italian.

## Current issues to correct

The implementation must correct the following known defects:

- The Terms and DPA select Irish law and Irish courts without an Irish establishment or other identified connection.
- The Privacy Policy directs EU complaints to Ireland's Data Protection Commission instead of Portugal's Comissão Nacional de Proteção de Dados (CNPD).
- The Terms link to the EU ODR platform, which stopped accepting complaints on 20 March 2025 and was discontinued on 20 July 2025.
- The legal operator is described only as `PinkPepper.io`, which is a brand/domain rather than the contracting natural person.
- The DPA promises processor breach notification within 72 hours. Under Article 33(2) GDPR, the processor's duty is to notify the controller without undue delay; the 72-hour supervisory-authority deadline applies to controllers under Article 33(1).
- The DPA mixes customer-instructed processing with account, payment, and service-administration processing for which João acts as controller.
- The Refund Policy says the checkout obtains an express request for immediate performance and an acknowledgement of withdrawal-right loss, but the application does not collect either statement.
- Signup relies on passive text rather than explicit, versioned acceptance, and acceptance is not recorded.
- The cookie banner has accept/essential choices but no equally accessible post-dismissal control for changing or withdrawing analytics consent.
- Legal links are not currently localized by `getPublicPageHref`, and localized legal routes do not exist.
- The processor list omits services visible in the application, including rate-limiting, analytics, and optional Google sign-in, while some location, encryption, executed-DPA, and transfer statements are stronger than the repository can prove.
- Retention and deletion periods are stated as operational facts without automated tests proving those schedules run.

## External compliance constraints

### Portuguese Electronic Complaints Book

Because PinkPepper is already accepting private consumer subscriptions, João must register as an operator with the Portuguese Electronic Complaints Book. The site will expose the official complaints-book link and consumer-dispute information, but code cannot make an unregistered operator appear in that system. The implementation must not state that registration is complete.

### UK GDPR representative

PinkPepper is established outside the UK and actively targets UK customers. ICO guidance says a non-UK operator offering goods or services to individuals in the UK normally must appoint a UK representative unless processing is only occasional, low-risk, and does not involve large-scale special-category or criminal-offence data. João has not appointed a representative and has directed that UK targeting remain in place.

The legal copy must therefore:

- say that UK GDPR applies **where applicable**;
- give UK users João's direct privacy contact and their right to complain to the ICO;
- avoid claiming that a UK representative has been appointed or that PinkPepper has fully resolved Article 27; and
- carry the representative appointment or a written legal assessment of the exemption as a release risk in the handoff.

No policy wording is to be presented as curing this external gap.

## Legal sources

The content will be based on current primary or official sources, including:

- [GDPR, including Articles 13, 14, 28, 32, and 33](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Rome I Regulation, including Articles 3 and 6](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R0593)
- [Consumer Rights Directive 2011/83/EU](https://eur-lex.europa.eu/eli/dir/2011/83/oj)
- [Regulation (EU) 2024/3228 discontinuing the EU ODR platform](https://eur-lex.europa.eu/eli/reg/2024/3228/oj)
- [Portuguese Decree-Law 7/2004 on information-society service-provider disclosures](https://files.dre.pt/1s/2004/01/005a00/00700078.pdf)
- [Portuguese Law 144/2015 on alternative consumer dispute resolution](https://diariodarepublica.pt/dr/detalhe/lei/144-2015-70215248)
- [Portuguese Electronic Complaints Book](https://www.livroreclamacoes.pt/Inicio/)
- [Portuguese CNPD](https://www.cnpd.pt/)
- [UK Consumer Contracts Regulations 2013](https://www.legislation.gov.uk/uksi/2013/3134/contents)
- [ICO guidance on UK representatives for non-UK operators](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/receiving-personal-information-from-the-eea/)

## Architecture

### 1. Central legal configuration

A server-safe legal configuration module will be the only source for:

- operator name and trading name;
- NIF and formatted business address;
- contact email;
- publication and effective dates;
- policy version identifiers;
- supported legal locales;
- regulator, consumer-dispute, and official complaints links; and
- English and localized legal route construction.

Policy pages, the footer, signup, checkout, emails, and tests will import this configuration rather than duplicating identity or version strings.

### 2. Typed policy content

Legal content will use a typed block model that supports headings, paragraphs, lists, callouts, links, and tables without embedding page layout inside every translation. Each policy is a separate unit with one content file per locale:

```text
src/content/legal/
  terms/{en,fr,de,es,it,pt}.ts
  privacy/{en,fr,de,es,it,pt}.ts
  cookies/{en,fr,de,es,it,pt}.ts
  dpa/{en,fr,de,es,it,pt}.ts
  acceptable-use/{en,fr,de,es,it,pt}.ts
  refund/{en,fr,de,es,it,pt}.ts
  hub/{en,fr,de,es,it,pt}.ts
```

Every policy has stable clause IDs. A loader validates that every locale contains the same required clause IDs in the same order. Missing or malformed translations fail tests and the production build; they never silently fall back to English.

Translations are intended to carry equivalent legal meaning. The Portuguese version is the reference version for interpretation only to the extent permitted by applicable law. That rule cannot reduce a consumer's mandatory rights or make an unclear localized term binding.

### 3. Shared presentation

Shared server components will render:

- policy title, publication/effective dates, and version;
- the typed policy blocks;
- a legal navigation menu;
- a six-language switcher that preserves the current policy slug;
- operator disclosure; and
- consumer/privacy contact links.

The existing English paths remain canonical:

```text
/legal
/legal/terms
/legal/privacy
/legal/cookies
/legal/dpa
/legal/acceptable-use
/legal/refund
```

Localized versions use `/{locale}/legal/...` for `fr`, `de`, `es`, `it`, and `pt`. `/en/legal/...` continues to redirect to the unprefixed English URL. Each route generates self-referencing canonical metadata and `hreflang` alternatives for all six languages plus `x-default`.

Terms, Privacy, and the legal hub retain their existing indexability. DPA, Refund, Cookies, and Acceptable Use retain `noindex` unless the current SEO policy explicitly says otherwise. Sitemap behaviour must remain consistent with those choices.

Spanish and Italian legal routes are introduced without adding Spanish or Italian marketing routes. Locale validation for legal routes therefore uses the six configured application locales rather than the narrower public-marketing locale list.

### 4. Localized link integration

The following surfaces must link to the legal page matching the user's current supported locale:

- signup and authentication flows;
- checkout and upgrade flows;
- public and authenticated footers;
- cookie banner and cookie-settings control;
- security page;
- legal hub and cross-policy links; and
- the bounded email inventory described below.

For email integration, app-generated messages using `src/lib/email-wrapper.ts` or `src/lib/auth-emails.ts` will accept a supported profile/account locale and generate localized legal links. Missing or unsupported locale values use the canonical English links. The static Supabase templates in `src/lib/supabase-auth-templates/*.html` have no reliable per-recipient locale context and will retain canonical English links. Translating complete email bodies is outside this project.

Localized legal routes must be recognized by route-chrome and analytics-exclusion logic so they receive the same legal-page layout and do not unexpectedly load optional analytics.

## Policy requirements

### Terms of Service

The Terms will:

- identify João Pedro Reis as the supplier and contracting party trading as PinkPepper;
- distinguish business/professional customers from private consumers;
- describe the AI-assisted service and human-review limitations in plain language;
- explain account eligibility, security, acceptable use, subscriptions, recurring billing, VAT, cancellation, and plan changes;
- preserve ownership of user inputs and appropriate rights in outputs while giving João only the licence needed to provide the service;
- avoid exclusions or indemnities that purport to override mandatory consumer law;
- incorporate the Refund and Acceptable Use policies;
- explain notice and policy-change rules, including the delayed effective date for existing customers;
- select Portuguese law;
- use Portuguese courts for business disputes while preserving consumers' mandatory rights to bring or defend proceedings in the courts allowed by their country of residence; and
- replace the discontinued EU ODR section with current Portuguese alternative-dispute information and cross-border consumer resources where applicable.

### Privacy Policy

The Privacy Policy will:

- identify João, the address, NIF, and privacy contact;
- distinguish João's controller role for accounts, billing, support, security, service administration, and optional marketing from PinkPepper's processor role for customer-directed content processing;
- list data categories, purposes, lawful bases, recipients, retention criteria, data-source information where required, rights, and complaint routes;
- treat marketing consent separately from contract performance and explain withdrawal;
- describe AI processing and the absence of solely automated decisions producing legal or similarly significant effects, provided that remains true in the product;
- explain that users should not upload unnecessary special-category or third-party personal data and that business controllers retain responsibility for their instructions;
- list the actual services used by runtime code, including Supabase, Vercel hosting and telemetry, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and optional Google sign-in, with the correct controller/processor characterization;
- describe international-transfer safeguards conditionally and only where supported by the current vendor agreement or certification;
- replace the Irish DPC with the CNPD for EU complaints and retain the ICO for UK users where UK GDPR applies;
- disclose the unresolved UK representative position without asserting that a representative exists; and
- avoid unsupported assertions about exact hosting location, encryption algorithm, certification, executed DPAs, backup deletion, or retention automation.

### Data Processing Agreement

The DPA will separate the Article 28 processor relationship from João's independent controller activities. It will include:

- parties, precedence, definitions, scope, duration, nature, purpose, data subjects, and personal-data categories;
- controller instructions and responsibilities;
- confidentiality, security, data-subject request assistance, DPIA/prior-consultation assistance, and regulator cooperation;
- processor breach notice to the controller without undue delay, with no false universal 72-hour promise;
- general subprocessor authorization, advance notice, objection procedure, and equivalent downstream obligations;
- a verified subprocessor schedule and change mechanism;
- deletion or return at the controller's choice on termination, subject to applicable law and technically defined backup cycles;
- information and proportionate audit rights that do not obstruct Article 28 rights;
- international-transfer terms for EU/EEA and UK data only where the applicable mechanism exists;
- Portuguese governing law, subject to mandatory applicable data-protection law; and
- incorporation through the accepted Terms for business customers plus the existing option to request a countersigned copy.

Billing, fraud prevention, tax records, and direct account administration will not be misdescribed as processing solely on a customer's documented instructions.

### Cookie Policy and consent

The Cookie Policy and banner will match actual storage and telemetry behaviour. The inventory will cover first-party authentication/session storage, the PinkPepper consent preference, Stripe payment/fraud storage where set, Google Analytics after consent, Vercel Analytics after consent, and Vercel Speed Insights after consent.

Google Analytics, Vercel Analytics, and Vercel Speed Insights are all treated as optional analytics and must not render or load before affirmative consent. A persistent `Cookie settings` control will reopen the choice after dismissal. Choosing `Essential only` or withdrawing a prior analytics choice will save the essential-only preference, update Google consent to denied if `gtag` is present, expire visible first-party `_ga` and `_ga_*` cookies on PinkPepper's host/path, and reload the page so none of the three analytics components is rendered. Third-party cookies set on Stripe or another provider's domain cannot be deleted by PinkPepper and are described separately. With only one optional purpose, separate `Accept analytics` and `Essential only` choices are sufficient; a complex preference center is unnecessary.

### Refund Policy

The Refund Policy will:

- preserve cancellation at the end of the current billing period;
- offer EU/UK private consumers a full refund when they withdraw within 14 days of the initial paid subscription purchase;
- avoid claiming the existing checkout obtains immediate-performance or withdrawal-waiver consent;
- distinguish the statutory consumer withdrawal rule from discretionary business-customer refunds, billing errors, and service-unavailability remedies;
- explain renewals, downgrades, consultancy allocations, refund-request steps, response targets, payment-method timing, and VAT treatment without limiting mandatory law; and
- use the support email as a valid withdrawal channel without requiring a reason.

Refund requests and Stripe refund execution remain a manual support operation. This project supplies accurate policy text, request instructions, and internal handoff criteria; it does not add automatic eligibility adjudication, a refund API, or automated Stripe refunds.

### Acceptable Use Policy

The Acceptable Use Policy will preserve the existing safety boundaries while clarifying:

- prohibited unlawful, harmful, abusive, deceptive, or security-compromising use;
- restrictions on uploading data the user is not authorized to process;
- a warning against unnecessary special-category, health, criminal-offence, or children's data;
- service protection, investigation, suspension, notice, and appeal behaviour; and
- the relationship with the Terms and DPA.

### Legal hub and operator disclosure

The legal hub will summarize each policy, expose current versions/effective dates, display the complete operator identity, and link to support, CNPD, the official Portuguese Electronic Complaints Book, and applicable consumer-dispute resources. It must not claim that João's complaints-book registration is complete until that external registration is verified.

The site footer will include a concise supplier disclosure and link to the full legal hub without publishing the complete address on every unrelated page.

## Truthfulness audit

Before final policy text is accepted, every operational claim must be checked against code, database migrations, environment-independent configuration, and current vendor documentation/contracts. The audit covers:

- every service receiving account, content, billing, email, analytics, authentication, or rate-limit data;
- whether a service is João's processor, independent controller, or both depending on activity;
- actual data regions and transfer safeguards;
- prompt/output training commitments for the API products actually used;
- retention and deletion behaviour for free and paid accounts, uploaded files, generated documents, logs, analytics, billing records, and backups;
- encryption, access-control, logging, backup, certification, and vulnerability-management claims; and
- cookie/local-storage names, purposes, and lifetimes.

If a claim cannot be substantiated, the policy will use accurate criteria-based wording or remove the claim. This project does not create a new retention job or security control solely to preserve boilerplate wording; a separate implementation decision is required for any new operational guarantee.

Findings will be recorded in `docs/legal/vendor-and-policy-claims-audit.md` with the claim, repository or vendor evidence, verification date, conclusion, and resulting policy wording. This makes the factual audit reproducible without treating the design document as evidence of vendor contracts.

## Acceptance and versioning

### Data model

An append-only `legal_policy_acceptances` table will record:

- user ID;
- Terms version;
- Privacy version acknowledged;
- Refund version;
- locale;
- source (`signup`, `policy_update`, or `checkout`); and
- server-recorded acceptance timestamp.

The DPA is not stored in this table. The tuple `(user_id, terms_version, privacy_version, refund_version, source)` is unique. This preserves distinct signup/policy-update and checkout evidence while making callback retries and repeated checkout attempts idempotent within the same source. The table will not store IP address, raw user agent, or device fingerprint. Users may read their own records. Only trusted server paths may insert records; users cannot update or delete acceptance history through normal client APIs.

A shared server-side `resolveLegalRequirements(userId, now)` function returns the required Terms, Privacy, and Refund versions, whether the effective date has passed for that user, and whether the user has a satisfying acceptance tuple. Signup gating, the dashboard notice, protected feature APIs, and checkout must use this resolver rather than duplicating version comparisons.

For the general service gate, a current-version record from any source satisfies the policy requirement because each source uses the same explicit acceptance language. Checkout additionally requires a current-version record with source `checkout`; if none exists, the checkout disclosure must be accepted and that source-specific record inserted before Stripe Checkout opens.

### Signup

Password, magic-link, and Google signup all complete through an authenticated legal-acceptance step before normal dashboard access. That page has an unchecked explicit control stating that the user agrees to the current Terms and acknowledges the Privacy and Refund policies. Marketing remains a separate optional unchecked choice on the original signup form.

After password email confirmation, magic-link authentication, or Google OAuth, the existing authentication callback resolves the authenticated user and calls the shared resolver. A new user without current signup acceptance is redirected to `/legal/acceptance` immediately. An existing user without current policy-update acceptance is allowed through to the non-blocking notice before the existing-user effective instant and is redirected to mandatory acceptance only on or after that instant. This avoids pre-authentication acceptance tokens and works when the callback opens on another device. The authenticated acceptance endpoint reads current versions from server configuration, inserts the source-specific unique tuple idempotently, and then redirects to the original safe in-app destination. Duplicate callback execution or a repeated submission returns the existing acceptance as success. If persistence fails, the user remains on the acceptance page with a retry message and access only to the exception routes listed below.

### Existing users and material changes

Every existing user must accept Terms version `2026-07-18` and acknowledge Privacy and Refund versions `2026-07-18` by 17 August 2026. The localized in-app notice shows the publication date, effective date, summary, and policy links. Before the effective date it is non-blocking; on and after the effective date the resolver requires the exact current three-version tuple.

On and after the effective date, a missing tuple blocks all endpoints that create new AI output, consume paid quota, start a document review, submit an audit interaction, or initiate/change a paid subscription. It does not block public/legal routes, authentication/signout, the acceptance page and endpoint, read-only access to existing conversations/documents, downloading an existing user-owned file, account settings, account deletion, the Stripe billing portal used to cancel, or support/privacy-rights contact. Enforcement is a shared server guard imported by every in-scope mutation/API route, with a matching UI gate for usability; middleware or UI-only checks are insufficient. A route-inventory test lists each protected and exempt endpoint so newly added paid-feature routes cannot bypass the resolver silently.

No customer email is sent as part of this repository change. The handoff will provide the audience, effective date, and localized notice copy needed for a separately authorized communication.

### Checkout

Before opening Stripe Checkout, PinkPepper displays the selected plan, billing interval, recurring nature, VAT statement, cancellation timing, 14-day private-consumer refund link, Terms, Privacy, and Refund links. The user must explicitly accept the current contractual versions. The server verifies and records acceptance before creating the Stripe session; client-supplied version strings are never trusted over server configuration.

If configured, Stripe's own terms-of-service consent collection may provide additional evidence, but it does not replace PinkPepper's versioned record or depend on an unverified dashboard setting.

The published DPA is incorporated into the Terms for business customers using PinkPepper as a processor. It has its own displayed document version and remains available for countersignature, but it does not create a separate in-product acceptance gate or `legal_policy_acceptances` field in this project.

## Failure behaviour and edge cases

- Unsupported or malformed locale segments return a 404 rather than serving a mismatched legal language.
- `/en/legal/...` redirects permanently to the unprefixed English route while preserving the policy slug and query string.
- Missing translations, missing clauses, broken internal policy links, or mismatched versions fail automated verification.
- A failed acceptance write blocks the gated action and presents a retry path; it never proceeds optimistically.
- A user may decline marketing without affecting account creation or contract acceptance.
- A user who withdraws analytics consent receives no optional analytics on subsequent navigation; consent revocation is not treated as account or contract withdrawal.
- Consumer protections remain effective even if an account was incorrectly labelled as business or private.
- Policy pages remain accessible without authentication and remain accessible during an account or acceptance gate.
- Account cancellation, data-rights requests, support, and legally required exports remain available even when updated Terms have not been accepted.
- If a third-party transfer mechanism or location cannot be verified, the policy describes the applicable safeguard category without asserting a specific certification or region.
- The complaints-book link is published as an official external channel without claiming completed operator registration.

## Testing and verification

### Content and route tests

Automated tests will verify:

- exact operator name, NIF, address, and support email;
- Portuguese governing-law and CNPD references;
- absence of Irish law, Irish courts, the Irish DPC, the obsolete ODR URL, and the incorrect processor 72-hour formulation;
- complete clause-ID and navigation parity across six locales;
- correct localized internal links, canonicals, `hreflang`, and `/en` redirects;
- policy-version consistency between content, signup, checkout, acceptance records, and notices;
- intended index/noindex and sitemap behaviour; and
- actual third-party inventory coverage.

### Behaviour tests

Automated tests will cover:

- required but initially unchecked signup acceptance;
- independent optional marketing consent;
- password, magic-link, and Google redirect acceptance persistence;
- cross-device authentication callbacks, duplicate callbacks, failed acceptance writes, and idempotent resubmission;
- existing-user policy notices and effective-date gating;
- checkout rejection without current acceptance;
- server-side rejection of stale or forged version values;
- cookie acceptance, essential-only choice, reopening settings, and withdrawal; and
- preservation of cancellation/support/data-rights access when acceptance is outstanding.

### Repository verification

Before completion, run:

- targeted legal and consent tests;
- the full Vitest suite;
- TypeScript typecheck;
- ESLint;
- production build;
- `git diff --check`; and
- browser checks of every legal route and language, including responsive layout, external links, keyboard navigation, language switching, cookie settings, signup, and checkout disclosure.

The final handoff will distinguish verified code behaviour from external actions still required.

## Rollout

1. Add the central legal configuration, typed content model, and tests.
2. Replace English legal pages with shared rendering and corrected content.
3. Add and verify the five localized route sets and legal navigation.
4. Reconcile the vendor, retention, transfer, cookie, and security claims against the application.
5. Add the acceptance table and protected write paths.
6. Integrate signup, authentication callback, existing-user notice, and checkout acceptance.
7. Add persistent cookie settings and consent withdrawal.
8. Update footer, security, emails, route chrome, metadata, sitemap, and analytics exclusions.
9. Run all automated and browser verification.
10. Hand off the changes with explicit production steps: review by qualified counsel/translators, Electronic Complaints Book registration, UK representative decision, customer notice authorization, Stripe production configuration check, and deployment.

## Acceptance criteria

The implementation is ready for handoff when:

- all six legal languages contain every approved policy and clause;
- João's identity and Portuguese legal baseline are consistent everywhere;
- no Irish or discontinued ODR boilerplate remains;
- policies make no material factual claims contradicted by the repository or unverified vendor assumptions;
- signup, checkout, policy updates, and cookie withdrawal behave as described;
- versioned acceptance is stored with data minimization and server-side validation;
- all required test/build/browser checks pass; and
- the unresolved complaints-book registration and UK representative risk are plainly documented without false compliance claims.
