# Vendor and Policy Claims Audit

Verified on: 2026-07-18. This audit is repository evidence for policy wording and flags facts requiring production dashboard or contract confirmation.

| service | data categories | storage/region | purpose/role | retention/deletion path | international transfer mechanism | encryption | access control | logging | backups | certifications | training use | repository evidence | official source | verified on | status | policy wording |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Supabase | account, auth, profile, conversation, document metadata | dashboard-confirmed project region required | database/auth/storage processor | account deletion, retention jobs, backup expiry require dashboard confirmation | SCC/adequacy/provider terms qualified | provider encryption qualified | RLS and service-role controls | provider logs qualified | dashboard backup settings qualified | provider certifications qualified | not AI training | supabase migrations and clients | https://supabase.com/security | 2026-07-18 | qualified | Supabase stores product data subject to project configuration. |
| Vercel hosting | request logs, deployment data | provider edge/network locations qualified | hosting processor | provider log retention qualified | provider transfer terms | TLS/provider controls | team access | deployment/request logs | platform backups qualified | provider certifications qualified | not AI training | Next.js deployment/runtime | https://vercel.com/security | 2026-07-18 | qualified | Vercel hosts the application and may process operational logs. |
| Vercel Analytics | analytics events | provider locations qualified | optional analytics processor | provider retention qualified | provider transfer terms | provider controls | team access | analytics logs | provider backups qualified | provider certifications qualified | not AI training | CookieBanner | https://vercel.com/docs/analytics | 2026-07-18 | qualified | Vercel Analytics loads only after consent. |
| Vercel Speed Insights | performance metrics | provider locations qualified | optional performance analytics | provider retention qualified | provider transfer terms | provider controls | team access | performance logs | provider backups qualified | provider certifications qualified | not AI training | app layout/CookieBanner | https://vercel.com/docs/speed-insights | 2026-07-18 | qualified | Speed Insights loads only after consent. |
| Groq | prompts and generated text | provider configuration qualified | AI inference processor | provider retention qualified | provider transfer terms | provider controls | API key scoped | API logs qualified | provider backups qualified | provider certifications qualified | account terms qualified | AI route clients | https://groq.com/privacy-policy/ | 2026-07-18 | qualified | Groq may process prompts for requested AI features. |
| OpenAI | prompts, images, generated output | provider configuration qualified | AI inference processor | provider retention qualified | provider transfer terms | provider controls | API key scoped | API logs qualified | provider backups qualified | provider certifications qualified | API training defaults depend on provider terms/settings | vision route | https://openai.com/policies/business-terms/ | 2026-07-18 | qualified | OpenAI may process prompts/images for requested features. |
| Stripe | billing identifiers, invoices, checkout state | provider locations qualified | payment processor/controller as applicable | statutory billing retention | provider transfer terms | provider controls | dashboard access | payment logs | provider backups | provider certifications | not AI training | billing routes | https://stripe.com/legal | 2026-07-18 | qualified | Stripe processes payments and billing records. |
| Resend | support/review/welcome email | provider locations qualified | email processor | provider retention qualified | provider transfer terms | provider controls | API key scoped | email logs | provider backups | provider certifications qualified | not AI training | email modules | https://resend.com/legal/privacy-policy | 2026-07-18 | qualified | Resend sends service emails. |
| Upstash | rate-limit keys | provider region qualified | rate-limit processor | TTL-based deletion | provider transfer terms | provider controls | API key scoped | request logs qualified | provider backups qualified | provider certifications qualified | not AI training | ratelimit module | https://upstash.com/trust | 2026-07-18 | qualified | Upstash supports rate limiting. |
| Google Analytics | analytics identifiers/cookies | provider locations qualified | optional analytics | provider retention qualified | provider transfer terms | provider controls | dashboard access | analytics logs | provider backups | provider certifications qualified | not AI training | CookieBanner/google-analytics | https://support.google.com/analytics/ | 2026-07-18 | qualified | Google Analytics loads only after consent. |
| Google sign-in | OAuth identity | provider locations qualified | authentication provider | provider retention qualified | provider transfer terms | provider controls | OAuth config | auth logs | provider backups | provider certifications qualified | not AI training | Supabase Google OAuth config | https://policies.google.com/privacy | 2026-07-18 | qualified | Google sign-in is optional authentication. |

## Retention
Retention paths include user deletion, conversation purge jobs, billing legal retention, provider logs, and backup expiry. Dashboard-only values remain qualified.

## Deletion
Deletion requests are handled through account deletion/support workflows and provider deletion capabilities where available.

## Security
Security claims are limited to repository evidence and provider-qualified controls; unsupported encryption, region, and certification statements must not be published as absolute claims.

## Transfers
International transfers rely on provider terms, SCCs, adequacy safeguards, or qualified contract controls.

## Training use
AI training claims are qualified by provider terms and account settings; policies must not state unverified absolute non-training promises.

## Cookies
Optional analytics cookies require consent and withdrawal support. Essential cookies are used for security, session, locale, billing, and consent preferences.
