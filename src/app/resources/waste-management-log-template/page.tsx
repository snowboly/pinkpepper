import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Waste Management Log Template | PinkPepper",
  description:
    "Learn what a food waste management log should capture for EU and UK food safety compliance, including condemned stock, disposal routes, and contractor records.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/waste-management-log-template",
    languages: { "x-default": "https://pinkpepper.io/resources/waste-management-log-template", en: "https://pinkpepper.io/resources/waste-management-log-template" },
  },
};

export default function WasteManagementLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a waste management log template should capture"
      intro="Waste records serve two purposes: they document that unsafe or out-of-date product was removed from use, and they provide a disposal trail that authorities and certifying bodies may review. A straightforward log is usually enough — but it needs to be filled in consistently."
      summaryPoints={[
        "Product, quantity, reason for disposal, and who authorised it — all four for condemned stock entries.",
        "Contractor details and collection records may be required for certification or environmental inspection.",
        "Waste volumes reviewed over time can flag over-ordering, storage failures, and rotation issues.",
      ]}
      documentHighlights={[
        {
          label: "Condemned stock entries",
          description:
            "Product name and lot or batch identifier, quantity disposed, reason for disposal, disposal method, and the name of the person who authorised it. Authorisation matters — disposal decisions shouldn't be anonymous.",
        },
        {
          label: "Disposal authorisation column",
          description:
            "Who signed off the disposal. Particularly important when product is condemned due to a safety or quality failure rather than just date rotation.",
        },
        {
          label: "Contractor collection rows",
          description:
            "Date of collection, contractor name, waste category, and waste transfer note reference where required. For UK businesses, commercial food waste collection typically requires a transfer note — this is where you reference it.",
        },
        {
          label: "Monthly summary area",
          description:
            "A simple tally of waste volumes by category for the month. Useful for identifying patterns — and easier to review than reading individual entries.",
        },
      ]}
      sections={[
        {
          title: "Condemned product records need to be specific",
          body:
            "When product is condemned — past its use-by date, failed a check, or involved in a corrective action — the disposal needs to be documented. Product name, lot identifier, quantity, reason, method, and who authorised it. Generic entries like 'out of date items disposed' don't meet the standard and don't help you if the disposal is ever questioned.",
        },
        {
          title: "Contractor and transfer records",
          body:
            "If food waste is collected by a third-party contractor, the log should reference their name and collection frequency. For UK businesses, commercial food waste collection under the Environmental Protection Act typically requires waste transfer notes — these need to be filed and cross-referenced. Businesses with animal by-products have additional category and disposal route requirements.",
        },
        {
          title: "Waste logs have operational value beyond compliance",
          body:
            "A log reviewed monthly can show where product is being lost most often — over-production, poor date rotation, storage failures, delivery quality. That makes it a useful management tool, not just a compliance record. The patterns you find reviewing three months of data are rarely visible from a single entry.",
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
