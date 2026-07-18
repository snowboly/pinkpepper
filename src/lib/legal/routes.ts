import { LEGAL_LOCALES, LEGAL_POLICY_SLUGS } from "./config";
import type { LegalLocale, LegalPolicySlug, ParsedLegalPath } from "./types";

export function isLegalLocale(value: string): value is LegalLocale {
  return (LEGAL_LOCALES as readonly string[]).includes(value);
}

function isLegalPolicySlug(value: string): value is LegalPolicySlug {
  return (LEGAL_POLICY_SLUGS as readonly string[]).includes(value);
}

export function buildLegalHubPath(locale: LegalLocale): string {
  return locale === "en" ? "/legal" : "/" + locale + "/legal";
}

export function buildLegalPath(policy: LegalPolicySlug, locale: LegalLocale): string {
  return buildLegalHubPath(locale) + "/" + policy;
}

export function parseLegalPath(pathname: string): ParsedLegalPath | null {
  const clean = (pathname.split(/[?#]/, 1)[0] || "/").replace(/\/+$/, "") || "/";
  const parts = clean.split("/").filter(Boolean);

  if (parts.length === 1 && parts[0] === "legal") return { locale: "en", policy: null };
  if (parts.length === 2 && parts[0] === "legal" && isLegalPolicySlug(parts[1])) return { locale: "en", policy: parts[1] };
  if (parts.length === 2 && isLegalLocale(parts[0]) && parts[0] !== "en" && parts[1] === "legal") return { locale: parts[0], policy: null };
  if (parts.length === 3 && isLegalLocale(parts[0]) && parts[0] !== "en" && parts[1] === "legal" && isLegalPolicySlug(parts[2])) return { locale: parts[0], policy: parts[2] };

  return null;
}

export function getLegalAlternates(policy?: LegalPolicySlug): Record<LegalLocale | "x-default", string> {
  const alternates = Object.fromEntries(
    LEGAL_LOCALES.map((locale) => [locale, policy ? buildLegalPath(policy, locale) : buildLegalHubPath(locale)]),
  ) as Record<LegalLocale, string>;
  return { ...alternates, "x-default": policy ? buildLegalPath(policy, "en") : buildLegalHubPath("en") };
}
