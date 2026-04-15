import { describe, expect, it } from "vitest";
import { getStructuredGeneratedDocument } from "@/app/api/export/docx/route";

import { ExternalHyperlink, Paragraph, Table, TextRun } from "docx";
import {
  isTableLine,
  isSeparatorLine,
  splitTableCells,
  parseInlineBold,
  parseInline,
  parseContentToDocxElements,
  parseHeadingLine,
  isHorizontalRule,
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

describe("markdown heading detection", () => {
  it("parses heading levels 1 through 4", () => {
    expect(parseHeadingLine("# Title")).toEqual({ level: 1, text: "Title" });
    expect(parseHeadingLine("## Subtitle")).toEqual({ level: 2, text: "Subtitle" });
    expect(parseHeadingLine("### HACCP Team")).toEqual({ level: 3, text: "HACCP Team" });
    expect(parseHeadingLine("#### Details")).toEqual({ level: 4, text: "Details" });
  });

  it("returns null for non-headings", () => {
    expect(parseHeadingLine("Not a heading")).toBeNull();
    expect(parseHeadingLine("#no-space")).toBeNull();
  });

  it("strips optional trailing closing hashes", () => {
    expect(parseHeadingLine("## Heading ##")).toEqual({ level: 2, text: "Heading" });
  });
});

describe("horizontal rule detection", () => {
  it("recognises common horizontal rule styles", () => {
    expect(isHorizontalRule("---")).toBe(true);
    expect(isHorizontalRule("***")).toBe(true);
    expect(isHorizontalRule("___")).toBe(true);
    expect(isHorizontalRule("   ------   ")).toBe(true);
  });

  it("rejects things that look like rules but are not", () => {
    expect(isHorizontalRule("--")).toBe(false);
    expect(isHorizontalRule("-- separator")).toBe(false);
  });
});

describe("rich inline parser (parseInline)", () => {
  it("produces a plain TextRun for plain text", () => {
    const runs = parseInline("plain text", 22, "0F172A");
    expect(runs).toHaveLength(1);
    expect(runs[0]).toBeInstanceOf(TextRun);
  });

  it("handles inline code (`code`)", () => {
    const runs = parseInline("Use `core` temp probe", 22, "0F172A");
    // "Use " + "core"(code) + " temp probe"
    expect(runs).toHaveLength(3);
    for (const run of runs) expect(run).toBeInstanceOf(TextRun);
  });

  it("handles strikethrough (~~text~~)", () => {
    const runs = parseInline("old ~~deprecated~~ now", 22, "0F172A");
    expect(runs).toHaveLength(3);
    for (const run of runs) expect(run).toBeInstanceOf(TextRun);
  });

  it("emits an ExternalHyperlink for [text](url)", () => {
    const runs = parseInline("See [the spec](https://example.com/spec) for details", 22, "0F172A");
    // "See " + link + " for details"
    expect(runs).toHaveLength(3);
    expect(runs[0]).toBeInstanceOf(TextRun);
    expect(runs[1]).toBeInstanceOf(ExternalHyperlink);
    expect(runs[2]).toBeInstanceOf(TextRun);
  });

  it("keeps a bold segment working alongside other inline markers", () => {
    const runs = parseInline("**bold** and `code`", 22, "0F172A");
    // bold + " and " + code
    expect(runs).toHaveLength(3);
  });

  it("is backward compatible for pure-bold input with parseInlineBold", () => {
    const boldOnly = parseInline("This is **bold** text", 22, "0F172A");
    const legacy = parseInlineBold("This is **bold** text", 22, "0F172A");
    expect(boldOnly.length).toBe(legacy.length);
  });
});

describe("block-level parsing extensions", () => {
  it("renders headings as Paragraph nodes", () => {
    const elements = parseContentToDocxElements("## HACCP Team\nSome intro.");
    expect(elements).toHaveLength(2);
    expect(elements[0]).toBeInstanceOf(Paragraph);
    expect(elements[1]).toBeInstanceOf(Paragraph);
  });

  it("renders horizontal rules as Paragraph nodes", () => {
    const elements = parseContentToDocxElements("Intro\n---\nAfter rule");
    expect(elements).toHaveLength(3);
    for (const el of elements) expect(el).toBeInstanceOf(Paragraph);
  });

  it("renders bulleted list items as separate Paragraph nodes", () => {
    const content = "- first\n- second\n- third";
    const elements = parseContentToDocxElements(content);
    expect(elements).toHaveLength(3);
    for (const el of elements) expect(el).toBeInstanceOf(Paragraph);
  });

  it("renders ordered list items as separate Paragraph nodes", () => {
    const content = "1. first\n2. second\n3. third";
    const elements = parseContentToDocxElements(content);
    expect(elements).toHaveLength(3);
    for (const el of elements) expect(el).toBeInstanceOf(Paragraph);
  });

  it("renders blockquotes as a single Paragraph per consecutive block", () => {
    const content = "> quoted line one\n> quoted line two";
    const elements = parseContentToDocxElements(content);
    expect(elements).toHaveLength(1);
    expect(elements[0]).toBeInstanceOf(Paragraph);
  });

  it("renders fenced code blocks as Paragraph nodes, one per line", () => {
    const content = ["```", "line 1", "line 2", "```"].join("\n");
    const elements = parseContentToDocxElements(content);
    expect(elements).toHaveLength(2);
    for (const el of elements) expect(el).toBeInstanceOf(Paragraph);
  });

  it("handles a realistic HACCP-style section", () => {
    const content = [
      "### 2. HACCP Team",
      "",
      "| Name | Role |",
      "|---|---|",
      "| Chef | Lead |",
      "",
      "- Item one",
      "- Item two",
    ].join("\n");
    const elements = parseContentToDocxElements(content);
    // heading + table + spacer + bullet + bullet
    expect(elements[0]).toBeInstanceOf(Paragraph); // heading
    expect(elements[1]).toBeInstanceOf(Table);
    expect(elements[2]).toBeInstanceOf(Paragraph); // table spacer
    expect(elements[3]).toBeInstanceOf(Paragraph); // bullet
    expect(elements[4]).toBeInstanceOf(Paragraph); // bullet
  });
});
