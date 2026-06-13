import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";
import {
  inferJurisdiction,
  inferSourceClass,
  type Jurisdiction,
  type SourceClass,
} from "./source-taxonomy";
import type { LegalQueryPlan } from "./legal-query";

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseClient;
}

export type KnowledgeChunk = {
  id: string;
  content: string;
  source_type: string;
  source_name: string;
  section_ref: string | null;
  metadata: Record<string, unknown>;
  similarity: number;
};

export type RetrievalOptions = {
  topK?: number;
  threshold?: number;
  sourceType?: string;
  sourceName?: string;
  jurisdiction?: Jurisdiction;
  sourceClasses?: SourceClass[];
};

const DEFAULT_OPTIONS: Pick<Required<RetrievalOptions>, "topK" | "threshold"> = {
  topK: 5,
  threshold: 0.7,
};

const SOURCE_CLASS_WEIGHT: Record<SourceClass, number> = {
  primary_law: 4,
  official_guidance: 3,
  reference_standard: 2,
  internal_practice: 1,
};

function normalizeChunkJurisdiction(chunk: KnowledgeChunk): Jurisdiction {
  const metadataJurisdiction = chunk.metadata?.jurisdiction;
  if (
    metadataJurisdiction === "eu" ||
    metadataJurisdiction === "gb" ||
    metadataJurisdiction === "mixed" ||
    metadataJurisdiction === "unknown"
  ) {
    return metadataJurisdiction;
  }

  return inferJurisdiction([chunk.source_type, chunk.source_name].filter(Boolean).join(" "));
}

function normalizeChunkSourceClass(chunk: KnowledgeChunk): SourceClass {
  const metadataSourceClass = chunk.metadata?.source_class;
  if (
    metadataSourceClass === "primary_law" ||
    metadataSourceClass === "official_guidance" ||
    metadataSourceClass === "reference_standard" ||
    metadataSourceClass === "internal_practice"
  ) {
    return metadataSourceClass;
  }

  return inferSourceClass([chunk.source_type, chunk.source_name].filter(Boolean).join(" "));
}

function hasAuthorityProvenance(chunk: KnowledgeChunk, sourceClass: SourceClass): boolean {
  if (sourceClass === "primary_law") {
    return Boolean(
      chunk.metadata?.source_key &&
        chunk.metadata?.version_key &&
        chunk.metadata?.official_url
    );
  }

  if (sourceClass === "official_guidance") {
    return Boolean(chunk.metadata?.official_url);
  }

  return true;
}

function compareRetrievedChunks(a: KnowledgeChunk, b: KnowledgeChunk): number {
  const aSourceClass = normalizeChunkSourceClass(a);
  const bSourceClass = normalizeChunkSourceClass(b);
  const aWeight = SOURCE_CLASS_WEIGHT[aSourceClass] ?? 0;
  const bWeight = SOURCE_CLASS_WEIGHT[bSourceClass] ?? 0;

  return bWeight - aWeight || b.similarity - a.similarity;
}

export function rankRetrievedChunks(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
  return [...chunks].sort(compareRetrievedChunks);
}

