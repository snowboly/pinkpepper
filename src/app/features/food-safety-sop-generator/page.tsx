import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety SOP Generator - AI-Powered | PinkPepper",
  description:
    "Generate cleaning SOPs, hygiene procedures, temperature logs and training records in minutes. Grounded in EC 852/2004 and UK FSA guidance. Try free.",
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
          title: "Monitoring records sit inside the same workflow",
          body:
            "Temperature checks and daily monitoring logs work better when they are treated as part of the same SOP system rather than separate forms nobody owns. PinkPepper helps teams connect opening checks, close-down routines, and temperature records so the daily workflow is easier to follow and easier to review.",
        },
        {
          title: "Supports local review and adaptation",
          body:
            "Generated drafts are a starting point for site-specific review. That makes it easier to adapt wording, assign accountability, and export the record into the formats your business already uses.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=60",
        alt: "Kitchen staff following hygiene procedures during food preparation",
      }}
      relatedLinks={[
        {
          href: "/resources/food-safety-opening-and-closing-checklist",
          label: "Food safety opening and closing checklist",
          description: "Start with a daily checklist structure for shift checks, sign-off, and corrective actions.",
        },
        {
          href: "/resources/temperature-monitoring-log-template",
          label: "Temperature monitoring log template",
          description: "Use a clearer log structure for fridges, freezers, hot hold, and out-of-range actions.",
        },
        {
          href: "/articles/temperature-control-in-haccp-limits-and-monitoring",
          label: "Temperature control in HACCP",
          description: "Read the practical guide behind the limits, monitoring routines, and records teams actually need.",
        },
        {
          href: "/ai-food-safety-consultant",
          label: "AI food safety consultant",
          description: "See how AI drafting and optional human consultant review fit EU and UK food safety work.",
        },
      ]}
    />
  );
}
