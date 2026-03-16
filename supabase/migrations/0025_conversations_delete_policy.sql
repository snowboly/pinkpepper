-- Add missing DELETE RLS policy for conversations
-- Without this, deletes silently succeed with 0 rows affected
create policy "conversations_delete_own" on public.conversations
  for delete using (auth.uid() = user_id);
