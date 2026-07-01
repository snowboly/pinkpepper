import { describe, expect, it } from "vitest";
import { selectLegalSections } from "@/lib/rag/legal-sections";

describe("selectLegalSections", () => {
  it("retains late EU entry-into-force and annex evidence", () => {
    const text = [
      "COMMISSION IMPLEMENTING REGULATION (EU) 2026/459",
      "of 24 February 2026",
      "amending Implementing Regulation (EU) 2019/1793",
      "Whereas:",
      "Background ".repeat(900),
      "Article 2",
      "This Regulation shall enter into force on the day following that of its publication.",
      "ANNEX",
      "Annex II is amended as follows:",
      "China (CN)",
      "Arachidonic acid oil",
      "Cereulide toxin",
      "50 %",
      "official certificate and results of sampling and analyses",
    ].join("\n");

    const sections = selectLegalSections(text, [
      "date",
      "annex",
      "control_frequency",
      "certificate",
      "analysis_report",
    ]);
    const selected = sections.map((section) => section.content).join("\n");

    expect(selected).toContain("Article 2");
    expect(selected).toContain("day following");
    expect(selected).toContain("ANNEX");
    expect(selected).toContain("Arachidonic acid oil");
    expect(selected).toContain("50 %");
    expect(selected).toContain("sampling and analyses");
  });

  it("selects UK commencement and schedule sections", () => {
    const text = [
      "The Food Safety (Amendment) Regulations 2026",
      "2026 No. 412",
      "Regulation 1",
      "These Regulations come into force on 1 July 2026.",
      "Regulation 2",
      "The principal Regulations are amended.",
      "SCHEDULE",
      "Amendments to the principal Regulations",
      "In paragraph 4, substitute the following requirement.",
    ].join("\n");

    const sections = selectLegalSections(text, ["date", "article", "annex"]);
    const selected = sections.map((section) => section.content).join("\n");

    expect(selected).toContain("come into force on 1 July 2026");
    expect(selected).toContain("SCHEDULE");
    expect(selected).toContain("substitute the following requirement");
  });
});
