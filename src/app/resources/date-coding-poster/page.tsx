import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Date Coding Poster | PinkPepper",
  description:
    "Use a date coding poster to reinforce opened-product labelling, shelf-life discipline, defrost controls, and FIFO stock rotation.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/date-coding-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/date-coding-poster",
      en: "https://pinkpepper.io/resources/date-coding-poster",
    },
  },
};

export default function DateCodingPosterPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a date coding poster should help staff remember"
      intro="A container without a usable date is an avoidable risk. Someone will guess, someone will waste it, or someone will use it without confidence. A good date coding poster keeps the labelling standard visible wherever products are opened, decanted, cooled, defrosted, portioned, and returned to storage."
      summaryPoints={[
        "The best posters focus on clarity: what the product is, when it was opened or prepared, and when it must be used or discarded.",
        "Date coding works only when the standard is visible across shifts, not held in one person’s memory.",
        "The poster should support shelf-life and stock-rotation routines already defined by the business.",
      ]}
      documentHighlights={[
        {
          label: "Opened and decanted products",
          description:
            "The poster should reinforce that original packaging is not the end of the control. Once a product is opened or moved, the information must move with it.",
        },
        {
          label: "Prepared and cooled foods",
          description:
            "Batch prep, cooled components, and defrosted stock all need clear dates that reflect your documented shelf-life rules, not guesswork.",
        },
        {
          label: "Readable labels",
          description:
            "A date code helps nobody if the label is vague, abbreviated beyond recognition, or already falling off halfway through service.",
        },
        {
          label: "Rotation discipline",
          description:
            "Date coding only works properly when it is tied to FIFO and checked consistently at the point of use, not after waste has already built up.",
        },
      ]}
      sections={[
        {
          title: "No date means no confidence",
          body:
            "A faded sticker or a shorthand note that only one person understands is not a control. Good date coding gives any member of the team enough clarity to decide whether the product can still be used safely, whether it should be prioritised, or whether it needs to be discarded.",
        },
        {
          title: "The control starts again after opening and prep",
          body:
            "Original pack labels are only one part of the picture. The risk comes back every time ingredients are opened, portioned, defrosted, or cooled for later use. That is why the poster belongs where relabelling happens, not just in a stockroom nobody checks during service.",
        },
        {
          title: "Supports traceability and waste control together",
          body:
            "Clear date coding helps reduce waste, but that is not its only job. It also strengthens traceability, cross-shift consistency, and your due diligence when questions arise about shelf life or stock handling. A simple visible prompt helps keep those standards live in the real working environment.",
        },
      ]}
      ctaTitle="Stop the guessing game at the storage shelf"
      ctaBody="PinkPepper helps teams pair date coding routines with shelf-life rules, stock rotation, and traceability records so daily labelling stays clear under pressure."
      templateSlug="date-coding-poster"
      relatedLinks={[
        { href: "/resources/food-safety-opening-and-closing-checklist", label: "Food safety opening and closing checklist" },
        { href: "/resources/waste-management-log-template", label: "Waste management log template" },
        { href: "/resources/traceability-log-template", label: "Traceability log template" },
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
      ]}
    />
  );
}
