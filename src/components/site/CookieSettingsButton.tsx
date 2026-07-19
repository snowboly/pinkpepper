"use client";

import { COOKIE_SETTINGS_EVENT } from "@/components/site/CookieBanner";

export function CookieSettingsButton() {
  return <button type="button" className="pp-shell-link text-left" onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}>Cookie settings</button>;
}
