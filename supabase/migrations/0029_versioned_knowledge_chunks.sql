CREATE INDEX IF NOT EXISTS knowledge_chunks_metadata_retrieval_status_idx
  ON public.knowledge_chunks ((metadata->>'retrieval_status'));

CREATE INDEX IF NOT EXISTS knowledge_chunks_metadata_source_key_idx
  ON public.knowledge_chunks ((metadata->>'source_key'));

CREATE INDEX IF NOT EXISTS knowledge_chunks_metadata_version_key_idx
  ON public.knowledge_chunks ((metadata->>'version_key'));

CREATE OR REPLACE FUNCTION public.activate_versioned_knowledge_chunks(
  p_source_key TEXT,
  p_version_key TEXT,
  p_rows JSONB,
  p_legacy_source_names TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.knowledge_chunks (
    content,
    embedding,
    source_type,
    source_name,
    section_ref,
    metadata
  )
  SELECT
    rows.content,
    rows.embedding::vector,
    rows.source_type,
    rows.source_name,
    rows.section_ref,
    COALESCE(rows.metadata, '{}'::jsonb)
      || jsonb_build_object(
        'retrieval_status', 'active',
        'source_key', p_source_key,
        'version_key', p_version_key
      )
  FROM jsonb_to_recordset(p_rows) AS rows(
    content TEXT,
    embedding TEXT,
    source_type TEXT,
    source_name TEXT,
    section_ref TEXT,
    metadata JSONB
  );

  UPDATE public.knowledge_chunks
  SET
    metadata = metadata || jsonb_build_object(
      'retrieval_status', 'archived',
      'archived_at', now(),
      'superseded_by_version_key', p_version_key
    )
  WHERE
    coalesce(metadata->>'retrieval_status', 'active') = 'active'
    AND metadata->>'version_key' IS DISTINCT FROM p_version_key
    AND (
      metadata->>'source_key' = p_source_key
      OR source_name = ANY(p_legacy_source_names)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_versioned_knowledge_chunks TO service_role;

COMMENT ON FUNCTION public.activate_versioned_knowledge_chunks IS
  'Inserts a validated new source version, then archives older active chunks for the same source key inside one transaction';

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
    AND coalesce(kc.metadata->>'retrieval_status', 'active') = 'active'
    AND (filter_source_type IS NULL OR kc.source_type = filter_source_type)
    AND (filter_source_name IS NULL OR kc.source_name = filter_source_name)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_knowledge_chunks TO authenticated;

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
    AND coalesce(kc.metadata->>'retrieval_status', 'active') = 'active'
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
