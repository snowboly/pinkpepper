import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, FileCheck, ShieldCheck, Users } from "lucide-react";

export const metadata = {
  title: "About PinkPepper | AI Food Safety Software Built by a Food Scientist",
  description:
    "Learn how PinkPepper combines AI food safety compliance software with food safety consultancy for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/about",
  },
};

const corePages = [
  {
    href: "/features/haccp-plan-generator",
    title: "HACCP workflows",
    description: "See the main workflow for hazard analysis, CCP structure, and corrective action drafting.",
  },
  {
    href: "/resources/haccp-plan-template",
    title: "Template library",
    description: "Use the strongest templates first if you need structure before a custom draft.",
  },
  {
    href: "/use-cases/food-manufacturing",
    title: "Food manufacturing use case",
    description: "Follow the manufacturing path if records, traceability, and audit pressure drive most of your work.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden py-20 text-center md:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#FFF1F2,transparent)]" />
        <div className="pp-container max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#E11D48]">About PinkPepper</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
            AI food safety compliance software built around real operational work
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#475569]">
            PinkPepper was built for food businesses that need faster help with HACCP, allergen records, SOPs, audit
            preparation, and day-to-day compliance questions without relying on generic AI output.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[#475569]">
            <Link
              href="/features"
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]"
            >
              Explore product features
            </Link>
            <Link
              href="/resources"
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]"
            >
              Browse templates
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 transition-colors hover:border-[#FDA4AF] hover:text-[#0F172A]"
            >
              View pricing
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
              <p className="mt-3 text-center text-sm font-semibold text-[#0F172A]">Dr Joao</p>
              <p className="text-center text-xs text-[#64748B]">Founder and scientific lead</p>
            </div>

            <div className="space-y-5 leading-relaxed text-[#475569]">
              <h2 className="text-2xl font-bold text-[#0F172A]">Why PinkPepper exists</h2>
              <p>
                PinkPepper was founded by <strong>Dr Joao</strong>, a food scientist with a background in chemistry and
                food science and hands-on experience helping food businesses build and maintain compliance systems.
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
                , it became obvious that creating the plan is only one part of the problem. Teams still need practical
                help with allergen management, SOPs, audit preparation, and document review after the first HACCP draft
                exists.
              </p>
              <blockquote className="rounded-xl border border-[#E2E8F0] bg-[#FFF1F2] p-5 italic text-[#0F172A]">
                &ldquo;Traditional consulting is too slow and too expensive for routine compliance work. PinkPepper is
                my attempt to make specialist-grade food safety support more available without turning it into vague
                software copy.&rdquo;
                <span className="mt-2 block text-sm font-semibold not-italic text-[#E11D48]">- Dr Joao</span>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">What makes it different</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#475569]">
            PinkPepper is designed around the documents, questions, and recurring review work that food businesses
            actually have to complete.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Brain,
                title: "Specialized AI agent",
                body: "Grounded in food safety workflows, not generic assistant patterns or broad open-web chatter.",
              },
              {
                icon: FileCheck,
                title: "Built around working documents",
                body: "Focused on HACCP plans, SOPs, allergen records, monitoring logs, and audit-readiness work.",
              },
              {
                icon: Users,
                title: "Consultant-backed direction",
                body: "Designed to support real food safety work, with a clear path to human review when risk is higher.",
              },
              {
                icon: ShieldCheck,
                title: "Practical over performative",
                body: "The goal is usable compliance output that helps operations move, not impressive but empty AI prose.",
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
          <h2 className="text-center text-2xl font-bold text-[#0F172A] md:text-3xl">Core paths to explore next</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {corePages.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-black/[0.04]"
              >
                <p className="text-xl font-semibold text-[#0F172A]">{item.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#475569]">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-20">
        <div className="pp-container max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] text-[#E11D48]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Part of the iLoveHACCP family</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-[#475569]">
            PinkPepper sits alongside{" "}
            <a
              href="https://www.ilovehaccp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#E11D48] hover:underline"
            >
              iLoveHACCP.com
            </a>
            . One helps teams get a HACCP plan started; the other focuses on the ongoing compliance work that comes
            after that first plan exists.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#F1F5F9] py-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_110%,#FFF1F2,transparent)]" />
        <div className="pp-container max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Put this to work in your operation</h2>
          <p className="mt-4 text-lg text-[#475569]">
            Start generating HACCP plans, SOPs, and allergen records today. Upgrade when you need more formal audit and
            review workflows.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#E11D48]/20 transition-all hover:bg-[#BE123C]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
