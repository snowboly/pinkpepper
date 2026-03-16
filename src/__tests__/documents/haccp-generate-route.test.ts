import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  routeState,
  resolveUserAccessMock,
  buildGenerateSystemPromptMock,
  buildGenerateUserPromptMock,
  buildHaccpDocumentDataFromAnswersMock,
  buildHaccpModelPromptMock,
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
});
