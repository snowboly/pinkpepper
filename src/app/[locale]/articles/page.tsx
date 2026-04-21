import ArticlesPage from "@/app/articles/page";
import { buildPublicMetadata } from "@/lib/seo/public-metadata";
import { isPublicLocale } from "@/lib/public-routes";
import { notFound } from "next/navigation";

const articlesMetadata = {
  title: "Food Safety Articles & Insights | PinkPepper",
  description:
    "A curated library of practical guidance on HACCP, allergen management, food safety audits, and operational compliance for EU and UK food businesses.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return buildPublicMetadata(locale, "/articles", articlesMetadata);
}

export default async function LocalizedArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  return <ArticlesPage />;
}
