import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { TemplateDownloadCard } from "./TemplateDownloadCard";

type ResourceSection = {
  title: string;
  body: string;
};

type ResourceTemplateProps = {
  category: string;
  title: string;
  intro: string;
  summaryPoints: string[];
  sections: ResourceSection[];
  ctaTitle: string;
  ctaBody: string;
  relatedLinks: Array<{ href: string; label: string }>;
  /** When provided, shows the thumbnail preview + download card section */
  templateSlug?: string;
};

export function ResourceTemplate({
  category,
  title,
  intro,
  summaryPoints,
  sections,
  ctaTitle,
  ctaBody,
  relatedLinks,
  templateSlug,
}: ResourceTemplateProps) {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{category}</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">{title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#475569]">{intro}</p>
        </div>
      </section>

      {/* Thumbnail preview + download card */}
      {templateSlug && (
        <section className="bg-[#F8FAFC] py-14">
          <div className="pp-container max-w-4xl">
            <div className="grid gap-8 md:grid-cols-[1fr_320px] items-start">
              {/* Document thumbnail */}
              <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                <Image
                  src={`/templates/thumbnails/${templateSlug}.svg`}
                  alt={`${title} preview`}
                  width={600}
                  height={780}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Download card — server-rendered with auth/tier state */}
              <div className="md:sticky md:top-24">
                <Suspense fallback={<DownloadCardSkeleton />}>
                  <TemplateDownloadCard slug={templateSlug} title={title} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Summary points */}
      <section className={templateSlug ? "bg-white py-14" : "bg-[#F8FAFC] py-16"}>
        <div className="pp-container grid gap-6 md:grid-cols-3">
          {summaryPoints.map((point) => (
            <div key={point} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
              <p className="text-base font-semibold leading-relaxed text-[#0F172A]">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content sections */}
      <section className={templateSlug ? "bg-[#F8FAFC] py-14" : "bg-white py-16"}>
        <div className="pp-container max-w-4xl space-y-10">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-2xl font-semibold text-[#0F172A]">{section.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-[#475569]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-[#F1F5F9] bg-[#FFF7ED] py-16">
        <div className="pp-container max-w-4xl rounded-3xl border border-[#FED7AA] bg-white p-8">
          <h2 className="text-2xl font-semibold text-[#0F172A]">{ctaTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569]">{ctaBody}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
            >
              Start for free
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-[#E2E8F0] px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Related resources */}
      <section className="bg-white py-16">
        <div className="pp-container max-w-4xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Related resources</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-sm font-semibold text-[#0F172A] transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-lg hover:shadow-black/[0.04]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function DownloadCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 animate-pulse">
      <div className="h-3 w-24 rounded bg-[#F1F5F9]" />
      <div className="mt-3 h-5 w-48 rounded bg-[#F1F5F9]" />
      <div className="mt-2 h-4 w-full rounded bg-[#F1F5F9]" />
      <div className="mt-1 h-4 w-3/4 rounded bg-[#F1F5F9]" />
      <div className="mt-5 h-10 w-36 rounded-full bg-[#F1F5F9]" />
    </div>
  );
}
