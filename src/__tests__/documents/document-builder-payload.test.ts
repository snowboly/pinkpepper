import { describe, expect, it } from "vitest";

import {
  buildDocumentGenerationPayload,
  normaliseBuilderAnswers,
} from "@/components/dashboard/document-builders/document-builder-payload";

describe("document builder payload serialization", () => {
  it("normalises field values by trimming text inputs", () => {
    expect(
      normaliseBuilderAnswers({
        businessName: "  PinkPepper Cafe  ",
        targetRange: " 0C to 4C ",
      }),
    ).toEqual({
      businessName: "PinkPepper Cafe",
      targetRange: "0C to 4C",
    });
  });

  it("trims row-based values without collapsing the table structure", () => {
    expect(
      normaliseBuilderAnswers({
        dailyTasks: [
          {
            item: "  Worktop  ",
            chemical: " Sanitiser ",
          },
        ],
      }),
    ).toEqual({
      dailyTasks: [
        {
          item: "Worktop",
          chemical: "Sanitiser",
        },
      ],
    });
  });

  it("builds a structured payload for a supported builder", () => {
    expect(
      buildDocumentGenerationPayload("tempLog", {
        businessName: "PinkPepper Cafe",
        createdBy: "Joao",
        approvedBy: "Maria",
        logType: "Fridge",
        targetRange: "0C to 4C",
        unitId: "Walk-in chiller 1",
        checksPerDay: "2",
        probeCount: "2",
        probeLocation: "Top and bottom shelf",
        month: "March",
        year: "2026",
      }),
    ).toEqual({
      documentType: "temperature_log",
      builderKey: "tempLog",
      builderData: {
        businessName: "PinkPepper Cafe",
        createdBy: "Joao",
        approvedBy: "Maria",
        logType: "Fridge",
        targetRange: "0C to 4C",
        unitId: "Walk-in chiller 1",
        checksPerDay: "2",
        probeCount: "2",
        probeLocation: "Top and bottom shelf",
        month: "March",
        year: "2026",
      },
    });
  });
});
