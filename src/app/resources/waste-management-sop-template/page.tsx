import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Waste Management SOP Template | PinkPepper",
  description:
    "Learn how to write a waste management SOP for food businesses, covering segregation, storage, collection, and compliance with EU and UK waste regulations.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/waste-management-sop-template",
  },
};

export default function WasteManagementSopTemplatePage() {
  return (
    <ResourceTemplate
      category="SOP resource"
      title="What a waste management SOP should cover for food businesses"
      intro="A waste management SOP defines how a food business handles waste throughout the operation — from segregation at source to disposal. Done well it protects food from contamination, satisfies local authority and certification requirements, and gives staff a clear procedure to follow consistently."
      summaryPoints={[
        "Waste segregation at source prevents cross-contamination and keeps disposal costs manageable.",
        "Storage, collection frequency, and contractor details need to be explicit enough for site teams to follow without supervision.",
        "The SOP should align with local environmental and food safety compliance requirements.",
      ]}
      sections={[
        {
          title: "Segregation and labelling",
          body: "The SOP should specify which waste streams apply to the site — food waste, packaging, glass, hazardous, animal by-products — and how each must be segregated. Bins and containers should be clearly labelled and colour-coded where required. The document should state what cannot be mixed and why, particularly where animal by-products or allergen-containing waste are involved.",
        },
        {
          title: "Storage, frequency, and contractor arrangements",
          body: "Waste stored on-site must be held in sealed, pest-resistant containers in a designated area separated from food handling and storage. The SOP should specify how often waste is removed from food production areas, the location and condition requirements for external storage, and the name and contact details of each waste contractor. Collection schedules and waste transfer note requirements should be referenced where applicable.",
        },
        {
          title: "Responsibilities and verification",
          body: "The procedure should name who is responsible for each waste stream, including who checks that segregation is being followed during service and who records contractor collections. A verification step — such as a supervisor check at the end of service — closes the loop and provides evidence for internal audit and environmental health inspections.",
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
