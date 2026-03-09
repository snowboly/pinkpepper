/**
 * Knowledge Ingestion Script for PinkPepper RAG
 *
 * This script processes food safety documents and ingests them into the
 * knowledge_chunks table for RAG retrieval.
 *
 * Usage:
 *   npx tsx scripts/ingest-knowledge.ts <source-dir>
 *
 * Environment variables required:
 *   - OPENAI_API_KEY: For generating embeddings
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Service role key for database writes
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

// Configuration
const CHUNK_SIZE = 500; // Target tokens per chunk
const CHUNK_OVERLAP = 50; // Overlap between chunks
const EMBEDDING_MODEL = "text-embedding-ada-002";
const BATCH_SIZE = 10; // Embeddings per batch request

// Source type mapping based on file path patterns
const SOURCE_TYPE_PATTERNS: Record<string, RegExp> = {
  regulation: /regulations?|ec[\s-]?\d+|directive/i,
  guidance: /guidance|fsa|guide/i,
  template: /template|form|log|checklist/i,
  certification: /brcgs|sqf|ifs|fssc|certification/i,
  best_practice: /best[\s-]?practice|procedure|sop/i,
};

type SourceType = "regulation" | "guidance" | "template" | "certification" | "best_practice";

type DocumentChunk = {
  content: string;
  sourceType: SourceType;
  sourceName: string;
  sectionRef: string | null;
  metadata: Record<string, unknown>;
};

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Detect source type from file path
 */
function detectSourceType(filePath: string): SourceType {
  for (const [type, pattern] of Object.entries(SOURCE_TYPE_PATTERNS)) {
    if (pattern.test(filePath)) {
      return type as SourceType;
    }
  }
  return "guidance"; // Default
}

/**
 * Extract source name from file path
 */
function extractSourceName(filePath: string): string {
  const basename = path.basename(filePath, path.extname(filePath));
  // Clean up common patterns
  return basename
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Simple text chunking with overlap
 * In production, use a proper tokenizer like tiktoken
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
 * Extract section references from chunk content
 */
function extractSectionRef(content: string): string | null {
  // Look for common patterns like "Article 5", "Clause 3.4.1", "Annex II"
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
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Read and parse a text file
 */
async function readTextFile(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, "utf-8");
}

/**
 * Parse a PDF file into plain text
 */
async function readPdfFile(filePath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const buffer = await fs.promises.readFile(filePath);
  const data = await pdfParse(buffer, { max: 200 });
  return data.text?.trim() ?? "";
}

/**
 * Parse a DOCX file into plain text
 */
async function readDocxFile(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await fs.promises.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value?.trim() ?? "";
}

/**
 * Process a single document file
 */
async function processDocument(filePath: string): Promise<DocumentChunk[]> {
  console.log(`Processing: ${filePath}`);

  const ext = path.extname(filePath).toLowerCase();
  let text: string;

  if (ext === ".txt" || ext === ".md") {
    text = await readTextFile(filePath);
  } else if (ext === ".pdf") {
    text = await readPdfFile(filePath);
  } else if (ext === ".docx") {
    text = await readDocxFile(filePath);
  } else {
    console.log(`  Skipping unsupported format: ${ext}`);
    return [];
  }

  const sourceType = detectSourceType(filePath);
  const sourceName = extractSourceName(filePath);
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);

  console.log(`  Source type: ${sourceType}`);
  console.log(`  Source name: ${sourceName}`);
  console.log(`  Chunks created: ${chunks.length}`);

  return chunks.map((content) => ({
    content,
    sourceType,
    sourceName,
    sectionRef: extractSectionRef(content),
    metadata: {
      originalFile: path.basename(filePath),
      processedAt: new Date().toISOString(),
    },
  }));
}

/**
 * Generate embeddings for chunks in batches
 */
async function generateEmbeddings(chunks: DocumentChunk[]): Promise<Array<{ chunk: DocumentChunk; embedding: number[] }>> {
  const results: Array<{ chunk: DocumentChunk; embedding: number[] }> = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const contents = batch.map((c) => c.content);

    console.log(`  Generating embeddings ${i + 1}-${Math.min(i + BATCH_SIZE, chunks.length)} of ${chunks.length}`);

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: contents,
    });

    for (let j = 0; j < batch.length; j++) {
      results.push({
        chunk: batch[j],
        embedding: response.data[j].embedding,
      });
    }

    // Rate limiting
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Insert chunks into the database
 */
async function insertChunks(
  chunksWithEmbeddings: Array<{ chunk: DocumentChunk; embedding: number[] }>
): Promise<void> {
  console.log(`  Inserting ${chunksWithEmbeddings.length} chunks into database...`);

  const rows = chunksWithEmbeddings.map(({ chunk, embedding }) => ({
    content: chunk.content,
    embedding: JSON.stringify(embedding),
    source_type: chunk.sourceType,
    source_name: chunk.sourceName,
    section_ref: chunk.sectionRef,
    metadata: chunk.metadata,
  }));

  // Insert in batches to avoid payload limits
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from("knowledge_chunks").insert(batch);

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }
  }

  console.log(`  Successfully inserted ${rows.length} chunks`);
}

/**
 * Process all documents in a directory
 */
async function processDirectory(dirPath: string): Promise<void> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      try {
        const chunks = await processDocument(fullPath);
        if (chunks.length > 0) {
          const withEmbeddings = await generateEmbeddings(chunks);
          await insertChunks(withEmbeddings);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  const sourceDir = process.argv[2];

  if (!sourceDir) {
    console.error("Usage: npx tsx scripts/ingest-knowledge.ts <source-dir>");
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable not set");
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Error: Supabase environment variables not set");
    process.exit(1);
  }

  const resolvedPath = path.resolve(sourceDir);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: Directory not found: ${resolvedPath}`);
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("PinkPepper Knowledge Ingestion");
  console.log("=".repeat(60));
  console.log(`Source directory: ${resolvedPath}`);
  console.log(`Chunk size: ${CHUNK_SIZE} words`);
  console.log(`Chunk overlap: ${CHUNK_OVERLAP} words`);
  console.log("");

  const startTime = Date.now();

  await processDirectory(resolvedPath);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("");
  console.log("=".repeat(60));
  console.log(`Ingestion complete in ${duration}s`);
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
