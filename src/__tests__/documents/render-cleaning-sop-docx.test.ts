import { describe, expect, it } from "vitest";
import { renderCleaningSopDocx } from "@/lib/documents/render-cleaning-sop-docx";
import { buildCleaningSopDataFromAnswers } from "@/lib/documents/cleaning-sop-generation";

const sample = buildCleaningSopDataFromAnswers([
  "Commercial kitchen — restaurant",
  "Worktops, chopping boards, knives, ovens, fridges, floors",
  "Diversey J-512 sanitiser at 1:100; Suma Multi D2 degreaser at 1:50",
  "Head chef performs daily; manager verifies weekly",
  "Daily cleaning log, ATP swab records, corrective action log",
]);

describe("renderCleaningSopDocx", () => {
  it("creates a valid DOCX file (PK zip header)", async () => {
    const buffer = Buffer.from(await renderCleaningSopDocx(sample));
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
