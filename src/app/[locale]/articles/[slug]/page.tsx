import { notFound } from "next/navigation";
import ArticleDetailPage, { generateArticleMetadata } from "@/app/articles/[slug]/page";
import { getArticleManifest } from "@/lib/articles";
import { isPublicLocale } from "@/lib/public-routes";

type LocalizedArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const locales = ["fr", "de", "pt"] as const;
  const params = await Promise.all(
    locales.map(async (locale) => {
      const articles = await getArticleManifest({ locale });
      return articles.map((article) => ({ locale, slug: article.slug }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({ params }: LocalizedArticlePageProps) {
  const { locale, slug } = await params;
  if (!isPublicLocale(locale) || locale === "en") notFound();

  return generateArticleMetadata(slug, locale);
}

export default async function LocalizedArticleDetailPage({ params }: LocalizedArticlePageProps) {
  const { locale, slug } = await params;
  if (!isPublicLocale(locale) || locale === "en") notFound();

  return <ArticleDetailPage params={Promise.resolve({ slug })} locale={locale} />;
}
