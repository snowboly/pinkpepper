-- Regulation sync log: tracks automated EUR-Lex regulation ingestion
CREATE TABLE IF NOT EXISTS public.regulation_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celex_number TEXT NOT NULL,
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  last_modified DATE,
  content_hash TEXT,
  chunks_ingested INTEGER NOT NULL DEFAULT 0,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sync_log_celex ON public.regulation_sync_log(celex_number);
CREATE INDEX idx_sync_log_synced_at ON public.regulation_sync_log(synced_at);
