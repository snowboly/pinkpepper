import { describe, expect, it } from "vitest";
import {
  inferQueryJurisdiction,
  inferJurisdiction,
  inferSourceClass,
  isAuthoritativeSourceClass,
} from "@/lib/rag/source-taxonomy";
import { getVerificationState } from "@/lib/rag/verification";

describe("source taxonomy", () => {
  it("classifies UK food hygiene regulations as gb primary law", () => {
    expect(inferJurisdiction("knowledge-docs/regulations/UK-food-hygiene-regulations-2006.md")).toBe("gb");
    expect(inferSourceClass("knowledge-docs/regulations/UK-food-hygiene-regulations-2006.md")).toBe("primary_law");
  });

  it("treats FSA guidance as official guidance", () => {
    expect(inferSourceClass("knowledge-docs/guidance/FSA-temperature-control.md")).toBe("official_guidance");
    expect(isAuthoritativeSourceClass("official_guidance")).toBe(true);
  });

  it("infers GB jurisdiction from user queries about UK rules", () => {
    expect(inferQueryJurisdiction("What does UK law require for chilled food storage?")).toBe("gb");
  });

  it("infers GB jurisdiction from London-based user queries", () => {
    expect(
      inferQueryJurisdiction("I run a restaurant in London. What food safety regulations apply to me?")
    ).toBe("gb");
  });

  it("infers EU jurisdiction from Germany-based user queries", () => {
    expect(
      inferQueryJurisdiction("I'm a food manufacturer in Germany. What regulations must I follow?")
    ).toBe("eu");
  });
});

describe("verification state", () => {
  it("returns verified when primary law is present", () => {
    expect(getVerificationState([{ source_class: "primary_law", jurisdiction: "gb" }])).toBe("verified");
  });

  it("returns verified for regulation chunks even when source_class metadata is missing", () => {
    expect(getVerificationState([{ source_type: "regulation", source_name: "UK food hygiene regulations 2006" }])).toBe("verified");
  });

  it("returns verified for guidance chunks even when source_class metadata is missing", () => {
    expect(getVerificationState([{ source_type: "guidance", source_name: "FSA temperature control guidance" }])).toBe("verified");
  });

  it("returns partial when only internal practice is present", () => {
    expect(getVerificationState([{ source_class: "internal_practice", jurisdiction: "gb" }])).toBe("partial");
  });

  it("returns partial for certification-standard questions when retrieval is empty", () => {
    expect(
      getVerificationState([], {
        mode: "qa",
        userMessage: "What do I need to prepare for a BRCGS audit?",
      })
    ).toBe("partial");
  });

  it("keeps legal applicability questions unverified when retrieval is empty", () => {
    expect(
      getVerificationState([], {
        mode: "qa",
        userMessage: "I run a restaurant in London. What food safety regulations apply to me?",
      })
    ).toBe("unverified");
  });

  it("returns unverified when there is no evidence", () => {
    expect(getVerificationState([])).toBe("unverified");
  });
});
