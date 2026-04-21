import HaccpPlanGeneratorPage from "@/app/features/haccp-plan-generator/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale, getPublicMessages } from "@/lib/public-routes";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  const messages = await getPublicMessages(locale);
  return buildPublicMetadata(locale, "/features/haccp-plan-generator", messages.pages.features.haccpPlanGenerator);
}

export default HaccpPlanGeneratorPage;
