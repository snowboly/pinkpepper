/**
 * Document parsing utilities for PDF and DOCX files.
 * Used for Phase 2: user document upload and analysis.
 */

import mammoth from "mammoth";

// pdf-parse has no named exports, use default
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export type ParsedDocument = {
  text: string;
  pageCount?: number;
  metadata?: Record<string, unknown>;
};

/**
 * Parse a PDF buffer into plain text.
 */
export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  const data = await pdfParse(buffer, {
    // Limit to 100 pages for safety
    max: 100,
  });

  return {
    text: data.text?.trim() ?? "",
    pageCount: data.numpages,
    metadata: {
      info: data.info,
    },
  };
}

/**
 * Parse a DOCX buffer into plain text.
 */
export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });

  return {
    text: result.value?.trim() ?? "",
    metadata: {
      messages: result.messages,
    },
  };
}

/**
 * Parse a document buffer based on MIME type.
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedDocument> {
  switch (mimeType) {
    case "application/pdf":
      return parsePdf(buffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return parseDocx(buffer);
    default:
      throw new Error(`Unsupported document type: ${mimeType}`);
  }
}

/**
 * Chunk text into overlapping segments for embedding.
 */
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    const chunk = chunkWords.join(" ");
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
    i += chunkSize - overlap;
  }

  return chunks;
}
