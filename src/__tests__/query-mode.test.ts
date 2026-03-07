import { describe, it, expect } from "vitest";
import { detectQueryMode } from "@/lib/query-mode";

describe("detectQueryMode", () => {
  describe("audit mode", () => {
    it("detects 'audit' keyword", () => {
      expect(detectQueryMode("Can you audit my kitchen?")).toBe("audit");
    });

    it("detects 'check compliance'", () => {
      expect(detectQueryMode("Check compliance of our cold store")).toBe("audit");
    });

    it("detects 'gap analysis'", () => {
      expect(detectQueryMode("Perform a gap analysis on our HACCP plan")).toBe("audit");
    });

    it("detects 'non-conformance'", () => {
      expect(detectQueryMode("We had a non-conformance with temperature logs")).toBe("audit");
    });

    it("detects 'major nc' with space padding", () => {
      expect(detectQueryMode("This was raised as a major nc last audit")).toBe("audit");
    });

    it("detects 'am i compliant'", () => {
      expect(detectQueryMode("Am I compliant with EC 852/2004?")).toBe("audit");
    });

    it("detects 'corrective action'", () => {
      expect(detectQueryMode("What corrective action should I take?")).toBe("audit");
    });

    it("detects 'capa'", () => {
      expect(detectQueryMode("Help me with CAPA for this finding")).toBe("audit");
    });

    it("detects 'review my'", () => {
      expect(detectQueryMode("Can you review my cleaning schedule?")).toBe("audit");
    });

    it("detects 'what are we missing'", () => {
      expect(detectQueryMode("What are we missing for BRC?")).toBe("audit");
    });

    it("is case insensitive", () => {
      expect(detectQueryMode("AUDIT my kitchen")).toBe("audit");
      expect(detectQueryMode("Gap Analysis needed")).toBe("audit");
    });
  });

  describe("document mode", () => {
    it("detects 'create'", () => {
      expect(detectQueryMode("Create a temperature monitoring log")).toBe("document");
    });

    it("detects 'generate'", () => {
      expect(detectQueryMode("Generate a cleaning schedule")).toBe("document");
    });

    it("detects 'draft'", () => {
      expect(detectQueryMode("Draft a food safety policy")).toBe("document");
    });

    it("detects 'haccp plan'", () => {
      expect(detectQueryMode("I need a HACCP plan for my bakery")).toBe("document");
    });

    it("detects 'sop'", () => {
      expect(detectQueryMode("Write me an SOP for goods receiving")).toBe("document");
    });

    it("detects 'allergen matrix'", () => {
      expect(detectQueryMode("I need an allergen matrix for my menu")).toBe("document");
    });

    it("detects 'cleaning schedule'", () => {
      expect(detectQueryMode("I need a cleaning schedule")).toBe("document");
    });

    it("detects 'risk assessment'", () => {
      expect(detectQueryMode("Help with a risk assessment for my new product")).toBe("document");
    });

    it("detects 'pest control log'", () => {
      expect(detectQueryMode("I need a pest control log")).toBe("document");
    });

    it("detects 'declaration of compliance'", () => {
      expect(detectQueryMode("Give me a declaration of compliance template")).toBe("document");
    });

    it("is case insensitive", () => {
      expect(detectQueryMode("WRITE me a HACCP Plan")).toBe("document");
    });
  });

  describe("audit takes priority over document", () => {
    it("'audit' beats 'create'", () => {
      expect(detectQueryMode("Audit and create a corrective action plan")).toBe("audit");
    });

    it("'verify' beats 'template'", () => {
      expect(detectQueryMode("Verify this template is compliant")).toBe("audit");
    });

    it("'due diligence' is audit even though 'due diligence record' is document", () => {
      expect(detectQueryMode("Check our due diligence")).toBe("audit");
    });
  });

  describe("qa mode (default)", () => {
    it("returns qa for general food safety question", () => {
      expect(detectQueryMode("What temperature should I store chicken at?")).toBe("qa");
    });

    it("returns qa for regulatory question", () => {
      expect(detectQueryMode("What does EC 852/2004 say about hand washing?")).toBe("qa");
    });

    it("returns qa for empty string", () => {
      expect(detectQueryMode("")).toBe("qa");
    });

    it("returns qa for unrelated topic", () => {
      expect(detectQueryMode("What is the capital of France?")).toBe("qa");
    });
  });
});
