import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  routeState,
  resolveUserAccessMock,
  buildGenerateSystemPromptMock,
  buildGenerateUserPromptMock,
  buildHaccpDocumentDataFromAnswersMock,
  buildHaccpModelPromptMock,
  buildCleaningScheduleDataFromBuilderMock,
  buildCleaningScheduleModelPromptMock,
  buildCleaningSopDataFromBuilderMock,
  buildCleaningSopModelPromptMock,
  buildProductDataSheetDataFromBuilderMock,
  buildProductDataSheetModelPromptMock,
  buildTemperatureLogDataFromBuilderMock,
  buildTemperatureLogModelPromptMock,
  buildTrainingRecordDataFromBuilderMock,
  buildTrainingRecordModelPromptMock,
  renderDocumentForChatMock,
} = vi.hoisted(() => ({
  routeState: {
    tier: "plus" as "plus" | "pro",
    insertedUsageEvents: [] as Array<Record<string, unknown>>,
    insertedMessages: [] as Array<Record<string, unknown>>,
  },
  resolveUserAccessMock: vi.fn(),
  buildGenerateSystemPromptMock: vi.fn(),
  buildGenerateUserPromptMock: vi.fn(),
  buildHaccpDocumentDataFromAnswersMock: vi.fn(),
  buildHaccpModelPromptMock: vi.fn(),
  buildCleaningScheduleDataFromBuilderMock: vi.fn(),
  buildCleaningScheduleModelPromptMock: vi.fn(),
  buildCleaningSopDataFromBuilderMock: vi.fn(),
  buildCleaningSopModelPromptMock: vi.fn(),
  buildProductDataSheetDataFromBuilderMock: vi.fn(),
  buildProductDataSheetModelPromptMock: vi.fn(),
  buildTemperatureLogDataFromBuilderMock: vi.fn(),
  buildTemperatureLogModelPromptMock: vi.fn(),
  buildTrainingRecordDataFromBuilderMock: vi.fn(),
  buildTrainingRecordModelPromptMock: vi.fn(),
  renderDocumentForChatMock: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "user_123", email: "owner@example.com" } }, error: null }),
    },
    from: (table: string) => {
      if (table === "profiles" || table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: {}, error: null }),
            }),
          }),
        };
      }

      if (table === "conversations") {
        return {
          select: () => ({
            eq: () => ({
              eq: async () => ({ data: { id: "conv_123" }, error: null }),
              maybeSingle: async () => ({ data: { id: "conv_123" }, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({ data: { id: "conv_123" }, error: null }),
            }),
          }),
        };
      }

      if (table === "usage_events") {
        return {
          insert: async (payload: Record<string, unknown>) => {
            routeState.insertedUsageEvents.push(payload);
            return { error: null };
          },
        };
      }

      if (table === "chat_messages") {
        return {
          insert: async (payload: Array<Record<string, unknown>>) => {
            routeState.insertedMessages.push(...payload);
            return { error: null };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  }),
}));

vi.mock("@/lib/access", () => ({
  resolveUserAccess: resolveUserAccessMock,
}));

vi.mock("@/lib/policy", () => ({
  countUsageSince: async () => 0,
  utcDayStartIso: () => "2026-03-16T00:00:00.000Z",
}));

vi.mock("@/lib/tier", () => ({
  TIER_CAPABILITIES: {
    plus: { dailyDocumentGenerations: 0, advancedHaccpGeneration: false },
    pro: { dailyDocumentGenerations: 20, advancedHaccpGeneration: true },
  },
}));

vi.mock("@/lib/documents/generate-prompt", () => ({
  buildGenerateSystemPrompt: buildGenerateSystemPromptMock,
  buildGenerateUserPrompt: buildGenerateUserPromptMock,
}));

vi.mock("@/lib/documents/haccp-generation", () => ({
  buildHaccpDocumentDataFromAnswers: buildHaccpDocumentDataFromAnswersMock,
  buildHaccpModelPrompt: buildHaccpModelPromptMock,
}));

