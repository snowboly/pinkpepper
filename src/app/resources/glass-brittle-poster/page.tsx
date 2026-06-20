import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Glass and Brittle Plastic Control Poster | PinkPepper",
  description:
    "Use a glass and brittle plastic control poster to reinforce registers, inspections, breakage response, and contamination control for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/glass-brittle-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/glass-brittle-poster",
      en: "https://pinkpepper.io/resources/glass-brittle-poster",
    },
  },
};

export default function GlassBrittlePosterPage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a glass and brittle plastic control poster should reinforce"
      intro="A glass and brittle plastic control poster should keep the main control points visible: where breakable materials exist, when checks are due, how to respond to breakage, and how to protect exposed product during clean-up. For EU and UK food businesses, it is a practical reminder that supports the site register and inspection routine."
      summaryPoints={[
        "A useful glass-control poster reminds staff that prevention depends on routine checks, not just emergency breakage response.",
        "The poster should support the live register and the actual inspection schedule already used on site.",
        "Breakage response must be clear enough that staff know to stop, isolate product, clean methodically, and verify the area before restart.",
      ]}
      documentHighlights={[
        {
          label: "Known breakable items",
          description:
            "The poster should point staff back to the idea of controlled items and designated areas rather than treating any glass or brittle plastic as informal site knowledge.",
        },
        {
          label: "Routine inspection prompts",
          description:
            "Checks for damage, cracks, loose covers, and degraded fittings should be visible because these are the early warnings that stop a breakage event from becoming product contamination.",
        },
        {
          label: "Breakage isolation and clean-up",
          description:
            "A useful poster makes the response sequence obvious: stop work, isolate the zone, protect or quarantine product, clean carefully, and verify the area before release.",
        },
        {
          label: "Verification before restart",
          description:
            "The poster should reinforce that restart happens only after the area, tools, and potentially affected product are assessed, not when the visible shards are gone.",
        },
      ]}
      sections={[
        {
          title: "The poster should reinforce register-based control",
          body:
            "Glass and brittle plastic management works when the site knows what exists, where it is, and how it is checked. The poster is useful when it backs up that register-based discipline instead of acting like a standalone control.",
        },
        {
          title: "Breakage response must be simple enough to follow under pressure",
          body:
            "When something breaks, staff will follow the clearest routine available. A strong poster helps remove hesitation by pointing them toward stop, isolate, clean, inspect, and document rather than rushing to restart the line or service.",
        },
        {
          title: "Visible reminders reduce complacency",
          body:
            "Sites become used to familiar fittings, covers, and lights. That is where a poster helps: it turns familiar risks back into visible ones and keeps routine checks from being treated as optional.",
        },
      ]}
      ctaTitle="Keep breakage control linked to real HACCP discipline"
      ctaBody="PinkPepper helps businesses pair visible control reminders with hazard analysis, corrective action records, and inspection routines that support real contamination prevention."
      templateSlug="glass-brittle-poster"
      relatedLinks={[
        { href: "/resources/foreign-body-poster", label: "Foreign body prevention poster" },
        { href: "/resources/hazard-analysis-template", label: "Hazard analysis template" },
        { href: "/resources/corrective-action-log-template", label: "Corrective action log template" },
      ]}
    />
  );
}
