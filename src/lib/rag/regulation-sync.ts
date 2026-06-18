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
import { buildChunkMetadata } from "@/lib/rag/source-taxonomy";
import { activateVersionedKnowledgeChunks } from "@/lib/rag/knowledge-ingestion";
import type { Json } from "@/types/database.types";
import {
  searchFoodSafetyRegulations,
  discoverNewRegulations,
  discoverEuOfficialJournalRegulations,
  discoverUkRegulations,
  fetchRegulationText,
  fetchUkLegislationText,
  getManualBackfillRegulations,
  celexToSourceName,
  normalizeLegislationTitle,
  MIN_REGULATION_TEXT_CHARS,
  type CellarRegulation,
} from "@/lib/rag/cellar-client";

// Chunking config — matches scripts/ingest-knowledge.ts
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const EMBEDDING_BATCH_SIZE = 10;
const EMBEDDING_BATCH_DELAY_MS = 200;
const SYNC_PROCESSING_BUDGET_MS = 240_000;

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
  completed: boolean;
  stoppedEarly: boolean;
  remainingRegulations: number;
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

type RegulationMetadataInput = Pick<
  CellarRegulation,
  "celex" | "baseCelex" | "title" | "dateDocument" | "dateLastModified"
> &
  Partial<
    Pick<
      CellarRegulation,
      "jurisdiction" | "sourceKey" | "versionKey" | "officialUrl" | "textUrl" | "actType"
    >
  >;

type KnowledgeCleanupRow = {
  id: string;
  source_type: string;
  source_name: string;
  metadata: Record<string, unknown> | null;
};

export function buildKnowledgeCleanupPlan(rows: KnowledgeCleanupRow[]): {
  archiveIds: string[];
  titleUpdates: Array<{ id: string; sourceName: string }>;
} {
  const archiveIds: string[] = [];
  const titleUpdates: Array<{ id: string; sourceName: string }> = [];

  for (const row of rows) {
    if (row.source_type !== "regulation") continue;

    const metadata = row.metadata ?? {};
    if ((metadata.retrieval_status ?? "active") !== "active") continue;

    if (!metadata.source_key || /\brevoked\b/i.test(row.source_name)) {
      archiveIds.push(row.id);
      continue;
    }

    if (/^\s*<div\b/i.test(row.source_name)) {
      const sourceName = normalizeLegislationTitle(row.source_name);
      if (sourceName && sourceName !== row.source_name) {
        titleUpdates.push({ id: row.id, sourceName });
      }
    }
  }

  return { archiveIds, titleUpdates };
}

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

export function buildRegulationChunkMetadata(
  sourceName: string,
  regulation: RegulationMetadataInput
): Json {
  const sourceKey =
    regulation.sourceKey ??
    (regulation.jurisdiction === "gb"
      ? `uk:${regulation.baseCelex.replace(/\//g, ":")}`
      : `eu:celex:${regulation.baseCelex}`);
  const versionKey =
    regulation.versionKey ??
    (regulation.jurisdiction === "gb"
      ? `${sourceKey}:${regulation.dateLastModified}`
      : `eu:celex:${regulation.celex}`);

  return {
    ...buildChunkMetadata(sourceName),
    jurisdiction: regulation.jurisdiction ?? "eu",
    source_class: "primary_law",
    retrieval_status: "active",
    source_key: sourceKey,
    version_key: versionKey,
    act_type: regulation.actType,
    official_url: regulation.officialUrl,
    text_url: regulation.textUrl,
    celexNumber: regulation.celex,
    baseCelexNumber: regulation.baseCelex,
    currentVersionDate: regulation.dateLastModified,
    originalTitle: regulation.title,
    dateDocument: regulation.dateDocument,
    syncedAt: new Date().toISOString(),
  };
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
export async function getLastCompletedSyncDate(
  supabase: ReturnType<typeof createAdminClient> = createAdminClient()
): Promise<string> {
  const { data, error } = await supabase
    .from("regulation_sync_log")
    .select("synced_at")
    .eq("celex_number", "RUN_COMPLETE")
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

export function shouldStopForTimeBudget(
  startedAtMs: number,
  nowMs: number = Date.now(),
  budgetMs: number = SYNC_PROCESSING_BUDGET_MS
): boolean {
  return nowMs - startedAtMs >= budgetMs;
}

export function shouldAdvanceSyncCursor(
  result: Pick<SyncResult, "stoppedEarly" | "errors">
): boolean {
  return !result.stoppedEarly && result.errors.length === 0;
}

export async function isVersionAlreadyActive(
  supabase: ReturnType<typeof createAdminClient>,
  sourceKey: string,
  versionKey: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("knowledge_chunks")
    .select("id")
    .eq("source_type", "regulation")
    .contains("metadata", {
      source_key: sourceKey,
      version_key: versionKey,
      retrieval_status: "active",
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to inspect active regulation version: ${error.message}`);
  }

  return Boolean(data);
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

function getRegulationSourceName(regulation: CellarRegulation): string {
  return regulation.jurisdiction === "gb" ? regulation.title : celexToSourceName(regulation.celex);
}

function getRegulationSourceKey(regulation: CellarRegulation): string {
  return regulation.sourceKey ??
    (regulation.jurisdiction === "gb"
      ? `uk:${regulation.baseCelex.replace(/\//g, ":")}`
      : `eu:celex:${regulation.baseCelex}`);
}

function getRegulationVersionKey(regulation: CellarRegulation): string {
  return regulation.versionKey ??
    (regulation.jurisdiction === "gb"
      ? `${getRegulationSourceKey(regulation)}:${regulation.dateLastModified}`
      : `eu:celex:${regulation.celex}`);
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
  const sourceName = getRegulationSourceName(regulation);

  // Chunk the text
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
  if (chunks.length === 0) {
    throw new Error("No chunks produced from regulation text");
  }

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
        metadata: buildRegulationChunkMetadata(sourceName, regulation) as Record<string, unknown>,
      });
    }

    // Rate limiting between embedding batches
    if (i + EMBEDDING_BATCH_SIZE < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, EMBEDDING_BATCH_DELAY_MS));
    }
  }

  await activateVersionedKnowledgeChunks(supabase as never, {
    sourceKey: getRegulationSourceKey(regulation),
    versionKey: getRegulationVersionKey(regulation),
    rows: allRows,
    legacySourceNames: [sourceName, ...regulation.legacyAliases],
  });

  return { chunksCreated: allRows.length, contentHash };
}

