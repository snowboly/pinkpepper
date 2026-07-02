import type { OfficialLegalIdentifier } from "./legal-authority";
import type { LegalRequestedDetail } from "./legal-query";
import { selectLegalSections, type LegalSection } from "./legal-sections";
import { sanitizeUntrustedTextUnbounded } from "./untrusted-content";

const ALLOWED_OFFICIAL_HOSTS = new Set([
  "eur-lex.europa.eu",
  "data.europa.eu",
  "legislation.gov.uk",
  "www.legislation.gov.uk",
]);
const MAX_RESPONSE_CHARS = 2_000_000;

export type OfficialEvidence = {
  identifier: OfficialLegalIdentifier;
  sourceName: string;
  url: string;
  officialUrl: string;
  content: string;
  sections: LegalSection[];
  retrievedAt: string;
};

export function buildEurLexTextUrl(celex: string): string {
  if (!/^[023]\d{4}[RLD]\d{4}(?:-\d{8})?$/i.test(celex)) {
    throw new Error(`Invalid CELEX identifier: ${celex}`);
  }
  return `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=${encodeURIComponent(`CELEX:${celex.toUpperCase()}`)}`;
}

export function buildUkLegislationTextUrl(
  identifier: Extract<OfficialLegalIdentifier, { jurisdiction: "gb" }>
): string {
  if (!/^[a-z]+$/i.test(identifier.legislationType)) {
    throw new Error(`Invalid UK legislation type: ${identifier.legislationType}`);
  }
  return `https://www.legislation.gov.uk/${identifier.legislationType.toLowerCase()}/${identifier.year}/${identifier.number}/made/data.xml`;
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

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function markupToLegalText(markup: string): string {
  return decodeEntities(
    markup
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
  )
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function documentNumberFromCelex(celex: string): string | null {
  const match = celex.match(/^[023](\d{4})[RLD](\d{4})/i);
  return match ? `${match[1]}/${Number(match[2])}` : null;
}

function confirmsIdentifier(text: string, identifier: OfficialLegalIdentifier): boolean {
  if (identifier.jurisdiction === "eu") {
    const documentNumber = documentNumberFromCelex(identifier.celex);
    return (
      text.toUpperCase().includes(identifier.celex.toUpperCase()) ||
      Boolean(documentNumber && text.includes(documentNumber))
    );
  }

  const patterns = [
    `${identifier.year}/${identifier.number}`,
    `${identifier.year} No. ${identifier.number}`,
    `${identifier.year} No ${identifier.number}`,
  ];
  return patterns.some((pattern) => text.toLowerCase().includes(pattern.toLowerCase()));
}

function sourceName(identifier: OfficialLegalIdentifier): string {
  if (identifier.jurisdiction === "eu") return `EUR-Lex ${identifier.celex.toUpperCase()}`;
  return `legislation.gov.uk ${identifier.legislationType.toUpperCase()} ${identifier.year}/${identifier.number}`;
}

async function fetchOfficialText(
  url: string,
  fetchImpl: typeof fetch,
  timeoutMs: number
): Promise<string> {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml,text/xml;q=0.9",
      "User-Agent": "PinkPepper legal verifier",
    },
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location || !isAllowedOfficialUrl(new URL(location, url).toString())) {
      throw new Error("Official source redirected to a non-allowlisted URL");
    }
    throw new Error("Official source redirect requires explicit resolution");
  }
  if (!response.ok) {
    throw new Error(`Official source returned HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentLength > MAX_RESPONSE_CHARS) {
    throw new Error("Official source response exceeded the size limit");
  }
  const body = await response.text();
  if (body.length > MAX_RESPONSE_CHARS) {
    throw new Error("Official source response exceeded the size limit");
  }
  return markupToLegalText(body);
}

export async function verifyOfficialLegislation(
  identifier: OfficialLegalIdentifier,
  requestedDetails: LegalRequestedDetail[],
  options: {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
  } = {}
): Promise<OfficialEvidence> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const url =
    identifier.jurisdiction === "eu"
      ? buildEurLexTextUrl(identifier.celex)
      : buildUkLegislationTextUrl(identifier);
  const text = await fetchOfficialText(url, fetchImpl, options.timeoutMs ?? 12_000);
  if (!confirmsIdentifier(text, identifier)) {
    throw new Error("Official source did not confirm the requested legal identifier");
  }

  const sections = selectLegalSections(text, requestedDetails).map((section) => ({
    ...section,
    content: sanitizeUntrustedTextUnbounded(section.content),
  }));
  if (sections.length === 0) {
    throw new Error("Official source returned no usable legal sections");
  }

  return {
    identifier,
    sourceName: sourceName(identifier),
    url,
    officialUrl: url,
    content: sections.map((section) => section.content).join("\n\n"),
    sections,
    retrievedAt: new Date().toISOString(),
  };
}

export async function verifyEuRegulation(
  celex: string,
  options: {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
  } = {}
): Promise<OfficialEvidence> {
  return verifyOfficialLegislation(
    { jurisdiction: "eu", celex: celex.toUpperCase() },
    [],
    options
  );
}
