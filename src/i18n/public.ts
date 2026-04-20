import type { Locale } from "./config";

export const publicLaunchLocales = ["en", "fr", "de", "pt"] as const satisfies readonly Locale[];
export type PublicLocale = (typeof publicLaunchLocales)[number];

export const publicContentRoutePaths = [
  "/",
  "/pricing",
  "/features/haccp-plan-generator",
  "/features/allergen-documentation",
  "/features/food-safety-sop-generator",
] as const;

export const publicAuthRoutePaths = ["/signup", "/login"] as const;

export const publicRoutePaths = [
  ...publicContentRoutePaths,
  ...publicAuthRoutePaths,
] as const;
