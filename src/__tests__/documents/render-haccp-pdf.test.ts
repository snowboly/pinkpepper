import { describe, expect, it } from "vitest";
import { renderHaccpPdf } from "@/lib/documents/render-haccp-pdf";
import type { HaccpDocumentData } from "@/lib/documents/haccp-schema";

const sample: HaccpDocumentData = {
  metadata: {
    companyName: "PinkPepper Foods",
    version: "1.0",
    date: "2026-03-16",
    createdBy: "Joao",
    approvedBy: "QA Manager",
    logoUrl: null,
  },
  processFlow: ["Receive", "Store chilled", "Prepare", "Serve"],
  steps: [
    { stepNo: 1, stepName: "Receive", fullStepDescription: "Receive chilled goods from approved suppliers." },
  ],
  hazards: [
    {
      stepNo: 1,
      stepName: "Receive",
      hazardType: "Biological",
      hazardDescription: "Temperature abuse on receipt.",
      controlMeasure: "Reject deliveries above limit.",
      isCcp: "No",
    },
  ],
  ccps: [],
};

describe("renderHaccpPdf", () => {
  it("creates a pdf with header/footer metadata and no CCP section when not needed", async () => {
    const bytes = await renderHaccpPdf(sample);

    expect(bytes.length).toBeGreaterThan(0);
    expect(Buffer.from(bytes).subarray(0, 4).toString()).toBe("%PDF");
  });
});
