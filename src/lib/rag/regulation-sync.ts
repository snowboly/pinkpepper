/**
 * Regulation Sync Orchestrator
 *
 * Fetches new/amended EU food safety regulations from the EUR-Lex CELLAR API,
 * chunks and embeds them, and upserts into the knowledge_chunks table.
 *
 * Designed to run as a monthly Vercel Cron job.
 */

import { createAdminClient } from "@/utils/supabase/admin";
import { generateEmbeddings } from "@/lib/rag/embeddings";
import {
  searchFoodSafetyRegulations,
  fetchRegulationText,
  celexToSourceName,
  type CellarRegulation,
} from "@/lib/rag/cellar-client";

// Chunking config — matches scripts/ingest-knowledge.ts
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const EMBEDDING_BATCH_SIZE = 10;
const EMBEDDING_BATCH_DELAY_MS = 200;

// Default backfill date if no previous sync exists
const DEFAULT_SINCE_DATE = "2024-01-01";

export type SyncResult = {
  regulationsProcessed: number;
  regulationsSkipped: number;
  chunksCreated: number;
  errors: Array<{ celex: string; error: string }>;
  syncedAt: string;
};

/**
 * Simple text chunking with overlap.
 * Copied from scripts/ingest-knowledge.ts:84-96.
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(" "));
    i += chunkSize - overlap;
  }

  return chunks.filter((chunk) => chunk.trim().length > 50);
}

/**
 * Extract section references from chunk content.
 * Copied from scripts/ingest-knowledge.ts:101-120.
 */
function extractSectionRef(content: string): string | null {
  const patterns = [
    /Article\s+\d+(\.\d+)?/i,
    /Clause\s+\d+(\.\d+)*/i,
    /Section\s+\d+(\.\d+)*/i,
    /Annex\s+[IVX]+(\s+Chapter\s+[IVX]+)?/i,
    /Chapter\s+\d+/i,
    /Part\s+\d+/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[0];
  }

  return null;
}

/**
 * Get the most recent sync date from the log, or the default backfill date.
 */
async function getLastSyncDate(): Promise<string> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("regulation_sync_log")
    .select("synced_at")
    .eq("status", "success")
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.synced_at) {
    return new Date(data.synced_at).toISOString().split("T")[0];
  }

  return DEFAULT_SINCE_DATE;
}

/**
 * Check if a regulation has already been synced with the same last_modified date.
 */
async function isAlreadySynced(celex: string, lastModified: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("regulation_sync_log")
    .select("id")
    .eq("celex_number", celex)
    .eq("last_modified", lastModified)
    .eq("status", "success")
    .maybeSingle();

  return !!data;
}

/**
 * Process a single regulation: fetch text, chunk, embed, and insert into DB.
 */
async function processRegulation(
  regulation: CellarRegulation
): Promise<{ chunksCreated: number }> {
  const supabase = createAdminClient();
  const sourceName = celexToSourceName(regulation.celex);

  // Fetch full text
  const text = await fetchRegulationText(regulation.celex);
  if (!text || text.length < 100) {
    throw new Error(`Regulation text too short or empty (${text.length} chars)`);
  }

  // Chunk the text
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
  if (chunks.length === 0) {
    throw new Error("No chunks produced from regulation text");
  }

  // Delete existing chunks for this regulation (deduplication)
  await supabase
    .from("knowledge_chunks")
    .delete()
    .eq("source_name", sourceName)
    .eq("source_type", "regulation");

  // Generate embeddings in batches
  const allRows: Array<{
    content: string;
    embedding: string;
    source_type: string;
    source_name: string;
    section_ref: string | null;
    metadata: Record<string, unknown>;
  }> = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    const embeddings = await generateEmbeddings(batch);

    for (let j = 0; j < batch.length; j++) {
      allRows.push({
        content: batch[j],
        embedding: JSON.stringify(embeddings[j].embedding),
        source_type: "regulation",
        source_name: sourceName,
        section_ref: extractSectionRef(batch[j]),
        metadata: {
          celexNumber: regulation.celex,
          originalTitle: regulation.title,
          dateDocument: regulation.dateDocument,
          syncedAt: new Date().toISOString(),
        },
      });
    }

    // Rate limiting between embedding batches
    if (i + EMBEDDING_BATCH_SIZE < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, EMBEDDING_BATCH_DELAY_MS));
    }
  }

  // Insert chunks in batches of 100
  for (let i = 0; i < allRows.length; i += 100) {
    const batch = allRows.slice(i, i + 100);
    const { error } = await supabase.from("knowledge_chunks").insert(batch);
    if (error) {
      throw new Error(`DB insert failed: ${error.message}`);
    }
  }

  return { chunksCreated: allRows.length };
}

/**
 * Main sync function. Searches for new/amended EU food safety regulations
 * and ingests them into the knowledge base.
 */
export async function syncRegulations(): Promise<SyncResult> {
  const supabase = createAdminClient();
  const syncedAt = new Date().toISOString();

  const result: SyncResult = {
    regulationsProcessed: 0,
    regulationsSkipped: 0,
    chunksCreated: 0,
    errors: [],
    syncedAt,
  };

  // Determine sync window
  const sinceDate = await getLastSyncDate();
  console.log(`[regulation-sync] Searching for regulations modified since ${sinceDate}`);

  // Search CELLAR for food safety regulations
  let regulations: CellarRegulation[];
  try {
    regulations = await searchFoodSafetyRegulations(sinceDate);
    console.log(`[regulation-sync] Found ${regulations.length} regulations`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[regulation-sync] SPARQL search failed: ${message}`);
    result.errors.push({ celex: "SPARQL_SEARCH", error: message });
    return result;
  }

  // Process each regulation
  for (const regulation of regulations) {
    try {
      // Skip if already synced with same last_modified
      const alreadySynced = await isAlreadySynced(
        regulation.celex,
        regulation.dateLastModified
      );
      if (alreadySynced) {
        result.regulationsSkipped++;
        continue;
      }

      console.log(
        `[regulation-sync] Processing: ${regulation.celex} — ${regulation.title.slice(0, 80)}`
      );

      const { chunksCreated } = await processRegulation(regulation);
      result.regulationsProcessed++;
      result.chunksCreated += chunksCreated;

      // Log success
      await supabase.from("regulation_sync_log").insert({
        celex_number: regulation.celex,
        title: regulation.title.slice(0, 500),
        source_name: celexToSourceName(regulation.celex),
        last_modified: regulation.dateLastModified,
        chunks_ingested: chunksCreated,
        synced_at: syncedAt,
        status: "success",
      });

      console.log(
        `[regulation-sync] ✓ ${regulation.celex}: ${chunksCreated} chunks ingested`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[regulation-sync] ✗ ${regulation.celex}: ${message}`);
      result.errors.push({ celex: regulation.celex, error: message });

      // Log error
      await supabase.from("regulation_sync_log").insert({
        celex_number: regulation.celex,
        title: regulation.title.slice(0, 500),
        source_name: celexToSourceName(regulation.celex),
        last_modified: regulation.dateLastModified,
        chunks_ingested: 0,
        synced_at: syncedAt,
        status: "error",
        error_message: message.slice(0, 1000),
      });
    }
  }

  console.log(
    `[regulation-sync] Done: ${result.regulationsProcessed} processed, ` +
      `${result.regulationsSkipped} skipped, ${result.errors.length} errors, ` +
      `${result.chunksCreated} total chunks`
  );

  return result;
}
