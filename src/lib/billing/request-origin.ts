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

  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) {
    try {
      return new URL(headerOrigin).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  // No Origin header — fall back to Referer, which browsers send on
  // same-origin fetches even when Origin is stripped by some policies.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin;
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
