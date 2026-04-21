"use server";

import { cookies } from "next/headers";
import { publicLaunchLocales, type PublicLocale } from "@/i18n/public";

export async function setLocaleCookie(locale: PublicLocale) {
  if (!(publicLaunchLocales as readonly string[]).includes(locale)) return;
  const store = await cookies();
  store.set("locale", locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
}
