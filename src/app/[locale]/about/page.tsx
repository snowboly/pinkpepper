import AboutPage from "@/app/about/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const aboutMetadata = {
  title: "About PinkPepper | AI Food Safety Software by a Food Scientist",
  description:
    "Built by a food scientist with hands-on compliance experience. PinkPepper combines AI grounded in 35+ EU & UK regulations with human food safety consultancy.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return buildPublicMetadata(locale, "/about", aboutMetadata);
}

export default async function LocalizedAboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return <AboutPage />;
}
