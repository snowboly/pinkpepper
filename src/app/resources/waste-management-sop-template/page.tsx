import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Waste Management SOP Template | PinkPepper",
  description:
    "Learn how to write a waste management SOP for food businesses, covering segregation, storage, collection, and compliance with EU and UK waste regulations.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/waste-management-sop-template",
    languages: { "x-default": "https://pinkpepper.io/resources/waste-management-sop-template", en: "https://pinkpepper.io/resources/waste-management-sop-template" },
  },
};

export default function WasteManagementSopTemplatePage() {
  return (
    <ResourceTemplate
      category="SOP resource"
      title="What a waste management SOP should cover for food businesses"
      intro="A waste management SOP defines how a food business handles waste from segregation at source through to disposal. Done well it protects food from contamination, satisfies local authority and certification requirements, and gives staff a procedure they can follow without guessing."
      summaryPoints={[
        "Segregation at source prevents cross-contamination and keeps disposal straightforward.",
        "Storage, collection frequency, and contractor details explicit enough for teams to follow without supervision.",
        "Aligned with local environmental requirements — not just food safety ones.",
      ]}
      documentHighlights={[
        {
          label: "Waste stream sections",
          description:
            "Food waste, packaging, glass, hazardous materials, animal by-products — each stream covered separately. What goes where, what cannot be mixed, and why. Particularly important where allergen-containing or ABP waste is involved.",
        },
        {
          label: "Container and labelling requirements",
          description:
            "Which bins are used for which stream, how they're labelled, colour-coding where required. If staff need to guess, the segregation breaks down.",
        },
        {
          label: "Storage area rules",
          description:
            "Where waste is held on site, the condition requirements — sealed, pest-resistant, separated from food handling and storage areas — and how often it's moved. Waste stored incorrectly is a contamination risk and an inspection finding.",
        },
        {
          label: "Contractor schedule and contacts",
          description:
            "Who collects which stream, how often, and the contact details. Collection schedules and waste transfer note requirements referenced where they apply.",
        },
      ]}
      sections={[
        {
          title: "Segregation needs to be specific, not aspirational",
          body:
            "The SOP should state which waste streams apply to the site and exactly how each is separated. What bins are used, how they're labelled, and what cannot be mixed. Animal by-products and allergen-containing waste in particular have rules that staff need to know before they're sorting waste under pressure at the end of service.",
        },
        {
          title: "Storage and collection can't be left vague",
          body:
            "Waste stored on site needs to be in sealed, pest-resistant containers in a designated area kept well away from food handling and storage. The SOP should say where that area is, what the condition requirements are, how often waste is removed from food production areas, and who each waste contractor is. If collection schedules or waste transfer notes are required, they need to be referenced here.",
        },
        {
          title: "Responsibility and verification close the loop",
          body:
            "The procedure should name who owns each waste stream — and who checks that segregation is being followed during service. A supervisor check at the end of service provides evidence for internal audit. Without it, the SOP describes what should happen, but there's no record of whether it did.",
        },
      ]}
      ctaTitle="Create a waste management procedure for your site"
      ctaBody="PinkPepper can help you draft a waste management SOP and supporting records tailored to your operation size, waste categories, and contractor arrangements."
      templateSlug="waste-management-sop-template"
      relatedLinks={[
        { href: "/resources/waste-management-log-template", label: "Waste management log template" },
        { href: "/resources/cleaning-and-disinfection-sop", label: "Cleaning and disinfection SOP" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
