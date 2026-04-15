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
  filterAuthorityFallbackChunks,
  buildUserDocumentSearchRpcArgs,
  shouldRetryLegacyUserDocumentSearch,
  type KnowledgeChunk,
  type UserDocumentChunk,
  type RetrievalOptions,
  type UserDocumentRetrievalOptions,
} from "./retriever";

export {
  buildRAGPrompt,
  buildRAGSystemPrompt,
  classifyQAIntent,
  formatContext,
  extractSourceReferences,
  getExportGuidance,
  getUncertaintyHandlingInstructions,
  isExactReferenceQuestion,
  isRecentChangeQuestion,
  MODE_TEMPERATURES,
  responseMeetsIntentContract,
  type RAGMode,
  type QAIntent,
} from "./prompt-builder";

export {
  formatCitations,
  groupCitationsByType,
  getSourceTypeLabel,
  sortCitationsByRelevance,
  deduplicateCitations,
  type Citation,
} from "./citations";

export {
  sanitizeUntrustedText,
  sanitizeUntrustedFilename,
  buildUntrustedDocumentBlock,
  userChunksToUntrusted,
  knowledgeChunksToUntrusted,
  UNTRUSTED_CONTENT_SYSTEM_NOTE,
} from "./untrusted-content";
