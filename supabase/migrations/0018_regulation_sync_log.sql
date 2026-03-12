-- Track regulation knowledge-base sync runs for auditing and staleness checks
CREATE TABLE IF NOT EXISTS public.regulation_sync_log (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at      timestamptz NOT NULL DEFAULT now(),
  status         text        NOT NULL CHECK (status IN ('success', 'failure')),
  source_name    text,
  chunks_upserted integer,
  error_message  text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Only admins / service-role should read/write this table
ALTER TABLE public.regulation_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.regulation_sync_log
  FOR ALL
  USING (false);
