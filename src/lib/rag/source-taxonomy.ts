export type Jurisdiction = "eu" | "gb" | "mixed" | "unknown";
export type SourceClass =
  | "primary_law"
  | "official_guidance"
  | "reference_standard"
  | "internal_practice";

const GB_PATTERN = /\b(uk|great britain|fsa|england|london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh|wales|scotland|northern ireland|food hygiene regulations)\b/i;
const EU_PATTERN = /\b(eu|european union|germany|deutschland|france|spain|italy|portugal|ireland|netherlands|belgium|austria|poland|denmark|sweden|finland|czech republic|slovakia|slovenia|croatia|hungary|romania|bulgaria|greece|cyprus|malta|estonia|latvia|lithuania|luxembourg|ec[-\s]?\d+|regulation \(ec\)|regulation \(eu\)|eur-lex)\b/i;
const CODEX_PATTERN = /\b(codex)\b/i;
const GUIDANCE_PATTERN = /\b(guidance|guide|fsa[-\s])/i;
const REGULATION_PATTERN = /\b(regulations?|directive|ec[-\s]?\d+|eu[-\s]?\d+|food hygiene regulations)\b/i;

export function inferJurisdiction(pathOrName: string): Jurisdiction {
  const hasGb = GB_PATTERN.test(pathOrName);
  const hasEu = EU_PATTERN.test(pathOrName);

  if (hasGb && hasEu) return "mixed";
  if (hasGb) return "gb";
  if (hasEu) return "eu";
  return "unknown";
}

export function inferQueryJurisdiction(query: string): Jurisdiction {
  return inferJurisdiction(query);
}

export function inferSourceClass(pathOrName: string): SourceClass {
  if (CODEX_PATTERN.test(pathOrName)) return "reference_standard";
  if (GUIDANCE_PATTERN.test(pathOrName)) return "official_guidance";
  if (REGULATION_PATTERN.test(pathOrName)) return "primary_law";
  return "internal_practice";
}

export function isAuthoritativeSourceClass(sourceClass: SourceClass): boolean {
  return sourceClass === "primary_law" || sourceClass === "official_guidance";
}

export function buildChunkMetadata(pathOrName: string): {
  jurisdiction: Jurisdiction;
  source_class: SourceClass;
} {
  return {
    jurisdiction: inferJurisdiction(pathOrName),
    source_class: inferSourceClass(pathOrName),
  };
}
