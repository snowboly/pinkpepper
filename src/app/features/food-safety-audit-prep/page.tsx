import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Audit Prep Software — BRCGS, SQF, EHO | PinkPepper",
  description:
    "Prepare for BRCGS, SQF, EHO & local authority inspections. Generate audit checklists, evidence packs & corrective actions with AI. Try free.",
  alternates: {
    canonical: "https://pinkpepper.io/features/food-safety-audit-prep",
  },
};

export default function FoodSafetyAuditPrepPage() {
  return (
    <FeatureTemplate
      breadcrumbName="Food Safety Audit Prep"
      breadcrumbUrl="https://pinkpepper.io/features/food-safety-audit-prep"
      eyebrow="Audit preparation"
      title="Prepare audit evidence before inspection pressure hits the team"
      description="PinkPepper helps operators prepare internal review checklists, evidence bundles, corrective action trackers, and export-ready documentation so audit prep becomes a system instead of a last-minute scramble."
      primaryCta="Start audit prep"
      painPoints={[
        "Audit preparation often starts too late and exposes gaps in SOPs, logs, or document ownership.",
        "Teams struggle to bring documents, records, and corrective actions into one review flow.",
        "Higher-stakes reviews need a path from AI draft to human validation.",
      ]}
      outcomes={[
        "Prepare monthly and pre-audit reviews with more structure.",
        "Spot documentation gaps earlier.",
        "Create a stronger handoff into human consultancy where needed.",
      ]}
      sections={[
        {
          title: "Evidence-pack thinking",
          body:
            "PinkPepper is designed to help teams think in terms of an audit pack: the current SOP set, temperature and monitoring records, open corrective actions, traceability documents, and revision history.",
        },
        {
          title: "Supports internal reviews before external scrutiny",
          body:
            "A structured internal review is one of the fastest ways to improve audit outcomes. The product helps teams draft review checklists and organise the documents they need to check before an inspection or customer audit.",
        },
        {
          title: "Useful when the stakes are higher",
          body:
            "Where the work has real compliance risk, PinkPepper's positioning is not 'publish AI output and hope'. It is 'use Consultant for guidance, use Auditor for findings, and escalate to human consultancy when necessary.'",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
        alt: "Organised commercial kitchen ready for inspection",
      }}
      relatedLinks={[
        {
          href: "/features/food-safety-sop-generator",
          label: "Food safety SOP generator",
          description: "Strengthen the operating documents auditors will ask to see.",
        },
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Keep your hazard analysis and control logic aligned with audit expectations.",
        },
        {
          href: "/pricing",
          label: "Pricing",
          description: "Review the plans that cover Consultant use, Auditor workflows, and human consultancy.",
        },
      ]}
    />
  );
}
