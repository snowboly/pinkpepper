# Food Safety Advisor Design

## Goal

Turn PinkPepper into a trustworthy food safety advisor for operational food businesses in the EU and Great Britain.

The first release must prioritize verified compliance guidance over broad conversational coverage. The system should answer clearly when it has strong legal support, downgrade gracefully when support is partial, and refuse to improvise legal claims when verified coverage is weak.

## Product Scope

### In Scope

- Food business registration and approval
- Hygiene requirements
- HACCP and prerequisite programmes
- Allergen management and operational food information duties
- Temperature control and cold chain
- Cleaning and disinfection
- Pest control
- Waste management
- Traceability, withdrawal, and recall
- Training, supervision, fitness to work, and personal hygiene
- Inspection readiness and audit-style gap analysis

### Out of Scope for V1

- Novel foods
- Nutrition and health claims as a broad specialist domain
- Import and export controls
- Specialist product-law areas outside normal operational compliance
- Full UK divergence handling beyond Great Britain

## Jurisdiction Boundary

V1 covers:

- European Union
- Great Britain

V1 excludes:

- Northern Ireland-specific divergence handling
- Scotland, Wales, and Northern Ireland deep domestic variation beyond what can be safely generalized for Great Britain

## Core Product Principle

PinkPepper should operate as a source-governed compliance advisor, not a generic chatbot with legal flavoring.

That means:

- legal claims must be grounded in retrieved sources
- source type must influence answer authority
- the model must not fill legal gaps from memory when retrieval is weak
- the interface should present verified answers as a product feature, not just a prompting style

## Answer Confidence Model

Every legal or compliance answer should fall into one of three states.

### 1. Verified Legal Answer

Used when retrieval finds sufficiently relevant primary law or official guidance.

Behavior:

- answer directly
- cite the retrieved source
- distinguish EU and GB positions where relevant
- avoid unsupported extrapolation

### 2. Partially Verified Answer

Used when only part of the requested answer is supported by retrieved authoritative sources.

Behavior:

- answer the supported portion
- explicitly mark the unsupported portion
- request narrowing detail or recommend manual verification

### 3. Not Verified

Used when retrieval does not produce enough authoritative support.

Behavior:

- do not present the answer as legal advice or law-backed guidance
- say coverage is missing or insufficient
- direct the user toward the relevant source type or authority needed for verification

## Recommended Approach

### Chosen Approach: Law-First Advisor

Build a curated EU and GB corpus with explicit metadata, prioritize primary law and official guidance in retrieval, and block unsupported legal claims.

Why this approach:

- it matches the trust level expected from a food safety advisor
- it creates a clear difference between verified law, guidance, and internal best practice
- it reduces hallucinated legal detail
- it gives the product a defensible quality boundary

### Alternatives Considered

#### Hybrid Advisor

Keep the current flexible chat behavior, improve retrieval, and rely on disclaimers when evidence is weak.

Tradeoff:

- faster to ship
- still too easy for the model to overstate legal certainty

#### Checklist-First Advisor

Focus mainly on audits, templates, and workflows, with lighter legal Q&A.

Tradeoff:

- safer than the current model
- weaker as a true advisor product

## System Architecture

The existing chat workspace can remain the primary UI shell. The major change is in the backend answer pipeline.

### 1. Legal Corpus Layer

Maintain a structured knowledge base for EU and GB operational food safety sources.

Each source should include:

- jurisdiction
- authority
- source class
- legal status
- effective date
- last reviewed date
- topic tags
- canonical identifier
- superseded or replacement links where applicable

### 2. Retrieval Layer

Retrieval should rank sources in authority bands:

1. primary law
2. official guidance
3. internal guidance, templates, and best-practice material

The system should prefer fewer authoritative chunks over many low-authority chunks.

### 3. Answer Policy Layer

The model may:

- make legal claims from primary law or official guidance
- use internal material for operational framing, examples, and templates

The model may not:

- treat templates or best-practice docs as proof of legal requirements
- answer legal questions from model memory alone when retrieval is weak

### 4. Coverage Layer

Before finalizing a response, the system should determine whether the available sources are strong enough to produce:

- verified
- partially verified
- not verified

This coverage state should shape both answer content and UI presentation.

## Source Taxonomy

The corpus should be normalized into explicit source classes.

### Primary Law

- EU regulations relevant to operational food businesses
- GB retained law
- GB statutory instruments relevant to operational food safety

### Official Guidance

- FSA guidance
- GOV.UK operational guidance where appropriate and authoritative for the covered topic

