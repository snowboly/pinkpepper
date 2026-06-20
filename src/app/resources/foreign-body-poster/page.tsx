import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Foreign Body Prevention Poster | PinkPepper",
  description:
    "Use a foreign body prevention poster to reinforce packaging checks, utensil control, housekeeping, and contamination prevention on EU and UK food sites.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/foreign-body-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/foreign-body-poster",
      en: "https://pinkpepper.io/resources/foreign-body-poster",
    },
  },
};

export default function ForeignBodyPosterPage() {
  return (
    <ResourceTemplate
      category="HACCP resource"
      title="What a foreign body prevention poster should keep front of mind"
      intro="A foreign body prevention poster should reinforce the simple controls that stop contamination before it reaches product: damaged packaging checks, controlled use of tools and utensils, clean-as-you-go discipline, and immediate escalation when fragments, breakage, or debris are found. For EU and UK food businesses, it is a practical cue that supports HACCP and site standards."
      summaryPoints={[
        "Foreign-body prevention works best when staff can see the control points that are easiest to miss under routine pressure.",
        "The poster should focus on prevention and escalation, not just list contamination examples.",
        "Visible reminders are especially useful around receiving, decanting, prep, packing, and rework areas where fragments can enter product unnoticed.",
      ]}
      documentHighlights={[
        {
          label: "Packaging and incoming checks",
          description:
            "Staff should be reminded to check for damaged containers, split packaging, staples, loose components, and other signs that foreign material could already be present.",
        },
        {
          label: "Tool and utensil control",
          description:
            "The poster should reinforce disciplined handling of knives, scoops, clips, pens, and other small items that can break, go missing, or contaminate open product.",
        },
        {
          label: "Housekeeping and line condition",
          description:
            "Debris, worn surfaces, loose fittings, and poor clean-down all increase the risk of contamination. A good poster points staff back to those conditions before work starts or resumes.",
        },
        {
          label: "Immediate response expectations",
          description:
            "When a foreign-body risk is seen, the team needs a clear prompt to stop, isolate, assess affected product, and escalate rather than carry on and hope it is minor.",
        },
      ]}
      sections={[
        {
          title: "Most foreign-body failures are routine control failures",
          body:
            "Foreign-body incidents rarely come from dramatic events alone. They often start with everyday gaps: a damaged lid, a missing clip, a cracked scoop, or poor clean-down around equipment. A poster is useful when it keeps those routine gaps visible to the people doing the work.",
        },
        {
          title: "The visible cue should fit the site's actual contamination risks",
          body:
            "A bakery, factory, and restaurant will not share the exact same foreign-body profile. The strongest poster content matches the materials, handling steps, and breakage points that matter most in your own operation.",
        },
        {
          title: "Escalation language matters as much as prevention language",
          body:
            "Staff need to know what to do when they find damage or suspect contamination. The poster should support a simple habit: stop, separate affected product, report it, and do not restart until the area or batch is assessed.",
        },
      ]}
      ctaTitle="Support HACCP controls with visible foreign-body discipline"
      ctaBody="PinkPepper helps teams connect contamination-prevention reminders with hazard analysis, corrective action records, and practical SOPs that stand up in real operations."
      templateSlug="foreign-body-poster"
      relatedLinks={[
        { href: "/resources/hazard-analysis-template", label: "Hazard analysis template" },
        { href: "/resources/corrective-action-log-template", label: "Corrective action log template" },
        { href: "/resources/glass-brittle-poster", label: "Glass and brittle plastic control poster" },
      ]}
    />
  );
}
