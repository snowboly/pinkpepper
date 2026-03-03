-- Phase 3 - conversations and chat history

create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id bigserial primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;

create policy "conversations_select_own" on public.conversations
for select using (auth.uid() = user_id);

create policy "conversations_insert_own" on public.conversations
for insert with check (auth.uid() = user_id);

create policy "conversations_update_own" on public.conversations
for update using (auth.uid() = user_id);

create policy "chat_messages_select_own" on public.chat_messages
for select using (auth.uid() = user_id);

create policy "chat_messages_insert_own" on public.chat_messages
for insert with check (auth.uid() = user_id);

create index if not exists idx_conversations_user_created_at on public.conversations(user_id, created_at desc);
create index if not exists idx_chat_messages_conversation_created_at on public.chat_messages(conversation_id, created_at asc);

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute procedure public.set_updated_at();
