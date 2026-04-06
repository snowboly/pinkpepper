import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety SOP Generator — AI-Powered | PinkPepper",
  description:
    "Generate cleaning SOPs, hygiene procedures, temperature logs & training records in minutes. Grounded in EC 852/2004 & UK FSA guidance. Try free.",
  alternates: {
    canonical: "https://pinkpepper.io/features/food-safety-sop-generator",
  },
};

export default function FoodSafetySopGeneratorPage() {
  return (
    <FeatureTemplate
      breadcrumbName="Food Safety SOP Generator"
      breadcrumbUrl="https://pinkpepper.io/features/food-safety-sop-generator"
      eyebrow="SOP generation"
      title="Generate food safety SOPs and records that match the way your site works"
      description="PinkPepper helps teams create standard operating procedures, monitoring logs, cleaning schedules, hygiene policies, and daily checklists without copying old templates from site to site."
      primaryCta="Generate SOPs faster"
      painPoints={[
        "Teams waste time rewriting the same SOPs for opening checks, sanitation, deliveries, and hygiene controls.",
        "Copied templates often survive long after the process on the ground has changed.",
        "Operations need editable, reviewable records, not generic text blocks.",
      ]}
      outcomes={[
        "Standardise recurring documentation work.",
        "Give teams clearer operating documents and checklists.",
        "Speed up implementation after HACCP or audit findings.",
      ]}
      sections={[
        {
          title: "Practical documents, not abstract guidance",
          body:
            "PinkPepper is suited to the documents teams actually use: cleaning SOPs, opening and closing checks, staff hygiene procedures, temperature logs, corrective action forms, and training records.",
        },
        {
          title: "Supports local review and adaptation",
          body:
            "Generated drafts are a starting point for site-specific review. That makes it easier to adapt wording, assign accountability, and export the record into the formats your business already uses.",
        },
        {
          title: "Pairs well with the rest of the compliance stack",
          body:
            "SOP generation is more useful when it connects to HACCP plans, allergen controls, and audit readiness. PinkPepper is positioned around that wider workflow instead of isolated document creation.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=80",
        alt: "Kitchen staff following hygiene procedures during food preparation",
      }}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Use HACCP outputs to inform SOP structure, monitoring, and corrective actions.",
        },
        {
          href: "/features/food-safety-audit-prep",
          label: "Food safety audit prep",
          description: "Turn SOPs and records into stronger audit evidence before inspection day.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "See which plan covers document generation, exports, and food safety consultancy.",
        },
      ]}
    />
  );
}
