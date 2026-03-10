import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";

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
};

const DEFAULT_OPTIONS: Required<Omit<RetrievalOptions, "sourceType" | "sourceName">> = {
  topK: 5,
  threshold: 0.7,
};

/**
 * Retrieve relevant knowledge chunks for a user query
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  const { topK, threshold, sourceType, sourceName } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query);

  // Call the search function in Supabase
  const { data, error } = await getSupabase().rpc("search_knowledge_chunks", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: topK,
    filter_source_type: sourceType ?? null,
    filter_source_name: sourceName ?? null,
  });

  if (error) {
    console.error("Knowledge retrieval error:", error);
    throw new Error(`Failed to retrieve knowledge: ${error.message}`);
  }

  return (data as KnowledgeChunk[]) || [];
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
 * Retrieve relevant chunks from a specific user's uploaded documents
 */
export async function retrieveUserDocumentContext(
  query: string,
  userId: string,
  options: RetrievalOptions = {}
): Promise<UserDocumentChunk[]> {
  const { topK, threshold } = { ...DEFAULT_OPTIONS, ...options };

  const { embedding } = await generateEmbedding(query);

  const { data, error } = await getSupabase().rpc("search_user_document_chunks", {
    p_user_id: userId,
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: topK,
  });

  if (error) {
    console.error("User document retrieval error:", error);
    throw new Error(`Failed to retrieve user documents: ${error.message}`);
  }

  return (data as UserDocumentChunk[]) || [];
}
