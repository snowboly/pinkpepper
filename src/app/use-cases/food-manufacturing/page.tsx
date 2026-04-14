import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Software for Food Manufacturing | PinkPepper",
  description:
    "PinkPepper helps food manufacturers create HACCP documentation, SOPs, traceability records, and audit-prep workflows.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/food-manufacturing",
  },
};

export default function FoodManufacturingUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="Manufacturing use case"
      title="On-demand food safety expertise for teams that need stronger documentation systems"
      description="You're a QA Manager with a HACCP question at 9:30 PM on a Tuesday. Your consultant isn't answering. The BRCGS audit is due Friday. PinkPepper combines an AI trained on EU retained law, UK Food Standards Agency guidance, Codex Alimentarius, and GFSI scheme requirements with certified human expert review — so you get instant, citation-backed answers and documented sign-off when the stakes are high."
      primaryCta="Start manufacturing workflows"
      painPoints={[
        "CCPs placed incorrectly because the Codex decision tree was misunderstood or inconsistently applied.",
        "Critical limits with no scientific justification — auditors ask for the validation reference and nothing is on file.",
        "Corrective action logs that say 'fixed it' instead of documenting product disposition and root cause.",
        "HACCP plans that look complete but fail under BRCGS Issue 9, IFS Version 8, or local authority scrutiny.",
      ]}
      outcomes={[
        "Instant AI answers backed by Codex, Regulation (EC) 852/2004, and GFSI scheme requirements — available 24/7, no callback required.",
        "Human expert review for high-stakes decisions: new CCP determinations, major deviations, and pre-audit plan review.",
        "Every interaction logged and exportable — a documented evidence trail you can place directly in your audit file.",
      ]}
      sections={[
        {
          title: "AI consultant trained on food safety frameworks",
          body: "Ask anything: whether a cooling step is a CCP, what the correct critical limit is for a new product, or how to write a corrective action for a specific deviation. The AI provides immediate, citation-backed responses referencing Regulation (EC) 852/2004, Codex Alimentarius, and GFSI scheme clauses. No waiting for a callback. No billing by the quarter-hour.",
        },
        {
          title: "Human validation when it matters most",
          body: "When the question involves a significant change — a new CCP determination, a major deviation requiring product disposition, or a pre-audit plan review — PinkPepper routes the query to a certified human expert. They validate the guidance against current EU retained law and UK expectations and provide a documented opinion you can place directly in your audit file.",
        },
        {
          title: "Designed for the whole manufacturing team",
          body: "From Technical Managers who need a second set of eyes on significant food safety decisions, to Production Supervisors handling a CCP deviation on night shift — PinkPepper delivers the right level of response for every role, without relying on expensive retainer consultants for questions that come up every day.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1581093458791-9d42e3c2fd7a?w=1200&q=80",
        alt: "Food production line in a manufacturing facility",
      }}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Build hazard analysis and control logic around manufacturing process flow.",
        },
        {
          href: "/features/food-safety-audit-prep",
          label: "Food safety audit prep",
          description: "Prepare internal audit checklists, evidence packs, and corrective action tracking.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Compare plans for higher-volume document work, Auditor workflows, and human consultancy.",
        },
      ]}
    />
  );
}
