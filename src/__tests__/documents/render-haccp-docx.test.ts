import { describe, expect, it } from "vitest";
import { renderHaccpDocx } from "@/lib/documents/render-haccp-docx";
import type { HaccpDocumentData } from "@/lib/documents/haccp-schema";

const sample: HaccpDocumentData = {
  metadata: {
    companyName: "PinkPepper Foods",
    version: "1.0",
    date: "2026-03-16",
    createdBy: "Joao",
    approvedBy: "QA Manager",
    logoUrl: "/logo/LogoV3.png",
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

describe("renderHaccpDocx", () => {
  it("creates a docx file for the approved HACCP structure", async () => {
    const buffer = Buffer.from(await renderHaccpDocx(sample));

    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
