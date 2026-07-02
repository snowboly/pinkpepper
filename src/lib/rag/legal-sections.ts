import type { LegalRequestedDetail } from "./legal-query";

export type LegalSectionKind =
  | "title"
  | "metadata"
  | "preamble"
  | "article"
  | "section"
  | "schedule"
  | "annex"
  | "signature";

export type LegalSection = {
  kind: LegalSectionKind;
  reference: string | null;
  content: string;
};

const SECTION_HEADING =
  /^(article|regulation|section|schedule|annex|part|chapter)\b(?:\s+([A-Z0-9IVX.-]+))?/i;
const PER_SECTION_LIMIT = 8_000;
const TOTAL_LIMIT = 20_000;

function classifyHeading(line: string): LegalSectionKind {
  if (/^annex\b/i.test(line)) return "annex";
  if (/^schedule\b/i.test(line)) return "schedule";
  if (/^article\b/i.test(line)) return "article";
  if (/^(regulation|section)\b/i.test(line)) return "section";
  return "preamble";
}

function capSection(section: LegalSection): LegalSection {
  if (section.content.length <= PER_SECTION_LIMIT) return section;
  return {
    ...section,
    content:
      section.content.slice(0, PER_SECTION_LIMIT) +
      "\n[section truncated by PinkPepper for context safety]",
  };
}

export function parseLegalSections(text: string): LegalSection[] {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const sections: LegalSection[] = [];
  let current: LegalSection = { kind: "title", reference: null, content: "" };

  for (const line of lines) {
    if (SECTION_HEADING.test(line)) {
      if (current.content) sections.push(capSection(current));
      current = {
        kind: classifyHeading(line),
        reference: line,
        content: line,
      };
      continue;
    }
    current.content = current.content ? `${current.content}\n${line}` : line;
  }

  if (current.content) sections.push(capSection(current));
  return sections;
}

function matchesRequestedDetail(
  section: LegalSection,
  detail: LegalRequestedDetail
): boolean {
  switch (detail) {
    case "annex":
      return section.kind === "annex" || section.kind === "schedule";
    case "article":
      return section.kind === "article" || section.kind === "section";
    case "date":
      return /\b(entry into force|come into force|commencement|appl(?:y|ies|ication)|publication|adopted|made on|transitional)\b/i.test(
        section.content
      );
    case "effective_date":
      return /\b(entry into force|enter(?:s|ed|ing)? into force|come(?:s)? into force|commencement|shall apply from|application date)\b/i.test(
        section.content
      );
    case "control_frequency":
      return /\b\d{1,3}\s*%|\bfrequency\b|\bidentity and physical checks\b/i.test(
        section.content
      );
    case "certificate":
      return /\bcertificate\b/i.test(section.content);
    case "analysis_report":
      return /\bsampling and analys|\banalysis report\b|\breport of analysis\b/i.test(
        section.content
      );
    case "authority":
      return /\bcompetent authority\b|\bminister\b|\bsecretary of state\b|\benforcement authority\b/i.test(
        section.content
      );
    case "jurisdiction":
      return section.kind === "title" || /\bextent\b|\bmember states\b/i.test(section.content);
  }
}

export function selectLegalSections(
  text: string,
  requestedDetails: LegalRequestedDetail[]
): LegalSection[] {
  const parsed = parseLegalSections(text);
  const selected = parsed.filter(
    (section, index) =>
      index === 0 ||
      requestedDetails.some((detail) => matchesRequestedDetail(section, detail))
  );
  const unique = [
    ...new Map(
      selected.map((section) => [
        `${section.kind}:${section.reference ?? section.content.slice(0, 80)}`,
        section,
      ])
    ).values(),
  ];

  const bounded: LegalSection[] = [];
  let total = 0;
  for (const section of unique) {
    if (total + section.content.length > TOTAL_LIMIT) continue;
    bounded.push(section);
    total += section.content.length;
  }
  return bounded;
}
