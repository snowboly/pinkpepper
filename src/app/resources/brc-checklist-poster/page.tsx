import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "BRC Checklist Poster | PinkPepper",
  description:
    "Use a BRC checklist poster to keep key site standards visible around hygiene, housekeeping, process control, and audit-readiness discipline.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/brc-checklist-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/brc-checklist-poster",
      en: "https://pinkpepper.io/resources/brc-checklist-poster",
    },
  },
  robots: { index: false, follow: true },
};

export default function BrcChecklistPosterPage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a BRC checklist poster should keep visible on site"
      intro="A BRC checklist poster is useful when it turns audit language into daily operating cues. The point is not to summarise the whole standard. It is to keep the site-focused habits in front of teams: hygiene discipline, housekeeping, segregation, records, and prompt escalation when something slips."
      summaryPoints={[
        "The strongest BRC posters reinforce the housekeeping and control points teams are expected to protect every shift.",
        "A visible checklist prompt helps sites close the gap between audit preparation and routine behaviour on the floor.",
        "Posters work best when supervisors can use them during walk-rounds, start-up checks, and corrective conversations.",
      ]}
      documentHighlights={[
        {
          label: "Site-standard reminders",
          description:
            "The poster should reinforce the practical controls that support BRC-style expectations around hygiene, housekeeping, segregation, and documentation.",
        },
        {
          label: "Short audit-readiness cues",
          description:
            "Operators need a visual list they can scan quickly, not a wall of standard text that no one uses during the shift.",
        },
        {
          label: "Clear ownership prompts",
          description:
            "The best posters support line leaders and supervisors by making it obvious what should be challenged, corrected, or escalated immediately.",
        },
        {
          label: "Printable floor-use format",
          description:
            "The layout should stay readable once printed and placed in production, intake, hygiene, or dispatch areas.",
        },
      ]}
      sections={[
        {
          title: "A visible checklist supports daily discipline",
          body:
            "Most audit problems do not start during the audit itself. They come from small misses that normalise over time: poor housekeeping, incomplete records, weak segregation, or a slow response to damaged materials and equipment. A visual checklist prompt helps keep those basics active on the floor.",
        },
        {
          title: "Useful BRC prompts focus on site behaviour",
          body:
            "A good poster does not try to teach the full standard. It reinforces the recurring behaviours that matter to site control: clean-as-you-go discipline, label accuracy, stock condition, protective clothing, foreign-body awareness, and escalation when standards drop.",
        },
        {
          title: "It works best when paired with live records",
          body:
            "The poster should support the system you already run, not replace it. It becomes more useful when teams can connect it directly to inspection routines, corrective actions, and the records that show issues were found and handled.",
        },
      ]}
      ctaTitle="Support BRC-style standards with usable records"
      ctaBody="PinkPepper helps teams connect audit-readiness prompts with practical checklists, logs, and document workflows that can still hold up under review."
      templateSlug="brc-checklist-poster"
      relatedLinks={[
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
        { href: "/resources/food-safety-management-system-template", label: "Food safety management system template" },
        { href: "/resources/gmp-poster", label: "GMP poster" },
        { href: "/resources/corrective-action-log-template", label: "Corrective action log template" },
      ]}
    />
  );
}
