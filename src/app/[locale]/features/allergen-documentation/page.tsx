import AllergenDocumentationPage from "@/app/features/allergen-documentation/page";
import { buildLocalizedWrapperMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale, getPublicMessages } from "@/lib/public-routes";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  const messages = await getPublicMessages(locale);
  return buildLocalizedWrapperMetadata(locale, "/features/allergen-documentation", messages.pages.features.allergenDocumentation);
}

export default AllergenDocumentationPage;
