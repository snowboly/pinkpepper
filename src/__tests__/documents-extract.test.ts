import { describe, expect, it } from "vitest";
import { detectDocumentMimeFromBytes } from "@/lib/documents/extract";

describe("detectDocumentMimeFromBytes", () => {
  it("detects PDF content from magic bytes", () => {
    const bytes = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
    expect(detectDocumentMimeFromBytes(bytes)).toBe("application/pdf");
  });

  it("detects DOCX/ZIP content from magic bytes", () => {
    const bytes = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    expect(detectDocumentMimeFromBytes(bytes)).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  it("detects utf-8 text even when the uploader spoofs a document mime", () => {
    const bytes = new TextEncoder().encode("Subject,Message\nhello,world\n");
    expect(detectDocumentMimeFromBytes(bytes)).toBe("text/plain");
  });

  it("rejects random binary blobs", () => {
    const bytes = Uint8Array.from([0x00, 0xff, 0x12, 0x89, 0xaa, 0xbb, 0xcc, 0xdd]);
    expect(detectDocumentMimeFromBytes(bytes)).toBeNull();
  });
});
