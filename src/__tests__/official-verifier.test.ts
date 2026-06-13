import { describe, expect, it, vi } from "vitest";
import {
  buildEurLexTextUrl,
  isAllowedOfficialUrl,
  verifyEuRegulation,
} from "@/lib/rag/official-verifier";

describe("official EU verifier", () => {
  it("constructs an exact EUR-Lex CELEX URL", () => {
    expect(buildEurLexTextUrl("32026R0194")).toBe(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32026R0194"
    );
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
});
