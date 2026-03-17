import { describe, expect, it } from "vitest";
import { renderHygieneDocx } from "@/lib/documents/render-hygiene-docx";
import { buildHygienePolicyDataFromAnswers } from "@/lib/documents/hygiene-generation";

const sample = buildHygienePolicyDataFromAnswers([
  "Green Leaf Cafe",
  "4 food handlers and 2 front-of-house staff",
  "White coats, aprons, hair nets, and disposable gloves",
  "No current illness reporting issues",
]);

describe("renderHygieneDocx", () => {
  it("creates a valid DOCX file (PK zip header)", async () => {
    const buffer = Buffer.from(await renderHygieneDocx(sample));
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
