# Legal Retrieval and Official Verification Design

## Goal

Improve PinkPepper's legal and regulatory answers so exact-reference, latest-law,
and amendment-chain questions select the legally relevant instrument instead of
the most semantically similar or newest nearby instrument.

The system should prefer accuracy over latency. When the curated knowledge base
cannot prove an exact legal claim, it should automatically consult approved
official sources before answering.

## Observed Failures

Two import/export QA cases exposed the current weaknesses:

1. A broad products-of-animal-origin answer mixed obsolete and current legal
   frameworks, assigned responsibilities to the wrong authorities, and made
   unsupported animal-by-product claims.
2. A question asking for the latest act amending Regulation (EU) 2019/1793
   returned Regulation (EU) 2026/551. The model noticed that 2026/551 amended
   2021/632 rather than 2019/1793, but still presented it as the answer. It
   missed the ingested 2026/194 and 2025/1441 amendment records.

The second failure is primarily retrieval failure, not just prompt failure.
Current retrieval uses vector similarity and authority-class weighting. It does
not treat regulation identifiers, CELEX numbers, amendment targets, or dates as
structured query constraints.

## Scope

### Included

- Legal-query intent and identifier parsing
- Hybrid lexical, metadata, and vector retrieval
- Distinct-source result selection
- Amendment relationship metadata
- Approved official-source fallback
- Claim-level evidence checks for legal answers
- Lower-generation temperature for precision legal queries
- Regression evaluation based on recorded QA failures
- Retrieval and verification observability

### Excluded

- General internet search
- Unapproved blogs, law-firm summaries, or commercial compliance sites
- Automatic legal advice without jurisdiction and commodity caveats
- Rebuilding the entire chatbot or replacing the current embedding provider
- Full legal citation graph construction across all EU and UK legislation

## Accuracy Policy

For exact legal questions, the system must distinguish:

- **Verified:** the requested claim is directly supported by retrieved primary
  law or approved official guidance.
- **Partially verified:** the governing instrument is identified, but an exact
  article, annex entry, date, product-origin combination, or operational detail
  is unavailable.
- **Unverified:** no approved source supports the requested claim.

An answer must not become "verified" merely because one authoritative document
was retrieved. Verification applies to the specific claims requested.

When evidence conflicts, the system should prefer:

1. Current consolidated primary law
2. The official amending act when the question concerns the amendment itself
3. Current official operational guidance
4. Older primary-law versions only for historical explanation

## Query Classification

Add a dedicated legal precision classifier alongside the existing QA intent
classification.

Precision legal queries include:

- exact regulation, directive, decision, statutory instrument, or CELEX lookup
- "latest", "most recent", "currently applicable", or "what changed"
- "amends", "amended by", "replaces", "corrects", or amendment-chain questions
- exact article, section, schedule, annex, control frequency, date, or threshold
- jurisdiction-sensitive import/export requirements

The classifier should return structured data:

```ts
type LegalQueryPlan = {
  precisionRequired: boolean;
  recencyRequired: boolean;
  exactReferences: string[];
  celexReferences: string[];
  targetInstrumentReferences: string[];
  relationship:
    | "amends"
    | "amended_by"
    | "replaces"
    | "corrects"
    | "implements"
    | null;
  requestedDetails: Array<
    | "article"
    | "annex"
    | "date"
    | "control_frequency"
    | "certificate"
    | "analysis_report"
    | "authority"
    | "jurisdiction"
  >;
};
```

Parsing should be deterministic for explicit identifiers such as `2019/1793`,
`2026/194`, and `32026R0194`. It may use normalized aliases for common formats,
but it must not guess an identifier from topic wording.

## Ingestion Metadata

Regulation chunks need structured metadata that can support legal matching:

