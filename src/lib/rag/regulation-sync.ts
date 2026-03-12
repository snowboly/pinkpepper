import { createAdminClient } from "@/utils/supabase/admin";

export type SyncStatus = "success" | "failure";

export type RegulationSyncLogEntry = {
  id: string;
  synced_at: string;
  status: SyncStatus;
  source_name: string | null;
  chunks_upserted: number | null;
  error_message: string | null;
  created_at: string;
};

/**
 * Get the timestamp of the most recent successful regulation sync.
 * Returns null if no successful sync has been recorded.
 */
export async function getLastSuccessfulSyncDate(): Promise<Date | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("regulation_sync_log")
    .select("synced_at")
    .eq("status", "success")
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return new Date(data.synced_at);
}

/**
 * Record the outcome of a regulation sync run.
 */
export async function logSyncResult(params: {
  status: SyncStatus;
  source_name?: string;
  chunks_upserted?: number;
  error_message?: string;
}): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("regulation_sync_log").insert({
    status: params.status,
    source_name: params.source_name ?? null,
    chunks_upserted: params.chunks_upserted ?? null,
    error_message: params.error_message ?? null,
  });

  if (error) {
    console.error("Failed to log regulation sync result:", error);
  }
}

/**
 * Check whether a new sync is needed based on a staleness threshold.
 * @param maxAgeMs Maximum acceptable age in milliseconds (default: 7 days)
 */
export async function isSyncStale(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<boolean> {
  const lastSync = await getLastSuccessfulSyncDate();
  if (!lastSync) return true;
  return Date.now() - lastSync.getTime() > maxAgeMs;
}
