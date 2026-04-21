import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleManifest } from "@/lib/articles";
import { getCspNonce } from "@/lib/security/csp";
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

  const url = `https://www.pinkpepper.io/articles/${article.slug}`;
  return {
    title: `${article.title} | PinkPepper`,
    description: article.excerpt,
    alternates: {
      canonical: url,
      languages: { "x-default": url, en: url },
    },
    openGraph: {
      title: `${article.title} | PinkPepper`,
      description: article.excerpt,
      locale: "en_GB",
      images: [
        article.image
          ? { url: article.image, width: 1200, height: 630, alt: article.title }
          : { url: "https://www.pinkpepper.io/social-card.png", width: 1200, height: 630, alt: "PinkPepper - AI Food Safety Compliance Software" },
      ],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const articleManifest = await getArticleManifest();
  const nonce = await getCspNonce();

  if (!article) {
    notFound();
  }

  const { processedContent } = processArticleContent(article.body);
  const relatedArticles = [
    ...articleManifest.filter((candidate) => candidate.slug !== article.slug && candidate.category === article.category),
    ...articleManifest.filter((candidate) => candidate.slug !== article.slug && candidate.category !== article.category),
  ].slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "PinkPepper",
      url: "https://www.pinkpepper.io",
    },
    publisher: {
      "@type": "Organization",
      name: "PinkPepper",
      url: "https://www.pinkpepper.io",
      logo: {
        "@type": "ImageObject",
        url: "https://www.pinkpepper.io/logo/android-chrome-512x512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.pinkpepper.io/articles/${article.slug}`,
    },
    ...(article.image ? { image: article.image } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.pinkpepper.io" },
      { "@type": "ListItem", position: 2, name: "Articles", item: "https://www.pinkpepper.io/articles" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://www.pinkpepper.io/articles/${article.slug}` },
    ],
  };

  return (
    <main className="overflow-hidden">
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="border-b border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-24">
        <div className="pp-container max-w-5xl">
          <div className="pp-article-hero-meta max-w-4xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">{article.category}</p>
            <h1 className="pp-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[#0F172A] md:text-6xl">
              {article.title}
            </h1>
            <p className="mt-5 text-sm font-semibold text-[#64748B]">{article.publishedAt}</p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#475569]">{article.excerpt}</p>
          </div>
          {article.image ? (
            <figure className="mt-10 overflow-hidden rounded-[30px] border border-[#E2E8F0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
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
          <div className="pp-article-body max-w-none" dangerouslySetInnerHTML={{ __html: processedContent }} />
        </div>
      </section>

      {relatedArticles.length > 0 ? (
        <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
          <div className="pp-container max-w-5xl">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">Related reading</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A]">Keep building the same cluster</h2>
              <p className="mt-4 text-base leading-7 text-[#475569]">
                Continue into related HACCP, audit, and operational compliance topics instead of dropping back to the
                archive.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {relatedArticles.map((candidate) => (
                <article
                  key={candidate.slug}
                  className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">{candidate.category}</p>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-[#0F172A]">
                    <Link href={`/articles/${candidate.slug}`} className="transition-colors hover:text-[#BE123C]">
                      {candidate.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#475569]">{candidate.excerpt}</p>
                  <div className="mt-5 border-t border-[#F1F5F9] pt-4">
                    <Link
                      href={`/articles/${candidate.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#FDA4AF] hover:text-[#BE123C]"
                    >
                      <span>Read next</span>
                      <span aria-hidden="true">+</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/articles" className="text-sm font-semibold text-[#BE123C] hover:text-[#9F1239]">
                Back to the full article hub
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
