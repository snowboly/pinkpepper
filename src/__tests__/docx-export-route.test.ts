import { describe, expect, it } from "vitest";
import { getStructuredGeneratedDocument } from "@/app/api/export/docx/route";

describe("getStructuredGeneratedDocument", () => {
  it("returns the assistant generated document even when the transcript has user messages", () => {
    const generatedDocument = {
      documentType: "sop",
      sections: [{ heading: "Purpose", body: "Keep food safe." }],
    };

    const result = getStructuredGeneratedDocument([
      { role: "user", content: "Create a cleaning SOP", createdAt: "2026-03-25T10:00:00Z", metadata: null },
      {
        role: "assistant",
        content: "Here is your SOP",
        createdAt: "2026-03-25T10:00:10Z",
        metadata: { generatedDocument },
      },
    ]);

    expect(result).toEqual(generatedDocument);
  });

  it("prefers the latest assistant message with a generated document", () => {
    const older = { documentType: "policy", sections: [{ heading: "Old", body: "Old body" }] };
    const newer = { documentType: "sop", sections: [{ heading: "New", body: "New body" }] };

    const result = getStructuredGeneratedDocument([
      { role: "assistant", content: "Older", createdAt: "2026-03-25T10:00:00Z", metadata: { generatedDocument: older } },
      { role: "user", content: "Add more detail", createdAt: "2026-03-25T10:01:00Z", metadata: null },
      { role: "assistant", content: "Updated", createdAt: "2026-03-25T10:02:00Z", metadata: { generatedDocument: newer } },
    ]);

    expect(result).toEqual(newer);
  });

  it("returns undefined when no assistant metadata includes a generated document", () => {
    const result = getStructuredGeneratedDocument([
      { role: "user", content: "Hello", createdAt: "2026-03-25T10:00:00Z", metadata: null },
      { role: "assistant", content: "Plain answer", createdAt: "2026-03-25T10:00:10Z", metadata: { citations: [] } },
    ]);

    expect(result).toBeUndefined();
  });
});
