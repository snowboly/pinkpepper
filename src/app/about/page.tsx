import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, FileCheck, ShieldCheck, Users } from "lucide-react";

export const metadata = {
  title: "About PinkPepper | AI Food Safety Software by a Food Scientist",
  description:
    "Built by a food scientist with hands-on compliance experience. PinkPepper combines AI grounded in 35+ EU & UK regulations with human food safety consultancy.",
  alternates: {
    canonical: "https://pinkpepper.io/about",
  },
};

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden py-20 text-center md:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#FFF1F2,transparent)]" />
        <div className="pp-container max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#E11D48]">About Us</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
            Built by a food scientist.
            <br className="hidden sm:block" /> Grounded in 35+ regulations.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#475569]">
            PinkPepper is AI food safety software built exclusively for EU&nbsp;&amp;&nbsp;UK food businesses.
            Generate HACCP plans, SOPs, and allergen records in minutes — then escalate to human food safety
            consultants when the work needs specialist review.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[#475569]">
            <Link
              href="/pricing"
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]"
            >
              View pricing
            </Link>
            <Link
              href="/features"
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]"
            >
              Explore product features
            </Link>
            <Link
              href="/articles"
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]"
            >
              Browse the article hub
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-14">
            <div className="flex-shrink-0">
              <div className="relative h-36 w-36 overflow-hidden rounded-2xl border-2 border-[#E11D48]/20 shadow-lg shadow-[#E11D48]/[0.06]">
                <Image src="/joao.svg" alt="Dr Joao - Founder of PinkPepper" fill className="object-cover" />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-[#0F172A]">Dr&nbsp;Joao</p>
              <p className="text-center text-xs text-[#64748B]">Founder &amp; Scientific Lead</p>
            </div>

            <div className="space-y-5 leading-relaxed text-[#475569]">
              <h2 className="text-2xl font-bold text-[#0F172A]">Our Story</h2>
              <p>
                PinkPepper was founded by <strong>Dr&nbsp;Joao</strong>, a food scientist with a background in{" "}
                <strong>chemistry and food science</strong> and years of hands-on experience helping food businesses
                achieve and maintain compliance.
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
                , a free tool for building HACCP plans for EU&nbsp;&amp;&nbsp;UK food businesses, one thing became
                clear: creating the plan is only the beginning. Businesses need ongoing, day-to-day guidance on SOPs,
                allergen management, audit preparation, and regulatory changes.
              </p>
              <blockquote className="rounded-xl border border-[#E2E8F0] bg-[#FFF1F2] p-5 italic text-[#0F172A]">
                &ldquo;Traditional consulting is too slow and too expensive for most food businesses. I built
                PinkPepper to democratise access to high-standard food safety systems by combining the speed of AI with
                the rigour of scientific expertise.&rdquo;
                <span className="mt-2 block text-sm font-semibold not-italic text-[#E11D48]">- Dr&nbsp;Joao</span>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">Why PinkPepper?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#475569]">
            We&rsquo;re not another generic chatbot. PinkPepper is specialised food safety software built around EU
            and UK regulatory work, document-heavy workflows, and the way real operators prepare for inspections and
            audits.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Brain,
                title: "Specialised AI Agent",
                body: "Our AI is grounded in a curated knowledge base of EU and UK food safety regulations, Codex Alimentarius, BRCGS, SQF, IFS, and FSSC 22000 standards, not scraped from the open web.",
              },
              {
                icon: FileCheck,
                title: "HACCP, SOPs & Audit Prep",
                body: "Generate compliant HACCP plans, standard operating procedures, cleaning schedules, and audit-ready documentation in minutes, not weeks.",
              },
              {
                icon: Users,
                title: "Human Consultancy When Needed",
                body: "Critical documents deserve expert eyes. Pro includes 2 hours of human food safety consultancy each month for specialist review and higher-risk support.",
              },
              {
                icon: ShieldCheck,
                title: "Two AI Modes, One Workflow",
                body: "Use Consultant for day-to-day answers and decisions, then switch to Auditor when you need structured findings, evidence gaps, and CAPA instead of another freeform chat reply.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-lg shadow-black/[0.04] transition-transform hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">
            Consultant, Auditor, then Human Review
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#475569]">
            PinkPepper is designed to match the job in front of you instead of forcing every task into the same chat
            flow.
          </p>

          <div className="mt-12 space-y-6">
            {[
              {
                step: "1",
                title: "Use Consultant mode",
                desc: "Get practical answers, next steps, and regulation-grounded guidance on HACCP, allergens, hygiene, supplier approval, recall procedures, and more.",
              },
              {
                step: "2",
                title: "Switch to Auditor mode",
                desc: "Turn the same problem into structured findings, evidence gaps, severity, and CAPA when you need a formal assessment instead of advice alone.",
              },
              {
                step: "3",
                title: "Escalate to human consultancy",
                desc: "Submit critical documents for review by food safety professionals when the risk is higher or you want specialist eyes before your next audit or inspection.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 rounded-2xl border border-[#E2E8F0] bg-white p-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E11D48] text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#475569]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">Built for Food Businesses</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#475569]">
            Whether you run a restaurant, a food manufacturing site, a catering operation, or a retail business,
            PinkPepper speaks your language.
          </p>
          <div className="mx-auto mt-10 max-w-2xl space-y-4 leading-relaxed text-[#475569]">
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">Regulation (EC) 852/2004 &amp; 853/2004</strong> - general and
                specific hygiene rules for food businesses
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">UK Food Safety Act 1990</strong> - post-Brexit UK compliance
                requirements
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">BRCGS, SQF, IFS, FSSC 22000</strong> - certification scheme support
                and audit preparation
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#E11D48]" />
              <p>
                <strong className="text-[#0F172A]">Allergen legislation</strong> - EU FIC Regulation 1169/2011 and
                Natasha&apos;s Law
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-20">
        <div className="pp-container max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Part of the iLoveHACCP Family</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-[#475569]">
            PinkPepper is the sister product to{" "}
            <a
              href="https://www.ilovehaccp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#E11D48] hover:underline"
            >
              iLoveHACCP.com
            </a>
            , a free HACCP plan builder for EU&nbsp;&amp;&nbsp;UK food businesses. While iLoveHACCP helps you create
            the plan, PinkPepper is your ongoing compliance companion, answering questions, generating documents, and
            connecting you with experts.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#F1F5F9] py-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_110%,#FFF1F2,transparent)]" />
        <div className="pp-container max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Stop spending hours on compliance paperwork</h2>
          <p className="mt-4 text-lg text-[#475569]">
            Try PinkPepper free on a real compliance question. No credit card required.
            Upgrade to Pro when you need Auditor mode and human consultancy.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#E11D48]/20 transition-all hover:bg-[#BE123C]"
            >
              Start free — no card needed
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
