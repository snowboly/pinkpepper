CREATE OR REPLACE FUNCTION public.search_knowledge_chunks_legal(
  search_terms TEXT[],
  match_count INT DEFAULT 20
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scored AS (
    SELECT
      kc.id,
      kc.content,
      kc.source_type,
      kc.source_name,
      kc.section_ref,
      kc.metadata,
      (
        SELECT count(*)::float
        FROM unnest(search_terms) AS term
        WHERE lower(
          concat_ws(
            ' ',
            kc.source_name,
            kc.content,
            kc.metadata->>'celexNumber',
            kc.metadata->>'baseCelexNumber',
            kc.metadata->>'originalTitle'
          )
        ) LIKE '%' || lower(term) || '%'
      ) AS exact_score
    FROM public.knowledge_chunks kc
    WHERE
      kc.source_type = 'regulation'
      AND coalesce(kc.metadata->>'retrieval_status', 'active') = 'active'
      AND coalesce(kc.metadata->>'source_class', 'primary_law') = 'primary_law'
  )
  SELECT
    scored.id,
    scored.content,
    scored.source_type,
    scored.source_name,
    scored.section_ref,
    scored.metadata,
    scored.exact_score AS similarity
  FROM scored
  WHERE scored.exact_score > 0
  ORDER BY
    scored.exact_score DESC,
    coalesce(scored.metadata->>'dateDocument', scored.metadata->>'currentVersionDate', '') DESC
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.search_knowledge_chunks_legal TO authenticated;

COMMENT ON FUNCTION public.search_knowledge_chunks_legal IS
  'Lexical primary-law retrieval for exact identifiers and amendment relationships';
