import type { Metadata } from "next";
import { FeatureTemplate } from "@/components/site/FeatureTemplate";

export const metadata: Metadata = {
  title: "Food Safety Software for Catering Businesses | PinkPepper",
  description:
    "PinkPepper handles the HACCP paperwork behind off-site catering, from prep in the production kitchen through transport, temporary setup, service, and pack-down.",
  alternates: {
    canonical: "https://pinkpepper.io/use-cases/catering",
  },
};

export default function CateringUseCasePage() {
  return (
    <FeatureTemplate
      eyebrow="For contract caterers and event kitchens"
      title="Food safety documentation that moves with your service"
      description="PinkPepper handles the HACCP paperwork behind off-site catering, from prep in the production kitchen through to transport, temporary setup, service, and pack-down. You get documentation that matches the way you actually work: event by event, menu by menu, venue by venue. No static templates. No blank sheets on the day of service."
      primaryCta="Start a catering plan"
      painPoints={[
        "Static HACCP templates fall apart the moment the menu, venue, or holding setup changes between events.",
        "Staff handoffs between kitchen, van, and front-of-service teams leave gaps in monitoring logs and temperature records.",
        "Pre-event preparation documents take longer to compile manually than the food takes to prepare.",
      ]}
      outcomes={[
        "Each event gets its own set of HACCP records, built from your core menus but adapted to the venue and service timeline.",
        "Transport, hot-hold, cold-hold, and display monitoring logs stay consistent across production and service teams.",
        "Audit-ready packs are ready before the van leaves, not pieced together after the event.",
      ]}
      sections={[
        {
          title: "Documentation that starts in the prep kitchen and finishes at pack-down",
          body:
            "A contract catering operation spans multiple sites, even if you only see one kitchen. PinkPepper links your prep records to transport checks, arrival temperatures, hot-hold and cold-hold logs, and final service records. When an EHO asks for the paper trail from raw material intake through to service at a wedding marquee, it is already in one place. Your team does not need to reconstruct a timeline from notebooks and WhatsApp messages.",
        },
        {
          title: "Event-level HACCP plans without the manual rebuild",
          body:
            "You change menus constantly. One week it is a seated gala, the next it is bowl food for a private view, then canapes in a field. PinkPepper lets you clone core menu plans and adjust CCPs, holding temperatures, and allergen notes for each event without rewriting everything from scratch. The system flags where a menu change introduces a new risk, so you do not catch it three hours into service.",
        },
        {
          title: "Staff handoffs that do not break the chain",
          body:
            "The chef who prepped the dish is rarely the same person plating it at the venue. PinkPepper gives service teams the monitoring records they need to pick up where the kitchen left off: hot-hold start times, allergen matrix for the menu, critical limit checks, and corrective action forms if something drifts. Everyone works from the same live documentation, whether they are in the production kitchen or standing behind a buffet at a country house 40 miles away.",
        },
      ]}
      heroImage={{
        src: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80",
        alt: "Catering buffet setup at a professional event",
      }}
      relatedLinks={[
        {
          href: "/features/haccp-plan-generator",
          label: "HACCP plan generator",
          description: "Build catering HACCP plans that cover prep, transport, holding, service, and event-specific controls.",
        },
        {
          href: "/features/allergen-documentation",
          label: "Allergen documentation",
          description: "Keep allergen records aligned with changing event menus, venue formats, and front-of-house handoffs.",
        },
        {
          href: "/resources/temperature-monitoring-log-template",
          label: "Temperature monitoring log template",
          description: "Use a monitoring structure that works across kitchen prep, transport, hot hold, and cold hold checks.",
        },
      ]}
    />
  );
}
