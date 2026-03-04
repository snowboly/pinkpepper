import { createAdminClient } from "@/utils/supabase/admin";
import { SubscriptionTier } from "@/lib/tier";

// ============================================================
// Bucket names
// ============================================================

export const BUCKETS = {
  vault: "user-vault",        // Plus/Pro persistent storage
  temp: "temp-uploads",       // All tiers — 72h ephemeral
  review: "review-attachments", // Review request docs
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

// ============================================================
// Limits
// ============================================================

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,    // 10 MB
  document: 25 * 1024 * 1024, // 25 MB
} as const;

// Per-tier total storage quota in bytes
export const STORAGE_QUOTAS: Record<SubscriptionTier, number> = {
  free: 50 * 1024 * 1024,    // 50 MB
  plus: 200 * 1024 * 1024,   // 200 MB
  pro: 500 * 1024 * 1024,    // 500 MB
};

// Signed URL expiry in seconds
const SIGNED_URL_EXPIRY = 60;

// Temp file TTL in hours
const TEMP_EXPIRY_HOURS = 72;

// ============================================================
// Helpers
// ============================================================

function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

function maxSizeForMime(mime: string): number {
  return isImageMime(mime) ? MAX_FILE_SIZES.image : MAX_FILE_SIZES.document;
}

/** Returns the total bytes used by a user across non-deleted files. */
export async function getUserStorageUsed(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("files")
    .select("size_bytes")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) throw new Error(`Failed to query storage usage: ${error.message}`);
  const rows = (data ?? []) as Array<{ size_bytes: number }>;
  return rows.reduce((sum, row) => sum + (row.size_bytes ?? 0), 0);
}

// ============================================================
// Upload
// ============================================================

export type UploadOptions = {
  conversationId?: string;
  reviewRequestId?: string;
  /** Force-set expires_at (ISO string). Defaults to 72h for temp bucket. */
  expiresAt?: string;
};

/**
 * Validate, upload, and record a file.
 * Returns the inserted `files` row id.
 */
export async function uploadFile(
  userId: string,
  tier: SubscriptionTier,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  bucket: BucketName,
  opts: UploadOptions = {}
): Promise<string> {
  // MIME validation
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`File type not allowed: ${mimeType}`);
  }

  // Size validation
  const maxSize = maxSizeForMime(mimeType);
  if (fileBuffer.byteLength > maxSize) {
    throw new Error(
      `File too large. Max ${maxSize / (1024 * 1024)} MB for this type.`
    );
  }

  // Quota check
  const used = await getUserStorageUsed(userId);
  const quota = STORAGE_QUOTAS[tier];
  if (used + fileBuffer.byteLength > quota) {
    throw new Error(
      `Storage quota exceeded. Tier ${tier} allows ${quota / (1024 * 1024)} MB total.`
    );
  }

  const admin = createAdminClient();
  const fileId = crypto.randomUUID();
  const storagePath = `${userId}/${fileId}/${fileName}`;

  // Upload to object storage
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // Determine expiry
  let expiresAt: string | null = opts.expiresAt ?? null;
  if (!expiresAt && bucket === BUCKETS.temp) {
    const exp = new Date();
    exp.setHours(exp.getHours() + TEMP_EXPIRY_HOURS);
    expiresAt = exp.toISOString();
  }

  // Insert metadata — cast required because admin client has no generated types
  const insertPayload = {
    id: fileId,
    user_id: userId,
    conversation_id: opts.conversationId ?? null,
    file_name: fileName,
    file_type: mimeType,
    size_bytes: fileBuffer.byteLength,
    storage_path: storagePath,
    bucket,
    expires_at: expiresAt,
  };
  const { data: row, error: insertError } = await admin
    .from("files")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertPayload as any)
    .select("id")
    .single();

  if (insertError || !row) {
    // Best-effort cleanup of the uploaded object
    await admin.storage.from(bucket).remove([storagePath]);
    throw new Error(`Metadata insert failed: ${insertError?.message ?? "no row returned"}`);
  }

  return (row as { id: string }).id;
}

// ============================================================
// Download (signed URL)
// ============================================================

/**
 * Returns a short-lived signed URL for a file.
 * Verifies ownership before issuing the URL.
 */
export async function getSignedUrl(
  fileId: string,
  userId: string
): Promise<string> {
  const admin = createAdminClient();

  type FileRow = { storage_path: string; bucket: string; deleted_at: string | null };

  const { data: rawFile, error: fetchError } = await admin
    .from("files")
    .select("storage_path, bucket, deleted_at")
    .eq("id", fileId)
    .eq("user_id", userId)
    .single();

  const file = rawFile as FileRow | null;
  if (fetchError || !file) {
    throw new Error("File not found or access denied.");
  }
  if (file.deleted_at) {
    throw new Error("File has been deleted.");
  }

  const { data, error: urlError } = await admin.storage
    .from(file.bucket)
    .createSignedUrl(file.storage_path, SIGNED_URL_EXPIRY);

  if (urlError || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${urlError?.message}`);
  }

  return data.signedUrl;
}

// ============================================================
// Delete
// ============================================================

/**
 * Soft-deletes the metadata record and removes the object from storage.
 * Verifies ownership before acting.
 */
export async function deleteFile(fileId: string, userId: string): Promise<void> {
  const admin = createAdminClient();

  type FileRow = { storage_path: string; bucket: string; deleted_at: string | null };

  const { data: rawFile, error: fetchError } = await admin
    .from("files")
    .select("storage_path, bucket, deleted_at")
    .eq("id", fileId)
    .eq("user_id", userId)
    .single();

  const file = rawFile as FileRow | null;
  if (fetchError || !file) {
    throw new Error("File not found or access denied.");
  }
  if (file.deleted_at) return; // Already deleted

  // Soft-delete metadata first
  const { error: updateError } = await admin
    .from("files")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", fileId);

  if (updateError) {
    throw new Error(`Failed to delete file record: ${updateError.message}`);
  }

  // Remove from object storage
  await admin.storage
    .from(file.bucket)
    .remove([file.storage_path]);
}

// ============================================================
// Expiry purge (for cron / edge function)
// ============================================================

/**
 * Deletes all expired temp files from storage and hard-deletes their metadata rows.
 * Intended to be called by a scheduled job.
 */
export async function purgeExpiredFiles(): Promise<{ purged: number }> {
  const admin = createAdminClient();

  type ExpiredRow = { id: string; storage_path: string; bucket: string };

  const { data: rawExpired, error } = await admin
    .from("files")
    .select("id, storage_path, bucket")
    .lt("expires_at", new Date().toISOString())
    .is("deleted_at", null);

  if (error) throw new Error(`Failed to fetch expired files: ${error.message}`);
  const expired = (rawExpired ?? []) as ExpiredRow[];
  if (expired.length === 0) return { purged: 0 };

  // Group by bucket for batch removal
  const byBucket: Record<string, string[]> = {};
  for (const f of expired) {
    (byBucket[f.bucket] ??= []).push(f.storage_path);
  }
  for (const [bucket, paths] of Object.entries(byBucket)) {
    await admin.storage.from(bucket).remove(paths);
  }

  // Hard-delete metadata rows
  const ids = expired.map((f) => f.id);
  await admin.from("files").delete().in("id", ids);

  return { purged: ids.length };
}
