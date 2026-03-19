import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Safety Audit Checklist | PinkPepper",
  description:
    "Use this guide to structure a food safety audit checklist covering documents, records, corrective actions, and verification.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-safety-audit-checklist",
  },
};

export default function FoodSafetyAuditChecklistPage() {
  return (
    <ResourceTemplate
      category="Audit resource"
      title="What to include in a practical food safety audit checklist"
      intro="A good audit checklist is not just a list of requirements. It is a way to inspect whether documented controls, live records, corrective actions, and team behaviour still match each other."
      summaryPoints={[
        "Audit checklists should inspect both documents and live operational evidence.",
        "Corrective action follow-up is often where weak systems show first.",
        "A monthly internal review can reduce last-minute scrambling before inspection.",
      ]}
      sections={[
        {
          title: "Documents alone are not enough",
          body:
            "An audit checklist should cover whether key documents exist, but also whether the latest versions are in use and whether the records they require are actually being completed and reviewed.",
        },
        {
          title: "Check the weak points directly",
          body:
            "Temperature logs, allergen changes, cleaning verification, traceability records, and open corrective actions are common failure points. A checklist should push reviewers into those areas explicitly.",
        },
        {
          title: "Internal audit should be a recurring system",
          body:
            "The strongest teams treat internal review as a routine management process rather than a pre-inspection panic. That is the mindset PinkPepper's audit-prep positioning should reinforce.",
        },
      ]}
      ctaTitle="Create audit prep documents before inspection pressure builds"
      ctaBody="PinkPepper helps teams draft audit checklists, evidence summaries, and corrective action tracking so internal review becomes more structured."
      relatedLinks={[
        { href: "/features/food-safety-audit-prep", label: "Food safety audit prep" },
        { href: "/pricing", label: "Pricing" },
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
      ]}
    />
  );
}
