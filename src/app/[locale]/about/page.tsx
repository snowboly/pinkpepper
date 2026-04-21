import AboutPage from "@/app/about/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale, getPublicMessages } from "@/lib/public-routes";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  const messages = await getPublicMessages(locale);
  return buildPublicMetadata(locale, "/about", messages.pages.about);
}

export default async function LocalizedAboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return <AboutPage />;
}
