import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Safety Audit Checklist | PinkPepper",
  description:
    "Use this guide to structure a food safety audit checklist covering documents, records, corrective actions, and verification.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-safety-audit-checklist",
    languages: { "x-default": "https://pinkpepper.io/resources/food-safety-audit-checklist", en: "https://pinkpepper.io/resources/food-safety-audit-checklist" },
  },
};

export default function FoodSafetyAuditChecklistPage() {
  return (
    <ResourceTemplate
      category="Audit resource"
      title="What to include in a practical food safety audit checklist"
      intro="A good audit checklist isn't just a list of requirements. It's a way to check whether your documented controls, live records, corrective actions, and what's actually happening on site all still match each other."
      summaryPoints={[
        "Documents and live operational evidence — both need checking, not just one.",
        "Corrective action follow-up is often where weak systems show first.",
        "Monthly internal review beats last-minute scrambling before inspection.",
      ]}
      documentHighlights={[
        {
          label: "Document check section",
          description:
            "Are the right documents in place, are they the current version, and are they being used? An old version filed neatly is worse than no document — it suggests the review process broke down.",
        },
        {
          label: "Records review",
          description:
            "Temperature logs, cleaning records, training records — are they being completed consistently? Gaps in the last few weeks are what inspectors look at, not the records from six months ago.",
        },
        {
          label: "Open corrective actions",
          description:
            "A list of any issues raised since the last review, and whether they were actually closed. This is where a lot of audit findings emerge — not from new problems but from old ones that were noted and never resolved.",
        },
        {
          label: "Site walk observations",
          description:
            "Space to record findings from walking the operation — storage conditions, hygiene standards, labelling, equipment state. Things that don't fit a pre-written question but matter.",
        },
      ]}
      sections={[
        {
          title: "Documents alone aren't enough",
          body:
            "An audit checklist should cover whether key documents exist, but also whether the latest versions are in use and whether the records they require are actually being completed. A HACCP plan filed correctly but not reviewed in two years is a problem, not a tick.",
        },
        {
          title: "Push reviewers into the weak spots",
          body:
            "Temperature logs, allergen changes, cleaning verification, traceability, open corrective actions — these are where problems usually are. A checklist that doesn't send reviewers directly into those areas isn't doing its job.",
        },
        {
          title: "Internal audit works best as a routine, not a reaction",
          body:
            "The teams that handle inspections well aren't doing extra work in the week before — they're doing regular work all year. A monthly internal review that takes an hour is more useful than a full-day panic in response to a rating.",
        },
      ]}
      ctaTitle="Create audit prep documents before inspection pressure builds"
      ctaBody="PinkPepper helps teams draft audit checklists, evidence summaries, and corrective action tracking so internal review becomes more structured."
      templateSlug="food-safety-audit-checklist"
      relatedLinks={[
        { href: "/features/haccp-plan-generator", label: "HACCP plan generator" },
        { href: "/pricing", label: "Pricing" },
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
      ]}
    />
  );
}
