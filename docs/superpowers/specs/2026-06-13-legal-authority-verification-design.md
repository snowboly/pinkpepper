# EU and UK Legal Authority Verification Design

## Goal

Prevent recurring precision-law errors by verifying the exact authoritative
instrument and operative sections needed for a claim, across both EU and UK
legislation.

The system will use ingested evidence first. It will contact an official source
only when required details are missing, relationships are unresolved, or local
evidence conflicts.

## Root Cause

The first precision-retrieval implementation has two general defects:

1. It selects the first CELEX number found in retrieved chunks. For amendment
   questions, that can be the consolidated base act rather than the amending
   act whose provisions the user requested.
2. It sanitizes a complete official document with the generic 4,000-character
   chunk limit. Operative articles, schedules, and annexes commonly occur after
   that limit and are discarded before generation.

This produces a recurring failure mode: the model can identify an amendment
from summary metadata but cannot inspect the amendment's operative provisions.
It may then infer effective dates, annex changes, or requirements from
incomplete evidence.

## Accuracy Policy

Precision legal answers must satisfy these rules:

- Resolve the instrument that owns the requested legal change before fetching
  official text.
- Verify regulation, statutory-instrument, CELEX, and legislation.gov.uk
  identifiers from evidence. Do not derive identifiers as unsupported facts.
- Verify effective or commencement dates from operative provisions, not merely
  adoption or publication metadata.
- Include annex, schedule, article, section, frequency, certificate, and
  analysis requirements only when the corresponding official section is
  present in the evidence supplied to the model.
- Treat conflicting evidence as insufficient and invoke official fallback.
- If the official source still does not contain the requested section, state
  the gap instead of using model memory.

## Jurisdiction-Neutral Evidence Contract

Introduce one evidence model shared by EU and UK resolvers:

```ts
type OfficialLegalIdentifier =
  | { jurisdiction: "eu"; celex: string }
  | {
      jurisdiction: "gb";
      legislationType: string;
      year: number;
      number: number;
      extent?: "uk" | "england" | "wales" | "scotland" | "northern_ireland";
    };

type OfficialLegalEvidence = {
  identifier: OfficialLegalIdentifier;
  sourceName: string;
  officialUrl: string;
  retrievedAt: string;
  relationshipTargets: string[];
  sections: Array<{
    kind:
      | "title"
      | "metadata"
      | "preamble"
      | "article"
      | "section"
      | "schedule"
      | "annex"
      | "signature";
    reference: string | null;
    content: string;
  }>;
};
```

Official evidence remains temporary answer context. It does not bypass the
normal ingestion pipeline or become permanent knowledge automatically.

## Authority Resolution

### Relationship-first selection

For amendment, correction, replacement, or implementation questions:

1. Rank chunks containing the requested target and relationship in the same
   source.
2. Select the source representing the amending or modifying instrument.
3. Reject a consolidated base act as the verification target when another
   retrieved source explicitly owns the requested amendment.
4. Use the consolidated act only as supporting current-state evidence.

The resolver must return both the selected official identifier and an
explanation suitable for diagnostics, such as:

```ts
{
  identifier: { jurisdiction: "eu", celex: "32026R0459" },
  reason: "explicit amendment source for target 2019/1793",
  sourceChunkIds: ["..."]
}
```

### EU identifiers

Accept exact CELEX identifiers from metadata or user input. A document number
may be converted to a CELEX candidate only for URL resolution; the returned
EUR-Lex document must confirm that CELEX and title before the identifier is
treated as verified.

### UK identifiers

Resolve UK acts from canonical metadata:

- `source_key`, such as `uk:uksi:2013:2996`
- `official_url`
- `text_url`
- legislation type, year, and number

Allow user-entered canonical references such as `UKSI 2013/2996`, but require
the legislation.gov.uk response to confirm the identifier and title.

## Official Fetching

### EU

Fetch exact EUR-Lex CELEX HTML or XML from:

