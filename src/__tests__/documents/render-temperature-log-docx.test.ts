import { describe, it, expect } from "vitest";
import { renderTemperatureLogDocx } from "@/lib/documents/render-temperature-log-docx";
import { buildTemperatureLogDataFromAnswers } from "@/lib/documents/temperature-log-generation";

describe("renderTemperatureLogDocx", () => {
  it("produces a valid DOCX (PK header) with default 2 checks / 2 probes", async () => {
    const data = buildTemperatureLogDataFromAnswers(["Test Kitchen"]);
    const buf = await renderTemperatureLogDocx(data);
    const bytes = new Uint8Array(buf);
    // DOCX is a ZIP — starts with PK (0x50 0x4B)
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });

  it("produces a valid DOCX with 1 check / 1 probe", async () => {
    const data = buildTemperatureLogDataFromAnswers(["Small Cafe"]);
    data.metadata.checksPerDay = 1;
    data.metadata.probeCount = 1;
    const buf = await renderTemperatureLogDocx(data);
    const bytes = new Uint8Array(buf);
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });

  it("produces a valid DOCX with 4 checks / 4 probes", async () => {
    const data = buildTemperatureLogDataFromAnswers(["Large Cold Store"]);
    data.metadata.checksPerDay = 4;
    data.metadata.probeCount = 4;
    const buf = await renderTemperatureLogDocx(data);
    const bytes = new Uint8Array(buf);
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });
});
