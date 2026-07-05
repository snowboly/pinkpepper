import type { PublicLocale } from "@/i18n/public";

const localizedPublicNoindexPaths = new Set<string>([
  "/features/allergen-documentation",
]);

export function shouldIndexPublicRoute(path: string, locale: PublicLocale) {
  if (locale === "en") {
    return true;
  }

  return !localizedPublicNoindexPaths.has(path);
}
