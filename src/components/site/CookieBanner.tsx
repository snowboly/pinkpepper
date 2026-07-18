"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

type Consent = "accepted" | "essential";

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; }
}

const STORAGE_KEY = "pp-cookie-consent";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const CONSENT_CHANGED_EVENT = "pp-cookie-consent-changed";
export const COOKIE_SETTINGS_EVENT = "pp:cookie-settings-open";

export function parseConsent(raw: string | null): Consent | null { return raw === "accepted" || raw === "essential" ? raw : null; }

export function readConsentCookie(cookieSource: string): Consent | null {
  const prefix = STORAGE_KEY + "=";
  const entry = cookieSource.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  if (!entry) return null;
  try { return parseConsent(decodeURIComponent(entry.slice(prefix.length))); } catch { return null; }
}

export function visibleGoogleAnalyticsCookieNames(cookieSource: string): string[] {
  return cookieSource.split(";").map((part) => part.trim().split("=")[0]).filter((name) => name === "_ga" || name.startsWith("_ga_"));
}

function readStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try { const stored = parseConsent(localStorage.getItem(STORAGE_KEY)); if (stored) return stored; } catch {}
  return readConsentCookie(document.cookie);
}

export function buildConsentCookie(value: Consent): string {
  return STORAGE_KEY + "=" + encodeURIComponent(value) + "; Max-Age=" + COOKIE_MAX_AGE_SECONDS + "; Path=/; SameSite=Lax";
}

function persistConsent(value: Consent) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  try { document.cookie = buildConsentCookie(value); } catch {}
}

function expireVisibleGoogleAnalyticsCookies() {
  for (const name of visibleGoogleAnalyticsCookieNames(document.cookie)) {
    document.cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax";
  }
}

type CookieBannerProps = { nonce?: string; googleAnalyticsMeasurementId?: string };

export function CookieBanner({ nonce, googleAnalyticsMeasurementId }: CookieBannerProps) {
  const [consent, setConsent] = useState<Consent | null>(readStoredConsent);
  const [visible, setVisible] = useState(() => readStoredConsent() === null);
  const reloadRequested = useRef(false);

  useEffect(() => {
    const syncConsent = () => { const next = readStoredConsent(); setConsent(next); setVisible(next === null); };
    const openSettings = () => setVisible(true);
    syncConsent();
    window.addEventListener(CONSENT_CHANGED_EVENT, syncConsent);
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => { window.removeEventListener(CONSENT_CHANGED_EVENT, syncConsent); window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings); };
  }, []);

  function accept() { setConsent("accepted"); setVisible(false); persistConsent("accepted"); }
  function decline() {
    setConsent("essential"); setVisible(false); persistConsent("essential");
    try { window.gtag?.("consent", "update", { analytics_storage: "denied" }); } catch {}
    try { expireVisibleGoogleAnalyticsCookies(); } catch {}
    if (!reloadRequested.current) { reloadRequested.current = true; window.location.reload(); }
  }

  return <>
    <Script id="pp-cookie-banner-fallback" nonce={nonce} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: "(() => { const storageKey = 'pp-cookie-consent'; const eventName = 'pp-cookie-consent-changed'; const settingsEventName = 'pp:cookie-settings-open'; const cookieMaxAge = 31536000; const parseConsent = (value) => value === 'accepted' || value === 'essential' ? value : null; const persist = (value) => { try { window.localStorage.setItem(storageKey, value); } catch {} try { document.cookie = storageKey + '=' + encodeURIComponent(value) + '; Max-Age=' + cookieMaxAge + '; Path=/; SameSite=Lax'; } catch {} }; const hideBanner = () => { const banner = document.querySelector('[data-cookie-banner]'); if (banner instanceof HTMLElement) { banner.hidden = true; banner.style.display = 'none'; } }; document.addEventListener('click', (event) => { const target = event.target; if (!(target instanceof Element)) return; const trigger = target.closest('[data-cookie-action]'); if (!(trigger instanceof HTMLElement)) return; const value = parseConsent(trigger.dataset.cookieAction ?? null); if (!value) return; persist(value); hideBanner(); window.dispatchEvent(new Event(eventName)); }); window.addEventListener(settingsEventName, () => { const banner = document.querySelector('[data-cookie-banner]'); if (banner instanceof HTMLElement) { banner.hidden = false; banner.style.display = ''; } }); })();" }} />
    {consent === "accepted" ? <><Analytics /><SpeedInsights />{googleAnalyticsMeasurementId ? <><Script id="google-analytics-loader" src={"https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsMeasurementId} strategy="afterInteractive" /><Script id="google-analytics-config" nonce={nonce} strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${googleAnalyticsMeasurementId}');`}</Script></> : null}</> : null}
    {visible && <div data-cookie-banner role="dialog" aria-modal="false" aria-label="Cookie consent" className="cookie-banner fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_12px_36px_rgba(15,23,42,0.14)] md:inset-x-6 md:bottom-6 md:px-6 md:py-4"><div className="pp-container flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><p className="max-w-3xl text-sm leading-relaxed text-[#475569]">We use essential cookies to keep PinkPepper running, and optional analytics cookies to understand usage. <Link href="/legal/cookies" className="font-medium text-[#E11D48] underline underline-offset-2 hover:no-underline">Cookie Policy</Link></p><div className="grid flex-shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end sm:gap-3"><button data-cookie-action="essential" type="button" onClick={decline} className="rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#475569] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]">Essential only</button><button data-cookie-action="accepted" type="button" onClick={accept} className="rounded-full bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]">Accept all</button></div></div></div>}
  </>;
}
