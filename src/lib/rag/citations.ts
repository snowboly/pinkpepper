import type { KnowledgeChunk } from "./retriever";

export type Citation = {
  id: string;
  title: string;
  excerpt: string;
  sourceType: string;
  sourceName: string;
  sectionRef: string | null;
  similarity: number;
};

/**
 * Convert knowledge chunks to citation format for UI display
 */
export function formatCitations(chunks: KnowledgeChunk[]): Citation[] {
  return chunks.map((chunk) => ({
    id: chunk.id,
    title: formatCitationTitle(chunk),
    excerpt: truncateExcerpt(chunk.content, 200),
    sourceType: chunk.source_type,
    sourceName: chunk.source_name,
    sectionRef: chunk.section_ref,
    similarity: chunk.similarity,
  }));
}

/**
 * Format a human-readable citation title
 */
function formatCitationTitle(chunk: KnowledgeChunk): string {
  const base = chunk.source_name;
  if (chunk.section_ref) {
    return `${base}, ${chunk.section_ref}`;
  }
  return base;
}

/**
 * Truncate excerpt to a maximum length, preserving word boundaries
 */
function truncateExcerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Group citations by source type for organized display
 */
export function groupCitationsByType(citations: Citation[]): Record<string, Citation[]> {
  return citations.reduce(
    (acc, citation) => {
      const type = citation.sourceType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(citation);
      return acc;
    },
    {} as Record<string, Citation[]>
  );
}

/**
 * Get human-readable label for source type
 */
export function getSourceTypeLabel(sourceType: string): string {
  const labels: Record<string, string> = {
    regulation: "Regulations",
    guidance: "Guidance Documents",
    template: "Templates",
    certification: "Certification Standards",
    best_practice: "Best Practices",
  };
  return labels[sourceType] || sourceType;
}

/**
 * Sort citations by relevance (similarity score)
 */
export function sortCitationsByRelevance(citations: Citation[]): Citation[] {
  return [...citations].sort((a, b) => b.similarity - a.similarity);
}

/**
 * Deduplicate citations by source name (keep highest similarity)
 */
export function deduplicateCitations(citations: Citation[]): Citation[] {
  const seen = new Map<string, Citation>();

  for (const citation of citations) {
    const key = `${citation.sourceName}-${citation.sectionRef || ""}`;
    const existing = seen.get(key);

    if (!existing || citation.similarity > existing.similarity) {
      seen.set(key, citation);
    }
  }

  return Array.from(seen.values());
}
