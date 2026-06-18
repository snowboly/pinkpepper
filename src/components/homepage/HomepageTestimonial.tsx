"use client";

import Image from "next/image";
import { useState } from "react";

export type HomepageTestimonialItem = {
  quote: string;
  companyName: string;
  companyUrl: string;
  logoSrc: string;
  logoAlt: string;
  supportingLine?: string;
};

export type HomepageTestimonialProps = {
  testimonials: HomepageTestimonialItem[];
  eyebrow?: string;
};

export function HomepageTestimonial({
  testimonials,
  eyebrow = "Customer feedback",
}: HomepageTestimonialProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const testimonial = testimonials[activeIndex] ?? testimonials[0];
  const canCycle = testimonials.length > 1;

  const goToPrevious = () =>
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  const goToNext = () =>
    setActiveIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));

  return (
    <section className="border-b border-[#F1F5F9] bg-white py-16 md:py-20">
      <div className="pp-container">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-[#E2E8F0] bg-[#F8FAFC] px-8 py-10 md:px-12 md:py-12">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#E11D48]">
            {eyebrow}
          </p>

          <blockquote className="mt-6 text-center">
            <p className="text-2xl font-semibold leading-tight text-[#0F172A] md:text-3xl">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
          </blockquote>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center">
            <a
              href={testimonial.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 rounded-full border border-[#E2E8F0] bg-white px-5 py-3 text-left transition-colors hover:border-[#CBD5E1]"
            >
              <Image
                src={testimonial.logoSrc}
                alt={testimonial.logoAlt}
                width={144}
                height={56}
                className="h-9 w-auto object-contain"
              />
              <span className="text-sm font-semibold text-[#0F172A]">{testimonial.companyName}</span>
            </a>
            {testimonial.supportingLine ? (
              <p className="max-w-2xl text-sm leading-relaxed text-[#64748B]">
                {testimonial.supportingLine}
              </p>
            ) : null}
          </div>

          {canCycle ? (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous testimonial"
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#475569] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]"
              >
                Prev
              </button>
              <div className="flex items-center gap-2" aria-label="Testimonial navigation">
                {testimonials.map((item, index) => (
                  <button
                    key={`${item.companyName}-${index}`}
                    type="button"
                    aria-label={`Go to testimonial ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      index === activeIndex ? "bg-[#E11D48]" : "bg-[#CBD5E1] hover:bg-[#94A3B8]"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next testimonial"
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#475569] transition-colors hover:border-[#CBD5E1] hover:text-[#0F172A]"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
