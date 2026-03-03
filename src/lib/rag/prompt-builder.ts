import type { KnowledgeChunk } from "./retriever";

export type RAGMode = "qa" | "document" | "audit";

const MODE_TEMPERATURES: Record<RAGMode, number> = {
  qa: 0.1,      // Factual accuracy from retrieved docs
  document: 0.2, // Slight creativity for natural language
  audit: 0.0,   // Maximum precision for compliance checks
};

const SYSTEM_PROMPT_BASE = `You are PinkPepper, an AI food safety assistant for EU and UK businesses.

CRITICAL RULES:
1. Only answer from the provided context documents
2. If information is not in context, say "I don't have specific guidance on this in my knowledge base"
3. Always cite your sources using [Source: document name, section]
4. Never speculate about regulatory requirements
5. For certification-specific questions, clarify which standard applies
6. Be precise with regulation numbers and article references
7. When multiple regulations apply, explain how they relate`;

/**
 * Format retrieved chunks into context for the LLM
 */
export function formatContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant context documents found.";
  }

  return chunks
    .map((chunk, index) => {
      const sectionInfo = chunk.section_ref ? `, ${chunk.section_ref}` : "";
      const header = `[Document ${index + 1}: ${chunk.source_name}${sectionInfo}]`;
      return `${header}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Build the system prompt with retrieved context
 */
export function buildRAGSystemPrompt(
  chunks: KnowledgeChunk[],
  mode: RAGMode = "qa"
): string {
  const contextSection = formatContext(chunks);

  const modeInstructions = getModeInstructions(mode);

  return `${SYSTEM_PROMPT_BASE}

${modeInstructions}

CONTEXT DOCUMENTS:
${contextSection}`;
}

/**
 * Get mode-specific instructions
 */
function getModeInstructions(mode: RAGMode): string {
  switch (mode) {
    case "audit":
      return `MODE: AUDIT CHECK
- Be extremely precise with regulatory requirements
- Highlight any gaps or compliance concerns
- Reference exact clauses and articles
- Do not make assumptions about compliance status`;

    case "document":
      return `MODE: DOCUMENT GENERATION
- Generate structured, professional documentation
- Use appropriate headings and formatting
- Include all required elements based on context
- Make content actionable and clear for food business operators`;

    case "qa":
    default:
      return `MODE: Q&A
- Provide clear, direct answers
- Explain regulatory context when helpful
- Offer practical guidance where appropriate
- Be concise but thorough`;
  }
}

/**
 * Build a complete RAG prompt for the chat API
 */
export function buildRAGPrompt(
  userMessage: string,
  chunks: KnowledgeChunk[],
  mode: RAGMode = "qa"
): { systemPrompt: string; temperature: number } {
  return {
    systemPrompt: buildRAGSystemPrompt(chunks, mode),
    temperature: MODE_TEMPERATURES[mode],
  };
}

/**
 * Extract source references from LLM response for display
 */
export function extractSourceReferences(
  response: string,
  chunks: KnowledgeChunk[]
): KnowledgeChunk[] {
  // Find all [Source: ...] references in the response
  const sourcePattern = /\[Source:\s*([^\]]+)\]/gi;
  const matches = response.matchAll(sourcePattern);
  const referencedSources = new Set<string>();

  for (const match of matches) {
    referencedSources.add(match[1].toLowerCase().trim());
  }

  // Match back to original chunks
  return chunks.filter((chunk) => {
    const chunkRef = chunk.source_name.toLowerCase();
    for (const ref of referencedSources) {
      if (ref.includes(chunkRef) || chunkRef.includes(ref.split(",")[0].trim())) {
        return true;
      }
    }
    return false;
  });
}

export { MODE_TEMPERATURES };
