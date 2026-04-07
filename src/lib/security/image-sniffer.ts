/**
 * Magic-byte sniffing for user-uploaded images.
 *
 * Why
 * ---
 * `File.type` in multipart/form-data is the **client-supplied** MIME. A
 * malicious uploader can claim `image/jpeg` while the actual bytes are an
 * HTML document, an SVG with `<script>`, a ZIP polyglot, or a crafted file
 * aimed at a downstream parser. We must not trust that header when:
 *   1. gating which files are allowed into our vision pipeline, or
 *   2. building a `data:<mime>;base64,...` URL that is forwarded to the
 *      OpenAI vision endpoint (which dispatches its own parser by MIME).
 *
 * This helper inspects the first few bytes and returns the canonical MIME
 * only when the signature matches one of the four formats our product
 * supports. Anything else is rejected up front.
 *
 * We intentionally keep the allowlist tight: JPEG, PNG, GIF, WEBP. No SVG
 * (XML/JS payload surface), no BMP/TIFF/HEIC (inconsistent decoder
 * support), no generic `application/octet-stream` fallback.
 */

export type SniffedImageMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export type ImageSniffResult =
  | { ok: true; mime: SniffedImageMime }
  | { ok: false; reason: string };

/** Minimum bytes needed to make a reliable decision for any supported format. */
const MIN_HEADER_BYTES = 16;

/**
 * Inspect the leading bytes of `buffer` and return the detected image MIME.
 * Never trust the caller's claimed MIME for any security decision — use the
 * result of this function instead.
 */
export function sniffImageMime(buffer: Uint8Array): ImageSniffResult {
  if (buffer.length < MIN_HEADER_BYTES) {
    return { ok: false, reason: "File too small to be a valid image." };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ok: true, mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ok: true, mime: "image/png" };
  }

  // GIF: "GIF87a" or "GIF89a"
  if (
    buffer[0] === 0x47 && // G
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x38 && // 8
    (buffer[4] === 0x37 || buffer[4] === 0x39) && // 7 | 9
    buffer[5] === 0x61 // a
  ) {
    return { ok: true, mime: "image/gif" };
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { ok: true, mime: "image/webp" };
  }

  return {
    ok: false,
    reason: "Unsupported image format. Only JPEG, PNG, GIF, and WEBP are accepted.",
  };
}

/**
 * Convenience: fetch bytes from a browser `File`, enforce a hard size cap,
 * sniff the format, and return both the canonical MIME and the full buffer
 * ready for base64-encoding. Callers should NOT call `file.arrayBuffer()`
 * themselves — this helper is the single validated entry point.
 */
export async function readAndSniffImageFile(
  file: File,
  maxBytes: number
): Promise<ImageSniffResult & { buffer?: Uint8Array }> {
  // Reject on reported size before we copy anything into memory; browsers
  // populate `File.size` from the multipart framing, not the client MIME,
  // so this cap is trustworthy as a DoS guard.
  if (file.size > maxBytes) {
    return { ok: false, reason: `Image must be under ${Math.floor(maxBytes / (1024 * 1024))}MB.` };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Second size check in case the stream delivered more than `file.size`
  // promised (belt-and-braces against a broken client or proxy).
  if (buffer.length > maxBytes) {
    return { ok: false, reason: `Image must be under ${Math.floor(maxBytes / (1024 * 1024))}MB.` };
  }

  const sniffed = sniffImageMime(buffer);
  if (!sniffed.ok) {
    return sniffed;
  }

  return { ...sniffed, buffer };
}
