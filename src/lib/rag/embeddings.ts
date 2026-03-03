import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-ada-002";
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export type EmbeddingResult = {
  embedding: number[];
  tokenCount: number;
};

/**
 * Generate embedding for a single text input
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  });

  return {
    embedding: response.data[0].embedding,
    tokenCount: response.usage.total_tokens,
  };
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (texts.length === 0) return [];

  const trimmedTexts = texts.map((t) => t.trim());

  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: trimmedTexts,
  });

  const avgTokens = Math.ceil(response.usage.total_tokens / texts.length);

  return response.data.map((item) => ({
    embedding: item.embedding,
    tokenCount: avgTokens,
  }));
}

/**
 * Validate embedding dimensions
 */
export function isValidEmbedding(embedding: number[]): boolean {
  return Array.isArray(embedding) && embedding.length === EMBEDDING_DIMENSIONS;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