vi.mock("@/lib/documents/cleaning-sop-generation", () => ({
  buildCleaningSopDataFromAnswers: vi.fn(),
  buildCleaningSopDataFromBuilder: buildCleaningSopDataFromBuilderMock,
  buildCleaningSopModelPrompt: buildCleaningSopModelPromptMock,
}));

vi.mock("@/lib/documents/cleaning-schedule-generation", () => ({
  buildCleaningScheduleDataFromAnswers: vi.fn(),
  buildCleaningScheduleDataFromBuilder: buildCleaningScheduleDataFromBuilderMock,
  buildCleaningScheduleModelPrompt: buildCleaningScheduleModelPromptMock,
}));

vi.mock("@/lib/documents/product-data-sheet-generation", () => ({
  buildProductDataSheetDataFromAnswers: vi.fn(),
  buildProductDataSheetDataFromBuilder: buildProductDataSheetDataFromBuilderMock,
  buildProductDataSheetModelPrompt: buildProductDataSheetModelPromptMock,
}));

vi.mock("@/lib/documents/training-record-generation", () => ({
  buildTrainingRecordDataFromAnswers: vi.fn(),
  buildTrainingRecordDataFromBuilder: buildTrainingRecordDataFromBuilderMock,
  buildTrainingRecordModelPrompt: buildTrainingRecordModelPromptMock,
}));

vi.mock("@/lib/documents/temperature-log-generation", () => ({
  buildTemperatureLogDataFromAnswers: vi.fn(),
  buildTemperatureLogDataFromBuilder: buildTemperatureLogDataFromBuilderMock,
  buildTemperatureLogModelPrompt: buildTemperatureLogModelPromptMock,
}));

vi.mock("@/lib/documents/render-chat", () => ({
  renderDocumentForChat: renderDocumentForChatMock,
}));

vi.mock("@/lib/documents/render-docx", () => ({
  renderDocx: async () => new ArrayBuffer(8),
}));

vi.mock("@/lib/documents/render-pdf", () => ({
  renderPdf: async () => new Uint8Array([1, 2, 3]),
}));

const fetchMock = vi.fn();
global.fetch = fetchMock as typeof fetch;

import { POST } from "@/app/api/documents/generate/route";

