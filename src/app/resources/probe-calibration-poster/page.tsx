import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Probe Thermometer Calibration Poster | PinkPepper",
  description:
    "Use a probe thermometer calibration poster to reinforce routine accuracy checks, cleaning, reference methods, and corrective action for EU and UK food businesses.",
  alternates: {
    canonical: "https://pinkpepper.io/resources/probe-calibration-poster",
    languages: {
      "x-default": "https://pinkpepper.io/resources/probe-calibration-poster",
      en: "https://pinkpepper.io/resources/probe-calibration-poster",
    },
  },
};

export default function ProbeCalibrationPosterPage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What a probe thermometer calibration poster should remind teams to do"
      intro="A probe calibration poster should make the checking routine easy to remember: verify the probe at the right interval, use the correct reference method, clean it properly, record the result, and act when it is out of tolerance. For EU and UK food businesses, it supports the accuracy of the monitoring system rather than acting as evidence on its own."
      summaryPoints={[
        "A calibration poster is most useful when it reminds staff how to check accuracy before the probe is relied on for CCP or routine monitoring decisions.",
        "The visible prompt should match the same method and tolerance rules used in your calibration log.",
        "Staff need a reminder about what to do when a probe fails, not just how to perform the check when everything is fine.",
      ]}
      documentHighlights={[
        {
          label: "Reference method reminders",
          description:
            "The poster should point staff toward the approved check method your site uses, such as an ice-point check or reference comparison, rather than vague 'test the probe' language.",
        },
        {
          label: "Cleaning and handling discipline",
          description:
            "Calibration and hygiene belong together. The probe must be clean before and after checks and protected from damage between uses.",
        },
        {
          label: "Recording expectations",
          description:
            "A useful poster reminds staff that the check only counts when it is recorded with the probe ID, result, and any action taken.",
        },
        {
          label: "Out-of-tolerance response",
          description:
            "The visible prompt should reinforce isolation, replacement, reassessment, or escalation steps if the probe fails rather than letting staff keep using it informally.",
        },
      ]}
      sections={[
        {
          title: "Monitoring evidence is only as good as the probe behind it",
          body:
            "A cooking or storage record looks reliable until the probe is found to be inaccurate. That is why a calibration poster matters: it supports the habit that protects the trustworthiness of the readings the site depends on.",
        },
        {
          title: "The poster should make the method harder to skip",
          body:
            "Calibration failures often come from routine shortcuts. The right visual prompt makes it easier for staff to remember the check sequence and harder to treat calibration as an optional back-office task.",
        },
        {
          title: "Use the poster near the place where checks happen",
          body:
            "Probe stations, prep areas, and supervisor check points are usually better locations than offices. The reminder should be visible at the moment the probe is being prepared, checked, or returned to use.",
        },
      ]}
      ctaTitle="Keep probe accuracy tied to real monitoring control"
      ctaBody="PinkPepper helps businesses connect calibration reminders with equipment logs, temperature records, and corrective action workflows so the visible check supports reliable food safety evidence."
      templateSlug="probe-calibration-poster"
      relatedLinks={[
        { href: "/resources/equipment-calibration-log-template", label: "Equipment calibration log template" },
        { href: "/resources/food-temperature-poster", label: "Food temperature poster" },
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
      ]}
    />
  );
}
