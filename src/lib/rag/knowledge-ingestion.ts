type KnowledgeChunkInsertRow = {
  content: string;
  embedding: string;
  source_type: string;
  source_name: string;
  section_ref: string | null;
  metadata: Record<string, unknown>;
};

type MinimalSupabaseClient = {
  rpc?: (
    fn: string,
    args: {
      p_source_type: string;
      p_source_name: string;
      p_rows: KnowledgeChunkInsertRow[];
    }
  ) => Promise<{ error: { message: string } | null }>;
};

export async function replaceKnowledgeChunksForSource(
  supabase: MinimalSupabaseClient,
  params: {
    sourceType: string;
    sourceName: string;
    rows: KnowledgeChunkInsertRow[];
    batchSize?: number;
  }
): Promise<void> {
  if (params.rows.length === 0) {
    return;
  }

  if (!supabase.rpc) {
    throw new Error("Supabase client does not support replacing knowledge chunks");
  }

  const { error } = await supabase.rpc("replace_knowledge_chunks_for_source", {
    p_source_type: params.sourceType,
    p_source_name: params.sourceName,
    p_rows: params.rows,
  });

  if (error) {
    throw new Error(`Database replace failed: ${error.message}`);
  }
}