### Reference Standard

- Codex HACCP materials used as a recognized reference framework

### Internal Practice

- PinkPepper templates
- PinkPepper SOPs
- PinkPepper checklists
- certification summaries and non-authoritative internal content

## Metadata Model

Every chunk should carry enough metadata to support trustworthy ranking and filtering.

Minimum fields:

- `jurisdiction`: `eu` or `gb`
- `source_class`: `primary_law`, `official_guidance`, `reference_standard`, `internal_practice`
- `authority`
- `topic`
- `effective_from`
- `reviewed_at`
- `current_status`
- `canonical_id`
- `source_name`
- `section_ref`

Helpful extensions:

- `supersedes`
- `superseded_by`
- `legal_family`
- `business_scope`

## Retrieval Rules

### Query Classification

The retrieval layer should classify whether the user is asking about:

- legal/compliance requirements
- practical operations guidance
- document generation
- audit or gap analysis

### Ranking Rules

For legal questions:

- prioritize `primary_law`
- fall back to `official_guidance` when needed
- include internal material only as supporting operational context

For operational questions:

- allow a blend of official guidance and internal best-practice material
- keep legal references explicit when they are present

For document generation:

- use law and guidance to define required content
- use internal templates to shape output structure

### Jurisdiction Rules

When a question is jurisdiction-neutral but the answer differs between EU and GB:

- present separate EU and GB subsections
- avoid blending the two into a single generic rule

When the user clearly asks about one jurisdiction:

- filter and rank that jurisdiction first

## Prompt and Answer Rules

The model should follow these core policies:

- never invent legal citations
- never present uncited legal claims as verified requirements
- clearly label when a statement comes from official law or guidance
- clearly label when a statement is PinkPepper best practice rather than law
- explicitly flag EU versus GB divergence where relevant

When retrieval is weak:

- do not fill the gap from model memory
- state that verified coverage is insufficient
- direct the user to the relevant authority or source class

## UI Implications for ChatWorkspace

The existing `ChatWorkspace` can remain, but the advisor experience should expose evidence quality more clearly.

Recommended UI additions:

- answer state badge: `Verified`, `Partially verified`, `Not verified`
- citation grouping by source class
- clearer distinction between law, guidance, and best practice
- visible jurisdiction labeling in answers where relevant

The UI should reinforce trust by making verification status legible rather than hidden in prose.

## Data Ingestion Strategy

### EU

Keep the existing EUR-Lex-based sync pattern, but tighten the corpus to operational food-business topics and improve metadata quality.

### Great Britain

Add a dedicated GB ingestion path for:

- retained operational food law
- relevant statutory instruments
- FSA operational guidance used by food businesses

GB ingestion should not depend on model knowledge or hand-written summaries alone.

### Internal Content

Continue ingesting PinkPepper internal materials, but classify them as `internal_practice` so retrieval and prompting cannot mistake them for law.

## Testing Strategy

The advisor needs tests that prove behavior, not just retrieval plumbing.

### Retrieval Tests

- jurisdiction-specific retrieval
- source-class ranking
- filtering by authoritative source types

### Policy Tests

- legal answers downgrade when only weak sources exist
- templates are not treated as legal authority
- divergence handling produces separate EU and GB sections

### Prompt Tests

- uncited legal claims are blocked
- unsupported answers fall back to partial or not-verified language

### Product Tests

- chat answers show the right verification state
- audit flows use authoritative findings where available
- document generation uses law-backed requirements plus template structure

## Delivery Strategy

The safest implementation path is incremental.

### Phase 1

- normalize source metadata
- separate source classes
- introduce verification states
- tighten prompt and answer policy

### Phase 2

- add GB ingestion pipeline
- add jurisdiction-aware retrieval and ranking
- add stronger answer-state presentation in the workspace

### Phase 3

- expand source coverage within the agreed operational scope
- add coverage reporting and source freshness monitoring

## Success Criteria

The V1 advisor is successful when:

- it can answer common EU and GB operational food safety questions with retrieved authoritative support
- it clearly separates law, guidance, and internal best practice
- it does not bluff legal details when coverage is weak
- it presents EU and GB differences clearly
- it improves user trust by exposing verification status

## Open Constraints

The quality of the advisor will depend on:

- the actual completeness of the ingested EU and GB corpus
- the quality of source metadata
- whether retrieval ranking can consistently favor authoritative sources
- whether the product accepts narrower but more reliable answers instead of broad but weak ones
