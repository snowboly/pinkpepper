import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "ISO 22000 Checklist Poster | PinkPepper",
  description:
    "Use an ISO 22000 checklist poster to keep food safety system discipline visible across prerequisite programmes, monitoring, records, and review routines.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/iso22000-checklist-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/iso22000-checklist-poster",
      en: "https://pinkpepper.io/resources/iso22000-checklist-poster",
    },
  },
  robots: { index: false, follow: true },
};

export default function Iso22000ChecklistPosterPage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What an ISO 22000 checklist poster should reinforce"
      intro="An ISO 22000 checklist poster is most useful when it brings the management-system basics into daily view: prerequisite controls, monitoring discipline, traceable records, review of deviations, and a clear expectation that food safety is managed as a system rather than a set of isolated forms."
      summaryPoints={[
        "The best ISO 22000 prompts connect frontline checks to the wider food safety management system.",
        "A concise poster helps teams remember system discipline during routine production, not only during audits.",
        "Visible checklist cues are useful when multiple departments contribute to the same food safety outcome.",
      ]}
      documentHighlights={[
        {
          label: "System-thinking reminders",
          description:
            "The poster should reinforce that food safety depends on linked controls, records, reviews, and corrective actions rather than one-off isolated checks.",
        },
        {
          label: "PRP and monitoring focus",
          description:
            "The most useful content keeps prerequisite programmes, monitoring habits, and escalation points visible to the people running them.",
        },
        {
          label: "Traceable record discipline",
          description:
            "A visible prompt is valuable when it reminds teams that incomplete or late records weaken the whole system, even when the process itself looked under control.",
        },
        {
          label: "Cross-functional usability",
          description:
            "The file should stay readable in production and support conversations between operations, QA, hygiene, and management teams.",
        },
      ]}
      sections={[
        {
          title: "ISO 22000 works only when daily checks stay connected",
          body:
            "A management system breaks down when departments treat food safety as someone else's paperwork. A checklist poster helps reinforce that prerequisite controls, monitoring, records, and review actions all connect to the same outcome.",
        },
        {
          title: "Visible reminders reduce drift in routine controls",
          body:
            "The gap usually appears in the small repeated actions: missing a review step, delaying a corrective action note, or treating a prerequisite programme as background noise. A poster helps keep those expectations in view where the work actually happens.",
        },
        {
          title: "It is strongest when paired with site-specific documents",
          body:
            "The poster should act as a live operational prompt. It becomes more valuable when teams can link it directly to your HACCP documents, monitoring logs, training records, and internal review routines.",
        },
      ]}
      ctaTitle="Make the management system easier to use on the floor"
      ctaBody="PinkPepper helps teams connect system requirements with practical templates, records, and document workflows that operators and managers can both use."
      templateSlug="iso22000-checklist-poster"
      relatedLinks={[
        { href: "/resources/food-safety-management-system-template", label: "Food safety management system template" },
        { href: "/resources/haccp-plan-template", label: "HACCP plan template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/resources/employee-food-safety-training-record", label: "Employee food safety training record" },
      ]}
    />
  );
}
