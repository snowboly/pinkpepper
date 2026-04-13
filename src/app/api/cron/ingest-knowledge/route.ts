import { buildChunkMetadata } from "@/lib/rag/source-taxonomy";
import { replaceKnowledgeChunksForSource } from "@/lib/rag/knowledge-ingestion";
import { createAdminClient } from "@/utils/supabase/admin";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const EMBEDDING_MODEL = "text-embedding-ada-002";
const BATCH_SIZE = 10;

const SOURCE_TYPE_PATTERNS: Record<string, RegExp> = {
  regulation: /regulations?|ec[\s-]?\d+|directive/i,
  guidance: /guidance|fsa|guide/i,
  template: /template|form|log|checklist/i,
  certification: /brcgs|sqf|ifs|fssc|certification/i,
  best_practice: /best[\s-]?practice|procedure|sop/i,
};

type SourceType = "regulation" | "guidance" | "template" | "certification" | "best_practice";

function detectSourceType(filePath: string): SourceType {
  for (const [type, pattern] of Object.entries(SOURCE_TYPE_PATTERNS)) {
    if (pattern.test(filePath)) return type as SourceType;
  }
  return "guidance";
}

function extractSourceName(filePath: string): string {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text: string): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.trim().length > 50);
}

function extractSectionRef(content: string): string | null {
  const patterns = [
    /Article\s+\d+(\.\d+)?/i,
    /Clause\s+\d+(\.\d+)*/i,
    /Section\s+\d+(\.\d+)*/i,
    /Annex\s+[IVX]+/i,
    /Chapter\s+\d+/i,
    /Part\s+\d+/i,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  return null;
}

async function ingestFile(
  filePath: string,
  openai: OpenAI,
  supabase: ReturnType<typeof createAdminClient>
) {
  const text = await fs.promises.readFile(filePath, "utf-8");
  const sourceType = detectSourceType(filePath);
  const sourceName = extractSourceName(filePath);
  const rawChunks = chunkText(text);

  const chunks = rawChunks.map((content) => ({
    content,
    sourceType,
    sourceName,
    sectionRef: extractSectionRef(content),
    metadata: {
      originalFile: path.basename(filePath),
      processedAt: new Date().toISOString(),
      ...buildChunkMetadata(filePath),
    },
  }));

  const rows: Array<{
    content: string;
    embedding: string;
    source_type: string;
    source_name: string;
    section_ref: string | null;
    metadata: Record<string, unknown>;
  }> = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch.map((c) => c.content),
    });
    for (let j = 0; j < batch.length; j++) {
      rows.push({
        content: batch[j].content,
        embedding: JSON.stringify(response.data[j].embedding),
        source_type: batch[j].sourceType,
        source_name: batch[j].sourceName,
        section_ref: batch[j].sectionRef,
        metadata: batch[j].metadata,
      });
    }
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  await replaceKnowledgeChunksForSource(supabase as never, {
    sourceType,
    sourceName,
    rows,
    batchSize: 100,
  });

  return { file: path.basename(filePath), chunks: rows.length, sourceName };
}

/**
 * Cron endpoint to ingest new knowledge documents into the RAG database.
 * Protected by CRON_SECRET — trigger manually from the Vercel dashboard.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetFiles = [
    "knowledge-docs/certification/FSSC-22000-food-safety-summary.md",
    "knowledge-docs/certification/IFS-food-standard-summary.md",
  ];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const supabase = createAdminClient();

  const results = [];
  const errors = [];

  for (const relPath of targetFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      errors.push({ file: relPath, error: "File not found" });
      continue;
    }
    try {
      results.push(await ingestFile(fullPath, openai, supabase));
    } catch (err) {
      errors.push({ file: relPath, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return Response.json({ ok: true, results, errors });
}
