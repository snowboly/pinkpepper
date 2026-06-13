import { sanitizeUntrustedText } from "./untrusted-content";

const ALLOWED_OFFICIAL_HOSTS = new Set([
  "eur-lex.europa.eu",
  "data.europa.eu",
]);

export type OfficialEvidence = {
  sourceName: string;
  url: string;
  content: string;
  retrievedAt: string;
};

export function buildEurLexTextUrl(celex: string): string {
  if (!/^[023]\d{4}[RLD]\d{4}(?:-\d{8})?$/i.test(celex)) {
    throw new Error(`Invalid CELEX identifier: ${celex}`);
  }
  return `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=${encodeURIComponent(`CELEX:${celex.toUpperCase()}`)}`;
}

export function isAllowedOfficialUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      ALLOWED_OFFICIAL_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function verifyEuRegulation(
  celex: string,
  options: {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
  } = {}
): Promise<OfficialEvidence> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const url = buildEurLexTextUrl(celex);
  const response = await fetchImpl(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "PinkPepper legal verifier",
    },
    redirect: "manual",
    signal: AbortSignal.timeout(options.timeoutMs ?? 12_000),
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location || !isAllowedOfficialUrl(new URL(location, url).toString())) {
      throw new Error("Official source redirected to a non-allowlisted URL");
    }
    throw new Error("Official source redirect requires explicit resolution");
  }
  if (!response.ok) {
    throw new Error(`EUR-Lex returned HTTP ${response.status}`);
  }

  const content = sanitizeUntrustedText(stripHtml(await response.text()));
  if (!content) {
    throw new Error("EUR-Lex returned no usable legal text");
  }

  return {
    sourceName: `EUR-Lex ${celex.toUpperCase()}`,
    url,
    content,
    retrievedAt: new Date().toISOString(),
  };
}
