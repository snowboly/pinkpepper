-- ============================================================================
-- RAG Knowledge Base for PinkPepper
-- Enables vector similarity search for grounded food safety responses
-- ============================================================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Knowledge Chunks Table
-- Stores document chunks with embeddings for RAG retrieval
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI text-embedding-ada-002 dimensions

  -- Source metadata
  source_type TEXT NOT NULL,        -- 'regulation', 'guidance', 'template', 'certification', 'best_practice'
  source_name TEXT NOT NULL,        -- 'EC 852/2004', 'BRCGS v9', 'UK FSA HACCP Guidance', etc.
  section_ref TEXT,                 -- 'Article 5', 'Clause 3.4.1', 'Annex II Chapter IX', etc.

  -- Additional metadata for filtering and display
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- HNSW index for fast approximate nearest neighbor search
-- Using cosine similarity (vector_cosine_ops) as it works well with normalized embeddings
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON public.knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

-- Index for filtering by source type
CREATE INDEX IF NOT EXISTS knowledge_chunks_source_type_idx
  ON public.knowledge_chunks (source_type);

-- Index for filtering by source name
CREATE INDEX IF NOT EXISTS knowledge_chunks_source_name_idx
  ON public.knowledge_chunks (source_name);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Knowledge chunks are readable by authenticated users
CREATE POLICY "Authenticated users can read knowledge chunks"
  ON public.knowledge_chunks
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete (via ingestion scripts)
CREATE POLICY "Service role can manage knowledge chunks"
  ON public.knowledge_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to search for similar chunks using vector similarity
CREATE OR REPLACE FUNCTION public.search_knowledge_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_source_type TEXT DEFAULT NULL,
  filter_source_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_type TEXT,
  source_name TEXT,
  section_ref TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.source_type,
    kc.source_name,
    kc.section_ref,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE
    (1 - (kc.embedding <=> query_embedding)) > match_threshold
    AND (filter_source_type IS NULL OR kc.source_type = filter_source_type)
    AND (filter_source_name IS NULL OR kc.source_name = filter_source_name)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute on the search function to authenticated users
GRANT EXECUTE ON FUNCTION public.search_knowledge_chunks TO authenticated;

-- ============================================================================
-- Trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_knowledge_chunks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_chunks_updated_at
  BEFORE UPDATE ON public.knowledge_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_chunks_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.knowledge_chunks IS 'Stores document chunks with embeddings for RAG-based food safety Q&A';
COMMENT ON COLUMN public.knowledge_chunks.embedding IS 'OpenAI text-embedding-ada-002 vector (1536 dimensions)';
COMMENT ON COLUMN public.knowledge_chunks.source_type IS 'Category: regulation, guidance, template, certification, best_practice';
COMMENT ON COLUMN public.knowledge_chunks.source_name IS 'Document name: EC 852/2004, BRCGS v9, etc.';
COMMENT ON COLUMN public.knowledge_chunks.section_ref IS 'Specific section: Article 5, Clause 3.4.1, etc.';
COMMENT ON FUNCTION public.search_knowledge_chunks IS 'Vector similarity search for RAG retrieval with optional filtering';
