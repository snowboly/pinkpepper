import type { LegalLocale, LegalPolicySlug } from "./types";

export const LEGAL_LOCALES = ["en", "fr", "de", "es", "it", "pt"] as const satisfies readonly LegalLocale[];

export const LEGAL_POLICY_SLUGS = ["terms", "privacy", "cookies", "dpa", "acceptable-use", "refund"] as const satisfies readonly LegalPolicySlug[];

export const LEGAL_OPERATOR = {
  legalName: "Jo?o Pedro Reis",
  tradingName: "PinkPepper",
  taxIdLabel: "NIF",
  taxId: "256709661",
  address: "Rua Duarte Galv?o 14 r/c dto., 1500-254 Lisboa, Portugal",
  country: "Portugal",
  contactEmail: "support@pinkpepper.io",
} as const;

export const LEGAL_TIMELINE = {
  publishedAt: "2026-07-18T00:00:00+01:00",
  newUserEffectiveAt: "2026-07-18T00:00:00+01:00",
  existingUserEffectiveAt: "2026-08-17T00:00:00+01:00",
} as const;

export const LEGAL_POLICY_VERSIONS: Record<LegalPolicySlug, "2026-07-18"> = {
  terms: "2026-07-18",
  privacy: "2026-07-18",
  cookies: "2026-07-18",
  dpa: "2026-07-18",
  "acceptable-use": "2026-07-18",
  refund: "2026-07-18",
};

export const LEGAL_OFFICIAL_LINKS = {
  cnpd: "https://www.cnpd.pt/",
  ico: "https://ico.org.uk/",
  complaintsBook: "https://www.livroreclamacoes.pt/Inicio/",
  consumerDispute: "https://www.consumidor.gov.pt/",
  support: `mailto:${LEGAL_OPERATOR.contactEmail}`,
} as const;
