import FaqsPage from "@/app/faqs/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale, getPublicMessages } from "@/lib/public-routes";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  const messages = await getPublicMessages(locale);
  return buildPublicMetadata(locale, "/faqs", messages.pages.faqs);
}

export default async function LocalizedFaqsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return <FaqsPage />;
}
