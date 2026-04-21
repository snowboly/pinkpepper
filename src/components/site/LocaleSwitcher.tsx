"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames } from "@/i18n/config";
import { publicLaunchLocales, type PublicLocale } from "@/i18n/public";
import { switchPublicLocale } from "@/lib/public-routes";
import { setLocaleCookie } from "@/lib/actions/locale";

export function LocaleSwitcher({
  currentLocale,
  label,
  currentLabel,
}: {
  currentLocale: PublicLocale;
  label: string;
  currentLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on outside click/touch
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex cursor-pointer items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]"
      >
        <span>{label}</span>
        <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-xs text-[#0F172A]">
          {localeNames[currentLocale]}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-44 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
            {currentLabel}
          </p>
          <div role="listbox" className="flex flex-col gap-1">
            {publicLaunchLocales.map((locale) => (
              <Link
                key={locale}
                href={switchPublicLocale(pathname, locale)}
                role="option"
                aria-selected={locale === currentLocale}
                onClick={() => { void setLocaleCookie(locale); setOpen(false); }}
                className={`rounded-xl px-3 py-2 text-sm ${
                  locale === currentLocale
                    ? "bg-[#FFF1F2] font-semibold text-[#BE123C]"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                {localeNames[locale]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
