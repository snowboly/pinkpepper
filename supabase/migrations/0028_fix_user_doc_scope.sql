-- Fix: user-uploaded document retrieval was leaking legacy chunks (rows with
-- conversation_id IS NULL, uploaded before this column existed) into every
-- new conversation. The original RPC in 0017 included `OR c.conversation_id IS NULL`
-- which matched orphan rows against any caller's p_conversation_id.
--
-- This migration is self-contained: it ensures the column and index exist
-- before re-asserting the correct RPC, regardless of whether 0017 or 0026
-- ran in this environment.

ALTER TABLE public.user_document_chunks
  ADD COLUMN IF NOT EXISTS conversation_id uuid NULL
  REFERENCES public.conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS user_document_chunks_conversation_id_idx
  ON public.user_document_chunks (conversation_id)
  WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_document_chunks_user_conversation_idx
  ON public.user_document_chunks (user_id, conversation_id);

-- Correct RPC: when p_conversation_id is supplied, restrict to that
-- conversation's chunks only. NULL conversation_id rows (legacy orphans)
-- are never returned when a real conversation ID is passed.
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
-- Rows with conversation_id = NULL are not reachable under the corrected
-- scoping. Uncomment to evict them, or run manually once verified.
--
-- DELETE FROM public.user_document_chunks WHERE conversation_id IS NULL;
