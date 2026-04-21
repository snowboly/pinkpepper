import FaqsPage from "@/app/faqs/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const faqsMetadata = {
  title: "FAQs — HACCP, Allergens, Regulations & More | PinkPepper",
  description:
    "Answers to common questions about PinkPepper: HACCP plans, allergen compliance, EU & UK regulations covered, data security, Consultant vs Auditor mode, and pricing.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return buildPublicMetadata(locale, "/faqs", faqsMetadata);
}

export default async function LocalizedFaqsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return <FaqsPage />;
}
