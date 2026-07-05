import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getArticleManifest,
  getAvailableArticleLocales,
  shouldIndexArticle,
  type ArticleRecord,
} from "@/lib/articles";
import { getCspNonce } from "@/lib/security/csp";
import { processArticleContent } from "@/lib/article-content";
import { type PublicLocale } from "@/i18n/public";
import { getPublicPageHref } from "@/lib/public-routes";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
  locale?: PublicLocale;
};

const articleUiCopy: Record<
  PublicLocale,
  {
    home: string;
    articles: string;
    nextMove: string;
    putIntoPractice: string;
    bridgeBody: string;
    relatedEyebrow: string;
    relatedTitle: string;
    relatedBody: string;
    readNext: string;
    backToHub: string;
  }
> = {
  en: {
    home: "Home",
    articles: "Articles",
    nextMove: "Next move",
    putIntoPractice: "Put this into practice",
    bridgeBody:
      "Keep the article useful by moving straight into the template, workflow, or operating model that matches the control problem you are working on.",
    relatedEyebrow: "Related reading",
    relatedTitle: "Keep building the same cluster",
    relatedBody:
      "Continue into related HACCP, audit, and operational compliance topics instead of dropping back to the archive.",
    readNext: "Read next",
    backToHub: "Back to the full article hub",
  },
  de: {
    home: "Startseite",
    articles: "Artikel",
    nextMove: "Nächster Schritt",
    putIntoPractice: "In die Praxis umsetzen",
    bridgeBody:
      "Nutzen Sie die passende Vorlage oder den passenden Arbeitsablauf, um die Inhalte direkt im Betrieb anzuwenden.",
    relatedEyebrow: "Weitere Artikel",
    relatedTitle: "Das Thema gezielt vertiefen",
    relatedBody:
      "Lesen Sie passende Beiträge zu HACCP, Audits und betrieblichen Kontrollen weiter.",
    readNext: "Weiterlesen",
    backToHub: "Zurück zur Artikelübersicht",
  },
  fr: {
    home: "Accueil",
    articles: "Articles",
    nextMove: "Étape suivante",
    putIntoPractice: "Mettre en pratique",
    bridgeBody:
      "Passez directement au modèle ou au processus adapté pour appliquer ces recommandations dans votre établissement.",
    relatedEyebrow: "Articles associés",
    relatedTitle: "Approfondir ce sujet",
    relatedBody:
      "Poursuivez avec des articles liés au système HACCP, aux audits et aux contrôles opérationnels.",
    readNext: "Lire la suite",
    backToHub: "Retour à tous les articles",
  },
  pt: {
    home: "Início",
    articles: "Artigos",
    nextMove: "Próximo passo",
    putIntoPractice: "Aplicar na prática",
    bridgeBody:
      "Passe diretamente para o modelo ou processo adequado para aplicar estas orientações na operação.",
    relatedEyebrow: "Leitura relacionada",
    relatedTitle: "Aprofundar este tema",
    relatedBody:
      "Continue com artigos relacionados sobre HACCP, auditorias e controlos operacionais.",
    readNext: "Ler a seguir",
    backToHub: "Voltar a todos os artigos",
  },
};

type BridgeLink = {
  href: string;
  title: string;
  description: string;
};

