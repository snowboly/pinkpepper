import { describe, expect, it } from "vitest";
import {
  normalizeHazardType,
  shouldRenderCcpSection,
  type HaccpDocumentData,
} from "@/lib/documents/haccp-schema";

describe("normalizeHazardType", () => {
  it("accepts only the four approved hazard types", () => {
    expect(normalizeHazardType("biological")).toBe("Biological");
    expect(normalizeHazardType("Chemical")).toBe("Chemical");
    expect(normalizeHazardType("physical")).toBe("Physical");
    expect(normalizeHazardType("allergen")).toBe("Allergen");
  });

  it("rejects unsupported hazard types", () => {
    expect(() => normalizeHazardType("micro")).toThrow("Unsupported hazard type");
  });
});

describe("shouldRenderCcpSection", () => {
  it("returns true when at least one hazard row is marked as CCP", () => {
    const data = {
      hazards: [
        {
          stepNo: 1,
          stepName: "Receive",
          hazardType: "Biological",
          hazardDescription: "Temperature abuse",
          controlMeasure: "Reject warm deliveries",
          isCcp: "Yes",
        },
      ],
    } as HaccpDocumentData;

    expect(shouldRenderCcpSection(data)).toBe(true);
  });

  it("returns false when no hazard row is marked as CCP", () => {
    const data = {
      hazards: [
        {
          stepNo: 1,
          stepName: "Receive",
          hazardType: "Biological",
          hazardDescription: "Temperature abuse",
          controlMeasure: "Reject warm deliveries",
          isCcp: "No",
        },
      ],
    } as HaccpDocumentData;

    expect(shouldRenderCcpSection(data)).toBe(false);
  });
});
