-- ============================================================================
-- User Document Chunks: user-scoped vector store for uploaded documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link to files table (optional — may be uploaded via temp bucket)
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,

  -- Content
  content TEXT NOT NULL,
  embedding VECTOR(1536),

  -- Source metadata
  source_name TEXT NOT NULL,          -- Original file name
  source_type TEXT NOT NULL DEFAULT 'user_upload',
  section_ref TEXT,

  -- Additional metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS user_doc_chunks_user_idx
  ON public.user_document_chunks (user_id);

CREATE INDEX IF NOT EXISTS user_doc_chunks_embedding_idx
  ON public.user_document_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS user_doc_chunks_file_idx
  ON public.user_document_chunks (file_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.user_document_chunks ENABLE ROW LEVEL SECURITY;

-- Users can read their own document chunks
CREATE POLICY "Users can read own document chunks"
  ON public.user_document_chunks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all chunks (for API routes)
CREATE POLICY "Service role can manage user document chunks"
  ON public.user_document_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Search function for user document chunks
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_user_document_chunks(
  p_user_id UUID,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_name TEXT,
  source_type TEXT,
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
    udc.id,
    udc.content,
    udc.source_name,
    udc.source_type,
    udc.section_ref,
    udc.metadata,
    1 - (udc.embedding <=> query_embedding) AS similarity
  FROM public.user_document_chunks udc
  WHERE
    udc.user_id = p_user_id
    AND (1 - (udc.embedding <=> query_embedding)) > match_threshold
  ORDER BY udc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_user_document_chunks TO authenticated;

-- ============================================================================
-- Trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_doc_chunks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_doc_chunks_updated_at
  BEFORE UPDATE ON public.user_document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_doc_chunks_updated_at();

COMMENT ON TABLE public.user_document_chunks IS 'User-uploaded document chunks with embeddings for personalised RAG retrieval';