- `eur-lex.europa.eu`
- `data.europa.eu`

Confirm that the returned document identifies the requested CELEX and legal
title. Reject unrelated pages, consent pages, and non-allowlisted redirects.

### UK

Fetch exact legislation XML or HTML from:

- `www.legislation.gov.uk`
- `legislation.gov.uk`

Prefer revised/current text for current-law questions and made/original text
when the user asks what a particular amending instrument introduced.

### Network safety

Require HTTPS, disallow credentials in URLs, reject non-allowlisted hosts, use
manual redirects, enforce timeouts, and cap downloaded response size.

## Section-Aware Extraction

Do not pass the beginning of a whole document through the generic per-chunk
truncation function.

Parse official text into legal sections while preserving headings and table
rows. Select sections according to the query:

- dates: title metadata plus commencement, entry-into-force, application, and
  transitional provisions
- amendments: amending clauses plus relationship title/preamble
- articles or sections: exact referenced provision
- annexes or schedules: matching annex/schedule headings and complete changed
  rows
- controls and frequencies: sections containing percentage or frequency terms
- certificates and analysis reports: operative provisions and linked annex rows
- authority: operative provision plus current official operational guidance

Apply limits after section selection:

- a per-section safety cap large enough for complete legal rows
- a total answer-context budget
- explicit truncation markers when a selected section exceeds its cap

Sanitization must continue stripping prompt-control tokens and unsafe framing,
but length limiting must be separate from sanitization.

## Evidence Sufficiency and Conflict Detection

Evidence assessment should operate on structured sections, not loose keyword
presence across unrelated chunks.

A requested detail is sufficient only when:

- the selected instrument is verified;
- the relationship and target occur in one authoritative source;
- the relevant section type is present;
- dates include the operative wording needed to calculate the date;
- frequencies, certificates, and analysis requirements appear in the same
  operative provision or annex row.

Evidence is conflicting when authoritative sources disagree on an identifier,
relationship, current version, date, or operative requirement. Conflict invokes
official fallback even if every requested keyword appears locally.

## Effective-Date Handling

Store and expose distinct date concepts:

- adoption or made date
- publication date
- entry-into-force or commencement date
- application date
- transitional end date

The verifier should return operative wording rather than silently calculating
dates. A deterministic helper may calculate phrases such as "the day following
publication", but the prompt must receive both the wording and resulting date.

## Retrieval Diagnostics

Return non-user-facing diagnostics with each precision retrieval:

- parsed jurisdiction and requested details
- candidate instruments and ranking reasons
- selected verification identifier and reason
- whether fallback ran
- official URL attempted
- selected section references
- missing or conflicting details
- fetch or parsing error

Diagnostics should avoid document bodies and credentials. Existing server logs
may record concise failures; full diagnostics can be attached to internal
metadata where an established safe mechanism exists.

## Failure Behavior

If local evidence is sufficient and consistent, do not make an external
request.

If official verification fails:

- retain supported local claims;
- mark unresolved claims as unverified;
- include the official URL attempted when available;
- never infer the missing annex, schedule, date, frequency, certificate, or
  authority assignment.

## Testing

Add deterministic regressions for:

- EU amendment source selected over its consolidated base act
- EU entry into force derived from operative wording
- late EUR-Lex annex rows retained after section extraction
- UK amending SI selected over the principal regulation
- UK commencement and schedule extraction
- fallback skipped when local evidence is complete
- fallback invoked for incomplete or conflicting evidence
- identifier confirmation failures
- redirect, host, timeout, and response-size protections
- partial-answer behavior when official sources are unavailable

The recorded `2026/459` failure is one fixture, not a special-case production
rule.

## Delivery

Implement this as a follow-up PR from current `main`. Keep the existing legal
query parser and lexical retrieval where they remain valid. Replace the
EU-specific verifier boundary with the shared authority resolver, jurisdiction
adapters, section extractor, and structured evidence assessment.
