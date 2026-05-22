import Image from "next/image";

export type HomepageTestimonialProps = {
  quote: string;
  companyName: string;
  companyUrl: string;
  logoSrc: string;
  logoAlt: string;
  supportingLine?: string;
};

export function HomepageTestimonial({
  quote,
  companyName,
  companyUrl,
  logoSrc,
  logoAlt,
  supportingLine,
}: HomepageTestimonialProps) {
  return (
    <section className="border-b border-[#F1F5F9] bg-[linear-gradient(180deg,#FFF8FB_0%,#FFFFFF_100%)] py-20">
      <div className="pp-container">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#FBCFE8] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:px-12 md:py-12">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#E11D48]">
            Customer feedback
          </p>
          <blockquote className="mt-6 text-center">
            <p className="pp-display text-3xl leading-tight text-[#0F172A] md:text-4xl">
              &ldquo;{quote}&rdquo;
            </p>
          </blockquote>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center">
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 rounded-full border border-[#F1F5F9] bg-[#FFF8FB] px-5 py-3 text-left transition-colors hover:border-[#FDA4AF] hover:bg-[#FFF1F2]"
            >
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={144}
                height={56}
                className="h-10 w-auto object-contain"
              />
              <span className="text-sm font-semibold text-[#0F172A]">{companyName}</span>
            </a>
            {supportingLine ? (
              <p className="max-w-2xl text-sm leading-relaxed text-[#64748B]">{supportingLine}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
