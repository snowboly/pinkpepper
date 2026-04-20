import FoodSafetySopGeneratorPage from "@/app/features/food-safety-sop-generator/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const metadataCopy = {
  title: "Food Safety SOP Generator | PinkPepper",
  description:
    "Generate practical food safety SOPs, hygiene procedures, and operational compliance documents for EU and UK teams.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) {
    notFound();
  }

  return buildPublicMetadata(locale, "/features/food-safety-sop-generator", metadataCopy);
}

export default FoodSafetySopGeneratorPage;
