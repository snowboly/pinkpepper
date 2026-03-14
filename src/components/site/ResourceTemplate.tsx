import Link from "next/link";

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
}: ResourceTemplateProps) {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="pp-container max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{category}</p>
          <h1 className="pp-display mt-4 text-4xl text-[#0F172A] md:text-6xl">{title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#475569]">{intro}</p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="pp-container grid gap-6 md:grid-cols-3">
          {summaryPoints.map((point) => (
            <div key={point} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
              <p className="text-base font-semibold leading-relaxed text-[#0F172A]">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container max-w-4xl space-y-10">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-2xl font-semibold text-[#0F172A]">{section.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-[#475569]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

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