describe("HACCP document generation route", () => {
  beforeEach(() => {
    routeState.tier = "plus";
    routeState.insertedUsageEvents = [];
    routeState.insertedMessages = [];
    resolveUserAccessMock.mockReset();
    buildGenerateSystemPromptMock.mockReset();
    buildGenerateUserPromptMock.mockReset();
    buildHaccpDocumentDataFromAnswersMock.mockReset();
    buildHaccpModelPromptMock.mockReset();
    buildCleaningScheduleDataFromBuilderMock.mockReset();
    buildCleaningScheduleModelPromptMock.mockReset();
    buildCleaningSopDataFromBuilderMock.mockReset();
    buildCleaningSopModelPromptMock.mockReset();
    buildProductDataSheetDataFromBuilderMock.mockReset();
    buildProductDataSheetModelPromptMock.mockReset();
    buildTemperatureLogDataFromBuilderMock.mockReset();
    buildTemperatureLogModelPromptMock.mockReset();
    buildTrainingRecordDataFromBuilderMock.mockReset();
    buildTrainingRecordModelPromptMock.mockReset();
    renderDocumentForChatMock.mockReset();
    fetchMock.mockReset();
    process.env.GROQ_API_KEY = "test-key";
    resolveUserAccessMock.mockImplementation(() => ({ tier: routeState.tier, isAdmin: false }));
    renderDocumentForChatMock.mockReturnValue("Rendered doc");
    buildHaccpDocumentDataFromAnswersMock.mockReturnValue({
      metadata: {
        companyName: "PinkPepper Foods",
        version: "1.0",
        date: "2026-03-16",
        createdBy: "Joao",
        approvedBy: "QA",
      },
      processFlow: [],
      steps: [],
      hazards: [],
      ccps: [],
    });
    buildHaccpModelPromptMock.mockReturnValue("structured haccp prompt");
    buildCleaningScheduleModelPromptMock.mockReturnValue("structured cleaning schedule prompt");
    buildCleaningSopModelPromptMock.mockReturnValue("structured cleaning sop prompt");
    buildProductDataSheetModelPromptMock.mockReturnValue("structured product data sheet prompt");
    buildTemperatureLogModelPromptMock.mockReturnValue("structured temperature log prompt");
    buildTrainingRecordModelPromptMock.mockReturnValue("structured training record prompt");
    buildCleaningScheduleDataFromBuilderMock.mockReturnValue({
      metadata: {
        premises: "PinkPepper Production Kitchen",
        docNo: "CL-001",
        revision: "1",
        date: "17 March 2026",
        approvedBy: "Operations Manager",
        reviewDate: "2026-12-31",
      },
      chemicalReference: [],
      dailyTasks: [],
      weeklyTasks: [],
      monthlyTasks: [],
      atpTargets: [],
    });
    buildCleaningSopDataFromBuilderMock.mockReturnValue({
      metadata: {
        businessName: "PinkPepper Foods",
        premises: "Main kitchen",
        docNo: "CL-SOP-001",
        revision: "1",
        date: "17 March 2026",
        approvedBy: "Operations Manager",
        reviewDate: "2026-12-31",
      },
      scope: "Cleaning and disinfection of food-contact surfaces and equipment",
      responsibilities: [],
      definitions: [],
      chemicals: [],
      standardProcedure: [],
      nonFoodContactProcedure: [],
      frequencySchedule: [],
      verificationVisual: [],
      verificationAtp: [],
      corrective: [],
      records: [],
    });
    buildProductDataSheetDataFromBuilderMock.mockReturnValue({
      metadata: {
        businessName: "PinkPepper Foods",
        docNo: "PDS-001",
        version: "1",
        date: "17 March 2026",
        approvedBy: "QA Manager",
      },
      productName: "Chicken Caesar Wrap",
      productCode: "WRAP-001",
      category: "Ready-to-eat wrap",
      description: "Chilled tortilla wrap with chicken and Caesar dressing",
      countryOfOrigin: "Portugal",
      ingredients: "Tortilla, chicken, dressing, lettuce",
      allergenContains: "Milk, Egg, Wheat",
      allergenMayContain: "Mustard",
      allergenFreeFrom: "Peanuts",
      storageConditions: "Keep refrigerated at 0C to 4C",
      shelfLifeUnopened: "3 days",
      shelfLifeOpened: "Consume immediately",
      netWeight: "220g",
      packagingType: "Printed film wrap",
      nutritionRows: [],
      microbiologyRows: [],
    });
    buildTrainingRecordDataFromBuilderMock.mockReturnValue({
      metadata: {
        businessName: "PinkPepper Foods",
        docNo: "TR-REC-001",
        version: "1",
        date: "17 March 2026",
        approvedBy: "Operations Manager",
      },
      employeeName: "Ana Costa",
      jobRole: "Chef de Partie",
      department: "Kitchen",
      startDate: "2026-03-01",
      inductionCompleted: true,
      inductionDate: "2026-03-02",
      trainerName: "Joao Silva",
      inductionTopics: ["personal hygiene"],
      inductionAssessment: "Competent",
      qualifications: [],
      trainingLogRows: [],
    });
    buildTemperatureLogDataFromBuilderMock.mockReturnValue({
      metadata: {
        premises: "PinkPepper Cafe",
        docNo: "TL-001",
        revision: "1",
        issueDate: "2026-03-17",
        month: "March",
        year: "2026",
        unitId: "Walk-in chiller 1",
        probeLocation: "Top and bottom shelf",
        targetRange: "0C to 4C",
        createdBy: "Joao",
        approvedBy: "Maria",
        checksPerDay: 2,
        probeCount: 2,
      },
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                documentType: "haccp_plan",
                title: "Lean HACCP Plan",
                documentNumber: "HACCP-001",
                version: "1.0",
                date: "2026-03-16",
                approvedBy: "QA",
                scope: "Kitchen process",
                sections: [],
                tables: [],
              }),
            },
          },
        ],
      }),
      text: async () => "",
    });
  });

  it("rejects HACCP generation for Plus users", async () => {
    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "haccp_plan",
          format: "json",
          answers: [],
        }),
      }),
    );

    expect(response.status).toBe(402);
  });

  it("rejects standard document generation for Plus users too", async () => {
    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "cleaning_sop",
          format: "json",
          answers: [],
        }),
      }),
    );

    expect(response.status).toBe(402);
  });

  it("uses the structured HACCP path for Pro users", async () => {
    routeState.tier = "pro";

    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "haccp_plan",
          format: "json",
          answers: ["PinkPepper Foods", "1.0"],
        }),
      }),
    );

    const payload = await response.json() as { document?: { haccpData?: unknown } };

    expect(response.status).toBe(200);
    expect(buildHaccpModelPromptMock).toHaveBeenCalled();
    expect(buildGenerateSystemPromptMock).not.toHaveBeenCalled();
    expect(buildGenerateUserPromptMock).not.toHaveBeenCalled();
    expect(payload.document?.haccpData).toBeTruthy();
  });

  it("uses structured builder data for temperature log generation when provided", async () => {
    routeState.tier = "pro";

    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "temperature_log",
          format: "json",
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
        }),
      }),
    );

    const payload = await response.json() as { document?: { temperatureLogData?: unknown } };

    expect(response.status).toBe(200);
    expect(buildTemperatureLogDataFromBuilderMock).toHaveBeenCalledWith({
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
    });
    expect(buildTemperatureLogModelPromptMock).toHaveBeenCalled();
    expect(buildGenerateUserPromptMock).not.toHaveBeenCalled();
    expect(payload.document?.temperatureLogData).toBeTruthy();
  });

  it("uses structured builder data for cleaning schedule generation when provided", async () => {
    routeState.tier = "pro";

    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "cleaning_schedule",
          format: "json",
          builderKey: "cleaningSchedule",
          builderData: {
            businessName: "PinkPepper Production Kitchen",
            approvedBy: "Operations Manager",
            reviewDate: "2026-12-31",
            chemicalReference: [],
            dailyTasks: [],
            weeklyTasks: [],
            monthlyTasks: [],
            atpTargets: [],
          },
        }),
      }),
    );

    const payload = await response.json() as { document?: { cleaningScheduleData?: unknown } };

    expect(response.status).toBe(200);
    expect(buildCleaningScheduleDataFromBuilderMock).toHaveBeenCalledWith({
      businessName: "PinkPepper Production Kitchen",
      approvedBy: "Operations Manager",
      reviewDate: "2026-12-31",
      chemicalReference: [],
      dailyTasks: [],
      weeklyTasks: [],
      monthlyTasks: [],
      atpTargets: [],
    });
    expect(buildCleaningScheduleModelPromptMock).toHaveBeenCalled();
    expect(buildGenerateUserPromptMock).not.toHaveBeenCalled();
    expect(payload.document?.cleaningScheduleData).toBeTruthy();
  });

  it("uses structured builder data for cleaning SOP generation when provided", async () => {
    routeState.tier = "pro";

    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "cleaning_sop",
          format: "json",
          builderKey: "cleaningSop",
          builderData: {
            businessName: "PinkPepper Foods",
            approvedBy: "Operations Manager",
            reviewDate: "2026-12-31",
            premises: "Main kitchen",
            scope: "Cleaning and disinfection of food-contact surfaces and equipment",
            responsibleRole: "Kitchen staff on shift",
            verificationRole: "Shift supervisor",
            chemicals: [],
            frequencySchedule: [],
            corrective: [],
            records: [],
          },
        }),
      }),
    );

    const payload = await response.json() as { document?: { cleaningSopData?: unknown } };

    expect(response.status).toBe(200);
    expect(buildCleaningSopDataFromBuilderMock).toHaveBeenCalledWith({
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
      reviewDate: "2026-12-31",
      premises: "Main kitchen",
      scope: "Cleaning and disinfection of food-contact surfaces and equipment",
      responsibleRole: "Kitchen staff on shift",
      verificationRole: "Shift supervisor",
      chemicals: [],
      frequencySchedule: [],
      corrective: [],
      records: [],
    });
    expect(payload.document?.cleaningSopData).toBeTruthy();
  });

  it("uses structured builder data for product data sheet generation when provided", async () => {
    routeState.tier = "pro";

    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "product_data_sheet",
          format: "json",
          builderKey: "productDataSheet",
          builderData: {
            businessName: "PinkPepper Foods",
            approvedBy: "QA Manager",
            productName: "Chicken Caesar Wrap",
            productCode: "WRAP-001",
            category: "Ready-to-eat wrap",
            description: "Chilled tortilla wrap with chicken and Caesar dressing",
            countryOfOrigin: "Portugal",
            ingredients: "Tortilla, chicken, dressing, lettuce",
            contains: "Milk, Egg, Wheat",
            mayContain: "Mustard",
            freeFrom: "Peanuts",
            storageConditions: "Keep refrigerated at 0C to 4C",
            shelfLifeUnopened: "3 days",
            shelfLifeOpened: "Consume immediately",
            netWeight: "220g",
            packagingType: "Printed film wrap",
            nutritionRows: [],
            microbiologyRows: [],
          },
        }),
      }),
    );

    const payload = await response.json() as { document?: { productDataSheetData?: unknown } };

    expect(response.status).toBe(200);
    expect(buildProductDataSheetDataFromBuilderMock).toHaveBeenCalledWith({
      businessName: "PinkPepper Foods",
      approvedBy: "QA Manager",
      productName: "Chicken Caesar Wrap",
      productCode: "WRAP-001",
      category: "Ready-to-eat wrap",
      description: "Chilled tortilla wrap with chicken and Caesar dressing",
      countryOfOrigin: "Portugal",
      ingredients: "Tortilla, chicken, dressing, lettuce",
      contains: "Milk, Egg, Wheat",
      mayContain: "Mustard",
      freeFrom: "Peanuts",
      storageConditions: "Keep refrigerated at 0C to 4C",
      shelfLifeUnopened: "3 days",
      shelfLifeOpened: "Consume immediately",
      netWeight: "220g",
      packagingType: "Printed film wrap",
      nutritionRows: [],
      microbiologyRows: [],
    });
    expect(buildProductDataSheetModelPromptMock).toHaveBeenCalled();
    expect(buildGenerateUserPromptMock).not.toHaveBeenCalled();
    expect(payload.document?.productDataSheetData).toBeTruthy();
  });

  it("uses structured builder data for training record generation when provided", async () => {
    routeState.tier = "pro";

    const response = await POST(
      new Request("http://localhost/api/documents/generate", {
        method: "POST",
        body: JSON.stringify({
          documentType: "staff_training_record",
          format: "json",
          builderKey: "staffTrainingRecord",
          builderData: {
            businessName: "PinkPepper Foods",
            approvedBy: "Operations Manager",
            employeeName: "Ana Costa",
            jobRole: "Chef de Partie",
            department: "Kitchen",
            startDate: "2026-03-01",
            inductionCompleted: "Yes",
            inductionDate: "2026-03-02",
            trainerName: "Joao Silva",
            inductionTopics: ["personal hygiene"],
            inductionAssessment: "Competent",
            qualifications: [],
            trainingLogRows: [],
          },
        }),
      }),
    );

    const payload = await response.json() as { document?: { trainingRecordData?: unknown } };

    expect(response.status).toBe(200);
    expect(buildTrainingRecordDataFromBuilderMock).toHaveBeenCalledWith({
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
      employeeName: "Ana Costa",
      jobRole: "Chef de Partie",
      department: "Kitchen",
      startDate: "2026-03-01",
      inductionCompleted: "Yes",
      inductionDate: "2026-03-02",
      trainerName: "Joao Silva",
      inductionTopics: ["personal hygiene"],
      inductionAssessment: "Competent",
      qualifications: [],
      trainingLogRows: [],
    });
    expect(buildTrainingRecordModelPromptMock).toHaveBeenCalled();
    expect(buildGenerateUserPromptMock).not.toHaveBeenCalled();
    expect(payload.document?.trainingRecordData).toBeTruthy();
  });
});
