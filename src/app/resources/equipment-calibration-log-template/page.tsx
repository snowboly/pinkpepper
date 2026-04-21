import type { Metadata } from "next";
import { ResourceTemplate } from "@/components/site/ResourceTemplate";

export const metadata: Metadata = {
  title: "Equipment Calibration Log Template | PinkPepper",
  description:
    "Learn what an equipment calibration log should record for probes, scales, and measuring instruments used in food safety monitoring to satisfy EU and UK inspection requirements.",
  alternates: {
    canonical: "https://www.pinkpepper.io/resources/equipment-calibration-log-template",
    languages: { "x-default": "https://www.pinkpepper.io/resources/equipment-calibration-log-template", en: "https://www.pinkpepper.io/resources/equipment-calibration-log-template" },
  },
};

export default function EquipmentCalibrationLogTemplatePage() {
  return (
    <ResourceTemplate
      category="Monitoring resource"
      title="What an equipment calibration log template should record"
      intro="A calibration log demonstrates that the measuring equipment used in your monitoring — probes, scales, thermometers — was accurate when the readings were taken. Without it, an inspection finding that a probe was uncalibrated can undermine all the monitoring records it produced."
      summaryPoints={[
        "The calibration record confirms that monitoring readings are trustworthy — it's the evidence behind the evidence.",
        "Equipment ID, calibration method, reference standard, and result are the four minimum fields.",
        "Out-of-tolerance results need a documented response, not just a note in the margin.",
      ]}
      documentHighlights={[
        {
          label: "Equipment identification",
          description:
            "A unique identifier for each piece of equipment (probe number, asset tag, or serial number), the equipment type, and its location or assigned use. Calibration records must be traceable to a specific instrument, not just 'the fridge probe'.",
        },
        {
          label: "Calibration date and frequency",
          description:
            "When calibration was carried out and when the next calibration is due. The frequency should reflect the criticality of the equipment — probes used at CCPs typically require more frequent calibration than non-critical measuring instruments.",
        },
        {
          label: "Reference standard and method",
          description:
            "What the equipment was calibrated against and the method used. For temperature probes this might be a traceable reference thermometer or an ice bath check. The reference standard gives the calibration record its validity.",
        },
        {
          label: "Result and corrective action",
          description:
            "Whether the equipment passed, the actual deviation if found, and what was done if it was outside tolerance — adjusted, repaired, or taken out of service. An out-of-tolerance result that has no corrective action record is an open audit finding.",
        },
      ]}
      sections={[
        {
          title: "Calibration validates everything measured with that equipment",
          body:
            "A temperature monitoring log shows what readings were taken. A calibration log shows whether those readings were accurate. If a probe is found to be reading 2°C low, every reading it produced needs to be reassessed. The calibration record is what defines the scope of the problem. Without it, the scope is unknown.",
        },
        {
          title: "Frequency should match the risk",
          body:
            "Not all equipment needs the same calibration schedule. A probe used to verify cooking temperatures at a CCP carries more risk if inaccurate than a thermometer used for routine ambient checks. The calibration log should reflect a schedule that matches the criticality of each instrument's role in your monitoring system.",
        },
        {
          title: "Out-of-tolerance results need a formal response",
          body:
            "Finding that a probe is out of tolerance is not just a maintenance note — it's a food safety event. The log entry for an out-of-tolerance result should include what happened to the equipment, what happened to the products monitored with it since the last valid calibration, and what corrective action was taken. A replacement sticker on the probe without a paper trail does not close the event.",
        },
      ]}
      ctaTitle="Generate a calibration log for your monitoring equipment"
      ctaBody="PinkPepper can help you produce an equipment calibration log matched to the instruments in your HACCP plan, with fields appropriate to your monitoring frequencies and CCP requirements."
      templateSlug="equipment-calibration-log-template"
      relatedLinks={[
        { href: "/resources/temperature-monitoring-log-template", label: "Temperature monitoring log template" },
        { href: "/resources/corrective-action-log-template", label: "Corrective action log template" },
        { href: "/resources/food-safety-audit-checklist", label: "Food safety audit checklist" },
      ]}
    />
  );
}
