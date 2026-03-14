# Premium Marketing Pass Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade PinkPepper's shared marketing chrome and homepage so the public site feels more premium, more intentional, and more trustworthy without changing product scope.

**Architecture:** Keep the work constrained to the shared public-site frame and the homepage. Improve quality through selective motion, stronger hierarchy, and cleaner shared components rather than broad refactors or a rebrand.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind CSS, Vitest

---

## File Structure

- Modify: `src/components/site/chrome.tsx`
  - Refine header and footer presentation, mobile nav treatment, and closing trust layer.
- Modify: `src/app/globals.css`
  - Replace blanket motion rules with more selective shared interaction patterns and any premium utility classes needed by the homepage/chrome.
- Modify: `src/app/page.tsx`
  - Recompose homepage structure and visual hierarchy while preserving core messaging and route links.
- Modify: `src/__tests__/seo-surface.test.ts`
  - Add regression coverage for the premium pass where shared chrome or homepage behavior changes materially.

## Chunk 1: Shared Chrome and Motion System

### Task 1: Lock premium shared chrome behaviors with failing tests

**Files:**
- Test: `src/__tests__/seo-surface.test.ts`
- Review: `src/components/site/chrome.tsx`
- Review: `src/app/globals.css`

- [ ] **Step 1: Write the failing test**

Extend the existing regression file with tests that assert:
- header still exposes a mobile navigation trigger
- footer includes premium compliance-software wording and a stronger trust/support closing structure
- global styles no longer apply the same hover-lift transform to every clickable element

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: FAIL because current shared chrome/motion patterns do not yet match the premium design.

- [ ] **Step 3: Write minimal implementation**

Update `src/components/site/chrome.tsx` and `src/app/globals.css` to:
- improve the header and mobile nav presentation
- make the footer feel more premium and trust-oriented
- replace the current blanket interaction motion with selective, component-oriented behavior

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/site/chrome.tsx src/app/globals.css src/__tests__/seo-surface.test.ts
git commit -m "feat: refine premium marketing chrome"
```

## Chunk 2: Homepage Recomposition

### Task 2: Add homepage premium-structure regressions

**Files:**
- Test: `src/__tests__/seo-surface.test.ts`
- Review: `src/app/page.tsx`

- [ ] **Step 1: Extend the failing test**

Add assertions that the homepage source contains:
- a sharper premium trust/proof band
- a more deliberate workflow or product-story section
- preserved deep links into key feature and pricing paths

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: FAIL because the homepage structure has not yet been recomposed.

- [ ] **Step 3: Write minimal implementation**

Update `src/app/page.tsx` to:
- tighten the hero and reduce surrounding noise
- improve the regulation/proof treatment
- rework the differentiation and workflow sections into a more premium narrative
- preserve and improve commercial navigation pathways
- keep the page responsive and consistent with the established identity

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/__tests__/seo-surface.test.ts
git commit -m "feat: recompose homepage for premium marketing"
```

## Chunk 3: Full Verification

### Task 3: Verify the premium pass end to end

**Files:**
- Verify only

- [ ] **Step 1: Run focused regression tests**

Run: `npx vitest run src/__tests__/seo-surface.test.ts`
Expected: PASS

- [ ] **Step 2: Run full repo tests**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: successful production build with no errors

- [ ] **Step 4: Review diff**

Run: `git diff --stat`
Expected: only intended premium marketing files and tests are changed

- [ ] **Step 5: Commit final adjustments if needed**

```bash
git add src/components/site/chrome.tsx src/app/globals.css src/app/page.tsx src/__tests__/seo-surface.test.ts
git commit -m "chore: verify premium marketing pass"
```
