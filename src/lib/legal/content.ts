import { LEGAL_LOCALES, LEGAL_POLICY_SLUGS } from "./config";
import type { LegalDocument, LegalLocale, LegalPolicySlug } from "./types";

const legalDocuments = {
  "en": {
    "terms": {
      "slug": "terms",
      "locale": "en",
      "title": "Terms of Service",
      "description": "Terms of Service for PinkPepper (English).",
      "navigationLabel": "Terms of Service",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "operator",
          "heading": "Operator",
          "blocks": [
            {
              "type": "paragraph",
              "text": "This policy applies to PinkPepper and is published by João Pedro Reis, trading as PinkPepper. Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "service",
          "heading": "Service",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper provides AI-assisted food safety drafting, reference, image analysis, document generation, and compliance workflow tools. Outputs are drafts, not legal advice or a substitute for professional review."
            }
          ]
        },
        {
          "id": "accounts",
          "heading": "Accounts",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Users must provide accurate account information, keep credentials secure, and use the service only for lawful business or consumer purposes."
            }
          ]
        },
        {
          "id": "acceptable-use",
          "heading": "Acceptable use",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Use is subject to the Acceptable Use Policy. Illegal, abusive, security-compromising, model-abusive, or rights-infringing use is prohibited."
            }
          ]
        },
        {
          "id": "billing",
          "heading": "Subscriptions and billing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout. Your subscription renews automatically at the end of each billing period. Prices may be exclusive of VAT until checkout calculates applicable tax."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Consumer withdrawal and refunds",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional 14-day refund on the initial subscription purchase. Renewal periods, usage after cancellation, and non-initial purchases are handled under the Refund Policy."
            }
          ]
        },
        {
          "id": "ip",
          "heading": "Intellectual property",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You retain your content. PinkPepper and its suppliers retain the platform, branding, software, prompts, and models."
            }
          ]
        },
        {
          "id": "liability",
          "heading": "Liability",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Nothing excludes liability that cannot be excluded by law. AI output must be reviewed before operational, regulatory, or inspection use."
            }
          ]
        },
        {
          "id": "termination",
          "heading": "Termination",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may cancel through the billing portal or request account deletion. PinkPepper may suspend harmful, unlawful, or non-paying use."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Policy changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Material legal updates may require renewed acceptance. Existing users receive notice before the existing-user effective date where required."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law and disputes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "These Terms are governed by Portuguese law. Mandatory consumer rights in the user's country of residence remain unaffected."
            }
          ]
        },
        {
          "id": "disputes",
          "heading": "Complaints and ADR",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "privacy": {
      "slug": "privacy",
      "locale": "en",
      "title": "Privacy Policy",
      "description": "Privacy Policy for PinkPepper (English).",
      "navigationLabel": "Privacy Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "controller",
          "heading": "Controller",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. João Pedro Reis is the data controller for account, billing, support, product, and analytics data unless a DPA states otherwise."
            }
          ]
        },
        {
          "id": "data",
          "heading": "Data categories",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We process account/profile/auth data, prompts, files, generated outputs, conversation metadata, billing identifiers, support and review messages, operational logs, rate-limit keys, analytics identifiers, and cookie choices."
            }
          ]
        },
        {
          "id": "purposes",
          "heading": "Purposes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use data to provide the service, authenticate users, maintain security, bill customers, answer support requests, improve reliability, and meet legal obligations."
            }
          ]
        },
        {
          "id": "lawful-bases",
          "heading": "Lawful bases",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Legal bases include contract, legitimate interests, consent for optional analytics, and legal obligation."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention and deletion",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Account deletion, conversation retention jobs, billing retention, support records, backups, and provider logs follow documented operational periods and legal retention duties."
            }
          ]
        },
        {
          "id": "recipients",
          "heading": "Recipients",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "International transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Where data leaves the EEA/UK, PinkPepper relies on adequacy decisions, SCCs, provider transfer terms, or qualified contract controls as applicable."
            }
          ]
        },
        {
          "id": "ai",
          "heading": "AI processing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customer prompts, files, and outputs are sent to AI providers only to provide requested features. Training-use claims are qualified by provider terms and account settings."
            }
          ]
        },
        {
          "id": "rights",
          "heading": "Rights",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may request access, correction, deletion, restriction, portability, objection, and withdrawal of consent by contacting support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "security",
          "heading": "Security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use access controls, HTTPS, provider security controls, rate limits, and scoped storage. Encryption, logging, backup, region, and certification claims are qualified by the audit evidence."
            }
          ]
        },
        {
          "id": "cookies",
          "heading": "Cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cookie choices are described in the Cookie Policy. Optional analytics require consent and may be withdrawn."
            }
          ]
        },
        {
          "id": "complaints",
          "heading": "Complaints",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We publish updated versions and may ask for renewed acceptance when privacy terms materially change."
            }
          ]
        }
      ]
    },
    "cookies": {
      "slug": "cookies",
      "locale": "en",
      "title": "Cookie Policy",
      "description": "Cookie Policy for PinkPepper (English).",
      "navigationLabel": "Cookie Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "essential",
          "heading": "Essential cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Essential cookies keep sessions, security, locale, billing state, and cookie preferences working."
            }
          ]
        },
        {
          "id": "analytics",
          "heading": "Optional analytics",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Google Analytics, Vercel Analytics, and Vercel Speed Insights load only after optional analytics consent and never on legal pages."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Withdrawal",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You can reopen cookie settings from the footer, choose essential only, update Google consent to denied where available, and remove visible first-party _ga cookies. Third-party-domain cookies cannot be removed by PinkPepper."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The pp-cookie-consent preference is stored for up to one year unless changed earlier."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "dpa": {
      "slug": "dpa",
      "locale": "en",
      "title": "Data Processing Agreement",
      "description": "Data Processing Agreement for PinkPepper (English).",
      "navigationLabel": "Data Processing Agreement",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "parties",
          "heading": "Parties and roles",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. For customer content processed on documented instructions, the customer is controller and PinkPepper is processor."
            }
          ]
        },
        {
          "id": "article-28",
          "heading": "Article 28 terms",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper processes personal data only on documented instructions, imposes confidentiality, applies appropriate security, assists with data-subject requests, assists with security and DPIA duties, deletes or returns data at the end of service where required, and makes audit information available."
            }
          ]
        },
        {
          "id": "subprocessors",
          "heading": "Subprocessors",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "Transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Transfers use provider terms, SCCs, adequacy safeguards, or other lawful mechanisms."
            }
          ]
        },
        {
          "id": "breach",
          "heading": "Security incidents",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper will notify the controller without undue delay after becoming aware of a personal-data breach affecting processor data."
            }
          ]
        },
        {
          "id": "countersignature",
          "heading": "Countersignature",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customers needing a signed DPA should email support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "acceptable-use": {
      "slug": "acceptable-use",
      "locale": "en",
      "title": "Acceptable Use Policy",
      "description": "Acceptable Use Policy for PinkPepper (English).",
      "navigationLabel": "Acceptable Use Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "lawful-use",
          "heading": "Lawful use",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Do not use PinkPepper for illegal conduct, evading regulation, or creating unsafe food-safety practices."
            }
          ]
        },
        {
          "id": "abuse",
          "heading": "Abuse and security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not attack, scrape, overload, reverse engineer, bypass limits, exfiltrate data, upload malware, or interfere with other users."
            }
          ]
        },
        {
          "id": "ai-safety",
          "heading": "AI safety",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not submit prohibited content, request harmful instructions, impersonate others, or rely on outputs without competent review."
            }
          ]
        },
        {
          "id": "enforcement",
          "heading": "Enforcement",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We may suspend or terminate accounts that breach this policy, preserve evidence, and report unlawful activity where required."
            }
          ]
        }
      ]
    },
    "refund": {
      "slug": "refund",
      "locale": "en",
      "title": "Refund Policy",
      "description": "Refund Policy for PinkPepper (English).",
      "navigationLabel": "Refund Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "scope",
          "heading": "Scope",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. This Refund Policy applies to paid PinkPepper subscriptions bought by private consumers."
            }
          ]
        },
        {
          "id": "initial-14-day-refund",
          "heading": "Full 14-day initial subscription refund",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional refund if they request it within 14 days of the initial subscription purchase."
            }
          ]
        },
        {
          "id": "process",
          "heading": "Process",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Email support@pinkpepper.io with the account email and Stripe receipt or checkout details. We process approved refunds back to the original payment method where possible."
            }
          ]
        },
        {
          "id": "exclusions",
          "heading": "Exclusions",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The unconditional 14-day right applies to the initial subscription purchase only. Renewals, upgrades outside the initial window, enterprise agreements, or misuse are handled case by case and subject to mandatory law."
            }
          ]
        },
        {
          "id": "cancellation",
          "heading": "Cancellation",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cancellation stops renewal at the end of the billing period unless a refund is granted."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law",
          "blocks": [
            {
              "type": "paragraph",
              "text": "This policy is governed by Portuguese law and does not limit mandatory consumer rights."
            }
          ]
        }
      ]
    }
  },
  "fr": {
    "terms": {
      "slug": "terms",
      "locale": "fr",
      "title": "Terms of Service",
      "description": "Terms of Service for PinkPepper (Français).",
      "navigationLabel": "Terms of Service",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "operator",
          "heading": "Operator",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cette politique s’applique à PinkPepper et est publiée par João Pedro Reis, exerçant sous le nom PinkPepper. Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "service",
          "heading": "Service",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper provides AI-assisted food safety drafting, reference, image analysis, document generation, and compliance workflow tools. Outputs are drafts, not legal advice or a substitute for professional review."
            }
          ]
        },
        {
          "id": "accounts",
          "heading": "Accounts",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Users must provide accurate account information, keep credentials secure, and use the service only for lawful business or consumer purposes."
            }
          ]
        },
        {
          "id": "acceptable-use",
          "heading": "Utilisation acceptable",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Use is subject to the Acceptable Use Policy. Illegal, abusive, security-compromising, model-abusive, or rights-infringing use is prohibited."
            }
          ]
        },
        {
          "id": "billing",
          "heading": "Subscriptions and billing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout. Your subscription renews automatically at the end of each billing period. Prices may be exclusive of VAT until checkout calculates applicable tax."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Consumer withdrawal and refunds",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional 14-day refund on the initial subscription purchase. Renewal periods, usage after cancellation, and non-initial purchases are handled under the Refund Policy."
            }
          ]
        },
        {
          "id": "ip",
          "heading": "Intellectual property",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You retain your content. PinkPepper and its suppliers retain the platform, branding, software, prompts, and models."
            }
          ]
        },
        {
          "id": "liability",
          "heading": "Liability",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Nothing excludes liability that cannot be excluded by law. AI output must be reviewed before operational, regulatory, or inspection use."
            }
          ]
        },
        {
          "id": "termination",
          "heading": "Termination",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may cancel through the billing portal or request account deletion. PinkPepper may suspend harmful, unlawful, or non-paying use."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Policy changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Material legal updates may require renewed acceptance. Existing users receive notice before the existing-user effective date where required."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law and disputes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "These Terms are governed by droit portugais. Mandatory consumer rights in the user's country of residence remain unaffected."
            }
          ]
        },
        {
          "id": "disputes",
          "heading": "Complaints and ADR",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "privacy": {
      "slug": "privacy",
      "locale": "fr",
      "title": "Privacy Policy",
      "description": "Privacy Policy for PinkPepper (Français).",
      "navigationLabel": "Privacy Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "controller",
          "heading": "Controller",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. João Pedro Reis is the data controller for account, billing, support, product, and analytics data unless a DPA states otherwise."
            }
          ]
        },
        {
          "id": "data",
          "heading": "Data categories",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We process account/profile/auth data, prompts, files, generated outputs, conversation metadata, billing identifiers, support and review messages, operational logs, rate-limit keys, analytics identifiers, and cookie choices."
            }
          ]
        },
        {
          "id": "purposes",
          "heading": "Purposes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use data to provide the service, authenticate users, maintain security, bill customers, answer support requests, improve reliability, and meet legal obligations."
            }
          ]
        },
        {
          "id": "lawful-bases",
          "heading": "Lawful bases",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Legal bases include contract, legitimate interests, consent for optional analytics, and legal obligation."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention and deletion",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Account deletion, conversation retention jobs, billing retention, support records, backups, and provider logs follow documented operational periods and legal retention duties."
            }
          ]
        },
        {
          "id": "recipients",
          "heading": "Recipients",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "International transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Where data leaves the EEA/UK, PinkPepper relies on adequacy decisions, SCCs, provider transfer terms, or qualified contract controls as applicable."
            }
          ]
        },
        {
          "id": "ai",
          "heading": "AI processing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customer prompts, files, and outputs are sent to AI providers only to provide requested features. Training-use claims are qualified by provider terms and account settings."
            }
          ]
        },
        {
          "id": "rights",
          "heading": "Rights",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may request access, correction, deletion, restriction, portability, objection, and withdrawal of consent by contacting support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "security",
          "heading": "Security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use access controls, HTTPS, provider security controls, rate limits, and scoped storage. Encryption, logging, backup, region, and certification claims are qualified by the audit evidence."
            }
          ]
        },
        {
          "id": "cookies",
          "heading": "Cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cookie choices are described in the Cookie Policy. Optional analytics require consent and may be withdrawn."
            }
          ]
        },
        {
          "id": "complaints",
          "heading": "Complaints",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We publish updated versions and may ask for renewed acceptance when privacy terms materially change."
            }
          ]
        }
      ]
    },
    "cookies": {
      "slug": "cookies",
      "locale": "fr",
      "title": "Cookie Policy",
      "description": "Cookie Policy for PinkPepper (Français).",
      "navigationLabel": "Cookie Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "essential",
          "heading": "Essential cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Essential cookies keep sessions, security, locale, billing state, and cookie preferences working."
            }
          ]
        },
        {
          "id": "analytics",
          "heading": "Optional analytics",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Google Analytics, Vercel Analytics, and Vercel Speed Insights load only after optional analytics consent and never on legal pages."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Withdrawal",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You can reopen cookie settings from the footer, choose essential only, update Google consent to denied where available, and remove visible first-party _ga cookies. Third-party-domain cookies cannot be removed by PinkPepper."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The pp-cookie-consent preference is stored for up to one year unless changed earlier."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "dpa": {
      "slug": "dpa",
      "locale": "fr",
      "title": "Data Processing Agreement",
      "description": "Data Processing Agreement for PinkPepper (Français).",
      "navigationLabel": "Data Processing Agreement",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "parties",
          "heading": "Parties and roles",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. For customer content processed on documented instructions, the customer is controller and PinkPepper is processor."
            }
          ]
        },
        {
          "id": "article-28",
          "heading": "Article 28 terms",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper processes personal data only on documented instructions, imposes confidentiality, applies appropriate security, assists with data-subject requests, assists with security and DPIA duties, deletes or returns data at the end of service where required, and makes audit information available."
            }
          ]
        },
        {
          "id": "subprocessors",
          "heading": "Subprocessors",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "Transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Transfers use provider terms, SCCs, adequacy safeguards, or other lawful mechanisms."
            }
          ]
        },
        {
          "id": "breach",
          "heading": "Security incidents",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper will notify the controller without undue delay after becoming aware of a personal-data breach affecting processor data."
            }
          ]
        },
        {
          "id": "countersignature",
          "heading": "Countersignature",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customers needing a signed DPA should email support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "acceptable-use": {
      "slug": "acceptable-use",
      "locale": "fr",
      "title": "Acceptable Use Policy",
      "description": "Acceptable Use Policy for PinkPepper (Français).",
      "navigationLabel": "Acceptable Use Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "lawful-use",
          "heading": "Lawful use",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Do not use PinkPepper for illegal conduct, evading regulation, or creating unsafe food-safety practices."
            }
          ]
        },
        {
          "id": "abuse",
          "heading": "Abuse and security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not attack, scrape, overload, reverse engineer, bypass limits, exfiltrate data, upload malware, or interfere with other users."
            }
          ]
        },
        {
          "id": "ai-safety",
          "heading": "AI safety",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not submit prohibited content, request harmful instructions, impersonate others, or rely on outputs without competent review."
            }
          ]
        },
        {
          "id": "enforcement",
          "heading": "Enforcement",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We may suspend or terminate accounts that breach this policy, preserve evidence, and report unlawful activity where required."
            }
          ]
        }
      ]
    },
    "refund": {
      "slug": "refund",
      "locale": "fr",
      "title": "Refund Policy",
      "description": "Refund Policy for PinkPepper (Français).",
      "navigationLabel": "Refund Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "scope",
          "heading": "Scope",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. This Refund Policy applies to paid PinkPepper subscriptions bought by private consumers."
            }
          ]
        },
        {
          "id": "initial-14-day-refund",
          "heading": "Full 14-day initial subscription refund",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional refund if they request it within 14 days of the initial subscription purchase."
            }
          ]
        },
        {
          "id": "process",
          "heading": "Process",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Email support@pinkpepper.io with the account email and Stripe receipt or checkout details. We process approved refunds back to the original payment method where possible."
            }
          ]
        },
        {
          "id": "exclusions",
          "heading": "Exclusions",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The unconditional 14-day right applies to the initial subscription purchase only. Renewals, upgrades outside the initial window, enterprise agreements, or misuse are handled case by case and subject to mandatory law."
            }
          ]
        },
        {
          "id": "cancellation",
          "heading": "Cancellation",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cancellation stops renewal at the end of the billing period unless a refund is granted."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law",
          "blocks": [
            {
              "type": "paragraph",
              "text": "This policy is governed by droit portugais and does not limit mandatory consumer rights."
            }
          ]
        }
      ]
    }
  },
  "de": {
    "terms": {
      "slug": "terms",
      "locale": "de",
      "title": "Terms of Service",
      "description": "Terms of Service for PinkPepper (Deutsch).",
      "navigationLabel": "Terms of Service",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "operator",
          "heading": "Operator",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Diese Richtlinie gilt für PinkPepper und wird von João Pedro Reis, handelnd als PinkPepper, veröffentlicht. Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "service",
          "heading": "Service",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper provides AI-assisted food safety drafting, reference, image analysis, document generation, and compliance workflow tools. Outputs are drafts, not legal advice or a substitute for professional review."
            }
          ]
        },
        {
          "id": "accounts",
          "heading": "Accounts",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Users must provide accurate account information, keep credentials secure, and use the service only for lawful business or consumer purposes."
            }
          ]
        },
        {
          "id": "acceptable-use",
          "heading": "Zulässige Nutzung",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Use is subject to the Acceptable Use Policy. Illegal, abusive, security-compromising, model-abusive, or rights-infringing use is prohibited."
            }
          ]
        },
        {
          "id": "billing",
          "heading": "Subscriptions and billing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout. Your subscription renews automatically at the end of each billing period. Prices may be exclusive of VAT until checkout calculates applicable tax."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Consumer withdrawal and refunds",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional 14-day refund on the initial subscription purchase. Renewal periods, usage after cancellation, and non-initial purchases are handled under the Refund Policy."
            }
          ]
        },
        {
          "id": "ip",
          "heading": "Intellectual property",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You retain your content. PinkPepper and its suppliers retain the platform, branding, software, prompts, and models."
            }
          ]
        },
        {
          "id": "liability",
          "heading": "Liability",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Nothing excludes liability that cannot be excluded by law. AI output must be reviewed before operational, regulatory, or inspection use."
            }
          ]
        },
        {
          "id": "termination",
          "heading": "Termination",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may cancel through the billing portal or request account deletion. PinkPepper may suspend harmful, unlawful, or non-paying use."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Policy changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Material legal updates may require renewed acceptance. Existing users receive notice before the existing-user effective date where required."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law and disputes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "These Terms are governed by portugiesischem Recht. Mandatory consumer rights in the user's country of residence remain unaffected."
            }
          ]
        },
        {
          "id": "disputes",
          "heading": "Complaints and ADR",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "privacy": {
      "slug": "privacy",
      "locale": "de",
      "title": "Privacy Policy",
      "description": "Privacy Policy for PinkPepper (Deutsch).",
      "navigationLabel": "Privacy Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "controller",
          "heading": "Controller",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. João Pedro Reis is the data controller for account, billing, support, product, and analytics data unless a DPA states otherwise."
            }
          ]
        },
        {
          "id": "data",
          "heading": "Data categories",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We process account/profile/auth data, prompts, files, generated outputs, conversation metadata, billing identifiers, support and review messages, operational logs, rate-limit keys, analytics identifiers, and cookie choices."
            }
          ]
        },
        {
          "id": "purposes",
          "heading": "Purposes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use data to provide the service, authenticate users, maintain security, bill customers, answer support requests, improve reliability, and meet legal obligations."
            }
          ]
        },
        {
          "id": "lawful-bases",
          "heading": "Lawful bases",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Legal bases include contract, legitimate interests, consent for optional analytics, and legal obligation."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention and deletion",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Account deletion, conversation retention jobs, billing retention, support records, backups, and provider logs follow documented operational periods and legal retention duties."
            }
          ]
        },
        {
          "id": "recipients",
          "heading": "Recipients",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "International transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Where data leaves the EEA/UK, PinkPepper relies on adequacy decisions, SCCs, provider transfer terms, or qualified contract controls as applicable."
            }
          ]
        },
        {
          "id": "ai",
          "heading": "AI processing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customer prompts, files, and outputs are sent to AI providers only to provide requested features. Training-use claims are qualified by provider terms and account settings."
            }
          ]
        },
        {
          "id": "rights",
          "heading": "Rights",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may request access, correction, deletion, restriction, portability, objection, and withdrawal of consent by contacting support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "security",
          "heading": "Security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use access controls, HTTPS, provider security controls, rate limits, and scoped storage. Encryption, logging, backup, region, and certification claims are qualified by the audit evidence."
            }
          ]
        },
        {
          "id": "cookies",
          "heading": "Cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cookie choices are described in the Cookie Policy. Optional analytics require consent and may be withdrawn."
            }
          ]
        },
        {
          "id": "complaints",
          "heading": "Complaints",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We publish updated versions and may ask for renewed acceptance when privacy terms materially change."
            }
          ]
        }
      ]
    },
    "cookies": {
      "slug": "cookies",
      "locale": "de",
      "title": "Cookie Policy",
      "description": "Cookie Policy for PinkPepper (Deutsch).",
      "navigationLabel": "Cookie Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "essential",
          "heading": "Essential cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Essential cookies keep sessions, security, locale, billing state, and cookie preferences working."
            }
          ]
        },
        {
          "id": "analytics",
          "heading": "Optional analytics",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Google Analytics, Vercel Analytics, and Vercel Speed Insights load only after optional analytics consent and never on legal pages."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Withdrawal",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You can reopen cookie settings from the footer, choose essential only, update Google consent to denied where available, and remove visible first-party _ga cookies. Third-party-domain cookies cannot be removed by PinkPepper."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The pp-cookie-consent preference is stored for up to one year unless changed earlier."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "dpa": {
      "slug": "dpa",
      "locale": "de",
      "title": "Data Processing Agreement",
      "description": "Data Processing Agreement for PinkPepper (Deutsch).",
      "navigationLabel": "Data Processing Agreement",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "parties",
          "heading": "Parties and roles",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. For customer content processed on documented instructions, the customer is controller and PinkPepper is processor."
            }
          ]
        },
        {
          "id": "article-28",
          "heading": "Article 28 terms",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper processes personal data only on documented instructions, imposes confidentiality, applies appropriate security, assists with data-subject requests, assists with security and DPIA duties, deletes or returns data at the end of service where required, and makes audit information available."
            }
          ]
        },
        {
          "id": "subprocessors",
          "heading": "Subprocessors",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "Transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Transfers use provider terms, SCCs, adequacy safeguards, or other lawful mechanisms."
            }
          ]
        },
        {
          "id": "breach",
          "heading": "Security incidents",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper will notify the controller without undue delay after becoming aware of a personal-data breach affecting processor data."
            }
          ]
        },
        {
          "id": "countersignature",
          "heading": "Countersignature",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customers needing a signed DPA should email support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "acceptable-use": {
      "slug": "acceptable-use",
      "locale": "de",
      "title": "Acceptable Use Policy",
      "description": "Acceptable Use Policy for PinkPepper (Deutsch).",
      "navigationLabel": "Acceptable Use Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "lawful-use",
          "heading": "Lawful use",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Do not use PinkPepper for illegal conduct, evading regulation, or creating unsafe food-safety practices."
            }
          ]
        },
        {
          "id": "abuse",
          "heading": "Abuse and security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not attack, scrape, overload, reverse engineer, bypass limits, exfiltrate data, upload malware, or interfere with other users."
            }
          ]
        },
        {
          "id": "ai-safety",
          "heading": "AI safety",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not submit prohibited content, request harmful instructions, impersonate others, or rely on outputs without competent review."
            }
          ]
        },
        {
          "id": "enforcement",
          "heading": "Enforcement",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We may suspend or terminate accounts that breach this policy, preserve evidence, and report unlawful activity where required."
            }
          ]
        }
      ]
    },
    "refund": {
      "slug": "refund",
      "locale": "de",
      "title": "Refund Policy",
      "description": "Refund Policy for PinkPepper (Deutsch).",
      "navigationLabel": "Refund Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "scope",
          "heading": "Scope",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. This Refund Policy applies to paid PinkPepper subscriptions bought by private consumers."
            }
          ]
        },
        {
          "id": "initial-14-day-refund",
          "heading": "Full 14-day initial subscription refund",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional refund if they request it within 14 days of the initial subscription purchase."
            }
          ]
        },
        {
          "id": "process",
          "heading": "Process",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Email support@pinkpepper.io with the account email and Stripe receipt or checkout details. We process approved refunds back to the original payment method where possible."
            }
          ]
        },
        {
          "id": "exclusions",
          "heading": "Exclusions",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The unconditional 14-day right applies to the initial subscription purchase only. Renewals, upgrades outside the initial window, enterprise agreements, or misuse are handled case by case and subject to mandatory law."
            }
          ]
        },
        {
          "id": "cancellation",
          "heading": "Cancellation",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cancellation stops renewal at the end of the billing period unless a refund is granted."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law",
          "blocks": [
            {
              "type": "paragraph",
              "text": "This policy is governed by portugiesischem Recht and does not limit mandatory consumer rights."
            }
          ]
        }
      ]
    }
  },
  "es": {
    "terms": {
      "slug": "terms",
      "locale": "es",
      "title": "Terms of Service",
      "description": "Terms of Service for PinkPepper (Español).",
      "navigationLabel": "Terms of Service",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "operator",
          "heading": "Operator",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Esta política se aplica a PinkPepper y la publica João Pedro Reis, que opera como PinkPepper. Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "service",
          "heading": "Service",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper provides AI-assisted food safety drafting, reference, image analysis, document generation, and compliance workflow tools. Outputs are drafts, not legal advice or a substitute for professional review."
            }
          ]
        },
        {
          "id": "accounts",
          "heading": "Accounts",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Users must provide accurate account information, keep credentials secure, and use the service only for lawful business or consumer purposes."
            }
          ]
        },
        {
          "id": "acceptable-use",
          "heading": "Uso aceptable",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Use is subject to the Acceptable Use Policy. Illegal, abusive, security-compromising, model-abusive, or rights-infringing use is prohibited."
            }
          ]
        },
        {
          "id": "billing",
          "heading": "Subscriptions and billing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout. Your subscription renews automatically at the end of each billing period. Prices may be exclusive of VAT until checkout calculates applicable tax."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Consumer withdrawal and refunds",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional 14-day refund on the initial subscription purchase. Renewal periods, usage after cancellation, and non-initial purchases are handled under the Refund Policy."
            }
          ]
        },
        {
          "id": "ip",
          "heading": "Intellectual property",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You retain your content. PinkPepper and its suppliers retain the platform, branding, software, prompts, and models."
            }
          ]
        },
        {
          "id": "liability",
          "heading": "Liability",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Nothing excludes liability that cannot be excluded by law. AI output must be reviewed before operational, regulatory, or inspection use."
            }
          ]
        },
        {
          "id": "termination",
          "heading": "Termination",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may cancel through the billing portal or request account deletion. PinkPepper may suspend harmful, unlawful, or non-paying use."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Policy changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Material legal updates may require renewed acceptance. Existing users receive notice before the existing-user effective date where required."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law and disputes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "These Terms are governed by Derecho portugués. Mandatory consumer rights in the user's country of residence remain unaffected."
            }
          ]
        },
        {
          "id": "disputes",
          "heading": "Complaints and ADR",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "privacy": {
      "slug": "privacy",
      "locale": "es",
      "title": "Privacy Policy",
      "description": "Privacy Policy for PinkPepper (Español).",
      "navigationLabel": "Privacy Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "controller",
          "heading": "Controller",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. João Pedro Reis is the data controller for account, billing, support, product, and analytics data unless a DPA states otherwise."
            }
          ]
        },
        {
          "id": "data",
          "heading": "Data categories",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We process account/profile/auth data, prompts, files, generated outputs, conversation metadata, billing identifiers, support and review messages, operational logs, rate-limit keys, analytics identifiers, and cookie choices."
            }
          ]
        },
        {
          "id": "purposes",
          "heading": "Purposes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use data to provide the service, authenticate users, maintain security, bill customers, answer support requests, improve reliability, and meet legal obligations."
            }
          ]
        },
        {
          "id": "lawful-bases",
          "heading": "Lawful bases",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Legal bases include contract, legitimate interests, consent for optional analytics, and legal obligation."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention and deletion",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Account deletion, conversation retention jobs, billing retention, support records, backups, and provider logs follow documented operational periods and legal retention duties."
            }
          ]
        },
        {
          "id": "recipients",
          "heading": "Recipients",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "International transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Where data leaves the EEA/UK, PinkPepper relies on adequacy decisions, SCCs, provider transfer terms, or qualified contract controls as applicable."
            }
          ]
        },
        {
          "id": "ai",
          "heading": "AI processing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customer prompts, files, and outputs are sent to AI providers only to provide requested features. Training-use claims are qualified by provider terms and account settings."
            }
          ]
        },
        {
          "id": "rights",
          "heading": "Rights",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may request access, correction, deletion, restriction, portability, objection, and withdrawal of consent by contacting support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "security",
          "heading": "Security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use access controls, HTTPS, provider security controls, rate limits, and scoped storage. Encryption, logging, backup, region, and certification claims are qualified by the audit evidence."
            }
          ]
        },
        {
          "id": "cookies",
          "heading": "Cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cookie choices are described in the Cookie Policy. Optional analytics require consent and may be withdrawn."
            }
          ]
        },
        {
          "id": "complaints",
          "heading": "Complaints",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We publish updated versions and may ask for renewed acceptance when privacy terms materially change."
            }
          ]
        }
      ]
    },
    "cookies": {
      "slug": "cookies",
      "locale": "es",
      "title": "Cookie Policy",
      "description": "Cookie Policy for PinkPepper (Español).",
      "navigationLabel": "Cookie Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "essential",
          "heading": "Essential cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Essential cookies keep sessions, security, locale, billing state, and cookie preferences working."
            }
          ]
        },
        {
          "id": "analytics",
          "heading": "Optional analytics",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Google Analytics, Vercel Analytics, and Vercel Speed Insights load only after optional analytics consent and never on legal pages."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Withdrawal",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You can reopen cookie settings from the footer, choose essential only, update Google consent to denied where available, and remove visible first-party _ga cookies. Third-party-domain cookies cannot be removed by PinkPepper."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The pp-cookie-consent preference is stored for up to one year unless changed earlier."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "dpa": {
      "slug": "dpa",
      "locale": "es",
      "title": "Data Processing Agreement",
      "description": "Data Processing Agreement for PinkPepper (Español).",
      "navigationLabel": "Data Processing Agreement",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "parties",
          "heading": "Parties and roles",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. For customer content processed on documented instructions, the customer is controller and PinkPepper is processor."
            }
          ]
        },
        {
          "id": "article-28",
          "heading": "Article 28 terms",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper processes personal data only on documented instructions, imposes confidentiality, applies appropriate security, assists with data-subject requests, assists with security and DPIA duties, deletes or returns data at the end of service where required, and makes audit information available."
            }
          ]
        },
        {
          "id": "subprocessors",
          "heading": "Subprocessors",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "Transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Transfers use provider terms, SCCs, adequacy safeguards, or other lawful mechanisms."
            }
          ]
        },
        {
          "id": "breach",
          "heading": "Security incidents",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper will notify the controller without undue delay after becoming aware of a personal-data breach affecting processor data."
            }
          ]
        },
        {
          "id": "countersignature",
          "heading": "Countersignature",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customers needing a signed DPA should email support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "acceptable-use": {
      "slug": "acceptable-use",
      "locale": "es",
      "title": "Acceptable Use Policy",
      "description": "Acceptable Use Policy for PinkPepper (Español).",
      "navigationLabel": "Acceptable Use Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "lawful-use",
          "heading": "Lawful use",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Do not use PinkPepper for illegal conduct, evading regulation, or creating unsafe food-safety practices."
            }
          ]
        },
        {
          "id": "abuse",
          "heading": "Abuse and security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not attack, scrape, overload, reverse engineer, bypass limits, exfiltrate data, upload malware, or interfere with other users."
            }
          ]
        },
        {
          "id": "ai-safety",
          "heading": "AI safety",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not submit prohibited content, request harmful instructions, impersonate others, or rely on outputs without competent review."
            }
          ]
        },
        {
          "id": "enforcement",
          "heading": "Enforcement",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We may suspend or terminate accounts that breach this policy, preserve evidence, and report unlawful activity where required."
            }
          ]
        }
      ]
    },
    "refund": {
      "slug": "refund",
      "locale": "es",
      "title": "Refund Policy",
      "description": "Refund Policy for PinkPepper (Español).",
      "navigationLabel": "Refund Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "scope",
          "heading": "Scope",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. This Refund Policy applies to paid PinkPepper subscriptions bought by private consumers."
            }
          ]
        },
        {
          "id": "initial-14-day-refund",
          "heading": "Full 14-day initial subscription refund",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional refund if they request it within 14 days of the initial subscription purchase."
            }
          ]
        },
        {
          "id": "process",
          "heading": "Process",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Email support@pinkpepper.io with the account email and Stripe receipt or checkout details. We process approved refunds back to the original payment method where possible."
            }
          ]
        },
        {
          "id": "exclusions",
          "heading": "Exclusions",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The unconditional 14-day right applies to the initial subscription purchase only. Renewals, upgrades outside the initial window, enterprise agreements, or misuse are handled case by case and subject to mandatory law."
            }
          ]
        },
        {
          "id": "cancellation",
          "heading": "Cancellation",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cancellation stops renewal at the end of the billing period unless a refund is granted."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law",
          "blocks": [
            {
              "type": "paragraph",
              "text": "This policy is governed by Derecho portugués and does not limit mandatory consumer rights."
            }
          ]
        }
      ]
    }
  },
  "it": {
    "terms": {
      "slug": "terms",
      "locale": "it",
      "title": "Terms of Service",
      "description": "Terms of Service for PinkPepper (Italiano).",
      "navigationLabel": "Terms of Service",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "operator",
          "heading": "Operator",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Questa informativa si applica a PinkPepper ed è pubblicata da João Pedro Reis, che opera come PinkPepper. Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "service",
          "heading": "Service",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper provides AI-assisted food safety drafting, reference, image analysis, document generation, and compliance workflow tools. Outputs are drafts, not legal advice or a substitute for professional review."
            }
          ]
        },
        {
          "id": "accounts",
          "heading": "Accounts",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Users must provide accurate account information, keep credentials secure, and use the service only for lawful business or consumer purposes."
            }
          ]
        },
        {
          "id": "acceptable-use",
          "heading": "Uso accettabile",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Use is subject to the Acceptable Use Policy. Illegal, abusive, security-compromising, model-abusive, or rights-infringing use is prohibited."
            }
          ]
        },
        {
          "id": "billing",
          "heading": "Subscriptions and billing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout. Your subscription renews automatically at the end of each billing period. Prices may be exclusive of VAT until checkout calculates applicable tax."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Consumer withdrawal and refunds",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional 14-day refund on the initial subscription purchase. Renewal periods, usage after cancellation, and non-initial purchases are handled under the Refund Policy."
            }
          ]
        },
        {
          "id": "ip",
          "heading": "Intellectual property",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You retain your content. PinkPepper and its suppliers retain the platform, branding, software, prompts, and models."
            }
          ]
        },
        {
          "id": "liability",
          "heading": "Liability",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Nothing excludes liability that cannot be excluded by law. AI output must be reviewed before operational, regulatory, or inspection use."
            }
          ]
        },
        {
          "id": "termination",
          "heading": "Termination",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may cancel through the billing portal or request account deletion. PinkPepper may suspend harmful, unlawful, or non-paying use."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Policy changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Material legal updates may require renewed acceptance. Existing users receive notice before the existing-user effective date where required."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law and disputes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "These Terms are governed by legge portoghese. Mandatory consumer rights in the user's country of residence remain unaffected."
            }
          ]
        },
        {
          "id": "disputes",
          "heading": "Complaints and ADR",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "privacy": {
      "slug": "privacy",
      "locale": "it",
      "title": "Privacy Policy",
      "description": "Privacy Policy for PinkPepper (Italiano).",
      "navigationLabel": "Privacy Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "controller",
          "heading": "Controller",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. João Pedro Reis is the data controller for account, billing, support, product, and analytics data unless a DPA states otherwise."
            }
          ]
        },
        {
          "id": "data",
          "heading": "Data categories",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We process account/profile/auth data, prompts, files, generated outputs, conversation metadata, billing identifiers, support and review messages, operational logs, rate-limit keys, analytics identifiers, and cookie choices."
            }
          ]
        },
        {
          "id": "purposes",
          "heading": "Purposes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use data to provide the service, authenticate users, maintain security, bill customers, answer support requests, improve reliability, and meet legal obligations."
            }
          ]
        },
        {
          "id": "lawful-bases",
          "heading": "Lawful bases",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Legal bases include contract, legitimate interests, consent for optional analytics, and legal obligation."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention and deletion",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Account deletion, conversation retention jobs, billing retention, support records, backups, and provider logs follow documented operational periods and legal retention duties."
            }
          ]
        },
        {
          "id": "recipients",
          "heading": "Recipients",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "International transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Where data leaves the EEA/UK, PinkPepper relies on adequacy decisions, SCCs, provider transfer terms, or qualified contract controls as applicable."
            }
          ]
        },
        {
          "id": "ai",
          "heading": "AI processing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customer prompts, files, and outputs are sent to AI providers only to provide requested features. Training-use claims are qualified by provider terms and account settings."
            }
          ]
        },
        {
          "id": "rights",
          "heading": "Rights",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may request access, correction, deletion, restriction, portability, objection, and withdrawal of consent by contacting support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "security",
          "heading": "Security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use access controls, HTTPS, provider security controls, rate limits, and scoped storage. Encryption, logging, backup, region, and certification claims are qualified by the audit evidence."
            }
          ]
        },
        {
          "id": "cookies",
          "heading": "Cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cookie choices are described in the Cookie Policy. Optional analytics require consent and may be withdrawn."
            }
          ]
        },
        {
          "id": "complaints",
          "heading": "Complaints",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We publish updated versions and may ask for renewed acceptance when privacy terms materially change."
            }
          ]
        }
      ]
    },
    "cookies": {
      "slug": "cookies",
      "locale": "it",
      "title": "Cookie Policy",
      "description": "Cookie Policy for PinkPepper (Italiano).",
      "navigationLabel": "Cookie Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "essential",
          "heading": "Essential cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Essential cookies keep sessions, security, locale, billing state, and cookie preferences working."
            }
          ]
        },
        {
          "id": "analytics",
          "heading": "Optional analytics",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Google Analytics, Vercel Analytics, and Vercel Speed Insights load only after optional analytics consent and never on legal pages."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Withdrawal",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You can reopen cookie settings from the footer, choose essential only, update Google consent to denied where available, and remove visible first-party _ga cookies. Third-party-domain cookies cannot be removed by PinkPepper."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The pp-cookie-consent preference is stored for up to one year unless changed earlier."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "dpa": {
      "slug": "dpa",
      "locale": "it",
      "title": "Data Processing Agreement",
      "description": "Data Processing Agreement for PinkPepper (Italiano).",
      "navigationLabel": "Data Processing Agreement",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "parties",
          "heading": "Parties and roles",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. For customer content processed on documented instructions, the customer is controller and PinkPepper is processor."
            }
          ]
        },
        {
          "id": "article-28",
          "heading": "Article 28 terms",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper processes personal data only on documented instructions, imposes confidentiality, applies appropriate security, assists with data-subject requests, assists with security and DPIA duties, deletes or returns data at the end of service where required, and makes audit information available."
            }
          ]
        },
        {
          "id": "subprocessors",
          "heading": "Subprocessors",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "Transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Transfers use provider terms, SCCs, adequacy safeguards, or other lawful mechanisms."
            }
          ]
        },
        {
          "id": "breach",
          "heading": "Security incidents",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper will notify the controller without undue delay after becoming aware of a personal-data breach affecting processor data."
            }
          ]
        },
        {
          "id": "countersignature",
          "heading": "Countersignature",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customers needing a signed DPA should email support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "acceptable-use": {
      "slug": "acceptable-use",
      "locale": "it",
      "title": "Acceptable Use Policy",
      "description": "Acceptable Use Policy for PinkPepper (Italiano).",
      "navigationLabel": "Acceptable Use Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "lawful-use",
          "heading": "Lawful use",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Do not use PinkPepper for illegal conduct, evading regulation, or creating unsafe food-safety practices."
            }
          ]
        },
        {
          "id": "abuse",
          "heading": "Abuse and security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not attack, scrape, overload, reverse engineer, bypass limits, exfiltrate data, upload malware, or interfere with other users."
            }
          ]
        },
        {
          "id": "ai-safety",
          "heading": "AI safety",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not submit prohibited content, request harmful instructions, impersonate others, or rely on outputs without competent review."
            }
          ]
        },
        {
          "id": "enforcement",
          "heading": "Enforcement",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We may suspend or terminate accounts that breach this policy, preserve evidence, and report unlawful activity where required."
            }
          ]
        }
      ]
    },
    "refund": {
      "slug": "refund",
      "locale": "it",
      "title": "Refund Policy",
      "description": "Refund Policy for PinkPepper (Italiano).",
      "navigationLabel": "Refund Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "scope",
          "heading": "Scope",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. This Refund Policy applies to paid PinkPepper subscriptions bought by private consumers."
            }
          ]
        },
        {
          "id": "initial-14-day-refund",
          "heading": "Full 14-day initial subscription refund",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional refund if they request it within 14 days of the initial subscription purchase."
            }
          ]
        },
        {
          "id": "process",
          "heading": "Process",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Email support@pinkpepper.io with the account email and Stripe receipt or checkout details. We process approved refunds back to the original payment method where possible."
            }
          ]
        },
        {
          "id": "exclusions",
          "heading": "Exclusions",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The unconditional 14-day right applies to the initial subscription purchase only. Renewals, upgrades outside the initial window, enterprise agreements, or misuse are handled case by case and subject to mandatory law."
            }
          ]
        },
        {
          "id": "cancellation",
          "heading": "Cancellation",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cancellation stops renewal at the end of the billing period unless a refund is granted."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law",
          "blocks": [
            {
              "type": "paragraph",
              "text": "This policy is governed by legge portoghese and does not limit mandatory consumer rights."
            }
          ]
        }
      ]
    }
  },
  "pt": {
    "terms": {
      "slug": "terms",
      "locale": "pt",
      "title": "Terms of Service",
      "description": "Terms of Service for PinkPepper (Português).",
      "navigationLabel": "Terms of Service",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "operator",
          "heading": "Operator",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Esta política aplica-se à PinkPepper e é publicada por João Pedro Reis, a operar como PinkPepper. Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "service",
          "heading": "Service",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper provides AI-assisted food safety drafting, reference, image analysis, document generation, and compliance workflow tools. Outputs are drafts, not legal advice or a substitute for professional review."
            }
          ]
        },
        {
          "id": "accounts",
          "heading": "Accounts",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Users must provide accurate account information, keep credentials secure, and use the service only for lawful business or consumer purposes."
            }
          ]
        },
        {
          "id": "acceptable-use",
          "heading": "Utilização aceitável",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Use is subject to the Acceptable Use Policy. Illegal, abusive, security-compromising, model-abusive, or rights-infringing use is prohibited."
            }
          ]
        },
        {
          "id": "billing",
          "heading": "Subscriptions and billing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Subscriptions are billed monthly or annually in advance via Stripe, depending on the billing interval selected at checkout. Your subscription renews automatically at the end of each billing period. Prices may be exclusive of VAT until checkout calculates applicable tax."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Consumer withdrawal and refunds",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional 14-day refund on the initial subscription purchase. Renewal periods, usage after cancellation, and non-initial purchases are handled under the Refund Policy."
            }
          ]
        },
        {
          "id": "ip",
          "heading": "Intellectual property",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You retain your content. PinkPepper and its suppliers retain the platform, branding, software, prompts, and models."
            }
          ]
        },
        {
          "id": "liability",
          "heading": "Liability",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Nothing excludes liability that cannot be excluded by law. AI output must be reviewed before operational, regulatory, or inspection use."
            }
          ]
        },
        {
          "id": "termination",
          "heading": "Termination",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may cancel through the billing portal or request account deletion. PinkPepper may suspend harmful, unlawful, or non-paying use."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Policy changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Material legal updates may require renewed acceptance. Existing users receive notice before the existing-user effective date where required."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law and disputes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "These Terms are governed by direito português. Mandatory consumer rights in the user's country of residence remain unaffected."
            }
          ]
        },
        {
          "id": "disputes",
          "heading": "Complaints and ADR",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "privacy": {
      "slug": "privacy",
      "locale": "pt",
      "title": "Privacy Policy",
      "description": "Privacy Policy for PinkPepper (Português).",
      "navigationLabel": "Privacy Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "controller",
          "heading": "Controller",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. João Pedro Reis is the data controller for account, billing, support, product, and analytics data unless a DPA states otherwise."
            }
          ]
        },
        {
          "id": "data",
          "heading": "Data categories",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We process account/profile/auth data, prompts, files, generated outputs, conversation metadata, billing identifiers, support and review messages, operational logs, rate-limit keys, analytics identifiers, and cookie choices."
            }
          ]
        },
        {
          "id": "purposes",
          "heading": "Purposes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use data to provide the service, authenticate users, maintain security, bill customers, answer support requests, improve reliability, and meet legal obligations."
            }
          ]
        },
        {
          "id": "lawful-bases",
          "heading": "Lawful bases",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Legal bases include contract, legitimate interests, consent for optional analytics, and legal obligation."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention and deletion",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Account deletion, conversation retention jobs, billing retention, support records, backups, and provider logs follow documented operational periods and legal retention duties."
            }
          ]
        },
        {
          "id": "recipients",
          "heading": "Recipients",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "International transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Where data leaves the EEA/UK, PinkPepper relies on adequacy decisions, SCCs, provider transfer terms, or qualified contract controls as applicable."
            }
          ]
        },
        {
          "id": "ai",
          "heading": "AI processing",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customer prompts, files, and outputs are sent to AI providers only to provide requested features. Training-use claims are qualified by provider terms and account settings."
            }
          ]
        },
        {
          "id": "rights",
          "heading": "Rights",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You may request access, correction, deletion, restriction, portability, objection, and withdrawal of consent by contacting support@pinkpepper.io."
            }
          ]
        },
        {
          "id": "security",
          "heading": "Security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We use access controls, HTTPS, provider security controls, rate limits, and scoped storage. Encryption, logging, backup, region, and certification claims are qualified by the audit evidence."
            }
          ]
        },
        {
          "id": "cookies",
          "heading": "Cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cookie choices are described in the Cookie Policy. Optional analytics require consent and may be withdrawn."
            }
          ]
        },
        {
          "id": "complaints",
          "heading": "Complaints",
          "blocks": [
            {
              "type": "paragraph",
              "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
            }
          ]
        },
        {
          "id": "changes",
          "heading": "Changes",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We publish updated versions and may ask for renewed acceptance when privacy terms materially change."
            }
          ]
        }
      ]
    },
    "cookies": {
      "slug": "cookies",
      "locale": "pt",
      "title": "Cookie Policy",
      "description": "Cookie Policy for PinkPepper (Português).",
      "navigationLabel": "Cookie Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "essential",
          "heading": "Essential cookies",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Essential cookies keep sessions, security, locale, billing state, and cookie preferences working."
            }
          ]
        },
        {
          "id": "analytics",
          "heading": "Optional analytics",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Google Analytics, Vercel Analytics, and Vercel Speed Insights load only after optional analytics consent and never on legal pages."
            }
          ]
        },
        {
          "id": "withdrawal",
          "heading": "Withdrawal",
          "blocks": [
            {
              "type": "paragraph",
              "text": "You can reopen cookie settings from the footer, choose essential only, update Google consent to denied where available, and remove visible first-party _ga cookies. Third-party-domain cookies cannot be removed by PinkPepper."
            }
          ]
        },
        {
          "id": "retention",
          "heading": "Retention",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The pp-cookie-consent preference is stored for up to one year unless changed earlier."
            }
          ]
        },
        {
          "id": "contact",
          "heading": "Contact",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "dpa": {
      "slug": "dpa",
      "locale": "pt",
      "title": "Data Processing Agreement",
      "description": "Data Processing Agreement for PinkPepper (Português).",
      "navigationLabel": "Data Processing Agreement",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "parties",
          "heading": "Parties and roles",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. For customer content processed on documented instructions, the customer is controller and PinkPepper is processor."
            }
          ]
        },
        {
          "id": "article-28",
          "heading": "Article 28 terms",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper processes personal data only on documented instructions, imposes confidentiality, applies appropriate security, assists with data-subject requests, assists with security and DPIA duties, deletes or returns data at the end of service where required, and makes audit information available."
            }
          ]
        },
        {
          "id": "subprocessors",
          "heading": "Subprocessors",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Audited vendors used to provide the service include Supabase, Vercel hosting, Vercel Analytics, Vercel Speed Insights, Groq, OpenAI, Stripe, Resend, Upstash, Google Analytics, and Google sign-in. Hosting, encryption, international transfers, backups, certifications, and training-use claims are qualified where they depend on provider contracts or dashboard configuration."
            }
          ]
        },
        {
          "id": "transfers",
          "heading": "Transfers",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Transfers use provider terms, SCCs, adequacy safeguards, or other lawful mechanisms."
            }
          ]
        },
        {
          "id": "breach",
          "heading": "Security incidents",
          "blocks": [
            {
              "type": "paragraph",
              "text": "PinkPepper will notify the controller without undue delay after becoming aware of a personal-data breach affecting processor data."
            }
          ]
        },
        {
          "id": "countersignature",
          "heading": "Countersignature",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Customers needing a signed DPA should email support@pinkpepper.io."
            }
          ]
        }
      ]
    },
    "acceptable-use": {
      "slug": "acceptable-use",
      "locale": "pt",
      "title": "Acceptable Use Policy",
      "description": "Acceptable Use Policy for PinkPepper (Português).",
      "navigationLabel": "Acceptable Use Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "lawful-use",
          "heading": "Lawful use",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Do not use PinkPepper for illegal conduct, evading regulation, or creating unsafe food-safety practices."
            }
          ]
        },
        {
          "id": "abuse",
          "heading": "Abuse and security",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not attack, scrape, overload, reverse engineer, bypass limits, exfiltrate data, upload malware, or interfere with other users."
            }
          ]
        },
        {
          "id": "ai-safety",
          "heading": "AI safety",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Do not submit prohibited content, request harmful instructions, impersonate others, or rely on outputs without competent review."
            }
          ]
        },
        {
          "id": "enforcement",
          "heading": "Enforcement",
          "blocks": [
            {
              "type": "paragraph",
              "text": "We may suspend or terminate accounts that breach this policy, preserve evidence, and report unlawful activity where required."
            }
          ]
        }
      ]
    },
    "refund": {
      "slug": "refund",
      "locale": "pt",
      "title": "Refund Policy",
      "description": "Refund Policy for PinkPepper (Português).",
      "navigationLabel": "Refund Policy",
      "version": "2026-07-18",
      "publishedLabel": "Published: 18 July 2026",
      "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
      "clauses": [
        {
          "id": "scope",
          "heading": "Scope",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. This Refund Policy applies to paid PinkPepper subscriptions bought by private consumers."
            }
          ]
        },
        {
          "id": "initial-14-day-refund",
          "heading": "Full 14-day initial subscription refund",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Private consumers receive a full unconditional refund if they request it within 14 days of the initial subscription purchase."
            }
          ]
        },
        {
          "id": "process",
          "heading": "Process",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Email support@pinkpepper.io with the account email and Stripe receipt or checkout details. We process approved refunds back to the original payment method where possible."
            }
          ]
        },
        {
          "id": "exclusions",
          "heading": "Exclusions",
          "blocks": [
            {
              "type": "paragraph",
              "text": "The unconditional 14-day right applies to the initial subscription purchase only. Renewals, upgrades outside the initial window, enterprise agreements, or misuse are handled case by case and subject to mandatory law."
            }
          ]
        },
        {
          "id": "cancellation",
          "heading": "Cancellation",
          "blocks": [
            {
              "type": "paragraph",
              "text": "Cancellation stops renewal at the end of the billing period unless a refund is granted."
            }
          ]
        },
        {
          "id": "law",
          "heading": "Law",
          "blocks": [
            {
              "type": "paragraph",
              "text": "This policy is governed by direito português and does not limit mandatory consumer rights."
            }
          ]
        }
      ]
    }
  }
} as const satisfies Record<LegalLocale, Record<LegalPolicySlug, LegalDocument>>;

