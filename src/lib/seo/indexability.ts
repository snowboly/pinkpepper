import type { PublicLocale } from "@/i18n/public";

const localizedPublicNoindexPaths = new Set<string>([
  "/",
  "/pricing",
  "/features/haccp-plan-generator",
  "/features/allergen-documentation",
  "/features/food-safety-sop-generator",
  "/about",
  "/articles",
  "/faqs",
  "/contact",
]);

export function shouldIndexPublicRoute(path: string, locale: PublicLocale) {
  if (locale === "en") {
    return true;
  }

  return !localizedPublicNoindexPaths.has(path);
}

const resourceNoindexPaths = new Set<string>([
  "/resources/brc-checklist-poster",
  "/resources/halal-compliance-poster",
  "/resources/iso22000-checklist-poster",
  "/resources/kosher-compliance-poster",
  "/resources/workplace-compliance-poster",
]);

export function shouldIndexResourceRoute(path: string) {
  return !resourceNoindexPaths.has(path);
}
