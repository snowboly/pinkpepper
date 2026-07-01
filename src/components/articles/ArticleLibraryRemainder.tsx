"use client";

import { useState } from "react";
import type { ArticleSummary } from "@/lib/articles";
import ArticleCard from "@/components/articles/ArticleCard";

type ArticleLibraryRemainderProps = {
  articles: ArticleSummary[];
  articleHrefBySlug: Record<string, string>;
};

export function ArticleLibraryRemainder({
  articles,
  articleHrefBySlug,
}: ArticleLibraryRemainderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (articles.length === 0) {
    return null;
  }

  if (!isExpanded) {
    return (
      <div className="mt-8 flex flex-col items-start gap-3 rounded-[2rem] border border-dashed border-[#CBD5E1] bg-white/70 p-6">
        <p className="text-sm leading-6 text-[#475569]">
          The rest of the library is available on demand so the hub loads faster on first visit.
        </p>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#FDA4AF] hover:text-[#BE123C]"
        >
          Show the remaining {articles.length} articles
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
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
  );
}

export default ArticleLibraryRemainder;
