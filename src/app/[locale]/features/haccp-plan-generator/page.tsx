import HaccpPlanGeneratorPage from "@/app/features/haccp-plan-generator/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const metadataCopy = {
  title: "HACCP Plan Generator - Build a Codex-Compliant Plan | PinkPepper",
  description:
    "Build a complete, audit-ready HACCP plan in hours. AI trained on Regulation (EC) 852/2004, Codex Alimentarius, and GFSI schemes - with optional human expert review.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) {
    notFound();
  }

  return buildPublicMetadata(locale, "/features/haccp-plan-generator", metadataCopy);
}

export default HaccpPlanGeneratorPage;
