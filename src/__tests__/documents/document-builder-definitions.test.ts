import { describe, expect, it } from "vitest";

import {
  DOCUMENT_BUILDERS,
  getDocumentBuilderDefaults,
  getDocumentBuilderDefinition,
} from "@/components/dashboard/document-builders/document-builder-definitions";
import {
  buildSharedDocumentMetadataFields,
  getSharedDocumentMetadataDefaults,
} from "@/components/dashboard/document-builders/shared-document-metadata";
import {
  createRowBuilderConfig,
  createRowBuilderRow,
} from "@/components/dashboard/document-builders/shared-row-builder";

describe("shared document metadata fields", () => {
  it("returns metadata fields in the expected audit-document order", () => {
    const fields = buildSharedDocumentMetadataFields({
      includeVersion: true,
      includeDate: true,
      includeCreatedBy: true,
      includeApprovedBy: true,
      includeReviewDate: true,
    });

    expect(fields.map((field) => field.key)).toEqual([
      "businessName",
      "version",
      "date",
      "createdBy",
      "approvedBy",
      "reviewDate",
    ]);
  });

  it("exposes correct field requirements for optional metadata", () => {
    const fields = buildSharedDocumentMetadataFields({
      includeVersion: true,
      includeDate: true,
      includeCreatedBy: false,
      includeApprovedBy: true,
      includeReviewDate: false,
    });

    expect(fields.find((field) => field.key === "businessName")?.required).toBe(true);
    expect(fields.find((field) => field.key === "approvedBy")?.required).toBe(true);
    expect(fields.some((field) => field.key === "createdBy")).toBe(false);
    expect(fields.some((field) => field.key === "reviewDate")).toBe(false);
  });

  it("provides blank defaults for only the requested metadata fields", () => {
    expect(
      getSharedDocumentMetadataDefaults({
        includeVersion: true,
        includeDate: false,
        includeCreatedBy: true,
        includeApprovedBy: true,
        includeReviewDate: false,
      }),
    ).toEqual({
      businessName: "",
      version: "",
      createdBy: "",
      approvedBy: "",
    });
  });
});

describe("shared row builder helpers", () => {
  it("creates row builder definitions with required cell metadata", () => {
    const config = createRowBuilderConfig({
      key: "chemicals",
      label: "Chemicals",
      columns: [
        { key: "chemicalName", label: "Chemical name", required: true },
        { key: "dilution", label: "Dilution", required: false },
      ],
    });

    expect(config.key).toBe("chemicals");
    expect(config.columns).toEqual([
      { key: "chemicalName", label: "Chemical name", required: true },
      { key: "dilution", label: "Dilution", required: false },
    ]);
  });

  it("builds empty row objects for a row config", () => {
    const config = createRowBuilderConfig({
      key: "wasteStreams",
      label: "Waste streams",
      columns: [
        { key: "wasteType", label: "Waste type", required: true },
        { key: "storageArea", label: "Storage area", required: true },
      ],
    });

    expect(createRowBuilderRow(config)).toEqual({
      wasteType: "",
      storageArea: "",
    });
  });
});

describe("document builder definitions", () => {
  it("exposes stable builder definitions for supported document keys", () => {
    expect(getDocumentBuilderDefinition("haccpPlan")?.documentType).toBe("haccp_plan");
    expect(getDocumentBuilderDefinition("tempLog")?.documentType).toBe("temperature_log");
    expect(getDocumentBuilderDefinition("cleaningSchedule")?.documentType).toBe("cleaning_schedule");
    expect(DOCUMENT_BUILDERS.tempLog.wizardKey).toBe("tempLog");
  });

  it("defaults the fridge temperature log preset to 0C to 4C", () => {
    const tempLog = getDocumentBuilderDefinition("tempLog");
    const targetRange = tempLog?.sections
      .flatMap((section) => section.fields)
      .find((field) => field.key === "targetRange");

    expect(targetRange?.defaultValue).toBe("0C to 4C");
  });

  it("builds default field values for document builder sections", () => {
    expect(getDocumentBuilderDefaults("tempLog")).toMatchObject({
      businessName: "",
      createdBy: "",
      approvedBy: "",
      logType: "Fridge",
      targetRange: "0C to 4C",
      checksPerDay: "2",
      probeCount: "2",
    });
  });

  it("marks cleaning schedule row sections as row builders", () => {
    const cleaningSchedule = getDocumentBuilderDefinition("cleaningSchedule");
    const rowFieldTypes = cleaningSchedule?.sections
      .filter((section) => section.key !== "metadata")
      .flatMap((section) => section.fields.map((field) => field.type));

    expect(rowFieldTypes).toEqual(["rows", "rows", "rows", "rows", "rows"]);
  });
});
