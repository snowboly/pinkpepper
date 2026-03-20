/**
 * Regulation Sync Orchestrator
 *
 * Fetches new/amended EU food safety regulations from the EUR-Lex CELLAR API,
 * chunks and embeds them, and upserts into the knowledge_chunks table.
 *
 * Designed to run as a monthly Vercel Cron job.
 */

import { createHash } from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateEmbeddings } from "@/lib/rag/embeddings";
import type { Json } from "@/types/database.types";
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
export { DEFAULT_SINCE_DATE };

export type SyncResult = {
  regulationsProcessed: number;
  regulationsSkipped: number;
  chunksCreated: number;
  errors: Array<{ celex: string; error: string }>;
  syncedAt: string;
  loggingAvailable: boolean;
};

type SyncLogInsert = {
  celex_number: string;
  title: string;
  source_name: string;
  last_modified?: string | null;
  content_hash?: string;
  chunks_ingested: number;
  synced_at: string;
  status: string;
  error_message?: string;
  metadata?: Json;
};

type HealthRow = {
  source_name: string;
  metadata: Json | null;
  updated_at: string;
};

type SyncHealthSummary = {
  regulationChunkCount: number;
  logTableAvailable: boolean;
  latestSyncedAt: string | null;
  canonicalSourceCount: number;
  legacySourceCount: number;
  distinctSources: string[];
  defaultSinceDate: string;
};

function extractMetadataDate(metadata: Json | null): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const syncedAt = metadata.syncedAt;
  if (typeof syncedAt === "string") return syncedAt;
  const processedAt = metadata.processedAt;
  return typeof processedAt === "string" ? processedAt : null;
}

function hasCanonicalCelex(metadata: Json | null): boolean {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
  return typeof metadata.celexNumber === "string";
}

export function summarizeRegulationSyncHealth(
  rows: HealthRow[],
  logTableAvailable: boolean
): SyncHealthSummary {
  const distinctSources = [...new Set(rows.map((row) => row.source_name))].sort();
  const latestSyncedAt = rows
    .map((row) => extractMetadataDate(row.metadata) ?? row.updated_at)
    .sort()
    .at(-1) ?? null;

  return {
    regulationChunkCount: rows.length,
    logTableAvailable,
    latestSyncedAt,
    canonicalSourceCount: rows.filter((row) => hasCanonicalCelex(row.metadata)).length,
    legacySourceCount: rows.filter((row) => !hasCanonicalCelex(row.metadata)).length,
    distinctSources,
    defaultSinceDate: DEFAULT_SINCE_DATE,
  };
}

function isMissingSyncLogTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  const message = "message" in error ? String(error.message) : "";
  return code === "PGRST205" || /regulation_sync_log/i.test(message) && /schema cache|does not exist/i.test(message);
}

export async function writeSyncLogEntry(
  supabase: ReturnType<typeof createAdminClient>,
  payload: SyncLogInsert
): Promise<boolean> {
  const { error } = await supabase.from("regulation_sync_log").insert(payload);
  if (!error) return true;
  if (isMissingSyncLogTableError(error)) {
    return false;
  }
  throw new Error(String("message" in error ? error.message : error));
}

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

  const { data, error } = await supabase
    .from("regulation_sync_log")
    .select("synced_at")
    .eq("status", "success")
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && isMissingSyncLogTableError(error)) {
    return DEFAULT_SINCE_DATE;
  }

  if (data?.synced_at) {
    return new Date(data.synced_at).toISOString().split("T")[0];
  }

  return DEFAULT_SINCE_DATE;
}

/**
 * SHA-256 hash of regulation text — used to detect amendments
 * even when the last_modified date hasn't changed.
 */
function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * Check if a regulation has already been synced with an identical content hash.
 * Falls back to last_modified comparison if no hash is stored yet.
 *
 * Queries by both the exact consolidated CELEX and the base CELEX number,
 * because the consolidated suffix (date) changes whenever EUR-Lex publishes
 * a new consolidated version — without this, every sync re-ingests everything.
 */
async function isAlreadySynced(
  celex: string,
  baseCelex: string,
  lastModified: string,
  contentHash: string
): Promise<boolean> {
  const supabase = createAdminClient();

  // Try exact consolidated CELEX first, then fall back to base CELEX prefix.
  // The base CELEX is stored in metadata->baseCelexNumber.
  const { data, error } = await supabase
    .from("regulation_sync_log")
    .select("content_hash, last_modified")
    .eq("status", "success")
    .or(`celex_number.eq.${celex},celex_number.like.${baseCelex}%`)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && isMissingSyncLogTableError(error)) {
    return false;
  }
  if (error) {
    throw new Error(error.message);
  }

  if (!data) return false;

  // If a hash is stored, compare hashes (catches amendments with unchanged dates)
  if (data.content_hash) return data.content_hash === contentHash;

  // Legacy: fall back to date comparison for older log entries without a hash
  return data.last_modified === lastModified;
}

