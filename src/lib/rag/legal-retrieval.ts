import { assessLegalEvidence, type LegalEvidenceAssessment } from "./legal-evidence";
import {
  resolveOfficialAuthority,
  type OfficialLegalIdentifier,
} from "./legal-authority";
import { buildLegalQueryPlan, type LegalQueryPlan } from "./legal-query";
import {
  verifyOfficialLegislation,
  type OfficialEvidence,
} from "./official-verifier";
import {
  rankLegalChunks,
  selectDistinctSourceChunks,
  type KnowledgeChunk,
} from "./retriever";

type LegalRetrievalDependencies = {
  retrieveLexical: (plan: LegalQueryPlan) => Promise<KnowledgeChunk[]>;
  verifyOfficial?: (
    identifier: OfficialLegalIdentifier,
    requestedDetails: LegalQueryPlan["requestedDetails"]
  ) => Promise<OfficialEvidence>;
};

export type LegalContextResult = {
  plan: LegalQueryPlan;
  chunks: KnowledgeChunk[];
  evidence: LegalEvidenceAssessment;
  usedOfficialFallback: boolean;
  verificationError: string | null;
};

function mergeChunks(...sets: KnowledgeChunk[][]): KnowledgeChunk[] {
  const seen = new Set<string>();
  return sets.flat().filter((chunk) => {
    if (seen.has(chunk.id)) return false;
    seen.add(chunk.id);
    return true;
  });
}

function identifierKey(identifier: OfficialLegalIdentifier): string {
  return identifier.jurisdiction === "eu"
    ? `eu:${identifier.celex}`
    : `gb:${identifier.legislationType}:${identifier.year}:${identifier.number}`;
}

function officialEvidenceChunk(evidence: OfficialEvidence): KnowledgeChunk {
  const key = identifierKey(evidence.identifier);
  const jurisdiction = evidence.identifier.jurisdiction;
  return {
    id: `official:${key}:${evidence.retrievedAt}`,
    content: evidence.content,
    source_type: "official_verification",
    source_name: evidence.sourceName,
    section_ref:
      evidence.sections
        .map((section) => section.reference)
        .filter((value): value is string => Boolean(value))
        .join("; ") || null,
    metadata: {
      source_class: "primary_law",
      jurisdiction,
      source_key: `official:${key}`,
      version_key: `official:${key}:${evidence.retrievedAt}`,
      ...(evidence.identifier.jurisdiction === "eu"
        ? { celexNumber: evidence.identifier.celex }
        : {
            legislationType: evidence.identifier.legislationType,
            legislationYear: evidence.identifier.year,
            legislationNumber: evidence.identifier.number,
          }),
      official_url: evidence.officialUrl,
      retrievedAt: evidence.retrievedAt,
      retrieval_status: "active",
    },
    similarity: 1,
  };
}

export async function resolveLegalContext(
  message: string,
  semanticChunks: KnowledgeChunk[],
  dependencies: LegalRetrievalDependencies
): Promise<LegalContextResult> {
  const plan = buildLegalQueryPlan(message);
  if (!plan.precisionRequired) {
    return {
      plan,
      chunks: semanticChunks,
      evidence: assessLegalEvidence(plan, semanticChunks),
      usedOfficialFallback: false,
      verificationError: null,
    };
  }

  let lexicalChunks: KnowledgeChunk[] = [];
  try {
    lexicalChunks = await dependencies.retrieveLexical(plan);
  } catch {
    lexicalChunks = [];
  }
  let chunks = selectDistinctSourceChunks(
    rankLegalChunks(mergeChunks(semanticChunks, lexicalChunks), plan)
  );
  let evidence = assessLegalEvidence(plan, chunks);
  const resolution =
    resolveOfficialAuthority(plan, chunks) ??
    (plan.celexReferences[0]
      ? {
          identifier: {
            jurisdiction: "eu" as const,
            celex: plan.celexReferences[0],
          },
          reason: "explicit CELEX in user query",
          sourceChunkIds: [],
        }
      : null);

  if (!evidence.sufficient && resolution) {
    try {
      const official = await (
        dependencies.verifyOfficial ??
        ((identifier, requestedDetails) =>
          verifyOfficialLegislation(identifier, requestedDetails))
      )(resolution.identifier, plan.requestedDetails);
      chunks = selectDistinctSourceChunks([
        officialEvidenceChunk(official),
        ...chunks,
      ]);
      evidence = assessLegalEvidence(plan, chunks);
      return {
        plan,
        chunks,
        evidence,
        usedOfficialFallback: true,
        verificationError: null,
      };
    } catch (error) {
      return {
        plan,
        chunks,
        evidence,
        usedOfficialFallback: false,
        verificationError: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    plan,
    chunks,
    evidence,
    usedOfficialFallback: false,
    verificationError: null,
  };
}
