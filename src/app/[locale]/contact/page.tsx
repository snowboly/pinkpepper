import ContactPage from "@/app/contact/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const contactMetadata = {
  title: "Contact PinkPepper — Food Safety Compliance Support",
  description:
    "Questions about HACCP plans, pricing, or enterprise plans? Contact PinkPepper for food safety compliance support. We respond within 1 business day.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return buildPublicMetadata(locale, "/contact", contactMetadata);
}

export default async function LocalizedContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return <ContactPage />;
}
