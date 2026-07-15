"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type RouteChromeProps = {
  children: ReactNode;
  legalFooter: ReactNode;
  legalHeader: ReactNode;
  siteFooter: ReactNode;
  siteHeader: ReactNode;
};

function isLegalPath(pathname: string | null) {
  return pathname === "/legal" || Boolean(pathname?.startsWith("/legal/"));
}

export function RouteChrome({ children, legalFooter, legalHeader, siteFooter, siteHeader }: RouteChromeProps) {
  const pathname = usePathname();
  const isLegalRoute = isLegalPath(pathname);

  return (
    <>
      {isLegalRoute ? legalHeader : siteHeader}
      {children}
      {isLegalRoute ? legalFooter : siteFooter}
    </>
  );
}
