import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "GMP Poster | PinkPepper",
  description:
    "Use a GMP poster to reinforce core good manufacturing practice expectations on hygiene, contamination control, and disciplined food handling.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/gmp-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/gmp-poster",
      en: "https://pinkpepper.io/resources/gmp-poster",
    },
  },
};

export default function GmpPosterPage() {
  return (
    <ResourceTemplate
      category="Training resource"
      title="What a GMP poster should reinforce on site"
      intro="A GMP poster works when it turns the basics into visible daily cues: personal hygiene, hand discipline, contamination control, protective clothing, and careful movement between raw and ready-to-eat work. It should strengthen routine, not add noise."
      summaryPoints={[
        "Good manufacturing practice reminders should be short, visual, and positioned where habits are formed.",
        "The strongest GMP posters reinforce site rules that already exist in training and SOPs.",
        "A poster is most useful when supervisors can point to it during briefings, onboarding, and corrective conversations.",
      ]}
      documentHighlights={[
        {
          label: "Personal hygiene reminders",
          description:
            "Handwashing, clean protective clothing, illness reporting, and behavior controls are usually the non-negotiable core of a GMP poster.",
        },
        {
          label: "Contamination-control prompts",
          description:
            "The poster should reinforce separation between raw and ready-to-eat work, clean and dirty tasks, and controlled use of utensils and surfaces.",
        },
        {
          label: "Simple operational language",
          description:
            "Posters work best when the wording is direct enough for staff to act on immediately, not when they try to summarize an entire policy manual.",
        },
        {
          label: "Print-ready visibility",
          description:
            "The file needs to be readable once printed and placed in working areas where supervisors and operators can actually use it.",
        },
      ]}
      sections={[
        {
          title: "GMP posters support consistency, not compliance by themselves",
          body:
            "The poster is there to reinforce the standards you already expect on site. It cannot replace induction, supervision, or documented procedures, but it can make the right behavior easier to remember when work is moving quickly.",
        },
        {
          title: "Visible cues are useful in high-turnover environments",
          body:
            "In sites with agency labour, seasonal peaks, or regular onboarding, a visible GMP reminder helps shorten the gap between training and practice. It gives supervisors a shared reference point on the floor.",
        },
        {
          title: "The best poster content matches the site's real risks",
          body:
            "A generic hygiene poster is fine, but a useful one reinforces the behaviors your operation most depends on. That could be allergen separation, controlled movement between zones, or discipline around hand tools and surfaces.",
        },
      ]}
      ctaTitle="Pair GMP reminders with real working documents"
      ctaBody="PinkPepper helps businesses connect posters with hygiene policies, training records, and operational SOPs so the wall message matches the documented system."
      templateSlug="gmp-poster"
      relatedLinks={[
        { href: "/resources/personal-hygiene-policy-template", label: "Personal hygiene policy template" },
        { href: "/resources/employee-food-safety-training-record", label: "Employee food safety training record" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
      ]}
    />
  );
}