function normalizedLegalText(chunk: KnowledgeChunk): string {
  return [
    chunk.source_name,
    chunk.content,
    chunk.metadata?.celexNumber,
    chunk.metadata?.baseCelexNumber,
    chunk.metadata?.originalTitle,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function relationshipScore(chunk: KnowledgeChunk, plan: LegalQueryPlan): number {
  const text = normalizedLegalText(chunk);
  const targetMatches = plan.targetInstrumentReferences.filter((reference) =>
    text.includes(reference.toLowerCase())
  ).length;
  const celexMatches = plan.celexReferences.filter((reference) =>
    text.includes(reference.toLowerCase())
  ).length;
  const exactMatches = plan.exactReferences.filter((reference) =>
    text.includes(reference.toLowerCase())
  ).length;
  const relationshipPattern =
    plan.relationship === "amended_by"
      ? /\bamend(?:s|ing|ed|ment)\b/
      : plan.relationship
        ? new RegExp(`\\b${plan.relationship.replace(/s$/, "")}\\w*\\b`, "i")
        : null;
  const relationshipMatches = relationshipPattern?.test(text) ? 1 : 0;

  return targetMatches * 100 + relationshipMatches * 30 + celexMatches * 80 + exactMatches * 20;
}

export function rankLegalChunks(
  chunks: KnowledgeChunk[],
  plan: LegalQueryPlan
): KnowledgeChunk[] {
  return [...chunks].sort((a, b) => {
    const relevanceDelta = relationshipScore(b, plan) - relationshipScore(a, plan);
    if (relevanceDelta !== 0) return relevanceDelta;
    return compareRetrievedChunks(a, b);
  });
}

export function selectDistinctSourceChunks(
  chunks: KnowledgeChunk[],
  maxChunksPerSource = 2,
  maxTotal = 12
): KnowledgeChunk[] {
  const sourceCounts = new Map<string, number>();
  const selected: KnowledgeChunk[] = [];

  for (const chunk of chunks) {
    const sourceKey =
      typeof chunk.metadata?.source_key === "string"
        ? chunk.metadata.source_key
        : chunk.source_name;
    const count = sourceCounts.get(sourceKey) ?? 0;
    if (count >= maxChunksPerSource) continue;
    sourceCounts.set(sourceKey, count + 1);
    selected.push(chunk);
    if (selected.length >= maxTotal) break;
  }

  return selected;
}

export function buildLegalSearchTerms(plan: LegalQueryPlan): string[] {
  const relationshipTerm =
    plan.relationship === "amends" || plan.relationship === "amended_by"
      ? "amend"
      : plan.relationship
        ? plan.relationship.replace(/s$/, "")
        : null;

  return [
    ...plan.targetInstrumentReferences,
    ...plan.celexReferences,
    ...(relationshipTerm ? [relationshipTerm] : []),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
}

export async function retrieveLegalLexicalContext(
  plan: LegalQueryPlan,
  topK = 20
): Promise<KnowledgeChunk[]> {
  const searchTerms = buildLegalSearchTerms(plan);
  if (searchTerms.length === 0) return [];

  const { data, error } = await getSupabase().rpc("search_knowledge_chunks_legal", {
    search_terms: searchTerms,
    match_count: topK,
  });

  if (error) {
    throw new Error(`Failed to retrieve exact legal matches: ${error.message}`);
  }

  return rankLegalChunks((data as KnowledgeChunk[]) || [], plan);
}

export function filterAuthorityFallbackChunks(
  chunks: KnowledgeChunk[],
  options: Pick<RetrievalOptions, "jurisdiction" | "sourceClasses">
): KnowledgeChunk[] {
  const jurisdictionFilter = normalizeJurisdictionFilter(options.jurisdiction);
  const sourceClasses = options.sourceClasses;

  return rankRetrievedChunks(
    chunks.filter((chunk) => {
      const chunkJurisdiction = normalizeChunkJurisdiction(chunk);
      const chunkSourceClass = normalizeChunkSourceClass(chunk);

      const matchesJurisdiction =
        !jurisdictionFilter ||
        chunkJurisdiction === jurisdictionFilter ||
        chunkJurisdiction === "mixed" ||
        chunkJurisdiction === "unknown";

      const matchesSourceClass =
        !sourceClasses ||
        sourceClasses.length === 0 ||
        (sourceClasses.includes(chunkSourceClass) &&
          hasAuthorityProvenance(chunk, chunkSourceClass));

      return matchesJurisdiction && matchesSourceClass;
    })
  );
}

type SearchKnowledgeRpcName =
  | "search_knowledge_chunks"
  | "search_knowledge_chunks_authority_aware";

type SearchKnowledgeRpcArgs = {
  query_embedding: number[];
  match_threshold: number;
  match_count: number;
  filter_source_type: string | null;
  filter_source_name: string | null;
  filter_jurisdiction?: Jurisdiction | null;
  filter_source_classes?: SourceClass[] | null;
};

function normalizeJurisdictionFilter(jurisdiction?: Jurisdiction): Exclude<Jurisdiction, "mixed" | "unknown"> | null {
  if (!jurisdiction || jurisdiction === "unknown" || jurisdiction === "mixed") {
    return null;
  }

  return jurisdiction;
}

export function buildKnowledgeSearchRequest(
  options: RetrievalOptions & { queryEmbedding?: number[] }
): { rpcName: SearchKnowledgeRpcName; rpcArgs: SearchKnowledgeRpcArgs } {
  const { topK, threshold, sourceType, sourceName, jurisdiction, sourceClasses, queryEmbedding = [] } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const jurisdictionFilter = normalizeJurisdictionFilter(jurisdiction);

  const useAuthorityAwareSearch = Boolean(
    jurisdictionFilter || (sourceClasses && sourceClasses.length > 0)
  );

  if (useAuthorityAwareSearch) {
    return {
      rpcName: "search_knowledge_chunks_authority_aware",
      rpcArgs: {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: topK,
        filter_source_type: sourceType ?? null,
        filter_source_name: sourceName ?? null,
        filter_jurisdiction: jurisdictionFilter,
        filter_source_classes: sourceClasses ?? null,
      },
    };
  }

  return {
    rpcName: "search_knowledge_chunks",
    rpcArgs: {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: topK,
      filter_source_type: sourceType ?? null,
      filter_source_name: sourceName ?? null,
    },
  };
}

/**
 * Retrieve relevant knowledge chunks for a user query
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query);
  const { rpcName, rpcArgs } = buildKnowledgeSearchRequest({
    ...options,
    queryEmbedding: embedding,
  });

  // Call the search function in Supabase
  const { data, error } = await getSupabase().rpc(rpcName, rpcArgs);

  if (error) {
    console.error("Knowledge retrieval error:", error);
    throw new Error(`Failed to retrieve knowledge: ${error.message}`);
  }

  return rankRetrievedChunks((data as KnowledgeChunk[]) || []);
}

/**
 * Retrieve context filtered by regulation type (EU/UK)
 */
export async function retrieveRegulationContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  return retrieveContext(query, {
    ...options,
    sourceType: "regulation",
  });
}

/**
 * Retrieve context filtered by guidance documents
 */
export async function retrieveGuidanceContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  return retrieveContext(query, {
    ...options,
    sourceType: "guidance",
  });
}

/**
 * Retrieve context filtered by templates
 */
export async function retrieveTemplateContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  return retrieveContext(query, {
    ...options,
    sourceType: "template",
  });
}

