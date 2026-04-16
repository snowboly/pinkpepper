-- Fix: user-uploaded document retrieval was leaking legacy chunks (rows with
-- conversation_id IS NULL, uploaded before 0017 added the column) into every
-- new conversation. The RPC in 0017_user_document_chunks_conversation_scope.sql
-- included `OR c.conversation_id IS NULL`, which matched orphan rows against
-- any caller's p_conversation_id.
--
-- Migration 0026 already defined the correct RPC, but if 0017's version is the
-- one currently live (e.g. 0026 not yet applied, or the buggy version was
-- re-installed), this migration re-asserts the correct definition. It is
-- idempotent and safe to run repeatedly.

CREATE OR REPLACE FUNCTION public.search_user_document_chunks(
  p_user_id          uuid,
  query_embedding    vector(1536),
  match_threshold    float   DEFAULT 0.65,
  match_count        int     DEFAULT 5,
  p_conversation_id  uuid    DEFAULT NULL
)
RETURNS TABLE (
  id           uuid,
  file_name    text,
  content      text,
  chunk_index  integer,
  similarity   float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.id,
    c.file_name,
    c.content,
    c.chunk_index,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.user_document_chunks c
  WHERE
    c.user_id = p_user_id
    AND (p_conversation_id IS NULL OR c.conversation_id = p_conversation_id)
    AND 1 - (c.embedding <=> query_embedding) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Legacy orphan cleanup (OPTIONAL — destructive, review before running).
-- Rows uploaded before 0017 have conversation_id = NULL and are not reachable
-- under the corrected scoping. Uncomment the DELETE below to evict them, or
-- run it manually once verified.
--
-- DELETE FROM public.user_document_chunks WHERE conversation_id IS NULL;
