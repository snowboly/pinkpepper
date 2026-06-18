import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Food Safety Opening and Closing Checklist | PinkPepper",
  description:
    "Learn what a food safety opening and closing checklist should cover for daily checks, corrective actions, and shift sign-off.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/food-safety-opening-and-closing-checklist",
    languages: { "x-default": "https://pinkpepper.io/resources/food-safety-opening-and-closing-checklist", en: "https://pinkpepper.io/resources/food-safety-opening-and-closing-checklist" },
  },
};

export default function FoodSafetyOpeningAndClosingChecklistPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a food safety opening and closing checklist should cover"
      intro="Opening and closing checks work best when they are short enough to complete on every shift and specific enough to show what was checked, what failed, and what was done about it."
      summaryPoints={[
        "Use one checklist structure for daily opening checks and another for daily closing checks.",
        "Record exceptions and corrective actions, not just normal sign-offs.",
        "Keep the sheet operational so teams will actually complete it during real shifts.",
      ]}
      documentHighlights={[
        {
          label: "Opening checks",
          description:
            "Stocked handwash stations, temperature checks, equipment readiness, allergen information availability, and any visible hygiene or pest issues before service begins.",
        },
        {
          label: "Closing checks",
          description:
            "Food storage, waste removal, cleaning completion, equipment shutdown where needed, and handover notes at the end of the shift.",
        },
        {
          label: "Corrective action notes",
          description:
            "A failed check should lead to a short note about what was done, who handled it, and whether the issue was resolved before service or handover.",
        },
        {
          label: "Repeat-use layout",
          description:
            "A day-by-day sheet is usually easier to use than writing the same checks from scratch every shift. Teams should only need to complete the result cells and any notes.",
        },
      ]}
      sections={[
        {
          title: "Daily checklists should support operations, not slow them down",
          body:
            "The point of an opening and closing checklist is not to create paperwork for its own sake. It is to make sure the same important controls are checked every day, even during busy shifts and handovers.",
        },
        {
          title: "Failures matter more than routine ticks",
          body:
            "A completed checklist becomes useful when it shows what happened when something was not right: a fridge was out of range, sanitiser was missing, or a cleaning task was incomplete. Those notes are what turn a routine checklist into evidence.",
        },
        {
          title: "Keep the format realistic for small teams",
          body:
            "Most cafes, restaurants, and catering teams will use this more consistently if the checks are prefilled and the team only records the result, initials, and any corrective action. Simplicity is a control feature here, not a compromise.",
        },
      ]}
      ctaTitle="Generate daily checklists that match your operation"
      ctaBody="PinkPepper can help you move from generic checklist formats into site-specific daily records and related SOPs."
      templateSlug="food-safety-opening-and-closing-checklist"
      relatedLinks={[
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/features/food-safety-sop-generator", label: "Food safety SOP generator" },
      ]}
    />
  );
}