/**
 * Process a single regulation: chunk, embed, and insert into DB.
 * Accepts pre-fetched text and its hash to avoid double-fetching.
 */
async function processRegulation(
  regulation: CellarRegulation,
  text: string,
  contentHash: string
): Promise<{ chunksCreated: number; contentHash: string }> {
  const supabase = createAdminClient();
  const sourceName = celexToSourceName(regulation.celex);

  // Chunk the text
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
  if (chunks.length === 0) {
    throw new Error("No chunks produced from regulation text");
  }

  // Delete existing chunks for this regulation (deduplication)
  await supabase
    .from("knowledge_chunks")
    .delete()
    .eq("source_type", "regulation")
    .in("source_name", [sourceName, ...regulation.legacyAliases]);

  // Generate embeddings in batches
  const allRows: Array<{
    content: string;
    embedding: string;
    source_type: string;
    source_name: string;
    section_ref: string | null;
    metadata: Json;
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
          baseCelexNumber: regulation.baseCelex,
          currentVersionDate: regulation.dateLastModified,
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

  return { chunksCreated: allRows.length, contentHash };
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
    loggingAvailable: true,
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
      // Fetch text first so we can hash it for amendment detection
      const text = await fetchRegulationText(regulation.celex);
      if (!text || text.length < 100) {
        throw new Error(`Regulation text too short or empty (${text.length} chars)`);
      }
      const contentHash = hashText(text);

      // Skip if already synced with identical content
      const alreadySynced = await isAlreadySynced(
        regulation.celex,
        regulation.baseCelex,
        regulation.dateLastModified,
        contentHash
      );
      if (alreadySynced) {
        result.regulationsSkipped++;
        continue;
      }

      console.log(
        `[regulation-sync] Processing: ${regulation.celex} — ${regulation.title.slice(0, 80)}`
      );

      const { chunksCreated } = await processRegulation(regulation, text, contentHash);
      result.regulationsProcessed++;
      result.chunksCreated += chunksCreated;

      // Log success
      const logged = await writeSyncLogEntry(supabase, {
        celex_number: regulation.celex,
        title: regulation.title.slice(0, 500),
        source_name: celexToSourceName(regulation.celex),
        last_modified: regulation.dateLastModified,
        content_hash: contentHash,
        chunks_ingested: chunksCreated,
        synced_at: syncedAt,
        status: "success",
        metadata: {
          baseCelexNumber: regulation.baseCelex,
          legacyAliases: regulation.legacyAliases,
        },
      });
      if (!logged) result.loggingAvailable = false;

      console.log(
        `[regulation-sync] ✓ ${regulation.celex}: ${chunksCreated} chunks ingested`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[regulation-sync] ✗ ${regulation.celex}: ${message}`);
      result.errors.push({ celex: regulation.celex, error: message });

      // Log error
      const logged = await writeSyncLogEntry(supabase, {
        celex_number: regulation.celex,
        title: regulation.title.slice(0, 500),
        source_name: celexToSourceName(regulation.celex),
        last_modified: regulation.dateLastModified,
        chunks_ingested: 0,
        synced_at: syncedAt,
        status: "error",
        error_message: message.slice(0, 1000),
        metadata: {
          baseCelexNumber: regulation.baseCelex,
          legacyAliases: regulation.legacyAliases,
        },
      });
      if (!logged) result.loggingAvailable = false;
    }
  }

  console.log(
    `[regulation-sync] Done: ${result.regulationsProcessed} processed, ` +
      `${result.regulationsSkipped} skipped, ${result.errors.length} errors, ` +
      `${result.chunksCreated} total chunks`
  );

  return result;
}

export async function getRegulationSyncHealth() {
  const supabase = createAdminClient();

  const rowsResult = await supabase
    .from("knowledge_chunks")
    .select("source_name, metadata, updated_at")
    .eq("source_type", "regulation");

  if (rowsResult.error) {
    throw new Error(`Failed to inspect regulation chunks: ${rowsResult.error.message}`);
  }

  const logProbe = await supabase
    .from("regulation_sync_log")
    .select("id")
    .limit(1);

  if (logProbe.error && !isMissingSyncLogTableError(logProbe.error)) {
    throw new Error(`Failed to inspect sync log: ${logProbe.error.message}`);
  }

  return summarizeRegulationSyncHealth(
    (rowsResult.data ?? []) as HealthRow[],
    !logProbe.error
  );
}
