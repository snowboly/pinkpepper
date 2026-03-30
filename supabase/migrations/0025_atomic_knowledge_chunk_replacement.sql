CREATE OR REPLACE FUNCTION public.replace_knowledge_chunks_for_source(
  p_source_type TEXT,
  p_source_name TEXT,
  p_rows JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.knowledge_chunks
  WHERE source_type = p_source_type
    AND source_name = p_source_name;

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
  FROM jsonb_to_recordset(p_rows) AS rows(
    content TEXT,
    embedding TEXT,
    source_type TEXT,
    source_name TEXT,
    section_ref TEXT,
    metadata JSONB
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.replace_knowledge_chunks_for_source TO service_role;

COMMENT ON FUNCTION public.replace_knowledge_chunks_for_source IS
  'Atomically replaces all knowledge chunks for a source inside a single database transaction';
