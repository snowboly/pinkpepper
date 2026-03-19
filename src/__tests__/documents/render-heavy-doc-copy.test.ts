import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), "utf8");

const files = [
  "src/lib/documents/cleaning-schedule-schema.ts",
  "src/lib/documents/cleaning-sop-schema.ts",
  "src/lib/documents/render-cleaning-schedule-docx.ts",
  "src/lib/documents/render-cleaning-schedule-pdf.ts",
  "src/lib/documents/render-product-data-sheet-docx.ts",
  "src/lib/documents/render-training-record-docx.ts",
  "src/lib/documents/render-training-record-pdf.ts",
  "src/lib/documents/render-cleaning-sop-docx.ts",
  "src/lib/documents/render-cleaning-sop-pdf.ts",
];

describe("heavy document source copy", () => {
  it("does not ship mojibake in heavy document schemas and renderers", () => {
    for (const file of files) {
      const source = readSource(file);
      expect(source).not.toContain("â€”");
      expect(source).not.toContain("â€¢");
      expect(source).not.toContain("â‰¥");
      expect(source).not.toContain("â˜");
      expect(source).not.toContain("â€“");
      expect(source).not.toContain("Â");
    }
  });
});
