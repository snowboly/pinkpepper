-- Scope user-uploaded document chunks to the conversation they belong to.
-- The RPC originally defined here included `OR c.conversation_id IS NULL`
-- in its WHERE clause, which caused orphan rows (uploaded before this column
-- existed) to leak into every conversation's retrieval. That RPC definition
-- has been removed from this file so it cannot be re-applied in a fresh
-- environment. The correct RPC is defined in:
--   0026_user_document_chunks_conversation_id.sql  (original fix)
--   0028_fix_user_doc_scope.sql                    (re-asserted, idempotent)
--
-- The column and index below remain — they are idempotent and still needed.

ALTER TABLE public.user_document_chunks
  ADD COLUMN IF NOT EXISTS conversation_id uuid NULL
  REFERENCES public.conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS user_document_chunks_user_conversation_idx
  ON public.user_document_chunks (user_id, conversation_id);
