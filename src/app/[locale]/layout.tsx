import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { publicLaunchLocales } from "@/i18n/public";
import { isPublicLocale } from "@/lib/public-routes";

export function generateStaticParams() {
  return publicLaunchLocales.map((locale) => ({ locale }));
}

export default async function LocalizedPublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return children;
}
