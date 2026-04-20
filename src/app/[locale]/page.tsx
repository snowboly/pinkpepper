import HomePage from "@/app/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const homeMetadata = {
  title: "PinkPepper | AI HACCP & Food Safety Software for EU & UK Businesses",
  description:
    "Generate HACCP plans, allergen records, SOPs & audit-ready documents in minutes. AI food safety software grounded in 35+ EU & UK regulations. Start free.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) {
    notFound();
  }

  return buildPublicMetadata(locale, "/", homeMetadata);
}

export default HomePage;
