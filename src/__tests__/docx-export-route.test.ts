import { describe, expect, it } from "vitest";
import { getStructuredGeneratedDocument } from "@/app/api/export/docx/route";

describe("getStructuredGeneratedDocument", () => {
  it("returns the assistant generated document even when the transcript has user messages", () => {
    const generatedDocument = {
      documentType: "sop",
      sections: [{ heading: "Purpose", body: "Keep food safe." }],
    };

    const result = getStructuredGeneratedDocument([
      { role: "user", metadata: null },
      {
        role: "assistant",
        metadata: { generatedDocument },
      },
    ]);

    expect(result).toEqual(generatedDocument);
  });

  it("prefers the latest assistant message with a generated document", () => {
    const older = { documentType: "policy", sections: [{ heading: "Old", body: "Old body" }] };
    const newer = { documentType: "sop", sections: [{ heading: "New", body: "New body" }] };

    const result = getStructuredGeneratedDocument([
      { role: "assistant", metadata: { generatedDocument: older } },
      { role: "user", metadata: null },
      { role: "assistant", metadata: { generatedDocument: newer } },
    ]);

    expect(result).toEqual(newer);
  });

  it("returns undefined when no assistant metadata includes a generated document", () => {
    const result = getStructuredGeneratedDocument([
      { role: "user", metadata: null },
      { role: "assistant", metadata: { citations: [] } },
    ]);

    expect(result).toBeUndefined();
  });
});
