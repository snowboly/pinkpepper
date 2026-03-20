import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Cleaning and Disinfection SOP | PinkPepper",
  description:
    "Learn how to structure a cleaning and disinfection SOP for food businesses, including responsibilities, chemicals, verification, and records.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/cleaning-and-disinfection-sop",
  },
};

export default function CleaningAndDisinfectionSopPage() {
  return (
    <ResourceTemplate
      category="SOP resource"
      title="How to structure a cleaning and disinfection SOP that teams can follow"
      intro="A cleaning SOP needs enough detail to be operational and enough simplicity to stay usable. The best versions define what gets cleaned, how often, with what method, by whom, and how completion is checked."
      summaryPoints={[
        "A strong cleaning SOP separates the task, method, frequency, responsibility, and verification step.",
        "Chemical control and contact-time clarity matter more than generic wording.",
        "The document should support real execution on shift, not only file compliance.",
      ]}
      sections={[
        {
          title: "Detail the method, not just the intent",
          body:
            "Many SOPs say equipment must be cleaned but never explain the method, sequence, or verification. More useful documents explain pre-clean, detergent, rinse, disinfect, contact time, and final check in practical language.",
        },
        {
          title: "Responsibility and frequency need to be explicit",
          body:
            "If an SOP does not clearly state who owns the task and how often it happens, teams make assumptions. Those assumptions are where missed cleaning and weak records usually start.",
        },
        {
          title: "Verification closes the loop",
          body:
            "A cleaning SOP should also explain how completion is checked. That might mean supervisor sign-off, visual inspection, ATP checks, swabs, or another verification method appropriate to the site.",
        },
      ]}
      ctaTitle="Generate cleaning SOP drafts faster"
      ctaBody="PinkPepper helps operators create cleaning and disinfection SOPs, schedules, and supporting records that can be reviewed and exported."
      templateSlug="cleaning-and-disinfection-sop"
      relatedLinks={[
        { href: "/features/food-safety-sop-generator", label: "Food safety SOP generator" },
        { href: "/resources/allergen-matrix-template", label: "Allergen matrix template" },
        { href: "/use-cases/food-manufacturing", label: "Food manufacturing use case" },
      ]}
    />
  );
}
