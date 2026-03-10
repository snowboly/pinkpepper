import { describe, expect, it } from "vitest";
import { extractDocumentText } from "@/lib/documents/extract";

describe("extractDocumentText", () => {
  it("extracts plain text for text/plain", async () => {
    const file = new File(["Hello\n\n\nWorld"], "a.txt", { type: "text/plain" });
    const result = await extractDocumentText(file);

    expect(result.strategy).toBe("plain-text");
    expect(result.text).toBe("Hello\n\nWorld");
    expect(result.warning).toBeUndefined();
  });

  it("returns unsupported strategy for pdf to avoid browser-only runtime dependencies", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "a.pdf", { type: "application/pdf" });
    const result = await extractDocumentText(file);

    expect(result.strategy).toBe("unsupported");
    expect(result.text).toBe("");
    expect(result.warning).toContain("temporarily disabled");
  });
});
