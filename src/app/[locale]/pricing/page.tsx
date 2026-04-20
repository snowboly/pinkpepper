import PricingPage from "@/app/pricing/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const pricingMetadata = {
  title: "Pricing - From EUR0/mo | PinkPepper Food Safety Software",
  description:
    "Start free. Plus at EUR19/mo for daily HACCP & SOP use. Pro at EUR99/mo adds Auditor mode + 2h human consultancy. Save EUR18,000+/year on compliance costs.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) {
    notFound();
  }

  return buildPublicMetadata(locale, "/pricing", pricingMetadata);
}

export default async function LocalizedPricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) {
    notFound();
  }

  return <PricingPage locale={locale} />;
}
