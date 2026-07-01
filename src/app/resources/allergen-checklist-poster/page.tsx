import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Allergen Checklist Poster | PinkPepper",
  description:
    "Use an allergen checklist poster to keep ingredient changes, service communication, and cross-contact controls visible for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/allergen-checklist-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/allergen-checklist-poster",
      en: "https://pinkpepper.io/resources/allergen-checklist-poster",
    },
  },
};

export default function AllergenChecklistPosterPage() {
  return (
    <ResourceTemplate
      category="Allergen resource"
      title="What an allergen checklist poster should remind teams to check"
      intro="An allergen checklist poster is useful when it turns the most failure-prone moments into visible prompts: recipe changes, substitutions, service communication, cleaning between tasks, and label or menu updates. For EU and UK operators, that means keeping practical allergen control visible where decisions actually happen."
      summaryPoints={[
        "The best allergen posters focus on the checks staff forget during busy service, not on long legal summaries.",
        "A visible checklist works best when it matches your allergen matrix, recipes, and customer-information process.",
        "Posters should reinforce cross-contact prevention and communication discipline together, not as separate issues.",
      ]}
      documentHighlights={[
        {
          label: "Recipe and substitution checks",
          description:
            "The poster should remind staff to verify whether any ingredient, garnish, sauce, or supplier change affects allergen information before service starts.",
        },
        {
          label: "Communication controls",
          description:
            "Front-of-house and kitchen staff need the same prompts around asking, escalating, confirming, and updating allergen information when a customer query is raised.",
        },
        {
          label: "Cross-contact reminders",
          description:
            "Segregation, utensil control, cleaning between allergen and non-allergen tasks, and careful storage are stronger poster prompts than generic statements about being careful.",
        },
        {
          label: "Operational placement",
          description:
            "The poster is most useful near prep, pass, and service briefing points where teams can reference it before the shift and during menu changes.",
        },
      ]}
      sections={[
        {
          title: "Allergen control fails in the handover moments",
          body:
            "Most allergen failures do not come from not knowing allergens exist. They come from a substitution nobody passed on, a garnish change not reflected in service information, or a rushed answer given without checking. A stronger poster targets those moments directly.",
        },
        {
          title: "Use the poster to reinforce one live source of truth",
          body:
            "For EU and UK food businesses, the checklist on the wall should reflect the same allergen logic used in your matrix, recipes, labels, menus, and staff briefings. If the visible reminder and the working documents drift apart, the poster becomes noise.",
        },
        {
          title: "A poster should make the right action obvious",
          body:
            "When staff are unsure, the poster should point them toward the next safe action: stop, check the current recipe information, confirm with the right person, and update customer-facing information where needed. That is more useful than abstract policy wording.",
        },
      ]}
      ctaTitle="Pair allergen reminders with live working documents"
      ctaBody="PinkPepper helps teams connect allergen posters with matrices, SOPs, records, and service controls so the reminder on the wall matches the way the operation really runs."
      templateSlug="allergen-checklist-poster"
      relatedLinks={[
        { href: "/resources/allergen-matrix-template", label: "Allergen matrix template" },
        { href: "/articles/allergen-management-within-haccp-plans", label: "Allergen management within HACCP plans" },
        { href: "/features/allergen-documentation", label: "Allergen documentation workflow" },
      ]}
    />
  );
}