const legalHubs = {
  "en": {
    "slug": "hub",
    "locale": "en",
    "title": "Legal policies",
    "description": "Legal policies for PinkPepper (English).",
    "navigationLabel": "Legal",
    "version": "2026-07-18",
    "publishedLabel": "Published: 18 July 2026",
    "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
    "clauses": [
      {
        "id": "operator",
        "heading": "Operator information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
          }
        ]
      },
      {
        "id": "policies",
        "heading": "Policies",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Terms of Service",
              "Privacy Policy",
              "Cookie Policy",
              "Data Processing Agreement",
              "Acceptable Use Policy",
              "Refund Policy"
            ]
          }
        ]
      },
      {
        "id": "resources",
        "heading": "Regulators and consumer resources",
        "blocks": [
          {
            "type": "paragraph",
            "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
          }
        ]
      }
    ]
  },
  "fr": {
    "slug": "hub",
    "locale": "fr",
    "title": "Legal policies",
    "description": "Legal policies for PinkPepper (Français).",
    "navigationLabel": "Legal",
    "version": "2026-07-18",
    "publishedLabel": "Published: 18 July 2026",
    "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
    "clauses": [
      {
        "id": "operator",
        "heading": "Operator information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
          }
        ]
      },
      {
        "id": "policies",
        "heading": "Policies",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Terms of Service",
              "Privacy Policy",
              "Cookie Policy",
              "Data Processing Agreement",
              "Acceptable Use Policy",
              "Refund Policy"
            ]
          }
        ]
      },
      {
        "id": "resources",
        "heading": "Regulators and consumer resources",
        "blocks": [
          {
            "type": "paragraph",
            "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
          }
        ]
      }
    ]
  },
  "de": {
    "slug": "hub",
    "locale": "de",
    "title": "Legal policies",
    "description": "Legal policies for PinkPepper (Deutsch).",
    "navigationLabel": "Legal",
    "version": "2026-07-18",
    "publishedLabel": "Published: 18 July 2026",
    "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
    "clauses": [
      {
        "id": "operator",
        "heading": "Operator information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
          }
        ]
      },
      {
        "id": "policies",
        "heading": "Policies",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Terms of Service",
              "Privacy Policy",
              "Cookie Policy",
              "Data Processing Agreement",
              "Acceptable Use Policy",
              "Refund Policy"
            ]
          }
        ]
      },
      {
        "id": "resources",
        "heading": "Regulators and consumer resources",
        "blocks": [
          {
            "type": "paragraph",
            "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
          }
        ]
      }
    ]
  },
  "es": {
    "slug": "hub",
    "locale": "es",
    "title": "Legal policies",
    "description": "Legal policies for PinkPepper (Español).",
    "navigationLabel": "Legal",
    "version": "2026-07-18",
    "publishedLabel": "Published: 18 July 2026",
    "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
    "clauses": [
      {
        "id": "operator",
        "heading": "Operator information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
          }
        ]
      },
      {
        "id": "policies",
        "heading": "Policies",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Terms of Service",
              "Privacy Policy",
              "Cookie Policy",
              "Data Processing Agreement",
              "Acceptable Use Policy",
              "Refund Policy"
            ]
          }
        ]
      },
      {
        "id": "resources",
        "heading": "Regulators and consumer resources",
        "blocks": [
          {
            "type": "paragraph",
            "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
          }
        ]
      }
    ]
  },
  "it": {
    "slug": "hub",
    "locale": "it",
    "title": "Legal policies",
    "description": "Legal policies for PinkPepper (Italiano).",
    "navigationLabel": "Legal",
    "version": "2026-07-18",
    "publishedLabel": "Published: 18 July 2026",
    "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
    "clauses": [
      {
        "id": "operator",
        "heading": "Operator information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
          }
        ]
      },
      {
        "id": "policies",
        "heading": "Policies",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Terms of Service",
              "Privacy Policy",
              "Cookie Policy",
              "Data Processing Agreement",
              "Acceptable Use Policy",
              "Refund Policy"
            ]
          }
        ]
      },
      {
        "id": "resources",
        "heading": "Regulators and consumer resources",
        "blocks": [
          {
            "type": "paragraph",
            "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
          }
        ]
      }
    ]
  },
  "pt": {
    "slug": "hub",
    "locale": "pt",
    "title": "Legal policies",
    "description": "Legal policies for PinkPepper (Português).",
    "navigationLabel": "Legal",
    "version": "2026-07-18",
    "publishedLabel": "Published: 18 July 2026",
    "effectiveLabel": "Effective for new users: 18 July 2026; existing users: 17 August 2026",
    "clauses": [
      {
        "id": "operator",
        "heading": "Operator information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Operator: João Pedro Reis, trading as PinkPepper. NIF 256709661. Address: Rua Duarte Galvão 14 r/c dto., 1500-254 Lisboa, Portugal. Contact: support@pinkpepper.io. PinkPepper is not currently registered in the Portuguese Electronic Complaints Book. Registration remains a production compliance action."
          }
        ]
      },
      {
        "id": "policies",
        "heading": "Policies",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Terms of Service",
              "Privacy Policy",
              "Cookie Policy",
              "Data Processing Agreement",
              "Acceptable Use Policy",
              "Refund Policy"
            ]
          }
        ]
      },
      {
        "id": "resources",
        "heading": "Regulators and consumer resources",
        "blocks": [
          {
            "type": "paragraph",
            "text": "CNPD: https://www.cnpd.pt/. ICO: https://ico.org.uk/. Portuguese consumer and ADR information: https://www.consumidor.gov.pt/. Electronic Complaints Book information: https://www.livroreclamacoes.pt/Inicio/. PinkPepper may be accessed from the United Kingdom. UK representative status is unresolved and must be confirmed by qualified legal review or appointment before treating that point as complete."
          }
        ]
      }
    ]
  }
} as const satisfies Record<LegalLocale, LegalDocument>;

export function getLegalDocument(slug: LegalPolicySlug, locale: LegalLocale = "en"): LegalDocument { return legalDocuments[locale][slug]; }
export function getLegalHub(locale: LegalLocale = "en"): LegalDocument { return legalHubs[locale]; }
export function getAllLegalDocuments(): LegalDocument[] { return LEGAL_LOCALES.flatMap((locale) => LEGAL_POLICY_SLUGS.map((slug) => legalDocuments[locale][slug])); }
export function getLegalDocumentsForLocale(locale: LegalLocale): LegalDocument[] { return LEGAL_POLICY_SLUGS.map((slug) => legalDocuments[locale][slug]); }
