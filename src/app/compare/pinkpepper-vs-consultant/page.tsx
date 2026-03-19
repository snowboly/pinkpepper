import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "PinkPepper vs Food Safety Consultant",
  description:
    "Compare PinkPepper with traditional food safety consulting for HACCP, SOP generation, allergen documentation, and audit preparation.",
  alternates: {
    canonical: "https://pinkpepper.io/compare/pinkpepper-vs-consultant",
  },
};

export default function PinkPepperVsConsultantPage() {
  return (
    <FeatureTemplate
      eyebrow="PinkPepper vs consultant"
      title="PinkPepper vs a traditional food safety consultant"
      description="Not a claim that software replaces specialist expertise. A claim that PinkPepper reduces the expensive consultant time spent on first drafts, routine SOP updates, and early-stage audit prep — so specialist hours go where they actually matter."
      primaryCta="Start with PinkPepper"
      painPoints={[
        "Hiring a consultant for every SOP refresh, routine checklist, or first draft isn't realistic for most food operations.",
        "Waiting weeks for consultant availability slows teams that need to move faster than their inspection calendar allows.",
        "Some decisions genuinely need specialist expertise — knowing which ones do, and which don't, is where most teams waste time and money.",
      ]}
      outcomes={[
        "Lower the cost of getting to a usable first draft.",
        "Reserve expert time for review, sign-off, and enforcement-level decisions.",
        "Access qualified food safety consultancy when work genuinely needs it — included in Pro.",
      ]}
      sections={[
        {
          title: "Where a consultant still wins",
          body:
            "Certification audits, enforcement responses, major process changes, formal sign-off, and high-stakes HACCP decisions still need qualified human expertise. PinkPepper doesn't change that, and we're clear about it.",
        },
        {
          title: "Where PinkPepper is faster",
          body:
            "HACCP first drafts, SOP refreshes, allergen matrices, audit prep checklists, temperature logs, and routine documentation updates. Speed and repeatability matter here more than consultant judgement — and that's where AI pays off.",
        },
        {
          title: "Why Pro bundles both",
          body:
            "The Pro plan includes 3 hours of food safety consultancy per month. AI speed for the work that can be accelerated, specialist review for the work that can't. That combination is more useful than choosing between them.",
        },
      ]}
      relatedLinks={[
        {
          href: "/features/food-safety-audit-prep",
          label: "Food safety audit prep",
          description: "See how PinkPepper structures evidence and corrective action workflows before review.",
        },
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Understand how the product helps teams produce stronger first drafts.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Compare low-cost entry against more expensive consultancy-heavy workflows.",
        },
      ]}
    />
  );
}
