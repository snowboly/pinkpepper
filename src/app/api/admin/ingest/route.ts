import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveUserAccess } from "@/lib/access";
import { buildChunkMetadata } from "@/lib/rag/source-taxonomy";
import { replaceKnowledgeChunksForSource } from "@/lib/rag/knowledge-ingestion";
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

async function ingestFile(filePath: string, openai: OpenAI, supabase: ReturnType<typeof createAdminClient>) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".md" && ext !== ".txt") {
    return { file: path.basename(filePath), skipped: true, reason: "unsupported format" };
  }

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

  // Generate embeddings in batches
  const chunksWithEmbeddings: Array<{ chunk: (typeof chunks)[0]; embedding: number[] }> = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch.map((c) => c.content),
    });
    for (let j = 0; j < batch.length; j++) {
      chunksWithEmbeddings.push({ chunk: batch[j], embedding: response.data[j].embedding });
    }
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const rows = chunksWithEmbeddings.map(({ chunk, embedding }) => ({
    content: chunk.content,
    embedding: JSON.stringify(embedding),
    source_type: chunk.sourceType,
    source_name: chunk.sourceName,
    section_ref: chunk.sectionRef,
    metadata: chunk.metadata,
  }));

  await replaceKnowledgeChunksForSource(supabase as never, {
    sourceType,
    sourceName,
    rows,
    batchSize: 100,
  });

  return { file: path.basename(filePath), chunks: rows.length, sourceName, sourceType };
}

export async function POST(request: Request) {
  // Auth check — admin only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { isAdmin } = resolveUserAccess(profile, user.email, null);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse optional list of specific files to ingest
  const body = await request.json().catch(() => ({}));
  const requestedFiles: string[] = body.files ?? [
    "knowledge-docs/certification/FSSC-22000-food-safety-summary.md",
    "knowledge-docs/certification/IFS-food-standard-summary.md",
  ];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const adminSupabase = createAdminClient();

  const results = [];
  const errors = [];

  for (const relPath of requestedFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      errors.push({ file: relPath, error: "File not found" });
      continue;
    }
    try {
      const result = await ingestFile(fullPath, openai, adminSupabase);
      results.push(result);
    } catch (err) {
      errors.push({ file: relPath, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ ok: true, results, errors });
}
