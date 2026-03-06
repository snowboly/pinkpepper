-- Add archive support to conversations
ALTER TABLE public.conversations ADD COLUMN archived_at timestamptz DEFAULT NULL;

-- Partial index for fast lookups of non-archived conversations per user
CREATE INDEX idx_conversations_archived
  ON public.conversations(user_id, archived_at)
  WHERE archived_at IS NULL;
