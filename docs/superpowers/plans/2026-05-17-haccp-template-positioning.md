# HACCP Template Positioning Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the HACCP feature page toward `HACCP plan template` intent while preserving PinkPepper's software-led differentiation.

**Architecture:** Update the existing feature page in place. Keep the route and overall page composition, but rewrite metadata, hero copy, section headings, and selected body paragraphs so the page leads with template language and explains the generator as the mechanism.

**Tech Stack:** Next.js, TypeScript, static page metadata, JSX content

---

## Chunk 1: Copy Strategy

### Task 1: Map the rewrite scope

**Files:**
- Modify: `src/app/features/haccp-plan-generator/page.tsx`

- [ ] Identify metadata fields that currently lead with `generator`
- [ ] Identify hero copy that should shift to `template`
- [ ] Identify body headings and paragraphs that need semantic reframing

### Task 2: Rewrite core SEO surfaces

**Files:**
- Modify: `src/app/features/haccp-plan-generator/page.tsx`

- [ ] Update `metadata.title`
- [ ] Update `metadata.description`
- [ ] Update hero H1 and supporting paragraph
- [ ] Update quick-win bullets and support chips where needed

## Chunk 2: Long-Form Content

### Task 3: Reframe long-form sections

**Files:**
- Modify: `src/app/features/haccp-plan-generator/page.tsx`

- [ ] Rewrite the opening explanatory paragraphs to introduce template-led intent
- [ ] Rename section headings to align with the approved structure
- [ ] Adjust comparison framing so PinkPepper beats a generic template by tailoring it
- [ ] Update the closing CTA copy to reinforce template-to-draft positioning

### Task 4: Verify the page still reads coherently

**Files:**
- Modify: `src/app/features/haccp-plan-generator/page.tsx`

- [ ] Review copy for collisions between `template` and `generator`
- [ ] Make sure the page still sounds like a product page rather than a free download page
- [ ] Keep UK/EU compliance framing intact

## Chunk 3: Verification

### Task 5: Run lightweight validation

**Files:**
- Test: `src/app/features/haccp-plan-generator/page.tsx`

- [ ] Run type checking or equivalent project verification
- [ ] Confirm no syntax or type issues were introduced

Plan complete and saved to `docs/superpowers/plans/2026-05-17-haccp-template-positioning.md`. Ready to execute?
