import type { LegalQueryPlan } from "./legal-query";
import type { KnowledgeChunk } from "./retriever";

export type OfficialLegalIdentifier =
  | { jurisdiction: "eu"; celex: string }
  | {
      jurisdiction: "gb";
      legislationType: string;
      year: number;
      number: number;
    };

export type AuthorityResolution = {
  identifier: OfficialLegalIdentifier;
  reason: string;
  sourceChunkIds: string[];
};

function normalizedChunkText(chunk: KnowledgeChunk): string {
  return [
    chunk.source_name,
    chunk.content,
    chunk.metadata?.originalTitle,
    chunk.metadata?.baseCelexNumber,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function relationshipPattern(plan: LegalQueryPlan): RegExp | null {
  switch (plan.relationship) {
    case "amends":
    case "amended_by":
      return /\bamend(?:s|ed|ing|ment)?\b/i;
    case "corrects":
      return /\bcorrect(?:s|ed|ing|ion)?\b/i;
    case "replaces":
      return /\breplac(?:es|ed|ing|ement)?\b/i;
    case "implements":
      return /\bimplement(?:s|ed|ing|ation)?\b/i;
    default:
      return null;
  }
}

function parseUkIdentifier(chunk: KnowledgeChunk): OfficialLegalIdentifier | null {
  const sourceKey =
    typeof chunk.metadata?.source_key === "string" ? chunk.metadata.source_key : "";
  const officialUrl =
    typeof chunk.metadata?.official_url === "string" ? chunk.metadata.official_url : "";
  const match =
    sourceKey.match(/^uk:([a-z]+):(\d{4}):(\d+)$/i) ??
    officialUrl.match(/legislation\.gov\.uk\/([a-z]+)\/(\d{4})\/(\d+)/i);
  if (!match) return null;

  return {
    jurisdiction: "gb",
    legislationType: match[1].toLowerCase(),
    year: Number(match[2]),
    number: Number(match[3]),
  };
}

function parseIdentifier(chunk: KnowledgeChunk): OfficialLegalIdentifier | null {
  const jurisdiction = String(chunk.metadata?.jurisdiction ?? "").toLowerCase();
  if (jurisdiction === "gb") return parseUkIdentifier(chunk);

  const celex =
    typeof chunk.metadata?.celexNumber === "string"
      ? chunk.metadata.celexNumber.toUpperCase()
      : "";
  if (/^[023]\d{4}[RLD]\d{4}(?:-\d{8})?$/.test(celex)) {
    return { jurisdiction: "eu", celex };
  }

  return parseUkIdentifier(chunk);
}

function authorityScore(chunk: KnowledgeChunk, plan: LegalQueryPlan): number {
  const text = normalizedChunkText(chunk);
  const relationship = relationshipPattern(plan);
  const targetMatches = plan.targetInstrumentReferences.filter((reference) =>
    text.includes(reference.toLowerCase())
  ).length;
  const relationshipMatches = relationship?.test(text) ? 1 : 0;
  const identifier = parseIdentifier(chunk);
  const consolidatedPenalty =
    identifier?.jurisdiction === "eu" && identifier.celex.startsWith("0") ? 80 : 0;

  return targetMatches * 100 + relationshipMatches * 60 - consolidatedPenalty;
}

function explicitEuModifyingAct(
  chunk: KnowledgeChunk,
  plan: LegalQueryPlan
): OfficialLegalIdentifier | null {
  if (!plan.recencyRequired || !plan.relationship) return null;
  const celex =
    typeof chunk.metadata?.celexNumber === "string"
      ? chunk.metadata.celexNumber.toUpperCase()
      : "";
  if (!celex.startsWith("0")) return null;

  const candidates = [
    ...normalizedChunkText(chunk).matchAll(
      /\b(?:implementing\s+)?(regulation|directive|decision)\s+\((?:eu|ec)\)\s+(?:no\s+)?(\d{4})\s*\/\s*(\d{1,4})\b/gi
    ),
  ]
    .map((match) => {
      const documentNumber = `${match[2]}/${Number(match[3])}`;
      const type = match[1].toLowerCase();
      const letter = type === "directive" ? "L" : type === "decision" ? "D" : "R";
      return {
        documentNumber,
        celex: `3${match[2]}${letter}${match[3].padStart(4, "0")}`,
        year: Number(match[2]),
        number: Number(match[3]),
      };
    })
    .filter(
      (candidate) =>
        !plan.targetInstrumentReferences.includes(candidate.documentNumber)
    )
    .sort((a, b) => b.year - a.year || b.number - a.number);

  return candidates[0]
    ? { jurisdiction: "eu", celex: candidates[0].celex }
    : null;
}

export function resolveOfficialAuthority(
  plan: LegalQueryPlan,
  chunks: KnowledgeChunk[]
): AuthorityResolution | null {
  const candidates = chunks
    .map((chunk) => ({
      chunk,
      identifier: parseIdentifier(chunk),
      score: authorityScore(chunk, plan),
    }))
    .filter(
      (candidate): candidate is typeof candidate & { identifier: OfficialLegalIdentifier } =>
        candidate.identifier !== null
    )
    .sort((a, b) => {
      const scoreDelta = b.score - a.score;
      if (scoreDelta !== 0) return scoreDelta;
      if (plan.recencyRequired) {
        const aDate = String(
          a.chunk.metadata?.dateDocument ??
            a.chunk.metadata?.publicationDate ??
            a.chunk.metadata?.currentVersionDate ??
            ""
        );
        const bDate = String(
          b.chunk.metadata?.dateDocument ??
            b.chunk.metadata?.publicationDate ??
            b.chunk.metadata?.currentVersionDate ??
            ""
        );
        const dateDelta = bDate.localeCompare(aDate);
        if (dateDelta !== 0) return dateDelta;
      }
      return b.chunk.similarity - a.chunk.similarity;
    });

  const selected = candidates[0];
  if (!selected) return null;
  const namedModifyingAct = explicitEuModifyingAct(selected.chunk, plan);
  if (namedModifyingAct) {
    return {
      identifier: namedModifyingAct,
      reason: "selected explicitly named modifying act from consolidated history",
      sourceChunkIds: [selected.chunk.id],
    };
  }

  return {
    identifier: selected.identifier,
    reason:
      selected.score > 0
        ? "selected source with explicit requested relationship and target"
        : "selected exact official identifier from retrieved evidence",
    sourceChunkIds: [selected.chunk.id],
  };
}
