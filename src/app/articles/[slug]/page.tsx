import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getAllArticles();
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

  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{article.category}</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">{article.title}</h1>
          <p className="mt-6 text-sm font-medium text-[#64748B]">{article.publishedAt}</p>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">{article.excerpt}</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container max-w-4xl">
          <div
            className="prose prose-slate max-w-none prose-headings:text-[#0F172A] prose-p:text-[#334155]"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </div>
      </section>
    </main>
  );
}
