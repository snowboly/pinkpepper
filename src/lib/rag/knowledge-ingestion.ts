type KnowledgeChunkInsertRow = {
  content: string;
  embedding: string;
  source_type: string;
  source_name: string;
  section_ref: string | null;
  metadata: Record<string, unknown>;
};

type MinimalSupabaseClient = {
  from: (table: string) => {
    delete?: () => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
      };
    };
    insert?: (rows: KnowledgeChunkInsertRow[]) => Promise<{ error: { message: string } | null }>;
  };
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

  const deleteBuilder = supabase.from("knowledge_chunks").delete?.();
  if (!deleteBuilder) {
    throw new Error("Supabase client does not support deleting knowledge chunks");
  }

  const { error: deleteError } = await deleteBuilder
    .eq("source_type", params.sourceType)
    .eq("source_name", params.sourceName);

  if (deleteError) {
    throw new Error(`Database delete failed: ${deleteError.message}`);
  }

  const tableBuilder = supabase.from("knowledge_chunks");
  if (!tableBuilder.insert) {
    throw new Error("Supabase client does not support inserting knowledge chunks");
  }

  const batchSize = params.batchSize ?? params.rows.length;
  for (let i = 0; i < params.rows.length; i += batchSize) {
    const batch = params.rows.slice(i, i + batchSize);
    const { error: insertError } = await tableBuilder.insert(batch);
    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }
  }
}