/**
 * Retrieve context from certification standards (BRCGS, SQF, etc.)
 */
export async function retrieveCertificationContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  return retrieveContext(query, {
    ...options,
    sourceType: "certification",
  });
}

export type UserDocumentChunk = {
  id: string;
  file_name: string;
  content: string;
  chunk_index: number;
  similarity: number;
};

export type UserDocumentRetrievalOptions = {
  topK?: number;
  threshold?: number;
  conversationId?: string;
};

type UserDocumentSearchRpcArgs = {
  p_user_id: string;
  query_embedding: number[];
  match_threshold: number;
  match_count: number;
  p_conversation_id?: string;
};

export function buildUserDocumentSearchRpcArgs(input: {
  userId: string;
  queryEmbedding: number[];
  threshold: number;
  topK: number;
  conversationId?: string;
}): UserDocumentSearchRpcArgs {
  const args: UserDocumentSearchRpcArgs = {
    p_user_id: input.userId,
    query_embedding: input.queryEmbedding,
    match_threshold: input.threshold,
    match_count: input.topK,
  };

  if (input.conversationId) {
    args.p_conversation_id = input.conversationId;
  }

  return args;
}

export function shouldRetryLegacyUserDocumentSearch(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const details = "details" in error ? String(error.details) : "";
  const message = "message" in error ? String(error.message) : "";

  return (
    code === "PGRST202" &&
    /p_conversation_id/i.test(`${details} ${message}`)
  );
}

/**
 * Retrieve relevant chunks from a specific user's uploaded documents.
 * When conversationId is supplied, only chunks from that conversation are searched,
 * so document grounding persists across all follow-up turns automatically.
 */
export async function retrieveUserDocumentContext(
  query: string,
  userId: string,
  options: UserDocumentRetrievalOptions = {}
): Promise<UserDocumentChunk[]> {
  const { topK, threshold, conversationId } = { ...DEFAULT_OPTIONS, ...options };

  const { embedding } = await generateEmbedding(query);

  const rpcArgs = buildUserDocumentSearchRpcArgs({
    userId,
    queryEmbedding: embedding,
    threshold,
    topK,
    conversationId,
  });

  let { data, error } = await getSupabase().rpc("search_user_document_chunks", rpcArgs);

  if (error && conversationId && shouldRetryLegacyUserDocumentSearch(error)) {
    const legacyArgs = buildUserDocumentSearchRpcArgs({
      userId,
      queryEmbedding: embedding,
      threshold,
      topK,
    });
    const legacyResult = await getSupabase().rpc("search_user_document_chunks", legacyArgs);
    data = legacyResult.data;
    error = legacyResult.error;
  }

  if (error) {
    console.error("User document retrieval error:", error);
    throw new Error(`Failed to retrieve user documents: ${error.message}`);
  }

  return (data as UserDocumentChunk[]) || [];
}