async function fetchTextForRegulation(regulation: CellarRegulation): Promise<string> {
  if (regulation.jurisdiction === "gb") {
    return fetchUkLegislationText(regulation);
  }
  return fetchRegulationText(regulation.celex);
}

/**
 * Main sync function. Searches for new/amended EU food safety regulations
 * and ingests them into the knowledge base.
 */
export async function syncRegulations(): Promise<SyncResult> {
  const supabase = createAdminClient();
  const startedAtMs = Date.now();
  const syncedAt = new Date().toISOString();

  const result: SyncResult = {
    regulationsProcessed: 0,
    regulationsSkipped: 0,
    chunksCreated: 0,
    errors: [],
    syncedAt,
    loggingAvailable: true,
    completed: false,
    stoppedEarly: false,
    remainingRegulations: 0,
  };

  // Determine sync window
  const sinceDate = await getLastCompletedSyncDate(supabase);
  console.log(`[regulation-sync] Searching for regulations published or completed since ${sinceDate}`);

  // Search CELLAR for curated seed regulations
  let seedRegulations: CellarRegulation[];
  try {
    seedRegulations = await searchFoodSafetyRegulations(sinceDate);
    const manualBackfillRegulations = getManualBackfillRegulations();
    seedRegulations.push(...manualBackfillRegulations);
    console.log(
      `[regulation-sync] Found ${seedRegulations.length} seed regulations ` +
        `(${manualBackfillRegulations.length} manual backfill entries)`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[regulation-sync] Seed search failed: ${message}`);
    result.errors.push({ celex: "SEED_SEARCH", error: message });
    return result;
  }

  // Discover new regulations via official EU and UK feeds (non-fatal).
  let discoveredRegulations: CellarRegulation[] = [];
  try {
    discoveredRegulations = await discoverNewRegulations(sinceDate);
    console.log(`[regulation-sync] Discovered ${discoveredRegulations.length} new EU regulations via Cellar SPARQL`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[regulation-sync] EU discovery failed (non-fatal): ${message}`);
    result.errors.push({ celex: "EU_DISCOVERY", error: message });
  }

  try {
    const officialJournalDiscovery = await discoverEuOfficialJournalRegulations(sinceDate);
    discoveredRegulations.push(...officialJournalDiscovery.regulations);
    console.log(
      `[regulation-sync] Discovered ${officialJournalDiscovery.regulations.length} new EU regulations ` +
        `via Official Journal (${officialJournalDiscovery.failures.length} daily-view failures)`
    );
    for (const failure of officialJournalDiscovery.failures) {
      result.errors.push({
        celex: "EU_OFFICIAL_JOURNAL",
        error: `${failure.date}: ${failure.error}`,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[regulation-sync] EU Official Journal discovery failed (non-fatal): ${message}`);
    result.errors.push({ celex: "EU_OFFICIAL_JOURNAL", error: message });
  }

  try {
    const ukDiscovery = await discoverUkRegulations(sinceDate);
    discoveredRegulations.push(...ukDiscovery.regulations);
    console.log(
      `[regulation-sync] Discovered ${ukDiscovery.regulations.length} new UK regulations ` +
        `(${ukDiscovery.failures.length} feed failures)`
    );
    for (const failure of ukDiscovery.failures) {
      result.errors.push({ celex: "UK_DISCOVERY_FEED", error: `${failure.feedUrl}: ${failure.error}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[regulation-sync] UK discovery failed (non-fatal): ${message}`);
    result.errors.push({ celex: "UK_DISCOVERY", error: message });
  }

  // Merge: seeds take priority over discovered candidates with the same source key.
  const seenSourceKeys = new Set(seedRegulations.map(getRegulationSourceKey));
  const uniqueDiscoveredRegulations = new Map<string, CellarRegulation>();
  for (const regulation of discoveredRegulations) {
    const sourceKey = getRegulationSourceKey(regulation);
    if (!seenSourceKeys.has(sourceKey)) {
      uniqueDiscoveredRegulations.set(sourceKey, regulation);
    }
  }
  const regulations = [
    ...seedRegulations,
    ...uniqueDiscoveredRegulations.values(),
  ];
  console.log(`[regulation-sync] Total: ${regulations.length} regulations to process`);

  // Process each regulation
  for (let regulationIndex = 0; regulationIndex < regulations.length; regulationIndex++) {
    if (shouldStopForTimeBudget(startedAtMs)) {
      result.stoppedEarly = true;
      result.remainingRegulations = regulations.length - regulationIndex;
      console.warn(
        `[regulation-sync] Stopping before Vercel deadline with ` +
          `${result.remainingRegulations} regulations remaining`
      );
      break;
    }

    const regulation = regulations[regulationIndex];
    try {
      const activeVersionExists = await isVersionAlreadyActive(
        supabase,
        getRegulationSourceKey(regulation),
        getRegulationVersionKey(regulation)
      );
      if (activeVersionExists) {
        result.regulationsSkipped++;
        continue;
      }

      // Fetch text first so we can hash it for amendment detection.
      // fetchRegulationText already throws if text < MIN_REGULATION_TEXT_CHARS.
      const text = await fetchTextForRegulation(regulation);
      if (!text || text.length < MIN_REGULATION_TEXT_CHARS) {
        throw new Error(`Regulation text too short (${text.length} chars)`);
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
        source_name: getRegulationSourceName(regulation),
        last_modified: regulation.dateLastModified,
        content_hash: contentHash,
        chunks_ingested: chunksCreated,
        synced_at: syncedAt,
        status: "success",
        metadata: {
          baseCelexNumber: regulation.baseCelex,
          legacyAliases: regulation.legacyAliases,
          sourceKey: getRegulationSourceKey(regulation),
          versionKey: getRegulationVersionKey(regulation),
          jurisdiction: regulation.jurisdiction ?? "eu",
          actType: regulation.actType,
          officialUrl: regulation.officialUrl,
          ...(regulation.discovered && { discovered: true }),
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
        source_name: getRegulationSourceName(regulation),
        last_modified: regulation.dateLastModified,
        chunks_ingested: 0,
        synced_at: syncedAt,
        status: "error",
        error_message: message.slice(0, 1000),
        metadata: {
          baseCelexNumber: regulation.baseCelex,
          legacyAliases: regulation.legacyAliases,
          sourceKey: getRegulationSourceKey(regulation),
          versionKey: getRegulationVersionKey(regulation),
          jurisdiction: regulation.jurisdiction ?? "eu",
          actType: regulation.actType,
          officialUrl: regulation.officialUrl,
          ...(regulation.discovered && { discovered: true }),
        },
      });
      if (!logged) result.loggingAvailable = false;
    }
  }

  result.completed = shouldAdvanceSyncCursor(result);

  if (result.completed) {
    const logged = await writeSyncLogEntry(supabase, {
      celex_number: "RUN_COMPLETE",
      title: "Regulation sync run completed",
      source_name: "regulation-sync",
      last_modified: syncedAt.slice(0, 10),
      chunks_ingested: result.chunksCreated,
      synced_at: syncedAt,
      status: "success",
      metadata: {
        sinceDate,
        regulationsProcessed: result.regulationsProcessed,
        regulationsSkipped: result.regulationsSkipped,
        remainingRegulations: result.remainingRegulations,
      },
    });
    if (!logged) result.loggingAvailable = false;
  }

  console.log(
    `[regulation-sync] Done: ${result.regulationsProcessed} processed, ` +
      `${result.regulationsSkipped} skipped, ${result.errors.length} errors, ` +
      `${result.chunksCreated} total chunks, completed=${result.completed}, ` +
      `remaining=${result.remainingRegulations}`
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
