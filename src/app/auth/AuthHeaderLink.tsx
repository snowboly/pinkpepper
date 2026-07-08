"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PublicLocale } from "@/i18n/public";
import { getPublicPageHref, isPublicLocale } from "@/lib/public-routes";

type AuthHeaderLinkProps = {
  href: "/login" | "/signup";
  children: string;
};

export function AuthHeaderLink({ href, children }: AuthHeaderLinkProps) {
  const pathname = usePathname();
  const maybeLocale = pathname.split("/").filter(Boolean)[0];
  const locale = isPublicLocale(maybeLocale ?? "") ? (maybeLocale as PublicLocale) : "en";

  return (
    <Link href={getPublicPageHref(locale, href)} className="font-semibold text-[#D96C6C] hover:text-[#C95A5A]">
      {children}
    </Link>
  );
}
