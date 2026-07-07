import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";
import { getCspNonce } from "@/lib/security/csp";

export const metadata: Metadata = {
  title: "HACCP Plan Template | PinkPepper",
  description:
    "Use PinkPepper's AI food safety consultant to generate HACCP documents, build HACCP paperwork, and get answers to food safety questions.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/haccp-plan-template",
    languages: { "x-default": "https://pinkpepper.io/resources/haccp-plan-template", en: "https://pinkpepper.io/resources/haccp-plan-template" },
  },
};

const haccpTemplateFaqs = [
  {
    q: "Can AI generate HACCP documents?",
    a: "AI can help generate HACCP first drafts, hazard tables, monitoring logic, and supporting food safety documents faster. Final documents still need review by someone who understands the site, process, and risks.",
  },
  {
    q: "Can I ask food safety questions before finalising the paperwork?",
    a: "Yes. PinkPepper is designed to answer food safety and HACCP questions while you work, so teams can clarify hazards, controls, records, and corrective actions before finalising the draft.",
  },
  {
    q: "Is a HACCP template enough on its own?",
    a: "No. A template is a starting structure. It becomes useful when it is adapted to the actual operation, supported by clear hazard reasoning, and reviewed before sign-off.",
  },
];

const haccpTemplateFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: haccpTemplateFaqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};

export default async function HaccpPlanTemplatePage() {
  const nonce = await getCspNonce();
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(haccpTemplateFaqSchema) }}
      />
      <ResourceTemplate
        category="HACCP resource"
        title="Use an AI food safety consultant to build a stronger HACCP first draft"
        intro="PinkPepper helps food businesses generate HACCP documents, structure HACCP paperwork, and answer food safety questions. The template still matters, but the real value is turning it into a reviewable draft with clearer hazards, controls, monitoring, corrective actions, and records."
        summaryPoints={[
          "Generate HACCP documents from process flow instead of starting with a blank form.",
          "Keep hazard analysis logic visible instead of collapsing it into one vague worksheet.",
          "Get food safety answers that clarify monitoring, records, and corrective actions.",
          "Reach a stronger first draft faster without skipping site review.",
        ]}
        documentHighlights={[
          {
            label: "Process steps follow your operation",
            description:
              "The rows go through receiving, storage, prep, cooking, cooling, and dispatch in order. Not a generic list. You fill in what actually happens at your site.",
          },
          {
            label: "B / P / C split per step",
            description:
              "Each hazard type gets its own row. Lumping them together is how things get missed, and auditors notice.",
          },
          {
            label: "Risk score columns",
            description:
              "Probability, severity, and residual risk stay visible so you can show the reasoning, not just the outcome. That is what makes the CCP decisions defensible.",
          },
          {
            label: "Control measures kept separate from the CCP column",
            description:
              "A lot of templates muddle these two things together. This one does not. The designation, CCP, PPR, or OPRP, sits in its own column so the logic is clear when someone reviews it later.",
          },
        ]}
        sections={[
          {
            title: "Start with the process, not the form",
            body:
              "Most templates hand you a blank table and expect you to figure out the rest. The better route is to start with how food actually moves through the site, from goods in, through prep and cook steps, to dispatch. That is where an AI food safety consultant can help: it turns process details into a structured HACCP draft instead of leaving your team to decode an empty worksheet.",
          },
          {
            title: "Hazard analysis needs its own working structure",
            body:
              "A HACCP plan gets harder to defend when the hazard analysis is buried inside one overstuffed table. Teams need a clearer way to record which biological, chemical, and physical hazards matter at each step, why they matter, and what controls already exist. That is why strong HACCP document generation has to keep the reasoning visible, not just output a finished-looking sheet.",
          },
          {
            title: "If the control logic does not work on shift, it does not work",
            body:
              "A monitoring step that says 'check temperatures regularly' is not a monitoring step. Your team needs to know what to check, when, how often, and what to do when something is wrong. That is also where question-answering matters. If operators can ask food safety questions in plain language, the final paperwork is more likely to reflect what really happens on shift.",
          },
          {
            title: "A template is a starting point, not a finished document",
            body:
              "No generic template reflects your operation. It gets you to a better first draft faster, but someone with knowledge of the site still needs to review it, challenge the assumptions, and sign off. Good AI food safety support shortens the drafting work. It does not pretend to remove the review step.",
          },
        ]}
        ctaTitle="Turn a HACCP template into a real first draft"
        ctaBody="PinkPepper's AI food safety consultant helps you generate HACCP documents, shape site-specific HACCP paperwork, and answer food safety questions while you build the draft."
        templateSlugs={["haccp-plan-template_hazzards", "haccp-plan-template_steps"]}
        relatedLinks={[
          { href: "/resources/hazard-analysis-template", label: "Hazard analysis template" },
          { href: "/features/haccp-plan-generator", label: "HACCP plan generator" },
          { href: "/articles/how-to-perform-a-hazard-analysis-correctly", label: "How to perform a hazard analysis correctly" },
        ]}
      />
      <section className="border-t border-[#F1F5F9] bg-[#F8FAFC] py-16">
        <div className="pp-container max-w-3xl">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {haccpTemplateFaqs.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                <h3 className="text-base font-semibold text-[#0F172A]">{q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
