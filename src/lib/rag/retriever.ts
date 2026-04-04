import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";
import {
  inferJurisdiction,
  inferSourceClass,
  type Jurisdiction,
  type SourceClass,
} from "./source-taxonomy";

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

export function rankRetrievedChunks(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
  return [...chunks].sort((a, b) => {
    const aSourceClass = normalizeChunkSourceClass(a);
    const bSourceClass = normalizeChunkSourceClass(b);
    const aWeight = SOURCE_CLASS_WEIGHT[aSourceClass] ?? 0;
    const bWeight = SOURCE_CLASS_WEIGHT[bSourceClass] ?? 0;

    return bWeight - aWeight || b.similarity - a.similarity;
  });
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
        sourceClasses.includes(chunkSourceClass);

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

/**
 * Retrieve relevant chunks from a specific user's uploaded documents.
 * When conversationId is supplied, only chunks from that conversation are searched,
 * so document grounding persists across all follow-up turns automatically.
 */
export async function retrieveUserDocumentContext(
  query: string,
  userId: string,
  options: RetrievalOptions = {},
  conversationId?: string | null
): Promise<UserDocumentChunk[]> {
  const { topK, threshold } = { ...DEFAULT_OPTIONS, ...options };

  const { embedding } = await generateEmbedding(query);

  const { data, error } = await getSupabase().rpc("search_user_document_chunks", {
    p_user_id: userId,
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: topK,
    p_conversation_id: conversationId ?? null,
  });

  if (error) {
    console.error("User document retrieval error:", error);
    throw new Error(`Failed to retrieve user documents: ${error.message}`);
  }

  return (data as UserDocumentChunk[]) || [];
}
