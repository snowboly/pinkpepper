import { describe, expect, it } from "vitest";
import { getStructuredGeneratedDocument } from "@/app/api/export/docx/route";

import { Paragraph, Table, TextRun } from "docx";
import {
  isTableLine,
  isSeparatorLine,
  splitTableCells,
  parseInlineBold,
  parseContentToDocxElements,
} from "@/app/api/export/docx/route";

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

describe("markdown table detection", () => {
  it("recognises a standard markdown table row", () => {
    expect(isTableLine("| CCP | Limit | Stage |")).toBe(true);
    expect(isTableLine("| :--- | :--- | :--- |")).toBe(true);
  });

  it("does not treat non-table lines as table rows", () => {
    expect(isTableLine("Some regular text")).toBe(false);
    expect(isTableLine("- bullet point")).toBe(false);
  });

  it("recognises a separator row", () => {
    expect(isSeparatorLine("|---|---|---|")).toBe(true);
    expect(isSeparatorLine("| :--- | ---: | :---: |")).toBe(true);
  });

  it("does not treat header rows as separators", () => {
    expect(isSeparatorLine("| CCP | Limit |")).toBe(false);
  });

  it("splits table cells correctly", () => {
    expect(splitTableCells("| CCP1 | ≤5°C | Receipt |")).toEqual(["CCP1", "≤5°C", "Receipt"]);
  });
});

describe("inline bold parsing", () => {
  it("returns a single TextRun for plain text", () => {
    const runs = parseInlineBold("plain text", 22, "0F172A");
    expect(runs).toHaveLength(1);
    expect(runs[0]).toBeInstanceOf(TextRun);
  });

  it("returns three TextRuns for text with one **bold** segment", () => {
    const runs = parseInlineBold("This is **bold** text", 22, "0F172A");
    // "This is " + "bold" + " text"
    expect(runs).toHaveLength(3);
    for (const run of runs) {
      expect(run).toBeInstanceOf(TextRun);
    }
  });

  it("handles a string that is entirely bold", () => {
    const runs = parseInlineBold("**all bold**", 22, "0F172A");
    expect(runs).toHaveLength(1);
    expect(runs[0]).toBeInstanceOf(TextRun);
  });

  it("produces 2 runs for a leading-bold string (**bold** text), not 3", () => {
    // Regression: filter-before-map dropped the leading empty segment and
    // reindexed, so "bold" ended up at index 0 (even = not bold).
    const runs = parseInlineBold("**bold** text", 22, "0F172A");
    // Expect ["bold"(bold), " text"(normal)] — the leading empty segment is dropped
    expect(runs).toHaveLength(2);
    for (const run of runs) expect(run).toBeInstanceOf(TextRun);
  });

  it("produces correct run count for multiple bold segments", () => {
    // "**first** and **second**" → ["first", " and ", "second"]
    const runs = parseInlineBold("**first** and **second**", 22, "0F172A");
    expect(runs).toHaveLength(3);
  });
});

describe("content to DOCX elements parser", () => {
  it("converts a valid markdown table block into a Table node", () => {
    const content = [
      "| CCP | Limit | Stage |",
      "|---|---|---|",
      "| CCP1 | ≤5°C | Receipt |",
      "| CCP2 | ≥75°C | Cooking |",
    ].join("\n");

    const elements = parseContentToDocxElements(content);
    // First element should be a Table, second is a spacer Paragraph
    expect(elements[0]).toBeInstanceOf(Table);
    expect(elements[1]).toBeInstanceOf(Paragraph);
    expect(elements).toHaveLength(2);
  });

  it("falls back to plain paragraphs for an invalid table (only 2 lines)", () => {
    const content = ["| CCP | Limit |", "|---|---|"].join("\n");
    const elements = parseContentToDocxElements(content);
    for (const el of elements) {
      expect(el).toBeInstanceOf(Paragraph);
    }
  });

  it("renders plain text lines as Paragraphs", () => {
    const elements = parseContentToDocxElements("Hello food safety.\nSecond line.");
    expect(elements).toHaveLength(2);
    for (const el of elements) {
      expect(el).toBeInstanceOf(Paragraph);
    }
  });

  it("skips blank lines", () => {
    const elements = parseContentToDocxElements("Line one.\n\n\nLine two.");
    expect(elements).toHaveLength(2);
  });

  it("handles mixed content: text then table then text", () => {
    const content = [
      "Intro line.",
      "| A | B |",
      "|---|---|",
      "| 1 | 2 |",
      "Closing line.",
    ].join("\n");
    const elements = parseContentToDocxElements(content);
    expect(elements[0]).toBeInstanceOf(Paragraph);  // "Intro line."
    expect(elements[1]).toBeInstanceOf(Table);       // table
    expect(elements[2]).toBeInstanceOf(Paragraph);  // spacer
    expect(elements[3]).toBeInstanceOf(Paragraph);  // "Closing line."
  });
});