- `celexNumber`
- `baseCelexNumber`
- `documentNumber`, such as `2026/194`
- `documentDate`
- `publicationDate`, when available
- `effectiveDate`, when available
- `act_type`
- `amendsCelexNumbers`
- `correctsCelexNumbers`
- `replacesCelexNumbers`
- `implementsCelexNumbers`
- `official_url`
- `text_url`
- `source_key`
- `version_key`
- `retrieval_status`

Relationship metadata should be extracted from official titles and preamble text
during ingestion. The extraction should be conservative: only store a
relationship when an explicit target identifier is present.

Curated markdown summaries may remain useful, but they must not outrank full
official text when both represent the same source.

## Retrieval Architecture

Use a three-stage retrieval pipeline.

### Stage 1: Deterministic legal lookup

When the query contains an exact identifier or explicit relationship:

1. Match `celexNumber`, `baseCelexNumber`, `documentNumber`, source aliases, and
   relationship metadata.
2. Retrieve the target instrument and acts that explicitly amend, correct, or
   replace it.
3. Apply date ordering only within the legally matching result set.

This stage must prevent a chronologically newer but unrelated act from winning.

### Stage 2: Hybrid supporting retrieval

Run vector search and lexical full-text search for supporting provisions and
official guidance. Merge results with deterministic matches.

Ranking priorities:

1. Exact identifier match
2. Explicit requested relationship match
3. Current active version
4. Primary law over guidance and internal summaries
5. Requested jurisdiction
6. Exact title or metadata token match
7. Semantic similarity
8. Recency, only after legal relevance

Results should be grouped by `source_key`. Limit the number of chunks per source
so one document cannot crowd out all other relevant instruments.

### Stage 3: Evidence sufficiency check

Before generation, determine whether the selected evidence covers the requested
details. For example:

- Identifying 2026/194 requires number, title, target act, and date metadata.
- Listing annex changes requires actual annex text.
- Naming a control frequency requires the exact annex row or official guidance.
- Assigning an authority requires current official guidance or operative law.

If required evidence is missing or contradictory, invoke official verification.

## Official-Source Verification

The verifier may access only allowlisted official hosts:

- `eur-lex.europa.eu`
- `data.europa.eu`
- `gov.uk`
- `legislation.gov.uk`
- `food.gov.uk`
- `foodstandards.gov.scot`
- `daera-ni.gov.uk`
- approved EU Commission food-safety domains

URLs must be constructed from parsed official identifiers or selected from
allowlisted search results. The service must reject redirects to non-allowlisted
hosts, private IP ranges, loopback addresses, embedded credentials, and
non-HTTPS URLs. This prevents the verifier from becoming a general-purpose
server-side fetch endpoint.

### Verification strategy

For explicit EU identifiers:

1. Resolve the CELEX or ELI URL directly.
2. Fetch metadata and the official text.
3. Extract the title, dates, relationships, articles, and annex content needed
   for the question.

For UK legislation:

1. Resolve the legislation.gov.uk identifier.
2. Prefer current revised text where applicable.
3. Use GOV.UK, FSA, APHA, Port Health, FSS, or DAERA guidance for current
   operational procedures and authority responsibilities.

The verifier should not perform open-ended search first when an exact official
identifier is available.

### Failure behavior

If official verification times out or the official text is unavailable:

- Answer only the portions supported by local evidence.
- Mark missing details as unverified.
- Do not silently fall back to model memory.
- Provide the official URL attempted when available.

Officially fetched content may be used for the current answer and cached with a
short freshness period. It should not automatically become permanent knowledge
without the normal ingestion and validation process.

Fetched text must pass the same external-content sanitization and prompt
injection defenses used for retrieved knowledge. Official provenance increases
legal authority, but fetched page content is still data and cannot override the
system prompt.

### Latency and caching

- Deterministic local lookup and hybrid retrieval run first.
- Official verification has a strict total time budget and per-request timeout.
- Exact identifier metadata may be cached longer than volatile operational
  guidance.
- Cache entries must retain source URL, fetch time, content hash, and response
  status.
