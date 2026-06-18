# EU/UK Regulation Discovery And Versioned Sync Design

## Goal

Make the monthly regulation cron actually discover and ingest relevant EU and UK food-law changes while protecting the current knowledge base. The chatbot should retrieve the latest validated version of each source, while older versions remain archived for audit/debugging and are not returned in normal RAG search.

## Non-Negotiable Safety Rules

- Do not delete or replace current knowledge chunks during discovery.
- Do not make a newly discovered regulation searchable until text retrieval, relevance checks, chunking, embedding, and database insert all succeed.
- Treat existing chunks that do not yet have version metadata as active. This preserves the current knowledge base during migration.
- When a source is updated, insert the new version first, then mark the previous version archived only after the new version is committed.
- If discovery, fetch, classification, or embedding fails, keep the current active corpus unchanged.
- Do not spend OpenAI embedding calls on candidates until source text is fetched and passes relevance validation.

## Retrieval Model

Normal chatbot retrieval should only search chunks where:

- `metadata.retrieval_status` is missing, or
- `metadata.retrieval_status = "active"`

Archived versions should remain in `knowledge_chunks`, but should be excluded from normal retrieval by both search RPCs:

- `search_knowledge_chunks`
- `search_knowledge_chunks_authority_aware`

Archived chunks can still be inspected manually or through a future admin/debug route.

## Version Metadata

New regulation chunks should include these metadata fields:

- `retrieval_status`: `"active"` or `"archived"`
- `source_key`: stable source identity, such as `eu:celex:32004R0852` or `uk:uksi:2013:2996`
- `version_key`: source plus version, such as consolidated CELEX/date or UK revised version date
- `jurisdiction`: `eu`, `gb`, `mixed`, or `unknown`
- `source_class`: normally `primary_law`
- `act_type`: `regulation`, `implementing_regulation`, `amending_act`, `directive`, `statutory_instrument`, or `import_export_control`
- `publication_date`
- `last_modified_date`
- `content_hash`
- `official_url`
- `discovered_at`
- `ingested_at`
- `supersedes_version_key`, when applicable

## Database Additions

Add a discovery log table instead of relying only on `regulation_sync_log`.

Recommended table: `regulation_discovery_candidates`

Columns:

- `id`
- `jurisdiction`
- `source_key`
- `version_key`
- `title`
- `act_type`
- `official_url`
- `publication_date`
- `last_modified_date`
- `content_hash`
- `relevance_status`: `candidate`, `relevant`, `irrelevant`, `fetch_failed`, `ingest_failed`, `ingested`
- `relevance_reason`
- `error_message`
- `metadata`
- `created_at`
- `updated_at`

This table is the operational audit trail for "what did the cron find, what did it ignore, and why?".

## Source Strategy

### EU

The current EUR-Lex HTML scraping path is not reliable because Vercel receives consent/navigation pages instead of regulation text.

Use official machine-oriented EU sources instead:

- Cellar metadata and content access for EU publications.
- Cellar RSS/Atom feeds for new and updated publications.
- EUR-Lex webservice only for metadata/search if credentials are configured, because the official docs state it cannot directly download document files.

Discovery should cover:

- regulations
- implementing regulations
- amending acts
- directives
- import/export control measures
- food/feed safety, hygiene, labelling, contaminants, residues, official controls, food contact materials, animal-origin products, traceability, and border-control topics

### UK

Use legislation.gov.uk feeds and update logs:

- Search/list feeds via `/data.feed`.
- Publication log feeds under `/update/.../data.feed`.
- XML or official document URLs for text retrieval.

Discovery should cover:

- UK Acts
- UK statutory instruments
- devolved instruments where food safety/hygiene/import-export relevance is clear
- retained/EU-origin legislation where applicable
- import/export and official-control instruments

## Monthly Cron Flow

1. Load last successful discovery date.
2. Discover EU candidates from Cellar feeds/metadata.
3. Discover UK candidates from legislation.gov.uk feeds/update logs.
4. Normalize candidates into a shared candidate shape.
5. Deduplicate by `source_key` and `version_key`.
6. Classify relevance using deterministic keyword/topic rules first.
7. Store every candidate and decision in `regulation_discovery_candidates`.
8. Fetch full official text only for relevant candidates.
9. Validate text source, length, language, and content hash.
10. Skip candidates whose hash matches the current active version.
11. Generate embeddings only after validation passes.
12. Insert new chunks as active in one database operation.
13. Archive older active chunks for the same `source_key`.
14. Write sync and discovery results.
15. Return a structured summary with counts for discovered, relevant, skipped, ingested, archived, and failed.

## Update Handling

When legislation changes:

- same `source_key`
- different `version_key` or different `content_hash`

The new version becomes searchable only after successful ingestion. The prior version is marked:

- `metadata.retrieval_status = "archived"`
- `metadata.archived_at = <timestamp>`
- `metadata.superseded_by_version_key = <new version>`

This gives the chatbot the current law while preserving older material for traceability.

## Failure Handling

- EU discovery failure should not block UK discovery.
- UK discovery failure should not block EU discovery.
- Candidate fetch failure should not block other candidates.
- Embedding failure should not alter active chunks.
- Database insert failure should leave all existing active chunks untouched.
- A cron run with partial failures should return `ok: true` only if at least the pipeline completed and no active corpus was corrupted; individual failures are reported in result arrays.

## First Implementation Slice

The first PR should not attempt the entire crawler at once. It should add the guardrails that protect the chatbot:

1. Add retrieval filtering so archived chunks are excluded but legacy chunks remain active.
2. Add tests for active/archived retrieval behavior.
3. Add a versioned chunk activation helper that inserts new rows before archiving old rows.
4. Add tests proving old chunks remain searchable if new ingestion fails.

After that, add EU and UK discovery in separate PRs.

## Official Source Notes

- EUR-Lex states its webservice is for direct querying/search and returns metadata in XML; it also states document files should be downloaded through Cellar REST/stable links rather than the webservice itself.
- Cellar documentation describes REST, SPARQL, RSS, and Atom access for EU publication metadata and content.
- Legislation.gov.uk documents `/data.feed` Atom feeds for searches/lists and update feeds for publication changes.
