/**
 * Minimal allowlist-based HTML scrubber for article bodies.
 *
 * Threat model
 * ------------
 * Articles live in `content/articles/*.md` and ship as committed HTML.
 * They are author-controlled in the common case, but the
 * `migrate-ilovehaccp-articles` script imports bodies from a third-party
 * source, and any future migration or CMS integration could introduce
 * untrusted HTML into the same sink. Rendering that HTML through
 * `dangerouslySetInnerHTML` without any scrubbing means a single bad
 * body = stored XSS on the public article page.
 *
 * The M6 CSP (strict nonces + `'strict-dynamic'`) already blocks inline
 * `<script>` execution and inline event handlers at the browser layer.
 * This module is the second layer: it removes the dangerous constructs
 * at render time so that even if CSP is ever weakened, a malicious
 * article body cannot execute JS, exfiltrate via forms, or frame-busted
 * the page.
 *
 * Design notes
 * ------------
 * Writing a *correct* HTML sanitiser with regex is notoriously hard;
 * we deliberately do NOT attempt to parse the DOM. Instead we take a
 * narrow, targeted approach:
 *
 *   1. Drop whole tag-and-content blocks for structurally dangerous
 *      elements (`<script>`, `<style>`, `<iframe>`, `<object>`,
 *      `<embed>`, `<link>`, `<meta>`, `<form>`, `<input>`, `<button>`,
 *      `<textarea>`, `<select>`, `<noscript>`, `<template>`). These
 *      elements have no legitimate place in an editorial body.
 *
 *   2. Strip ALL `on*` event-handler attributes from every tag.
 *
 *   3. Strip `style=` attributes (CSS-injection / exfiltration surface).
 *
 *   4. Neutralise `javascript:`, `vbscript:`, and `data:` URL schemes in
 *      `href` and `src` attributes by replacing them with `#`.
 *
 *   5. Strip `<a target="_blank">` rel-less links... actually keep those
 *      alone — `target="_blank"` in editorial content is fine, and the
 *      next/link wrapping elsewhere already handles rel=noopener.
 *
 * Callers must still render through CSP-protected output. This scrubber
 * is defense-in-depth, not a replacement for CSP.
 */

// Elements whose entire tag AND content must be removed.
const DANGEROUS_BLOCK_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "noscript",
  "template",
];

function stripBlockTags(html: string): string {
  let out = html;
  for (const tag of DANGEROUS_BLOCK_TAGS) {
    // Paired form: <tag ...>...</tag>
    const paired = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}\\s*>`, "gi");
    out = out.replace(paired, "");
    // Void / self-closing form: <tag ... /> or <tag ...>
    const self = new RegExp(`<${tag}\\b[^>]*/?>`, "gi");
    out = out.replace(self, "");
  }
  return out;
}

function stripEventHandlers(html: string): string {
  // Match `on<word>=` followed by a quoted value, single-quoted value,
  // or a bareword value, and remove the whole attribute. Works on the
  // tag-attribute surface left after block-tag removal.
  return html.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

function stripStyleAttributes(html: string): string {
  return html.replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

function neutraliseDangerousUrls(html: string): string {
  // Match href/src attributes with quoted OR bareword values. If the
  // value starts with javascript:, vbscript:, or data:, rewrite it to "#".
  const attrWithUrl =
    /(\s(?:href|src)\s*=\s*)(?:(["'])([^"']*)\2|([^\s>]+))/gi;
  return html.replace(
    attrWithUrl,
    (_match, prefix: string, quote: string | undefined, quotedValue: string | undefined, bareValue: string | undefined) => {
      const value = quotedValue ?? bareValue ?? "";
      const lowered = value.trim().toLowerCase();
      const isJs = lowered.startsWith("javascript:");
      const isVb = lowered.startsWith("vbscript:");
      // data: URLs are blocked except for data:image/* in src attributes,
      // which are common in legitimate inline thumbnails. Still, we err on
      // the side of dropping data: entirely here because the primary image
      // source in PinkPepper articles is via next/image with https URLs.
      const isData = lowered.startsWith("data:");
      const safeQuote = quote ?? '"';
      if (isJs || isVb || isData) {
        return `${prefix}${safeQuote}#${safeQuote}`;
      }
      return `${prefix}${safeQuote}${value}${safeQuote}`;
    }
  );
}

/**
 * Scrub an article HTML body of dangerous constructs. Safe to call on
 * already-normalised editorial HTML; a no-op for well-formed content.
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html) return "";
  let out = stripBlockTags(html);
  out = stripEventHandlers(out);
  out = stripStyleAttributes(out);
  out = neutraliseDangerousUrls(out);
  return out;
}
