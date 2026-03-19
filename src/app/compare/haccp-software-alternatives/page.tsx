import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "HACCP Software Alternatives | PinkPepper",
  description:
    "Compare PinkPepper with HACCP software alternatives for AI-assisted food safety documentation, SOP generation, and audit preparation.",
  alternates: {
    canonical: "https://pinkpepper.io/compare/haccp-software-alternatives",
  },
};

export default function HaccpSoftwareAlternativesPage() {
  return (
    <FeatureTemplate
      eyebrow="HACCP software alternatives"
      title="PinkPepper among HACCP software alternatives"
      description="Most HACCP software alternatives focus on record storage, digital checklists, and form workflows. PinkPepper's angle is different: AI-assisted drafting for teams that still need to create or rebuild their documentation — not just capture what already exists."
      primaryCta="Evaluate PinkPepper"
      painPoints={[
        "Most HACCP software is built for storing completed records, not for teams still working out what their documents should say.",
        "Many alternatives are strong once your system is mature — weaker when the documentation gap is what's actually slowing you down.",
        "Generic AI tools can generate text but don't understand CCP logic, monitoring frequency, or the evidence auditors expect to see.",
      ]}
      outcomes={[
        "Understand whether your gap is record storage or document creation — they need different tools.",
        "Get to a first HACCP plan, SOP, or allergen record faster without starting from a blank template.",
        "Evaluate PinkPepper against your current compliance stage, not a hypothetical mature system.",
      ]}
      sections={[
        {
          title: "Where other HACCP software tends to focus",
          body:
            "Record capture, digital forms, workflow approval chains, and compliance dashboards. These tools are well suited for teams that already have mature documentation and want to go paperless or manage at scale.",
        },
        {
          title: "Where PinkPepper is different",
          body:
            "PinkPepper is built for drafting and improving documentation: HACCP plans, allergen records, SOPs, audit checklists, corrective action workflows. If the gap is that these documents don't exist yet, or need rebuilding, that's what the product is designed for.",
        },
        {
          title: "Picking the right tool for your stage",
          body:
            "If you're in the documentation-creation phase, PinkPepper accelerates that work. If you're in the record-digitisation phase with mature docs, you may want a different primary tool — or both. We'd rather you know that than oversell the fit.",
        },
      ]}
      relatedLinks={[
        {
          href: "/features/food-safety-sop-generator",
          label: "Food safety SOP generator",
          description: "See PinkPepper's document-generation angle directly.",
        },
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Review the core workflow for hazard analysis and control documentation.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Move from comparison to plan evaluation.",
        },
      ]}
    />
  );
}
