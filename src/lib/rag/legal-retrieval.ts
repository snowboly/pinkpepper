import { assessLegalEvidence, type LegalEvidenceAssessment } from "./legal-evidence";
import { buildLegalQueryPlan, type LegalQueryPlan } from "./legal-query";
import { verifyEuRegulation, type OfficialEvidence } from "./official-verifier";
import {
  rankLegalChunks,
  selectDistinctSourceChunks,
  type KnowledgeChunk,
} from "./retriever";

type LegalRetrievalDependencies = {
  retrieveLexical: (plan: LegalQueryPlan) => Promise<KnowledgeChunk[]>;
  verifyEu?: (celex: string) => Promise<OfficialEvidence>;
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

function officialEvidenceChunk(evidence: OfficialEvidence, celex: string): KnowledgeChunk {
  return {
    id: `official:${celex}:${evidence.retrievedAt}`,
    content: evidence.content,
    source_type: "official_verification",
    source_name: evidence.sourceName,
    section_ref: null,
    metadata: {
      source_class: "primary_law",
      jurisdiction: "eu",
      source_key: `official:eu:${celex}`,
      version_key: `official:eu:${celex}:${evidence.retrievedAt}`,
      celexNumber: celex,
      official_url: evidence.url,
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
  const celex =
    evidence.verificationCelex ??
    plan.celexReferences[0] ??
    null;

  if (!evidence.sufficient && celex) {
    try {
      const official = await (dependencies.verifyEu ?? verifyEuRegulation)(celex);
      chunks = selectDistinctSourceChunks([
        officialEvidenceChunk(official, celex),
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
