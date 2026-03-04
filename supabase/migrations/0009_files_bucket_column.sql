-- Phase 9b - Add bucket column to files table to track which storage bucket a file lives in

alter table public.files
  add column bucket text not null default 'temp-uploads';