const defaultArticleBridgeLinks: Record<string, BridgeLink[]> = {
  guide: [
    {
      href: "/resources/haccp-plan-template",
      title: "Use the HACCP plan template",
      description: "Move from general guidance into a cleaner working structure you can adapt to your own process.",
    },
    {
      href: "/features/haccp-plan-generator",
      title: "Build the workflow inside PinkPepper",
      description: "Turn the same hazard and CCP logic into a draft plan, supporting SOPs, and corrective actions.",
    },
    {
      href: "/use-cases/restaurants",
      title: "See the restaurant workflow",
      description: "Compare the generic guidance against a more concrete operational model for service kitchens.",
    },
  ],
  operations: [
    {
      href: "/resources/temperature-monitoring-log-template",
      title: "Download the temperature monitoring log",
      description: "Use a record layout that separates product-safety checks from routine ambient monitoring.",
    },
    {
      href: "/features/haccp-plan-generator",
      title: "Tie monitoring into the HACCP workflow",
      description: "Build CCP limits, records, and corrective actions into the same compliance flow instead of scattering them across files.",
    },
    {
      href: "/use-cases/catering",
      title: "See the catering workflow",
      description: "Apply the same control logic in a mobile or event-led operation where setup and service windows create extra risk.",
    },
  ],
  compliance: [
    {
      href: "/resources/haccp-plan-template",
      title: "Start with the HACCP plan template",
      description: "Use a cleaner structure if you need to convert guidance into a site-specific plan quickly.",
    },
    {
      href: "/features/haccp-plan-generator",
      title: "Move into the full compliance workflow",
      description: "Build the actual HACCP record set instead of leaving the article insight disconnected from implementation.",
    },
    {
      href: "/use-cases/food-manufacturing",
      title: "See the manufacturing workflow",
      description: "Use the manufacturing path if the control point needs to work across higher-volume production and records.",
    },
  ],
  allergens: [
    {
      href: "/resources/allergen-matrix-template",
      title: "Download the allergen matrix template",
      description: "Translate allergen guidance into a usable reference for menu changes, supplier checks, and service teams.",
    },
    {
      href: "/features/allergen-documentation",
      title: "Centralize allergen documentation",
      description: "Keep declarations, matrix updates, and supporting records aligned in one workflow.",
    },
    {
      href: "/use-cases/restaurants",
      title: "See the restaurant workflow",
      description: "Use the restaurant path when allergen risk depends on substitutions, prep overlap, and service communication.",
    },
  ],
  audit: [
    {
      href: "/resources/food-safety-audit-checklist",
      title: "Use the audit checklist",
      description: "Turn the weak points from the article into a practical pre-inspection review before your next visit or certification check.",
    },
    {
      href: "/features/haccp-plan-generator",
      title: "Fix the underlying HACCP workflow",
      description: "Use the product workflow when the audit issue points to deeper gaps in hazard analysis, records, or corrective actions.",
    },
    {
      href: "/use-cases/food-manufacturing",
      title: "See the manufacturing workflow",
      description: "Use the manufacturing path if audit pressure is coming from higher-volume controls, traceability, or more formal records.",
    },
  ],
  checklist: [
    {
      href: "/resources/haccp-plan-template",
      title: "Start with the HACCP plan template",
      description: "Use a cleaner document structure if the checklist has exposed gaps in the actual plan.",
    },
    {
      href: "/resources/corrective-action-log-template",
      title: "Add a corrective action log",
      description: "Keep findings, fixes, and verification in one place instead of losing them across ad hoc notes.",
    },
    {
      href: "/use-cases/restaurants",
      title: "See the restaurant workflow",
      description: "Follow a concrete operating model if you want the checklist to map onto day-to-day kitchen controls.",
    },
  ],
};

const articleBridgeOverrides: Record<string, BridgeLink[]> = {
  "cooling-and-reheating-haccp-high-risk-steps": defaultArticleBridgeLinks.operations,
  "temperature-control-in-haccp-limits-and-monitoring": [
    defaultArticleBridgeLinks.operations[0],
    {
      href: "/resources/corrective-action-log-template",
      title: "Add a corrective action log",
      description: "Capture the product decision and process fix when a temperature deviation pushes you beyond the critical limit.",
    },
    defaultArticleBridgeLinks.operations[2],
  ],
  "identifying-critical-control-points-in-food-safety": [
    defaultArticleBridgeLinks.guide[0],
    defaultArticleBridgeLinks.guide[1],
    {
      href: "/use-cases/restaurants",
      title: "See the restaurant workflow",
      description: "Compare CCP decisions against a real service operation instead of leaving them as abstract flow-chart logic.",
    },
  ],
  "haccp-for-event-catering-eu": defaultArticleBridgeLinks.operations,
};

function resolveArticleBridgeLinks(article: ArticleRecord) {
  const override = articleBridgeOverrides[article.slug];
  if (override) {
    return override;
  }

  return defaultArticleBridgeLinks[article.category.toLowerCase()] ?? defaultArticleBridgeLinks.guide;
}

export async function generateStaticParams() {
  const articles = await getArticleManifest();
  return articles.map((article) => ({ slug: article.slug }));
}

function getArticleUrl(slug: string, locale: PublicLocale) {
  return locale === "en"
    ? `https://pinkpepper.io/articles/${slug}`
    : `https://pinkpepper.io/${locale}/articles/${slug}`;
}

export async function buildArticleLanguageAlternates(slug: string) {
  const locales = await getAvailableArticleLocales(slug);
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, getArticleUrl(slug, locale)]),
  );
  const englishUrl = getArticleUrl(slug, "en");

  return { "x-default": englishUrl, ...languages };
}

