-- Associate uploaded document chunks with the conversation they were uploaded in.
-- Nullable so existing rows are unaffected; new uploads supply a conversation_id.

ALTER TABLE user_document_chunks
  ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS user_document_chunks_conversation_id_idx
  ON user_document_chunks (conversation_id)
  WHERE conversation_id IS NOT NULL;

-- Updated RPC: when p_conversation_id is supplied, restrict search to that
-- conversation's chunks only. Falls back to user-wide search when NULL.
CREATE OR REPLACE FUNCTION search_user_document_chunks(
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
  FROM user_document_chunks c
  WHERE
    c.user_id = p_user_id
    AND (p_conversation_id IS NULL OR c.conversation_id = p_conversation_id)
    AND 1 - (c.embedding <=> query_embedding) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;
