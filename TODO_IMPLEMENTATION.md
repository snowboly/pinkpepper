# PinkPepper Implementation TODO

## Phase 1: Homepage Redesign - COMPLETED

### Task 1: Logo Update
- [x] Logo at h-12 (48px) in header, aligned with breathing room

### Task 2: Homepage Redesign (lovable.dev style)
- [x] Warm gradient background (#FFF5F5 → #FFF0ED → #FFEBE5)
- [x] Animated floating gradient orbs with pulse effect
- [x] Gated chat input box (redirects to signup)
- [x] Browser-chrome preview showcasing the product
- [x] 6 feature cards with hover effects
- [x] Dark pricing section with gradient background
- [x] Final CTA with gradient background

---

## Phase 2: RAG Foundation - COMPLETED

### Task 3: Database Migration
- [x] Created `supabase/migrations/0006_rag_knowledge_chunks.sql`
- [x] Enable pgvector extension
- [x] `knowledge_chunks` table with VECTOR(1536) column
- [x] HNSW index for similarity search
- [x] `search_knowledge_chunks` RPC function
- [x] RLS policies

### Task 4: RAG Library (`src/lib/rag/`)
- [x] `embeddings.ts` - OpenAI embedding calls (lazy init)
- [x] `retriever.ts` - pgvector similarity search (lazy init)
- [x] `prompt-builder.ts` - Context injection with mode detection
- [x] `citations.ts` - Citation formatting utilities
- [x] `index.ts` - Module re-exports

### Task 5: SourceCard Component
- [x] `src/components/chat/SourceCard.tsx`
- [x] Expandable citation UI with source type icons
- [x] `SourceCardsList` component

### Task 6: Ingestion Script
- [x] `scripts/ingest-knowledge.ts`
- [x] Document chunking (~500 tokens with overlap)
- [x] Embedding generation via OpenAI
- [x] Batch insert into knowledge_chunks

---

## Phase 3: Chat Integration - COMPLETED

- [x] Modified `src/app/api/chat/route.ts`:
  - RAG retrieval before LLM call
  - Auto-detect query mode (qa/document/audit)
  - Temperature: 0.1 (qa), 0.2 (document), 0.0 (audit)
  - Return citations in response
- [x] Updated `ChatWorkspace.tsx`:
  - Display SourceCardsList under assistant messages
  - Support for citations in Message type
- [x] Groq as primary LLM (llama-3.3-70b)
- [x] OpenAI for embeddings only (ada-002)

---

## Pricing Tier Features (Updated)

### Free (€0)
- 15 messages/day
- Basic food safety Q&A
- 10 saved conversations
- Temperature log templates
- Allergen quick reference

### Plus (€15/mo) - Most Popular
- 80 messages/day
- HACCP plan generation
- PDF export
- Allergen matrix builder
- HACCP templates library
- 2 human reviews/month
- Email support

### Pro (€69/mo)
- 250 messages/day
- Word + PDF export
- Audit preparation mode
- BRCGS & SQF templates
- Multi-site profiles
- Custom branding on exports
- 10 human reviews/month
- Priority support

---

## Files Created/Modified

### Homepage
- `src/app/page.tsx` - Full redesign with lovable.dev style
- `src/components/site/chrome.tsx` - Updated header/footer

### RAG System
- `supabase/migrations/0006_rag_knowledge_chunks.sql`
- `src/lib/rag/embeddings.ts`
- `src/lib/rag/retriever.ts`
- `src/lib/rag/prompt-builder.ts`
- `src/lib/rag/citations.ts`
- `src/lib/rag/index.ts`
- `src/components/chat/SourceCard.tsx`
- `scripts/ingest-knowledge.ts`

### Chat Integration
- `src/app/api/chat/route.ts` - RAG integration
- `src/components/dashboard/ChatWorkspace.tsx` - Citations display

---

## Next Steps

1. **Run database migration:**
   ```bash
   supabase db push
   ```

2. **Prepare knowledge sources:**
   - EC 852/2004 regulation text
   - UK FSA HACCP guidance
   - Codex Alimentarius principles
   - Allergen regulation 1169/2011

3. **Ingest documents:**
   ```bash
   npx tsx scripts/ingest-knowledge.ts ./knowledge-sources/
   ```

4. **Test RAG responses:**
   - "What are the HACCP principles?"
   - "What temperature should chilled food be stored at?"
   - "Create a HACCP plan for a cafe"

---

## Build Status
✅ `npm run build` passes
