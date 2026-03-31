# PinkPepper

AI-powered food safety compliance assistant for EU/UK food businesses.

Built with **Next.js 16 (App Router)**, **Supabase**, **Groq** (LLM streaming), **OpenAI** (embeddings + vision), **Stripe** (billing), and **Resend** (email).

The core product is an AI chatbot that helps food businesses with HACCP plans, SOPs, audit prep, allergen law, and EU/UK food safety compliance.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (React 19) |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (Postgres + pgvector) |
| LLM | Groq (`llama-3.3-70b-versatile`) |
| Embeddings | OpenAI `text-embedding-ada-002` |
| Vision | OpenAI `gpt-4o-mini` |
| Payments | Stripe |
| Email | Resend |
| Deployment | Vercel |

---

## Getting Started

Copy `.env.example` to `.env.local` and fill in all values, then:

```bash
npm install
npm run dev          # http://localhost:3000

# Generate TypeScript types from Supabase schema
npm run supabase:types

# Run database migrations (requires Supabase CLI linked)
supabase db push

# Ingest food safety knowledge documents into RAG
npx tsx scripts/ingest-knowledge.ts ./knowledge-docs
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile   # optional override

OPENAI_API_KEY=                        # used for embeddings + vision

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PLUS_PRICE_ID=
STRIPE_PRO_PRICE_ID=

RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@pinkpepper.io
```

---

## Key File Map

```
src/
  app/
    api/
      chat/stream/route.ts     ← Main streaming chat endpoint (Groq)
      chat/route.ts            ← Image analysis endpoint (OpenAI vision)
      billing/                 ← Stripe checkout, portal, status
      export/                  ← PDF and DOCX export
      reviews/                 ← Human review request endpoints
      webhook/stripe/          ← Stripe webhook handler
  components/dashboard/
    ChatWorkspace.tsx          ← Root chat UI component
    ChatMessages.tsx           ← Message list + empty state suggestions
    ChatInput.tsx              ← Textarea, image upload, send button
    ChatSidebar.tsx            ← Conversation list
    MessageItem.tsx            ← Single message bubble + citations
  lib/
    rag/
      index.ts                 ← RAG exports
      retriever.ts             ← pgvector similarity search
      embeddings.ts            ← OpenAI embedding generation
      prompt-builder.ts        ← RAG system prompt construction
      vision-prompt.ts         ← Food safety image analysis system prompt
      citations.ts             ← Citation formatting
    tier.ts                    ← Subscription tier definitions + capabilities
    policy.ts                  ← Usage counting helpers
    access.ts                  ← Resolve user tier + admin status
  utils/supabase/
    client.ts                  ← Browser Supabase client
    server.ts                  ← Server Supabase client (SSR)
    admin.ts                   ← Service-role Supabase client
  types/
    database.types.ts          ← Auto-generated from Supabase schema (do not edit)
supabase/
  migrations/                  ← All DB migrations (apply in order)
scripts/
  ingest-knowledge.ts          ← Batch-ingest food safety docs into knowledge_chunks
```

---

## Subscription Tiers

| | Free | Plus | Pro |
|---|---|---|---|
| Daily messages | 15 | 100 | 1000 |
| Daily image uploads | 0 | 3 | 20 |
| PDF export | No | Yes | Yes |
| DOCX export | No | No | Yes |
| Review credits/month | 0 | 0 | 3 |
| Saved conversations | 10 (30d) | Unlimited | Unlimited |

Admins bypass all limits.

---

## Chat Architecture

1. **Text messages** → `/api/chat/stream` → Groq SSE stream → client renders tokens incrementally
2. **Image messages** → `/api/chat` → OpenAI vision (`gpt-4o-mini`) → JSON response
3. **RAG**: every text message triggers pgvector similarity search against `knowledge_chunks`; chunks found above similarity threshold are injected into the system prompt

### Query modes (auto-detected from keywords)
- `qa` — general Q&A (default)
- `document` — HACCP plans, SOPs, forms, logs
- `audit` — compliance audits, gap analysis, NC identification

---

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run unit tests (Vitest)
npm run typecheck    # TypeScript type check
npm run lint         # ESLint
```

---

## Database

All migrations are in `supabase/migrations/`. Key tables:
- `profiles` — user tiers, admin flag
- `conversations` + `chat_messages` — chat history
- `usage_events` — daily usage tracking
- `knowledge_chunks` — RAG vector store (pgvector)
- `review_requests` + `review_attachments` — human review queue
