/**
 * Per-request Content-Security-Policy using nonces + `strict-dynamic`.
 *
 * Why nonces, not `'unsafe-inline'`?
 * ---------------------------------
 * The previous CSP used
 *     script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com
 * which meant any successful HTML injection on any page immediately
 * escalates to arbitrary JavaScript execution, because `'unsafe-inline'`
 * disables the browser's main XSS mitigation for script contexts.
 *
 * We generate a cryptographically random nonce per request in the
 * middleware, expose it on the incoming request via the `x-nonce` header,
 * and embed it into the outgoing `Content-Security-Policy` header. Server
 * components read the nonce through `getCspNonce()` and attach it to
 * every `<script>` tag they render. With `'strict-dynamic'` present, the
 * browser ignores host allowlists and `'unsafe-inline'` for script-src —
 * only scripts carrying the correct nonce (or scripts dynamically loaded
 * by a nonced script) will execute.
 *
 * Style nonces are intentionally NOT enforced yet because Next.js and
 * Tailwind emit inline styles we do not currently control. `style-src`
 * still uses `'unsafe-inline'` — a known residual risk captured in the
 * security audit follow-ups.
 */

import { headers } from "next/headers";

export const NONCE_HEADER = "x-nonce";

/**
 * Generate a fresh CSP nonce. 16 random bytes, base64-encoded — same
 * entropy the Next.js docs recommend.
 */
export function generateCspNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in both Node >= 16 and the Edge runtime.
  return btoa(binary);
}

/**
 * Build the `Content-Security-Policy` header value for a given nonce.
 * Kept in one place so middleware and any future report-only variant
 * stay in sync.
 */
export function buildContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic' instructs compliant browsers to trust scripts
    // loaded by a nonced script and to IGNORE host-based allowlists and
    // 'unsafe-inline'. `https:` and `'unsafe-inline'` remain as graceful
    // fallbacks for browsers that do not support 'strict-dynamic' — when
    // 'strict-dynamic' IS supported, the browser ignores them.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    // style-src: see file header — nonces here would require threading
    // nonces through every Tailwind/Next-emitted inline style, which is
    // a larger change. Tracked as an audit follow-up.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://images.pexels.com",
    "connect-src 'self' https://*.supabase.co https://api.groq.com https://api.openai.com https://api.stripe.com https://js.stripe.com https://va.vercel-scripts.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/**
 * Read the per-request CSP nonce from the incoming request headers.
 * Server components must call this and pass the result as `nonce={...}`
 * on any `<script>` they emit, otherwise the browser will block them.
 *
 * Returns `undefined` when called outside a request scope (e.g. during
 * unit tests that render a page component directly, or during static
 * prerendering). At runtime every request passes through middleware
 * which sets the nonce, so a missing nonce always means "not in a
 * request" — rendering without a nonce in that context is safe because
 * there is no CSP header to enforce either.
 */
export async function getCspNonce(): Promise<string | undefined> {
  try {
    const h = await headers();
    return h.get(NONCE_HEADER) ?? undefined;
  } catch {
    return undefined;
  }
}
