function deriveRequestOrigin(request: Request): string | null {
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

export function isAllowedBillingRequest(request: Request): boolean {
  const headerOrigin = request.headers.get("origin");
  if (!headerOrigin) {
    // Browsers always send Origin on POST; missing header means
    // this is a same-origin navigation or a non-browser client.
    return true;
  }

  const expectedOrigin = deriveRequestOrigin(request);
  if (!expectedOrigin) {
    return false;
  }

  try {
    return new URL(headerOrigin).origin === expectedOrigin;
  } catch {
    return false;
  }
}
