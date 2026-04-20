import type { Locale } from "./config";

export const publicLaunchLocales = ["en", "fr", "de", "pt"] as const satisfies readonly Locale[];
export type PublicLocale = (typeof publicLaunchLocales)[number];

export const publicRoutePaths = [
  "/",
  "/pricing",
  "/features/haccp-plan-generator",
  "/features/allergen-documentation",
  "/features/food-safety-sop-generator",
  "/signup",
  "/login",
] as const;
