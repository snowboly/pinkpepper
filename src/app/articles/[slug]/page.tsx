import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleManifest } from "@/lib/articles";
import { processArticleContent } from "@/lib/article-content";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getArticleManifest();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | PinkPepper`,
    description: article.excerpt,
    alternates: {
      canonical: `https://pinkpepper.io/articles/${article.slug}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { processedContent } = processArticleContent(article.body);

  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-24">
        <div className="pp-container max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{article.category}</p>
          <h1 className="pp-display mt-4 max-w-4xl text-4xl text-[#0F172A] md:text-6xl">{article.title}</h1>
          <p className="mt-5 text-sm font-medium text-[#64748B]">{article.publishedAt}</p>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">{article.excerpt}</p>
          {article.image ? (
            <figure className="mt-10 overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <Image
                src={article.image}
                alt={article.title}
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
              />
            </figure>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <div
            className="pp-article-body prose prose-slate max-w-none prose-headings:text-[#0F172A] prose-p:text-[#334155]"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </section>
    </main>
  );
}
