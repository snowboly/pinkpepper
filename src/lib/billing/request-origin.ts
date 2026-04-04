function deriveRequestOrigin(request: Request): string | null {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return null;
  }

  const proto = request.headers.get("x-forwarded-proto") ?? "https";
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
