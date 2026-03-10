-- User-scoped document chunks for RAG over uploaded documents
CREATE TABLE IF NOT EXISTS user_document_chunks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name    text        NOT NULL,
  content      text        NOT NULL,
  embedding    vector(1536),
  chunk_index  integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- HNSW index for fast approximate nearest-neighbour search
CREATE INDEX IF NOT EXISTS user_document_chunks_embedding_idx
  ON user_document_chunks
  USING hnsw (embedding vector_cosine_ops);

-- RLS: users can only see and modify their own chunks
ALTER TABLE user_document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_document_chunks_select_own"
  ON user_document_chunks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_document_chunks_insert_own"
  ON user_document_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_document_chunks_delete_own"
  ON user_document_chunks FOR DELETE
  USING (auth.uid() = user_id);

-- RPC: vector similarity search over a single user's document chunks
CREATE OR REPLACE FUNCTION search_user_document_chunks(
  p_user_id        uuid,
  query_embedding  vector(1536),
  match_threshold  float   DEFAULT 0.65,
  match_count      int     DEFAULT 5
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
    AND 1 - (c.embedding <=> query_embedding) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;
