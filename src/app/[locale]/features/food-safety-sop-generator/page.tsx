import FoodSafetySopGeneratorPage from "@/app/features/food-safety-sop-generator/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale, getPublicMessages } from "@/lib/public-routes";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  const messages = await getPublicMessages(locale);
  return buildPublicMetadata(locale, "/features/food-safety-sop-generator", messages.pages.features.foodSafetySopGenerator);
}

export default FoodSafetySopGeneratorPage;
