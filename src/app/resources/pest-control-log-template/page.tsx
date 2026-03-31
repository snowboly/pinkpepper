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
      intro="Pest control records serve two purposes: they show an active programme is in place, and they provide an evidence trail if something is found during an inspection. A log that only records contractor visits without findings or follow-up is rarely enough."
      summaryPoints={[
        "Contractor visits and internal staff sightings — both need to be in the same log.",
        "Findings at each monitoring point should be graded, not just marked as checked.",
        "Follow-up actions with completion dates turn a findings record into a closed loop.",
      ]}
      documentHighlights={[
        {
          label: "Contractor visit entries",
          description:
            "Date, engineer name, stations checked, findings graded by level of activity, corrective actions recommended, and the target date for those actions. Not just 'visit completed'.",
        },
        {
          label: "Internal sighting rows",
          description:
            "Space for staff to log sightings between contractor visits — who reported it, which area, what was seen, and what immediate action was taken. A lot of what actually happens on site never makes it into contractor-only logs.",
        },
        {
          label: "Bait station reference",
          description:
            "Each entry references the station number or location code, so findings can be mapped back to the site layout. Useful when a pattern emerges in one area.",
        },
        {
          label: "Follow-up actions column",
          description:
            "What was recommended and whether it's been completed. Recommendations that sit open for months are a problem in audit — this column is what closes them.",
        },
      ]}
      sections={[
        {
          title: "A log that only tracks contractor visits misses half the picture",
          body:
            "Staff see things between visits. A sighting near a delivery area, evidence in a store room, something spotted during cleaning. If those reports don't make it into a record, your log only reflects what happened during scheduled visits — which is a fraction of the overall picture.",
        },
        {
          title: "Graded findings matter more than presence/absence",
          body:
            "A monitoring point marked 'checked' tells you nothing. A graded finding — low, medium, high activity, or species identified — tells you whether a situation is stable or developing. That's the difference between a record and useful information.",
        },
        {
          title: "Review the records over time, not one by one",
          body:
            "Recurring activity at a specific station or in one area usually means a structural issue or a proofing gap. Reviewing trends quarterly — rather than looking at individual entries — is where that kind of pattern shows up. That's when you adjust the contract or fix the building.",
        },
      ]}
      ctaTitle="Build a pest control record system for your site"
      ctaBody="PinkPepper can help you create a pest control log and supporting SOP that reflects your site layout, contractor schedule, and monitoring point locations."
      templateSlug="pest-control-log-template"
      relatedLinks={[
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/resources/food-safety-management-system-template", label: "FSMS template" },
      ]}
    />
  );
}
