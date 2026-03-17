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
      eyebrow="Comparison page"
      title="PinkPepper vs a traditional food safety consultant"
      description="This is not a claim that software replaces specialist expertise. It is a claim that PinkPepper can reduce the amount of expensive expert time spent on first drafts, repetitive SOP writing, and early-stage audit prep."
      primaryCta="Start with PinkPepper"
      painPoints={[
        "Consultants are valuable, but many teams cannot afford to use them for every draft and routine update.",
        "Pure software buyers still need a path to food safety consultancy when documents carry higher risk.",
        "Commercial intent pages need a clear argument for when PinkPepper is the right first step.",
      ]}
      outcomes={[
        "Lower the cost of getting to a strong first draft.",
        "Reserve expert time for higher-value review and sign-off work.",
        "Give buyers a clearer middle ground between DIY and consultancy-only models.",
      ]}
      sections={[
        {
          title: "Where a consultant still wins",
          body:
            "Complex enforcement issues, major site changes, certification preparation, and formal sign-off still benefit from qualified human expertise. PinkPepper should be positioned honestly around that fact.",
        },
        {
          title: "Where PinkPepper is stronger",
          body:
            "For repeated drafting work, SOP refreshes, internal checklists, allergen documents, and early audit-prep structure, PinkPepper gives teams speed and consistency without waiting on consultant availability.",
        },
        {
          title: "Why the combination is credible",
          body:
            "The strongest commercial argument is not AI instead of experts. It is AI to accelerate preparation plus optional food safety consultancy where the work needs more confidence.",
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
