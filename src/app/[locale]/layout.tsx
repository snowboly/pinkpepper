import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { publicLaunchLocales } from "@/i18n/public";
import { isPublicLocale } from "@/lib/public-routes";
import { LEGAL_LOCALES } from "@/lib/legal/config";
import { isLegalLocale } from "@/lib/legal/routes";

export function generateStaticParams() {
  return LEGAL_LOCALES.filter((locale) => locale !== "en").map((locale) => ({ locale }));
}

export default async function LocalizedPublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLegalLocale(locale)) {
    notFound();
  }

  setRequestLocale(isPublicLocale(locale) ? locale : "en");

  return children;
}
