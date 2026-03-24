-- ============================================================================
-- Authority-aware RAG retrieval for food safety advisor
-- Adds jurisdiction/source-class filters without breaking existing callers
-- ============================================================================

CREATE INDEX IF NOT EXISTS knowledge_chunks_metadata_jurisdiction_idx
  ON public.knowledge_chunks ((metadata->>'jurisdiction'));

CREATE INDEX IF NOT EXISTS knowledge_chunks_metadata_source_class_idx
  ON public.knowledge_chunks ((metadata->>'source_class'));

CREATE OR REPLACE FUNCTION public.search_knowledge_chunks_authority_aware(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_source_type TEXT DEFAULT NULL,
  filter_source_name TEXT DEFAULT NULL,
  filter_jurisdiction TEXT DEFAULT NULL,
  filter_source_classes TEXT[] DEFAULT NULL
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
    AND (filter_jurisdiction IS NULL OR kc.metadata->>'jurisdiction' = filter_jurisdiction)
    AND (
      filter_source_classes IS NULL
      OR array_length(filter_source_classes, 1) IS NULL
      OR kc.metadata->>'source_class' = ANY(filter_source_classes)
    )
  ORDER BY
    CASE kc.metadata->>'source_class'
      WHEN 'primary_law' THEN 4
      WHEN 'official_guidance' THEN 3
      WHEN 'reference_standard' THEN 2
      WHEN 'internal_practice' THEN 1
      ELSE 0
    END DESC,
    kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_knowledge_chunks_authority_aware TO authenticated;

COMMENT ON FUNCTION public.search_knowledge_chunks_authority_aware IS
  'Vector similarity search for RAG retrieval with optional jurisdiction and source-class filtering';
