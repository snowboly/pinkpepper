"use client";

import { useState } from "react";
import type { PublicLocale } from "@/i18n/public";
import { ArticleCard } from "@/components/articles/ArticleCard";

type ArticleSummary = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image?: string;
};

type ArticleLibraryRemainderProps = {
  articles: ArticleSummary[];
  locale: PublicLocale;
  localizedArticleSlugs: string[];
};

function getArticleHref(slug: string, locale: PublicLocale, localizedSlugs: ReadonlySet<string>) {
  if (locale === "en" || !localizedSlugs.has(slug)) {
    return `/articles/${slug}`;
  }

  return `/${locale}/articles/${slug}`;
}

export function ArticleLibraryRemainder({
  articles,
  locale,
  localizedArticleSlugs,
}: ArticleLibraryRemainderProps) {
  const [expanded, setExpanded] = useState(false);
  const localizedSlugSet = new Set(localizedArticleSlugs);

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
      >
        {expanded ? "Hide the remaining articles" : `Show the remaining ${articles.length} articles`}
      </button>

      {expanded ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              {...article}
              href={getArticleHref(article.slug, locale, localizedSlugSet)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
