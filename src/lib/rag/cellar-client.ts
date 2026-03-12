/**
 * EUR-Lex CELLAR API Client
 *
 * Uses the official EU Publications Office endpoints:
 * - SPARQL endpoint for searching regulations by topic and date
 * - EUR-Lex HTML endpoint for fetching full regulation text
 *
 * No authentication or API key required.
 */

const SPARQL_ENDPOINT = "https://publications.europa.eu/webapi/rdf/sparql";

export type CellarRegulation = {
  celex: string;
  title: string;
  dateDocument: string;
  dateLastModified: string;
};

/**
 * Search for EU food safety regulations modified since a given date.
 * Uses EuroVoc concept labels to filter by food-safety-related topics.
 */
export async function searchFoodSafetyRegulations(
  sinceDate: string
): Promise<CellarRegulation[]> {
  const query = `
PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?celex ?title ?dateDocument ?dateLastModified
WHERE {
  ?work cdm:resource_legal_id_celex ?celex .
  ?work cdm:work_has_resource-type <http://publications.europa.eu/resource/authority/resource-type/REG> .
  ?work cdm:resource_legal_date_document ?dateDocument .
  ?work cdm:work_date_document ?dateLastModified .
  ?exp cdm:expression_belongs_to_work ?work .
  ?exp cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> .
  ?exp cdm:expression_title ?title .

  ?work cdm:work_is_about_concept_eurovoc ?concept .
  ?concept skos:prefLabel ?conceptLabel .
  FILTER(LANG(?conceptLabel) = "en")
  FILTER(
    CONTAINS(LCASE(?conceptLabel), "food safety") ||
    CONTAINS(LCASE(?conceptLabel), "food hygiene") ||
    CONTAINS(LCASE(?conceptLabel), "food contamination") ||
    CONTAINS(LCASE(?conceptLabel), "food additive") ||
    CONTAINS(LCASE(?conceptLabel), "food labelling") ||
    CONTAINS(LCASE(?conceptLabel), "foodstuff") ||
    CONTAINS(LCASE(?conceptLabel), "animal nutrition") ||
    CONTAINS(LCASE(?conceptLabel), "food inspection")
  )
  FILTER(?dateLastModified >= "${sinceDate}"^^xsd:date)
}
ORDER BY DESC(?dateLastModified)
LIMIT 50
`.trim();

  const params = new URLSearchParams({
    query,
    format: "application/sparql-results+json",
  });

  const response = await fetch(`${SPARQL_ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/sparql-results+json" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    results: {
      bindings: Array<{
        celex: { value: string };
        title: { value: string };
        dateDocument: { value: string };
        dateLastModified: { value: string };
      }>;
    };
  };

  // Deduplicate by CELEX number (SPARQL may return duplicates from multiple concept matches)
  const seen = new Set<string>();
  const results: CellarRegulation[] = [];

  for (const binding of data.results.bindings) {
    const celex = binding.celex.value;
    if (seen.has(celex)) continue;
    seen.add(celex);

    results.push({
      celex,
      title: binding.title.value,
      dateDocument: binding.dateDocument.value,
      dateLastModified: binding.dateLastModified.value,
    });
  }

  return results;
}

/**
 * Fetch the full English text of a regulation by CELEX number.
 * Returns cleaned plain text (HTML stripped).
 */
export async function fetchRegulationText(celexNumber: string): Promise<string> {
  const url = `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:${encodeURIComponent(celexNumber)}`;

  const response = await fetch(url, {
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch regulation ${celexNumber}: ${response.status}`);
  }

  const html = await response.text();
  return stripHtmlToText(html);
}

/**
 * Strip HTML tags and decode common entities to produce clean text.
 */
function stripHtmlToText(html: string): string {
  return html
    // Remove script and style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Replace block-level tags with newlines
    .replace(/<\/(p|div|h[1-6]|li|tr|br\s*\/?)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // Remove all remaining tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    // Normalize whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Convert a CELEX number to a human-readable source name.
 * e.g. "32004R0852" → "Regulation (EC) No 852/2004"
 */
export function celexToSourceName(celex: string): string {
  // CELEX format for regulations: 3{YYYY}R{NNNN}
  const match = celex.match(/^3(\d{4})R(\d{4,})$/);
  if (!match) return celex;

  const year = parseInt(match[1], 10);
  const number = parseInt(match[2], 10);

  // Pre-2007 (before Lisbon Treaty): EC; 2007+: EU
  const authority = year < 2007 ? "EC" : "EU";
  return `Regulation (${authority}) No ${number}/${year}`;
}
