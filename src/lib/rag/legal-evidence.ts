import type { LegalQueryPlan, LegalRequestedDetail } from "./legal-query";
import type { KnowledgeChunk } from "./retriever";

export type LegalEvidenceAssessment = {
  sufficient: boolean;
  missingDetails: LegalRequestedDetail[];
  verificationCelex: string | null;
};

function joinedEvidence(chunks: KnowledgeChunk[]): string {
  return chunks
    .map((chunk) => `${chunk.section_ref ?? ""} ${chunk.content}`)
    .join("\n")
    .toLowerCase();
}

function supportsDetail(
  detail: LegalRequestedDetail,
  chunks: KnowledgeChunk[],
  evidence: string
): boolean {
  switch (detail) {
    case "date":
      return chunks.some(
        (chunk) =>
          typeof chunk.metadata?.dateDocument === "string" ||
          typeof chunk.metadata?.publicationDate === "string"
      );
    case "annex":
      return chunks.some((chunk) => /\bannex\b/i.test(chunk.section_ref ?? "")) ||
        /\bannex\s+[ivx0-9]/i.test(evidence);
    case "article":
      return chunks.some((chunk) => /\barticle\b/i.test(chunk.section_ref ?? "")) ||
        /\barticle\s+\d+/i.test(evidence);
    case "control_frequency":
      return /\b\d{1,3}\s*%\b|\bfrequency\b.*\b(control|check|sampling)\b/i.test(evidence);
    case "certificate":
      return /\bofficial certificate\b|\bhealth certificate\b/i.test(evidence);
    case "analysis_report":
      return /\banalysis report\b|\breport of analysis\b/i.test(evidence);
    case "authority":
      return /\bcompetent authority\b|\bport health\b|\bap[hp]a\b|\bfsa\b/i.test(evidence);
    case "jurisdiction":
      return chunks.some((chunk) =>
        ["eu", "gb", "mixed"].includes(String(chunk.metadata?.jurisdiction))
      );
  }
}

export function assessLegalEvidence(
  plan: LegalQueryPlan,
  chunks: KnowledgeChunk[]
): LegalEvidenceAssessment {
  const evidence = joinedEvidence(chunks);
  const missingDetails = plan.requestedDetails.filter(
    (detail) => !supportsDetail(detail, chunks, evidence)
  );
  const relationshipSupported =
    !plan.relationship ||
    chunks.some((chunk) => {
      const chunkEvidence = [
        chunk.source_name,
        chunk.content,
        chunk.metadata?.originalTitle,
        chunk.metadata?.baseCelexNumber,
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase();

      return (
        plan.targetInstrumentReferences.every((reference) =>
          chunkEvidence.includes(reference.toLowerCase())
        ) && /\bamend|correct|replac|implement/i.test(chunkEvidence)
      );
    });
  const verificationCelex =
    chunks
      .map((chunk) => chunk.metadata?.celexNumber)
      .find((value): value is string => typeof value === "string") ?? null;

  return {
    sufficient: chunks.length > 0 && relationshipSupported && missingDetails.length === 0,
    missingDetails,
    verificationCelex,
  };
}
