import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Waste Management Log Template | PinkPepper",
  description:
    "Learn what a food waste management log should capture for EU and UK food safety compliance, including condemned stock, disposal routes, and contractor records.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/waste-management-log-template",
  },
};

export default function WasteManagementLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a waste management log template should capture"
      intro="Waste records are relevant to food safety for two reasons: they document that unsafe or out-of-date product has been removed from use, and they provide traceability of disposal routes that authorities and certifying bodies may review. A simple log is usually sufficient, but it needs to be consistently maintained."
      summaryPoints={[
        "Condemned product entries should identify the product, quantity, reason for disposal, and who authorised it.",
        "Disposal route records — including waste contractor details — may be required for certification or inspection.",
        "Food waste volumes tracked over time can identify process inefficiencies and over-ordering patterns.",
      ]}
      sections={[
        {
          title: "Condemned and rejected product",
          body: "When product is condemned — because it is past its use-by date, has failed a quality or safety check, or has been involved in a corrective action — the disposal should be documented. The record should include the product name and lot or batch identifier, the quantity disposed, the reason for disposal, the disposal method (bin, collection, return to supplier), and the name of the person who authorised the disposal decision.",
        },
        {
          title: "Waste disposal contractors",
          body: "If food waste is collected by a third-party contractor, the log should reference the contractor's name and the collection frequency. Where waste transfer notes are required — as they are for commercial food waste in the UK under the Environmental Protection Act — these should be filed and cross-referenced to the log. For businesses producing significant volumes of animal by-products, the relevant category and disposal route should also be recorded.",
        },
        {
          title: "Review and operational value",
          body: "A waste log reviewed regularly can reveal where product is being lost most often — whether through over-production, poor date rotation, storage failures, or supplier delivery issues. This makes it a useful operational tool beyond its compliance function. A monthly review of waste volumes by category is usually enough to identify actionable patterns.",
        },
      ]}
      ctaTitle="Create a waste management procedure for your site"
      ctaBody="PinkPepper can help you draft a waste management log and disposal procedure appropriate to your operation size, waste categories, and contractor arrangements."
      templateSlug="waste-management-log-template"
      relatedLinks={[
        { href: "/resources/corrective-action-log-template", label: "Corrective action log" },
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
