import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Audit Software | PinkPepper",
  description:
    "Prepare for food safety audits with PinkPepper using audit checklists, evidence packs, corrective actions, and review workflows.",
  alternates: {
    canonical: "https://pinkpepper.io/features/food-safety-audit-prep",
  },
};

export default function FoodSafetyAuditPrepPage() {
  return (
    <FeatureTemplate
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
        "Create a stronger handoff into food safety consultancy where needed.",
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
            "Where the work has real compliance risk, PinkPepper's positioning is not 'publish AI output and hope'. It is 'draft faster, review better, export cleanly, and escalate to food safety consultancy when necessary.'",
        },
      ]}
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
          description: "Review the plans that cover exports, audit workflows, and food safety consultancy.",
        },
      ]}
    />
  );
}
