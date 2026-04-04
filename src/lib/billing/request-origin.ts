function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedBillingRequest(request: Request): boolean {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const requestOrigin = normalizeOrigin(request.url);
  const headerOrigin = normalizeOrigin(request.headers.get("origin"));

  if (!configuredOrigin || !requestOrigin || requestOrigin !== configuredOrigin) {
    return false;
  }

  if (!headerOrigin) {
    return true;
  }

  return headerOrigin === configuredOrigin;
}
