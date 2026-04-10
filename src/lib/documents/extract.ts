/**
 * Server-side text extraction for user-uploaded documents.
 *
 * Trust model
 * -----------
 * NEVER trust `File.type` or the file extension — both are supplied by the
 * browser/uploader and can be spoofed. A malicious user could send a ZIP
 * polyglot labelled `application/pdf`, or an HTML file labelled
 * `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
 * and have it routed into pdf-parse / mammoth — parsers that are not
 * designed to handle adversarial input and have a long history of
 * memory/CPU DoS findings.
 *
 * We therefore sniff the first bytes of the buffer and dispatch the
 * extractor based on **detected** content only. Anything that does not
 * match one of the four supported formats (plain UTF-8 text, PDF, DOCX,
 * CSV-as-text) is rejected.
 *
 * Output text is hard-capped to prevent a crafted document from
 * generating an unbounded embeddings bill or blowing up downstream
 * prompt budgets.
 */

export type DocumentExtractionStrategy = "plain-text" | "pdf" | "docx" | "unsupported";

export type DocumentExtractionResult = {
  text: string;
  strategy: DocumentExtractionStrategy;
  warning?: string;
  /** Canonical MIME detected from magic bytes (or `text/plain` for UTF-8 text). */
  detectedMime?: string;
};

/** Absolute upper bound on extracted plain text we will embed/store. */
export const MAX_EXTRACTED_TEXT_CHARS = 200_000;

/** Minimum bytes required before we attempt to sniff. */
const MIN_SNIFF_BYTES = 8;

type SniffedKind = "pdf" | "docx-or-zip" | "utf8-text" | "unknown";

function sniffKind(buffer: Uint8Array): SniffedKind {
  if (buffer.length < MIN_SNIFF_BYTES) return "unknown";

  // PDF: "%PDF-"
  if (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d // -
  ) {
    return "pdf";
  }

  // ZIP container (DOCX is a ZIP): "PK\x03\x04" (also PK\x05\x06 empty,
  // PK\x07\x08 spanned — we accept the canonical local-file-header form).
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return "docx-or-zip";
  }

  // Heuristic for plain UTF-8 text: no NUL bytes in the first 512 bytes,
  // and every byte is either printable ASCII, whitespace, or part of a
  // valid UTF-8 continuation. This intentionally rejects binary blobs
  // (images, office binaries, executables) that were mislabelled as text.
  const scanLen = Math.min(buffer.length, 512);
  for (let i = 0; i < scanLen; i++) {
    const b = buffer[i];
    if (b === 0x00) return "unknown";
  }
  // TextDecoder with fatal=true will throw on invalid UTF-8.
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, scanLen));
    return "utf8-text";
  } catch {
    return "unknown";
  }
}

export function detectDocumentMimeFromBytes(bytes: Uint8Array): string | null {
  switch (sniffKind(bytes)) {
    case "pdf":
      return "application/pdf";
    case "docx-or-zip":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "utf8-text":
      return "text/plain";
    case "unknown":
    default:
      return null;
  }
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function capText(value: string): { text: string; truncated: boolean } {
  if (value.length <= MAX_EXTRACTED_TEXT_CHARS) {
    return { text: value, truncated: false };
  }
  return { text: value.slice(0, MAX_EXTRACTED_TEXT_CHARS), truncated: true };
}

async function extractFromPdf(buffer: Buffer): Promise<DocumentExtractionResult> {
  try {
    // Dynamic import avoids bundler issues with pdf-parse test fixtures
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
      buf: Buffer,
      opts?: { max?: number }
    ) => Promise<{ text: string; numpages?: number }>;
    // Cap pages parsed — pdf-parse accepts a `max` option and bails out
    // after N pages. This is our primary defence against a "PDF bomb"
    // (millions of empty pages, deeply nested objects, etc.).
    const result = await pdfParse(buffer, { max: 200 });
    const { text, truncated } = capText(normalizeWhitespace(result.text ?? ""));
    return {
      text,
      strategy: "pdf",
      detectedMime: "application/pdf",
      warning: truncated ? "Extracted text was truncated at the configured limit." : undefined,
    };
  } catch (e) {
    console.error("PDF extraction failed:", e);
    return { text: "", strategy: "unsupported", warning: "Failed to extract text from PDF." };
  }
}

async function extractFromDocx(buffer: Buffer): Promise<DocumentExtractionResult> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const { text, truncated } = capText(normalizeWhitespace(result.value ?? ""));
    return {
      text,
      strategy: "docx",
      detectedMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      warning: truncated ? "Extracted text was truncated at the configured limit." : undefined,
    };
  } catch (e) {
    // A ZIP that is not a DOCX (or a malformed DOCX) will land here.
    // We intentionally treat that as unsupported rather than falling back.
    console.error("DOCX extraction failed:", e);
    return { text: "", strategy: "unsupported", warning: "Failed to extract text from DOCX." };
  }
}

function extractFromUtf8(buffer: Uint8Array): DocumentExtractionResult {
  try {
    const raw = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    const { text, truncated } = capText(normalizeWhitespace(raw));
    return {
      text,
      strategy: "plain-text",
      detectedMime: "text/plain",
      warning: truncated ? "Extracted text was truncated at the configured limit." : undefined,
    };
  } catch {
    return { text: "", strategy: "unsupported", warning: "File is not valid UTF-8 text." };
  }
}

/**
 * Extract text from a browser `File`. Dispatch is based on magic-byte
 * sniffing only — `file.type` and `file.name` are not trusted.
 */
export async function extractDocumentText(file: File): Promise<DocumentExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.length === 0) {
    return { text: "", strategy: "unsupported", warning: "Empty file." };
  }

  const kind = sniffKind(bytes);
  switch (kind) {
    case "pdf":
      return extractFromPdf(Buffer.from(bytes));
    case "docx-or-zip":
      return extractFromDocx(Buffer.from(bytes));
    case "utf8-text":
      return extractFromUtf8(bytes);
    case "unknown":
    default:
      return {
        text: "",
        strategy: "unsupported",
        warning: "Unsupported file format. Upload a PDF, DOCX, or plain-text file.",
      };
  }
}
