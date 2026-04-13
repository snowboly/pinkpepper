/**
 * Return the canonical origin we consider "ours" for redirect/callback URLs.
 *
 * Trust order:
 *   1. `NEXT_PUBLIC_SITE_URL` (operator-controlled, not attacker-spoofable)
 *   2. Fall back to `x-forwarded-host` / `host` + proto ONLY when the env
 *      var is absent. This fallback exists so dev/preview deployments keep
 *      working, but it MUST NOT be used as a security boundary — callers
 *      that pass this value into a redirect or Stripe callback URL should
 *      insist on the env-pinned value in production.
 */
export function getTrustedSiteOrigin(request?: Request): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // fall through
    }
  }
  if (!request) return null;
  return deriveRequestOrigin(request);
}

function deriveRequestOrigin(request: Request): string | null {
  // Prefer the server-configured site URL so we do not trust attacker-supplied
  // x-forwarded-* headers when deciding which origin is "ours".
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    try {
      return new URL(configuredSiteUrl).origin;
    } catch {
      // Fall through to header-based derivation if the env var is malformed.
    }
  }

  const rawHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!rawHost) {
    return null;
  }

  // X-Forwarded-Host can be a comma-separated list when chained through proxies;
  // the first entry is the client-facing host.
  const host = rawHost.split(",")[0].trim();

  const rawProto = request.headers.get("x-forwarded-proto");
  const proto = rawProto
    ? rawProto.split(",")[0].trim()
    : new URL(request.url).protocol.replace(":", "");

  try {
    return new URL(`${proto}://${host}`).origin;
  } catch {
    return null;
  }
}

/**
 * Given an origin like `https://www.pinkpepper.io`, return the set of origins
 * that should be considered the same site. This exists so that users landing
 * on either the apex (`pinkpepper.io`) or the `www.` variant can POST to our
 * own billing routes without tripping the CSRF guard when `NEXT_PUBLIC_SITE_URL`
 * is pinned to only one of them.
 *
 * This does NOT open the guard to unrelated domains — we only add the direct
 * www <-> apex counterpart of the already-trusted canonical origin, both of
 * which are operator-controlled.
 */
function sameSiteOriginsFor(origin: string): Set<string> {
  const origins = new Set<string>();
  try {
    const url = new URL(origin);
    origins.add(url.origin);

    // Only toggle www for hostnames that look like a registrable domain —
    // avoid turning "localhost" into "www.localhost".
    const hostname = url.hostname;
    const isRegistrableDomain = hostname.includes(".") && !/^[0-9.]+$/.test(hostname);
    if (!isRegistrableDomain) {
      return origins;
    }

    const sibling = hostname.startsWith("www.") ? hostname.slice(4) : `www.${hostname}`;
    const siblingUrl = new URL(url.toString());
    siblingUrl.hostname = sibling;
    origins.add(siblingUrl.origin);
  } catch {
    // fall through with whatever we had
  }
  return origins;
}

/**
 * Generic same-origin guard. Re-exported as `isAllowedBillingRequest` for
 * the original billing call sites; new callers that are not billing-specific
 * (account deletion, other destructive POST/DELETE endpoints) should import
 * this name instead.
 */
export function isAllowedBillingRequest(request: Request): boolean {
  // Only POST (and other state-changing verbs) are protected; GET/HEAD are
  // safe and should not be gated here. Callers today only invoke this from POST
  // handlers, but we guard anyway to keep the helper safe to reuse.
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const expectedOrigin = deriveRequestOrigin(request);
  if (!expectedOrigin) {
    // Without a trustworthy expected origin we cannot make a safe decision.
    return false;
  }

  // Accept both the canonical origin and its www/apex counterpart so that
  // visitors on either host variant can hit the same API without a 403.
  const allowedOrigins = sameSiteOriginsFor(expectedOrigin);

  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) {
    try {
      return allowedOrigins.has(new URL(headerOrigin).origin);
    } catch {
      return false;
    }
  }

  // No Origin header — fall back to Referer, which browsers send on
  // same-origin fetches even when Origin is stripped by some policies.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowedOrigins.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  // Fail closed: modern browsers always send Origin or Referer on
  // cross-origin POSTs, so a request with neither is not a legitimate
  // same-origin browser flow and must be rejected to prevent CSRF.
  return false;
}

/** Alias with a name that reflects the generic semantics of the helper. */
export const isSameOriginRequest = isAllowedBillingRequest;
