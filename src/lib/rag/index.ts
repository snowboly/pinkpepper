// RAG (Retrieval-Augmented Generation) module for PinkPepper
// Provides grounded, accurate food safety responses with citations

export { generateEmbedding, generateEmbeddings, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "./embeddings";

export {
  retrieveContext,
  retrieveRegulationContext,
  retrieveGuidanceContext,
  retrieveTemplateContext,
  retrieveCertificationContext,
  retrieveUserDocumentContext,
  type KnowledgeChunk,
  type UserDocumentChunk,
  type RetrievalOptions,
} from "./retriever";

export {
  buildRAGPrompt,
  buildRAGSystemPrompt,
  formatContext,
  extractSourceReferences,
  getExportGuidance,
  MODE_TEMPERATURES,
  type RAGMode,
} from "./prompt-builder";

export {
  formatCitations,
  groupCitationsByType,
  getSourceTypeLabel,
  sortCitationsByRelevance,
  deduplicateCitations,
  type Citation,
} from "./citations";
