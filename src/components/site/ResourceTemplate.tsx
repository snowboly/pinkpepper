import Link from "next/link";
import { Suspense } from "react";
import { TemplateDownloadCard } from "./TemplateDownloadCard";
import { TemplateThumbnail } from "./TemplateThumbnail";

type ResourceSection = {
  title: string;
  body: string;
};

type DocumentHighlight = {
  label: string;
  description: string;
};

type ResourceTemplateProps = {
  category: string;
  title: string;
  intro: string;
  summaryPoints: string[];
  sections: ResourceSection[];
  /** Optional structured highlights shown in "What's inside" section near the blurred preview */
  documentHighlights?: DocumentHighlight[];
  ctaTitle: string;
  ctaBody: string;
  relatedLinks: Array<{ href: string; label: string }>;
  /** Single downloadable file — shows thumbnail + one download card */
  templateSlug?: string;
  /** Multiple downloadable files — shows thumbnail from first slug + stacked download cards */
  templateSlugs?: string[];
};

export function ResourceTemplate({
  category,
  title,
  intro,
  summaryPoints,
  sections,
  documentHighlights,
  relatedLinks,
  templateSlug,
  templateSlugs,
}: ResourceTemplateProps) {
  // Normalise to an array; templateSlugs takes precedence
  const slugs = templateSlugs ?? (templateSlug ? [templateSlug] : []);
  const hasSlugs = slugs.length > 0;

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

      {/* Blurred thumbnail preview + CTA card */}
      {hasSlugs && (
        <section className="bg-[#F8FAFC] py-14">
          <div className="pp-container max-w-4xl">
            <div className="grid gap-8 md:grid-cols-[1fr_320px] items-start">
              {/* Blurred document preview */}
              <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                {/* Blurred thumbnail */}
                <div className="select-none pointer-events-none" style={{ filter: "blur(5px)", transform: "scale(1.02)" }}>
                  <Suspense fallback={<div className="aspect-[600/780] bg-[#F1F5F9] animate-pulse" />}>
                    <TemplateThumbnail slug={slugs[0]} alt={`${title} preview`} />
                  </Suspense>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/20">
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm text-center">
                    <LockIcon />
                    <p className="text-sm font-semibold text-[#0F172A]">Document preview</p>
                    <p className="text-xs leading-relaxed text-[#64748B] max-w-[180px]">
                      Full document available in your workspace
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA card — single card covering all slugs */}
              <div className="md:sticky md:top-24">
                <Suspense fallback={<DownloadCardSkeleton />}>
                  <TemplateDownloadCard slugs={slugs} title={title} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Document explanation — what's inside, key aspects, what to look for */}
      <section className="bg-white py-14">
        <div className="pp-container max-w-4xl">
          {/* Summary points */}
          {summaryPoints.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {summaryPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                  <p className="text-base font-semibold leading-relaxed text-[#0F172A]">{point}</p>
                </div>
              ))}
            </div>
          )}

          {/* Structured document highlights */}
          {documentHighlights && documentHighlights.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-[#0F172A]">What&apos;s inside this template</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {documentHighlights.map((highlight) => (
                  <div key={highlight.label} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                    <p className="text-sm font-semibold text-[#0F172A]">{highlight.label}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editorial sections */}
          {sections.length > 0 && (
            <div className={`space-y-10 ${summaryPoints.length > 0 || (documentHighlights && documentHighlights.length > 0) ? "mt-14" : ""}`}>
              {sections.map((section) => (
                <article key={section.title}>
                  <h2 className="text-2xl font-semibold text-[#0F172A]">{section.title}</h2>
                  <p className="mt-4 text-base leading-relaxed text-[#475569]">{section.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">Ready to start?</p>
          <h2 className="pp-display mx-auto mt-3 max-w-xl text-3xl text-[#0F172A] md:text-4xl">
            Start free. No card required.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-[#64748B]">
            Try PinkPepper on a real compliance question today.
          </p>
          <div className="mt-7">
            <Link
              href="/signup"
              className="pp-interactive inline-block rounded-full bg-[#E11D48] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#BE123C]"
            >
              Get Started
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

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#94A3B8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
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
