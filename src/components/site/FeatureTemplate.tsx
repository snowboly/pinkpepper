import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

type Section = {
  title: string;
  body: string;
};

type FeatureTemplateProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  painPoints: string[];
  outcomes: string[];
  sections: Section[];
  relatedLinks: Array<{ href: string; label: string; description: string }>;
  heroImage?: { src: string; alt: string };
};

export function FeatureTemplate({
  eyebrow,
  title,
  description,
  primaryCta,
  painPoints,
  outcomes,
  sections,
  relatedLinks,
  heroImage,
}: FeatureTemplateProps) {
  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-[#F1F5F9] bg-white py-16 md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#FFF1F2,transparent_55%)]" />
        <div className="pp-container grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">{eyebrow}</p>
            <h1 className="pp-display mt-4 max-w-4xl text-4xl text-[#0F172A] md:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#475569]">{description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
              >
                {primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
            <p className="text-sm font-semibold text-[#0F172A]">Common challenges</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#475569]">
              {painPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {heroImage && (
        <section className="border-b border-[#F1F5F9] bg-[#F8FAFC] py-12">
          <div className="pp-container">
            <div className="relative mx-auto aspect-[21/9] max-w-5xl overflow-hidden rounded-3xl">
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1120px"
                priority
              />
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-16">
        <div className="pp-container">
          <div className="grid gap-6 md:grid-cols-3">
            {outcomes.map((outcome) => (
              <div key={outcome} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-[#E11D48]" />
                <p className="mt-4 text-base font-semibold leading-relaxed text-[#0F172A]">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container grid gap-6 lg:grid-cols-3">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
              <h2 className="text-xl font-semibold text-[#0F172A]">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="pp-container">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E11D48]">Related pages</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#0F172A]">Continue your evaluation</h2>
            </div>
            <Link href="/features" className="hidden text-sm font-semibold text-[#E11D48] md:block">
              Browse all features
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-lg hover:shadow-black/[0.04]"
              >
                <p className="text-lg font-semibold text-[#0F172A]">{link.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
