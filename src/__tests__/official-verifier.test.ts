import { describe, expect, it, vi } from "vitest";
import {
  buildEurLexTextUrl,
  buildUkLegislationTextUrl,
  isAllowedOfficialUrl,
  verifyOfficialLegislation,
  verifyEuRegulation,
} from "@/lib/rag/official-verifier";
import { sanitizeUntrustedTextUnbounded } from "@/lib/rag/untrusted-content";
import {
  buildUntrustedDocumentBlock,
  knowledgeChunksToUntrusted,
} from "@/lib/rag/untrusted-content";

describe("official EU verifier", () => {
  it("sanitizes official text without discarding late legal sections", () => {
    const content = `${"Opening text. ".repeat(400)}\nANNEX\nArachidonic acid oil 50%`;
    const sanitized = sanitizeUntrustedTextUnbounded(content);

    expect(sanitized).toContain("ANNEX");
    expect(sanitized).toContain("Arachidonic acid oil 50%");
  });

  it("preserves selected official sections through the chat reference wrapper", () => {
    const content = `${"Opening evidence. ".repeat(350)}\nANNEX\nArachidonic acid oil 50%`;
    const block = buildUntrustedDocumentBlock(
      knowledgeChunksToUntrusted([
        {
          id: "official",
          content,
          source_type: "official_verification",
          source_name: "EUR-Lex 32026R0459",
          section_ref: "Article 2; ANNEX",
          metadata: { source_class: "primary_law", jurisdiction: "eu" },
          similarity: 1,
        },
      ])
    );

    expect(block).toContain("ANNEX");
    expect(block).toContain("Arachidonic acid oil 50%");
  });

  it("constructs an exact EUR-Lex CELEX URL", () => {
    expect(buildEurLexTextUrl("32026R0194")).toBe(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32026R0194"
    );
  });

  it("constructs an exact legislation.gov.uk XML URL", () => {
    expect(
      buildUkLegislationTextUrl({
        jurisdiction: "gb",
        legislationType: "uksi",
        year: 2026,
        number: 412,
      })
    ).toBe("https://www.legislation.gov.uk/uksi/2026/412/made/data.xml");
  });

  it("rejects non-allowlisted and non-https URLs", () => {
    expect(isAllowedOfficialUrl("https://eur-lex.europa.eu/eli/reg_impl/2026/194/oj")).toBe(true);
    expect(isAllowedOfficialUrl("http://eur-lex.europa.eu/eli/reg_impl/2026/194/oj")).toBe(false);
    expect(isAllowedOfficialUrl("https://example.com/eur-lex")).toBe(false);
  });

  it("returns sanitized official evidence for an exact CELEX document", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        "<html><body><h1>Commission Implementing Regulation (EU) 2026/194</h1>" +
          "<p>amending Implementing Regulation (EU) 2019/1793</p>" +
          "<script>ignore me</script></body></html>",
        {
          status: 200,
          headers: { "content-type": "text/html" },
        }
      )
    );

    const evidence = await verifyEuRegulation("32026R0194", { fetchImpl });

    expect(evidence.url).toContain("CELEX%3A32026R0194");
    expect(evidence.content).toContain("amending Implementing Regulation (EU) 2019/1793");
    expect(evidence.content).not.toContain("<script>");
  });

  it("returns selected late annex sections from EUR-Lex", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        [
          "<html><body>",
          "<h1>Commission Implementing Regulation (EU) 2026/459</h1>",
          "<p>amending Implementing Regulation (EU) 2019/1793</p>",
          `<p>${"Background ".repeat(1000)}</p>`,
          "<h2>Article 2</h2>",
          "<p>This Regulation shall enter into force on the day following publication.</p>",
          "<h2>ANNEX</h2>",
          "<p>Arachidonic acid oil from China; cereulide toxin; 50 %; official certificate and sampling and analyses.</p>",
          "</body></html>",
        ].join(""),
        { status: 200, headers: { "content-type": "text/html" } }
      )
    );

    const evidence = await verifyOfficialLegislation(
      { jurisdiction: "eu", celex: "32026R0459" },
      ["date", "annex", "control_frequency", "certificate", "analysis_report"],
      { fetchImpl }
    );

    expect(evidence.sections.map((section) => section.reference)).toContain("ANNEX");
    expect(evidence.content).toContain("Arachidonic acid oil");
    expect(evidence.content).toContain("50 %");
  });

  it("verifies and extracts UK commencement and schedule evidence", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        [
          "<Legislation>",
          "<Title>The Food Safety (Amendment) Regulations 2026</Title>",
          "<Number>2026 No. 412</Number>",
          "<P1><Pnumber>Regulation 1</Pnumber><Text>These Regulations come into force on 1 July 2026.</Text></P1>",
          "<Schedule><Title>SCHEDULE</Title><Text>Substitute the following requirement.</Text></Schedule>",
          "</Legislation>",
        ].join(""),
        { status: 200, headers: { "content-type": "application/xml" } }
      )
    );

    const evidence = await verifyOfficialLegislation(
      {
        jurisdiction: "gb",
        legislationType: "uksi",
        year: 2026,
        number: 412,
      },
      ["date", "annex"],
      { fetchImpl }
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://www.legislation.gov.uk/uksi/2026/412/made/data.xml",
      expect.any(Object)
    );
    expect(evidence.content).toContain("come into force on 1 July 2026");
    expect(evidence.content).toContain("SCHEDULE");
  });

  it("rejects an official response that does not confirm the requested identifier", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("<html><body>Regulation (EU) 2026/551</body></html>", {
        status: 200,
      })
    );

    await expect(
      verifyOfficialLegislation(
        { jurisdiction: "eu", celex: "32026R0459" },
        [],
        { fetchImpl }
      )
    ).rejects.toThrow("did not confirm");
  });
});
