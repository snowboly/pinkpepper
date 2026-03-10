-- Add chat_language preference column to profiles
-- This controls the language the chatbot responds in (defaults to English).
-- Separate from `locale` which controls the UI language.
alter table public.profiles
  add column if not exists chat_language text not null default 'en';