- A timeout produces a partial answer rather than blocking indefinitely.
- Normal non-precision Q&A must not invoke the official verifier.

## Answer Generation

Precision legal queries should use temperature `0` or `0.1`.

The prompt should receive:

- the parsed `LegalQueryPlan`
- selected local sources
- official verification sources, if used
- an evidence coverage summary
- prohibited unsupported claim categories

Official fallback sources should use a distinct citation representation that
includes the official URL and retrieval date. They must not be disguised as
permanently ingested knowledge chunks.

The model must:

- answer the exact legal relationship asked about
- distinguish the requested target from merely related instruments
- cite only source-backed numbers, dates, articles, annexes, and authorities
- state when annex tables or operational details were not retrieved
- distinguish EU, Great Britain, and Northern Ireland applicability
- avoid presenting a newer unrelated act as the answer to a target-act query

## Claim Verification

Add a lightweight post-generation verifier for precision legal answers.

It should extract claims containing:

- regulation or CELEX identifiers
- dates
- article, annex, schedule, or section references
- amendment relationships
- mandatory control frequencies
- certificate or analysis requirements
- named competent authorities

Each extracted claim must map to at least one evidence item. If a claim cannot be
mapped, the system should regenerate once with explicit unsupported-claim
feedback. If the second answer still contains unsupported claims, remove or
replace them with an uncertainty statement.

This is not intended to prove arbitrary prose. It targets high-risk structured
legal claims.

Deterministic checks should handle identifiers, dates, and relationship targets.
Model-assisted verification may be used only for mapping more complex
operational claims to evidence, and its output must be treated as a validation
signal rather than new legal evidence.

## Observability

Record structured diagnostics for precision legal requests:

- parsed query plan
- deterministic matches
- vector and lexical candidates
- final source groups
- official fallback trigger reason
- official URLs consulted
- evidence sufficiency result
- unsupported claims found during post-generation verification
- final verification state
- retrieval and verification latency

Logs must not contain user secrets or uploaded document content.

## Testing

### Unit tests

- Parse `2019/1793`, `EU 2019 1793`, and CELEX forms consistently.
- Detect amendment-chain and latest-law intent.
- Rank 2026/194 above 2026/551 for "latest act amending 2019/1793".
- Rank 2026/551 for a question about acts amending 2021/632.
- Group chunks by source and enforce per-source caps.
- Trigger official fallback when annex evidence is absent.
- Reject unsupported annex, date, frequency, certificate, and authority claims.

### Integration tests

- Local knowledge identifies 2026/194 and 2025/1441 in the amendment chain.
- Official verification fills exact annex content when local chunks omit it.
- Official verification failure produces a partial answer without invention.
- GB import answers use current official operational guidance and correct
  authority attribution.
- EU-to-GB and GB-to-EU flows remain jurisdictionally separate.

### QA regression cases

Preserve the recorded import/export answers as fixtures with expected failures:

- wrong risk categories
- obsolete framework presented as current
- incorrect BCP and certification authority attribution
- unrelated newer regulation selected
- missing 2025/1441 amendment
- unsupported CN-code or annex conclusions

## Rollout

1. Add deterministic parsing and ranking behind a feature flag.
2. Run offline regression evaluation against existing chatbot prompts.
3. Enable official fallback for exact identifiers and amendment questions.
4. Add claim verification in report-only mode.
5. Review false positives, then enable one regeneration attempt.
6. Expand to broader legal applicability questions after precision-query
   performance is stable.

## Success Criteria

- The 2019/1793 test identifies 2026/194, not 2026/551.
- The answer includes 2025/1441 when the earlier amendment is requested.
- Exact annex details are either supported by fetched official text or clearly
  marked unavailable.
- No unsupported legal identifier, date, relationship, article, annex,
  frequency, certificate requirement, or authority attribution is presented as
  verified.
- Precision legal requests may be slower, but normal food-safety Q&A latency is
  not materially affected.
