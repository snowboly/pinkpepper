export type LegalLocale = "en" | "fr" | "de" | "es" | "it" | "pt";

export type LegalPolicySlug = "terms" | "privacy" | "cookies" | "dpa" | "acceptable-use" | "refund";

export type AcceptanceSource = "signup" | "policy_update" | "checkout";

export type LegalCapability = "general" | "checkout";

export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; tone?: "info" | "warning"; text: string }
  | { type: "link"; label: string; href: string };

export type LegalClause = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  slug: LegalPolicySlug | "hub";
  locale: LegalLocale;
  title: string;
  description: string;
  navigationLabel: string;
  version: string;
  publishedLabel: string;
  effectiveLabel: string;
  clauses: LegalClause[];
};

export type ParsedLegalPath = {
  locale: LegalLocale;
  policy: LegalPolicySlug | null;
};
