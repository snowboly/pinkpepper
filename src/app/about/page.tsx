import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  FileCheck,
  Users,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "About | PinkPepper",
  description:
    "PinkPepper combines AI-powered food safety compliance with expert human review. Founded by Dr Joao, with a background in chemistry and food science.",
};

export default function AboutPage() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 text-center md:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#FFF1F2,transparent)]" />
        <div className="pp-container max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#E11D48]">
            About Us
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
            Food safety compliance,
            <br className="hidden sm:block" /> powered by AI&nbsp;&amp;&nbsp;human expertise
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#475569]">
            PinkPepper is the AI compliance assistant built exclusively for food
            businesses operating under EU&nbsp;&amp;&nbsp;UK regulations. We pair
            a specialised AI agent with real food&nbsp;safety scientists so you
            get answers you can trust&nbsp;&mdash; instantly.
          </p>
        </div>
      </section>

      {/* ── Our Story ───────────────────────────────── */}
      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-14">
            <div className="flex-shrink-0">
              <div className="relative h-36 w-36 overflow-hidden rounded-2xl border-2 border-[#E11D48]/20 shadow-lg shadow-[#E11D48]/[0.06]">
                <Image
                  src="/joao.svg"
                  alt="Dr Joao — Founder of PinkPepper"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-[#0F172A]">
                Dr&nbsp;Joao
              </p>
              <p className="text-center text-xs text-[#64748B]">
                Founder &amp; Scientific Lead
              </p>
            </div>

            <div className="space-y-5 text-[#475569] leading-relaxed">
              <h2 className="text-2xl font-bold text-[#0F172A]">Our Story</h2>
              <p>
                PinkPepper was founded by <strong>Dr&nbsp;Joao</strong>, a food
                scientist with a background in <strong>chemistry and food science</strong> and
                years of hands-on experience helping food businesses achieve and
                maintain compliance.
              </p>
              <p>
                After building{" "}
                <a
                  href="https://www.ilovehaccp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#E11D48] hover:underline"
                >
                  iLoveHACCP
                </a>
                &nbsp;&mdash; a free tool for building HACCP plans for EU&nbsp;&amp;&nbsp;UK food businesses&nbsp;&mdash; one thing became clear: creating the
                plan is only the beginning. Businesses need ongoing, day-to-day
                guidance on SOPs, allergen management, audit preparation, and
                regulatory changes.
              </p>
              <blockquote className="rounded-xl border border-[#E2E8F0] bg-[#FFF1F2] p-5 text-[#0F172A] italic">
                &ldquo;Traditional consulting is too slow and too expensive for
                most food businesses. I built PinkPepper to democratise access
                to high-standard food safety systems&nbsp;&mdash; combining the
                speed of AI with the rigour of scientific expertise.&rdquo;
                <span className="mt-2 block text-sm font-semibold not-italic text-[#E11D48]">
                  &mdash; Dr&nbsp;Joao
                </span>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why PinkPepper ──────────────────────────── */}
      <section className="border-t border-[#F1F5F9] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">
            Why PinkPepper?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[#475569] leading-relaxed">
            We&rsquo;re not another generic chatbot. PinkPepper is a specialised
            food safety agent trained on EU&nbsp;&amp;&nbsp;UK regulations,
            industry standards, and real-world compliance scenarios.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Brain,
                title: "Specialised AI Agent",
                body: "Our AI is grounded in a curated knowledge base of EU & UK food safety regulations, Codex Alimentarius, BRCGS, SQF, IFS, and FSSC 22000 standards — not scraped from the open web.",
              },
              {
                icon: FileCheck,
                title: "HACCP, SOPs & Audit Prep",
                body: "Generate compliant HACCP plans, standard operating procedures, cleaning schedules, and audit-ready documentation in minutes, not weeks.",
              },
              {
                icon: Users,
                title: "Human Expert Review",
                body: "Critical documents deserve expert eyes. Our Pro tier includes human review credits — your AI-generated documents are checked by qualified food safety professionals.",
              },
              {
                icon: ShieldCheck,
                title: "Consultancy Without the Price Tag",
                body: "Get consultant-level food safety guidance on demand. PinkPepper is designed to give small and mid-sized businesses access to the same standard of compliance support as large enterprises.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-lg shadow-black/[0.04] transition-transform hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI + Human Expertise ────────────────────── */}
      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">
            AI&nbsp;+&nbsp;Human Expertise
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[#475569] leading-relaxed">
            Technology is powerful, but food safety is too important to leave
            entirely to algorithms. That&rsquo;s why PinkPepper combines both.
          </p>

          <div className="mt-12 space-y-6">
            {[
              {
                step: "1",
                title: "Ask anything, anytime",
                desc: "Use the AI assistant for instant answers on HACCP principles, allergen legislation, hygiene regulations, supplier approval, recall procedures, and more.",
              },
              {
                step: "2",
                title: "Generate documents",
                desc: "Create HACCP plans, prerequisite programmes, SOPs, monitoring logs, and corrective action reports — tailored to your business type and regulatory context.",
              },
              {
                step: "3",
                title: "Expert review & sign-off",
                desc: "Submit critical documents for human review by food safety professionals. Get feedback, corrections, and confidence before your next audit.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-5 rounded-2xl border border-[#E2E8F0] bg-white p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#475569]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built for Food Businesses ───────────────── */}
      <section className="border-t border-[#F1F5F9] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">
            Built for Food Businesses
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[#475569] leading-relaxed">
            Whether you run a restaurant, a food manufacturing site, a catering
            operation, or a retail business&nbsp;&mdash; PinkPepper speaks your
            language.
          </p>
          <div className="mx-auto mt-10 max-w-2xl space-y-4 text-[#475569] leading-relaxed">
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">Regulation (EC) 852/2004 &amp; 853/2004</strong>{" "}
                — general and specific hygiene rules for food businesses
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">UK Food Safety Act 1990</strong>{" "}
                — post-Brexit UK compliance requirements
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">BRCGS, SQF, IFS, FSSC 22000</strong>{" "}
                — certification scheme support and audit preparation
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">Allergen legislation</strong>{" "}
                — EU FIC Regulation 1169/2011 and Natasha&apos;s Law
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sister Product ──────────────────────────── */}
      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-20">
        <div className="pp-container max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">
            Part of the iLoveHACCP Family
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#475569] leading-relaxed">
            PinkPepper is the sister product to{" "}
            <a
              href="https://www.ilovehaccp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#E11D48] hover:underline"
            >
              iLoveHACCP.com
            </a>
            , a free HACCP plan builder for EU&nbsp;&amp;&nbsp;UK food businesses. While iLoveHACCP helps you create the plan, PinkPepper is
            your ongoing compliance companion&nbsp;&mdash; answering questions,
            generating documents, and connecting you with experts.
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-[#F1F5F9] py-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_110%,#FFF1F2,transparent)]" />
        <div className="pp-container max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
            Ready to simplify compliance?
          </h2>
          <p className="mt-4 text-lg text-[#475569]">
            Join hundreds of food businesses already using PinkPepper for
            smarter, faster food safety management.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#E11D48]/20 transition-all hover:bg-[#BE123C]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-8 py-3.5 text-base font-semibold text-[#0F172A] shadow-sm transition-all hover:border-[#CBD5E1] hover:shadow-md"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
