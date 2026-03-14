import { afterEach, describe, expect, it, vi } from "vitest";
import { extractDocumentText } from "@/lib/documents/extract";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("extractDocumentText", () => {
  it("extracts plain text for text/plain", async () => {
    const file = new File(["Hello\n\n\nWorld"], "a.txt", { type: "text/plain" });
    const result = await extractDocumentText(file);

    expect(result.strategy).toBe("plain-text");
    expect(result.text).toBe("Hello\n\nWorld");
    expect(result.warning).toBeUndefined();
  });

  it("returns unsupported strategy with a warning when pdf parsing fails", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const file = new File([new Uint8Array([1, 2, 3])], "a.pdf", { type: "application/pdf" });
    const result = await extractDocumentText(file);

    expect(result.strategy).toBe("unsupported");
    expect(result.text).toBe("");
    expect(result.warning).toBeTruthy();
    expect(errorSpy).toHaveBeenCalled();
  });
});
