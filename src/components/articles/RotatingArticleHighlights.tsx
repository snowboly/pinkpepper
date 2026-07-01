"use client";

import { useEffect, useState } from "react";
import type { ArticleSummary } from "@/lib/articles";
import ArticleCard from "@/components/articles/ArticleCard";

type RotatingArticleHighlightsProps = {
  articles: ArticleSummary[];
  articleHrefBySlug: Record<string, string>;
};

const ROTATING_ARTICLE_COUNT = 4;

function getRotatingSlice<T>(items: T[], seed: number, count: number) {
  if (items.length <= count) {
    return items;
  }

  const startIndex = seed % items.length;
  return Array.from({ length: count }, (_, index) => items[(startIndex + index) % items.length]);
}

function getDailySeed() {
  const today = new Date();
  const utcMonth = today.getUTCMonth() + 1;
  const utcDate = today.getUTCDate();
  return Number(`${today.getUTCFullYear()}${String(utcMonth).padStart(2, "0")}${String(utcDate).padStart(2, "0")}`);
}

export default function RotatingArticleHighlights({
  articles,
  articleHrefBySlug,
}: RotatingArticleHighlightsProps) {
  const [visibleArticles, setVisibleArticles] = useState(() => articles.slice(0, ROTATING_ARTICLE_COUNT));

  useEffect(() => {
    setVisibleArticles(getRotatingSlice(articles, getDailySeed(), ROTATING_ARTICLE_COUNT));
  }, [articles]);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-[#F1F5F9] bg-[#FFF7ED] py-14">
      <div className="pp-container">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Fresh picks</p>
          <h2 className="pp-display mt-4 text-3xl text-[#0F172A] md:text-4xl">More guides to explore</h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569]">
            Keep the core set stable, then use this rotating block to surface a few more practical guides on each visit.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleArticles.map((article) => (
            <ArticleCard
              key={article.slug}
              category={article.category}
              excerpt={article.excerpt}
              href={articleHrefBySlug[article.slug] ?? `/articles/${article.slug}`}
              image={article.image}
              publishedAt={article.publishedAt}
              title={article.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
