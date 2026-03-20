import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Pest Control Log Template | PinkPepper",
  description:
    "Learn what a pest control log should record to meet EU and UK food safety requirements, including contractor visits, findings, and follow-up actions.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/pest-control-log-template",
  },
};

export default function PestControlLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a pest control log template should record"
      intro="Pest control records serve two purposes: they demonstrate that an active pest management programme is in place, and they provide an evidence trail if an infestation is discovered during an inspection. A log that only records contractor visits without findings or follow-up actions is rarely sufficient."
      summaryPoints={[
        "The log should record both routine contractor visits and any internal sightings reported by staff.",
        "Findings at each bait station or monitoring point should be graded, not just noted as checked.",
        "Follow-up actions and their completion dates turn a findings record into a closed-loop system.",
      ]}
      sections={[
        {
          title: "Routine contractor visit records",
          body: "Each contractor visit should generate a written report. Your pest control log should reference this report (by date and reference number) and record the key outcomes: stations checked, evidence of activity found, pest species if relevant, corrective actions recommended, and the target date for those actions. Keeping contractor reports attached to or filed alongside the log makes audit retrieval straightforward.",
        },
        {
          title: "Internal sightings and staff reports",
          body: "Staff sightings should be recorded even when no contractor visit follows immediately. The log entry should include who reported it, the area and type of evidence, and what immediate action was taken. A pest sighting log that only reflects contractor activity misses a significant portion of what actually happens on site.",
        },
        {
          title: "Trending and periodic review",
          body: "Pest control records are most useful when reviewed over time rather than checked individually. Recurring activity at a particular station or in a particular area may indicate a structural issue or a gap in proofing. Your procedure should include a review frequency — typically quarterly — at which point patterns can be identified and the contract or control measures adjusted.",
        },
      ]}
      ctaTitle="Build a pest control record system for your site"
      ctaBody="PinkPepper can help you create a pest control log and supporting SOP that reflects your site layout, contractor schedule, and monitoring point locations."
      relatedLinks={[
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/resources/food-safety-management-system-template", label: "FSMS template" },
      ]}
    />
  );
}
