import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "HACCP Plan Generator - For Small Food Businesses | PinkPepper",
  description:
    "Create a practical HACCP plan faster. Built for small UK food businesses that need hazard analysis, controls, and audit-ready draft structure without starting from scratch.",
  alternates: {
    canonical: "https://pinkpepper.io/features/haccp-plan-generator",
  },
};

const quickWins = [
  "Create a practical HACCP draft faster",
  "Structure hazard analysis and control points clearly",
  "Prepare cleaner documentation for audit review",
];

const bestFor = [
  "Restaurants",
  "Cafes",
  "Takeaways",
  "Caterers",
];

const earlySteps = [
  {
    title: "Tell PinkPepper about your operation",
    body: "Answer a short structured intake about your products, process steps, shelf life, and current controls.",
  },
  {
    title: "Get a HACCP draft quickly",
    body: "PinkPepper turns those inputs into a practical draft covering hazards, control logic, and monitoring structure.",
  },
  {
    title: "Refine before you export or review",
    body: "Adjust the draft for your operation, then use it for internal review, audit prep, or deeper expert checking.",
  },
];

export default function HaccpPlanGeneratorPage() {
  return (
    <main className="overflow-hidden">
      <section className="border-b border-[#F1F5F9] bg-[#F8FAFC] py-16 md:py-24">
        <div className="pp-container grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="max-w-4xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">
              HACCP software for small food businesses
            </p>
            <h1 className="pp-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[#0F172A] md:text-6xl">
              Create a practical HACCP plan faster
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#475569]">
              Built for small UK food businesses that need hazard analysis, controls, and draft structure without
              starting from a blank page.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
              >
                View pricing
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-[#475569]">
              <span className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2">
                Hazard analysis support
              </span>
              <span className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2">
                Audit prep structure
              </span>
              <span className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2">
                Grounded in UK and EU food safety rules
              </span>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold text-[#0F172A]">What you get</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#475569]">
              {quickWins.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E11D48]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-[#F1F5F9] pt-6">
              <p className="text-sm font-semibold text-[#0F172A]">Best for</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {bestFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#FBCFE8] bg-[#FFF1F2] px-3 py-1.5 text-xs font-semibold text-[#BE123C]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-12">
        <div className="pp-container">
          <figure className="overflow-hidden rounded-[30px] border border-[#E2E8F0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <Image
              src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1600&q=80"
              alt="Clean commercial kitchen ready for food preparation"
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </figure>
        </div>
      </section>

      <section className="border-b border-[#F1F5F9] bg-white py-16">
        <div className="pp-container">
          <div className="grid gap-6 md:grid-cols-3">
            {earlySteps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                <h2 className="text-xl font-semibold text-[#0F172A]">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{step.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="pp-container max-w-4xl">
          <div className="pp-article-body max-w-none">
            <p>
              Writing a HACCP plan from scratch is one of the most daunting tasks for any food business. The blank page
              stares back at you. The Codex decision tree feels ambiguous. You wonder: <em>Have I identified all the
              hazards? Are my critical limits defensible? Will this pass a BRCGS or local authority audit?</em>
            </p>

            <p>
              PinkPepper&apos;s HACCP Plan Generator removes the guesswork. Answer a structured series of questions about
              your product and process, and our AI chatbot, trained on Regulation (EC) 852/2004, Codex Alimentarius,
              and GFSI scheme requirements, generates a comprehensive draft HACCP plan tailored to your operation.
            </p>

            <p>
              And when you need absolute confidence, a certified human food safety expert reviews the plan before you
              sign it off.
            </p>

            <h2>What the HACCP Plan Generator Delivers</h2>

            <p>A complete, audit-ready HACCP plan structured according to Codex Alimentarius principles, including:</p>

            <ul>
              <li>
                <strong>Product Description &amp; Intended Use:</strong> Clearly defined with allergen declarations and
                target consumer profile.
              </li>
              <li>
                <strong>Process Flow Diagram:</strong> A visual map of your production steps from receiving to dispatch.
              </li>
              <li>
                <strong>Hazard Analysis Worksheet:</strong> Systematic identification of biological, chemical, and
                physical hazards at each step, with documented justification for significance determinations.
              </li>
              <li>
                <strong>CCP Decision Tree Documentation:</strong> Transparent logic showing why each step is or is not a
                Critical Control Point.
              </li>
              <li>
                <strong>CCP Summary Table:</strong> Critical limits, monitoring procedures, corrective actions,
                verification activities, and record-keeping requirements for each identified CCP.
              </li>
              <li>
                <strong>Validation References:</strong> Scientific and regulatory citations supporting critical limits.
              </li>
            </ul>

            <h2>How It Works</h2>

            <h3>Step 1: Tell Us About Your Operation</h3>

            <p>
              You don&apos;t need to be a food safety expert to start. The AI chatbot guides you through a conversational
              intake process, asking clear questions about:
            </p>

            <ul>
              <li>Product category and composition</li>
              <li>Processing steps such as cooking, cooling, freezing, and packaging</li>
              <li>Intended consumer and shelf life</li>
              <li>Existing prerequisite programs such as cleaning, pest control, and allergen management</li>
            </ul>

            <h3>Step 2: AI Generates Your Draft Plan</h3>

            <p>
              Based on your responses, PinkPepper&apos;s AI constructs a complete draft HACCP plan. It identifies likely
              hazards, proposes appropriate critical limits drawn from Codex and EFSA guidance, and maps your process
              flow. The draft is yours immediately, no waiting for a consultant to clear their schedule.
            </p>

            <h3>Step 3: Review and Refine</h3>

            <p>
              You review the draft, make any adjustments based on your specific operational knowledge, and flag any
              sections where you want deeper validation.
            </p>

            <h3>Step 4: Optional Human Expert Review</h3>

            <p>
              For businesses pursuing BRCGS or IFS certification, or those wanting stronger audit-readiness, you can
              submit the draft for review by a PinkPepper human expert. They will:
            </p>

            <ul>
              <li>Verify hazard identification is complete and appropriate</li>
              <li>Confirm critical limits are scientifically sound and properly referenced</li>
              <li>Check that monitoring procedures are practical and correctly assigned</li>
              <li>Ensure corrective action protocols address product disposition</li>
              <li>Provide a documented review statement for your audit file</li>
            </ul>

            <h3>Step 5: Export and Implement</h3>

            <p>
              Download your completed HACCP plan in PDF or editable Word format. Distribute to your team, place it in
              your food safety binder, and have it ready for your next audit or EHO inspection.
            </p>

            <h2>Who Uses the HACCP Plan Generator</h2>

            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Why It Works for Them</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Startup Food Businesses</strong></td>
                  <td>
                    Get a compliant HACCP plan quickly to satisfy EHO registration requirements and retail buyer demands.
                    Avoid the high cost of full-service consulting at launch.
                  </td>
                </tr>
                <tr>
                  <td><strong>Small Manufacturers Pursuing BRCGS/IFS</strong></td>
                  <td>
                    Generate a solid foundation, then add human expert review to ensure the plan meets GFSI scheme
                    expectations before certification audits.
                  </td>
                </tr>
                <tr>
                  <td><strong>Product Developers Launching New Lines</strong></td>
                  <td>
                    Quickly assess the HACCP implications of a new recipe or process change. Determine if existing CCPs
                    cover the new product or if the plan needs updating.
                  </td>
                </tr>
                <tr>
                  <td><strong>Technical Managers with Limited Bandwidth</strong></td>
                  <td>
                    Delegate the heavy lifting of drafting to the AI, freeing up your time to focus on verification,
                    team training, and operational oversight.
                  </td>
                </tr>
                <tr>
                  <td><strong>Consultants and Trainers</strong></td>
                  <td>
                    Use the generator as a teaching tool or to accelerate client deliverables, with the option to
                    overlay your own expertise.
                  </td>
                </tr>
              </tbody>
            </table>

            <h2>Why AI-Generated HACCP Beats the Alternatives</h2>

            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Drawback</th>
                  <th>PinkPepper Advantage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Blank Template Downloaded Online</strong></td>
                  <td>
                    Generic; doesn&apos;t reflect your specific process or hazards. Often lacks scientific justification
                    for critical limits.
                  </td>
                  <td>
                    Tailored to your product and process inputs. Includes referenced critical limits based on Codex and
                    EU guidance.
                  </td>
                </tr>
                <tr>
                  <td><strong>Generic AI</strong></td>
                  <td>
                    Can mix jurisdictions, invent references, or produce generic content that is hard to defend.
                  </td>
                  <td>
                    PinkPepper is built for food safety workflows and grounded in validated food safety frameworks.
                  </td>
                </tr>
                <tr>
                  <td><strong>Full-Service Consultant Only</strong></td>
                  <td>Expensive, slow, and often hard to use for early draft iteration.</td>
                  <td>
                    AI gives you immediate, affordable draft support. Human review can still be added later when the
                    risk is higher.
                  </td>
                </tr>
                <tr>
                  <td><strong>Doing It Entirely Alone</strong></td>
                  <td>Time-consuming and anxiety-inducing. Critical hazards may be missed.</td>
                  <td>Structured guidance helps teams follow Codex methodology more consistently.</td>
                </tr>
              </tbody>
            </table>

            <h2>Built for UK and EU Compliance</h2>

            <p>PinkPepper&apos;s HACCP Plan Generator is configured for the regulatory landscape facing UK and European food businesses:</p>

            <ul>
              <li>
                <strong>Codex Alimentarius:</strong> The international foundation for HACCP methodology, explicitly
                referenced in Regulation (EC) 852/2004.
              </li>
              <li>
                <strong>Regulation (EC) 852/2004:</strong> The core EU hygiene legislation requiring food business
                operators to put in place, implement, and maintain a permanent procedure based on HACCP principles.
              </li>
              <li>
                <strong>UK Food Standards Agency Guidance:</strong> Aligned with FSA expectations including the MyHACCP
                framework and SFBB principles for smaller operations.
              </li>
              <li>
                <strong>BRCGS Issue 9 &amp; IFS Food Version 8:</strong> Structured to meet the HACCP requirements of
                major GFSI schemes, including food safety culture and allergen validation expectations.
              </li>
            </ul>

            <h2>From Blank Page to Audit-Ready Plan</h2>

            <p>
              You don&apos;t have to face the HACCP plan alone. Whether you&apos;re a startup seeking EHO approval or an
              established manufacturer preparing for BRCGS, PinkPepper gives you the structure, speed, and expert backup
              to build a plan you can defend with confidence.
            </p>

            <p>
              <Link href="/signup">Start building your HACCP plan today.</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-5xl">
          <div className="rounded-[2rem] border border-[#E2E8F0] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">
                Ready to start
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A]">
                Move from HACCP blank page to workable draft
              </h2>
              <p className="mt-4 text-base leading-7 text-[#475569]">
                Start free, work through your process step by step, and turn scattered compliance notes into a clearer
                HACCP draft.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-5xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E11D48]">Continue reading</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A]">Related pages</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                href: "/features/allergen-documentation",
                label: "Allergen documentation",
                description: "Pair your HACCP plan with allergen controls and menu-change documentation.",
              },
              {
                href: "/features/food-safety-sop-generator",
                label: "Food safety SOP generator",
                description: "Turn HACCP controls into day-to-day SOPs, logs, and hygiene records.",
              },
              {
                href: "/pricing",
                label: "Pricing",
                description: "See how free, Plus, and Pro fit different food safety workloads.",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
              >
                <p className="text-lg font-semibold text-[#0F172A]">{link.label}</p>
                <p className="mt-3 text-sm leading-7 text-[#475569]">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
