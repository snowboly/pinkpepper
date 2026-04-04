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

  if (!configuredOrigin) {
    return false;
  }

  const headerOrigin = normalizeOrigin(request.headers.get("origin"));

  if (headerOrigin) {
    return headerOrigin === configuredOrigin;
  }

  const requestOrigin = normalizeOrigin(request.url);
  return requestOrigin === configuredOrigin;
}
