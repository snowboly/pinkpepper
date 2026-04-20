import AllergenDocumentationPage from "@/app/features/allergen-documentation/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const metadataCopy = {
  title: "Allergen Documentation Software | PinkPepper",
  description:
    "Create allergen matrices, menu-change records, and allergen communication documents for EU and UK food businesses with PinkPepper.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) {
    notFound();
  }

  return buildPublicMetadata(locale, "/features/allergen-documentation", metadataCopy);
}

export default AllergenDocumentationPage;
