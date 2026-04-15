import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Cleaning and Disinfection SOP | PinkPepper",
  description:
    "Learn how to structure a cleaning and disinfection SOP for food businesses, including responsibilities, chemicals, verification, and records.",
  alternates: {
    canonical: "https://www.pinkpepper.io/resources/cleaning-and-disinfection-sop",
  },
};

export default function CleaningAndDisinfectionSopPage() {
  return (
    <ResourceTemplate
      category="SOP resource"
      title="How to structure a cleaning and disinfection SOP that teams can follow"
      intro="A cleaning SOP needs enough detail to be operational and enough clarity to stay usable. The best ones define what gets cleaned, how often, with what method, by whom, and how completion gets checked."
      summaryPoints={[
        "Separate entries for each area or piece of equipment — not a single catch-all table.",
        "The method matters: pre-clean, detergent, rinse, disinfectant, contact time, final check — in that order.",
        "Chemical details and dilution rates need to be in the document, not just remembered.",
      ]}
      documentHighlights={[
        {
          label: "Area and task list",
          description:
            "Each cleaning task is listed separately by area — prep surfaces, equipment, floors, storage. Not a single row for 'the kitchen'. If it's not listed, it doesn't reliably get done.",
        },
        {
          label: "Method steps in sequence",
          description:
            "Pre-clean, detergent, rinse, disinfectant, contact time, final check — each step written out. If someone can follow it without asking, it's specific enough.",
        },
        {
          label: "Chemical details section",
          description:
            "Product names, dilution rates, application method, contact times, and safety data sheet reference. Vague instructions like 'use approved cleaner' don't hold up when something goes wrong.",
        },
        {
          label: "Frequency and responsibility columns",
          description:
            "Who cleans it, how often, and what sign-off looks like. These are the three questions that come up every time a cleaning task gets missed.",
        },
      ]}
      sections={[
        {
          title: "Describe the method, not the intent",
          body:
            "A lot of SOPs say equipment must be cleaned and leave it there. More useful ones write out the actual sequence — pre-clean to remove debris, detergent to lift grease and soil, rinse, disinfectant with the correct contact time, final check. Without that sequence, teams improvise. Improvised cleaning rarely meets the same standard twice.",
        },
        {
          title: "Who and how often can't be left to assumption",
          body:
            "If the document doesn't say who owns the task and when it happens, people make reasonable-sounding guesses. That's where missed cleaning starts. It's also where the conversation goes badly when an inspector asks and no one gives the same answer.",
        },
        {
          title: "Verification closes the loop",
          body:
            "A cleaning SOP should explain how completion gets checked — supervisor sign-off, visual inspection, ATP swabs, or another method suited to the site. Without it, you have a record of intention, not evidence of what actually happened.",
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