export async function generateArticleMetadata(slug: string, locale: PublicLocale = "en"): Promise<Metadata> {
  const article = await getArticleBySlug(slug, { locale });

  if (!article) {
    return {};
  }

  const url = getArticleUrl(article.slug, locale);
  return {
    title: `${article.title} | PinkPepper`,
    description: article.excerpt,
    robots: shouldIndexArticle(article, locale) ? undefined : { index: false, follow: true },
    alternates: {
      canonical: url,
      languages: await buildArticleLanguageAlternates(article.slug),
    },
    openGraph: {
      title: `${article.title} | PinkPepper`,
      description: article.excerpt,
      locale: locale === "fr" ? "fr_FR" : locale === "de" ? "de_DE" : locale === "pt" ? "pt_PT" : "en_GB",
      images: [
        article.image
          ? { url: article.image, width: 1200, height: 630, alt: article.title }
          : { url: "https://pinkpepper.io/social-card.png", width: 1200, height: 630, alt: "PinkPepper - AI Food Safety Compliance Software" },
      ],
    },
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateArticleMetadata(slug, "en");
}

export default async function ArticleDetailPage({ params, locale = "en" }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, { locale });
  const articleManifest = await getArticleManifest({ locale });
  const nonce = await getCspNonce();
  const copy = articleUiCopy[locale];

  if (!article) {
    notFound();
  }

  const { processedContent } = processArticleContent(article.body);
  const bridgeLinks = resolveArticleBridgeLinks(article);
  const relatedArticles = [
    ...articleManifest.filter((candidate) => candidate.slug !== article.slug && candidate.category === article.category),
    ...articleManifest.filter((candidate) => candidate.slug !== article.slug && candidate.category !== article.category),
  ]
    .filter((candidate) => shouldIndexArticle(candidate, locale))
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "PinkPepper",
      url: "https://pinkpepper.io",
    },
    publisher: {
      "@type": "Organization",
      name: "PinkPepper",
      url: "https://pinkpepper.io",
      logo: {
        "@type": "ImageObject",
        url: "https://pinkpepper.io/logo/android-chrome-512x512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getArticleUrl(article.slug, locale),
    },
    ...(article.image ? { image: article.image } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.home, item: "https://pinkpepper.io" },
      { "@type": "ListItem", position: 2, name: copy.articles, item: locale === "en" ? "https://pinkpepper.io/articles" : `https://pinkpepper.io/${locale}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: getArticleUrl(article.slug, locale) },
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
            <p className="mt-5 text-base font-semibold text-[#64748B]">{article.publishedAt}</p>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-[#475569]">{article.excerpt}</p>
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

      {bridgeLinks.length > 0 ? (
        <section className="border-t border-[#F1F5F9] bg-[#FFF7ED] py-16">
          <div className="pp-container max-w-5xl">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">{copy.nextMove}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A]">{copy.putIntoPractice}</h2>
              <p className="mt-4 text-base leading-7 text-[#475569]">
                {copy.bridgeBody}
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {bridgeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={getPublicPageHref(locale, link.href)}
                  className="rounded-[1.75rem] border border-[#FED7AA] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#FDBA74] hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
                >
                  <p className="text-lg font-semibold leading-tight text-[#0F172A]">{link.title}</p>
                  <p className="mt-3 text-base leading-8 text-[#475569]">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedArticles.length > 0 ? (
        <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
          <div className="pp-container max-w-5xl">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">{copy.relatedEyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A]">{copy.relatedTitle}</h2>
              <p className="mt-4 text-base leading-7 text-[#475569]">
                {copy.relatedBody}
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {relatedArticles.map((candidate) => (
                <article
                  key={candidate.slug}
                  className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">{candidate.category}</p>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-[#0F172A]">
                    <Link href={locale === "en" ? `/articles/${candidate.slug}` : `/${locale}/articles/${candidate.slug}`} className="transition-colors hover:text-[#BE123C]">
                      {candidate.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-base leading-8 text-[#475569]">{candidate.excerpt}</p>
                  <div className="mt-5 border-t border-[#F1F5F9] pt-4">
                    <Link
                      href={locale === "en" ? `/articles/${candidate.slug}` : `/${locale}/articles/${candidate.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#FDA4AF] hover:text-[#BE123C]"
                    >
                      <span>{copy.readNext}</span>
                      <span aria-hidden="true">+</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <Link href={locale === "en" ? "/articles" : `/${locale}/articles`} className="text-sm font-semibold text-[#BE123C] hover:text-[#9F1239]">
                {copy.backToHub}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
