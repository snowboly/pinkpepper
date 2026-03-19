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
      title="Food safety software for manufacturing teams that need stronger documentation systems"
      description="PinkPepper helps food manufacturers draft HACCP plans, SOPs, traceability procedures, corrective action trackers, and internal audit workflows so compliance work can move faster without staying generic."
      primaryCta="Start manufacturing workflows"
      painPoints={[
        "Manufacturing sites need more structured documentation across process flow, traceability, and verification.",
        "Teams often outgrow spreadsheet-based systems before they are ready for heavy enterprise tooling.",
        "Audit and customer review pressure exposes gaps in version control, record structure, and document ownership.",
      ]}
      outcomes={[
        "Improve documentation structure before the next audit cycle.",
        "Generate SOP and traceability drafts more efficiently.",
        "Support internal review before external certification or customer scrutiny.",
      ]}
      sections={[
        {
          title: "Stronger than generic templates",
          body:
            "Manufacturing teams need documentation that reflects process steps, zoning, traceability, verification, and corrective action structure. PinkPepper is intended to give teams a better first version of that work.",
        },
        {
          title: "Supports continuous improvement",
          body:
            "The value is not just one document. It is the ability to produce, review, update, and export multiple connected records that support a more durable compliance system.",
        },
        {
          title: "Useful before enterprise complexity",
          body:
            "For smaller or growing manufacturers, there is often a gap between manual documents and larger compliance suites. PinkPepper fits that middle space well.",
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
          description: "Compare plans for higher-volume document work, exports, and food safety consultancy.",
        },
      ]}
    />
  );
}
