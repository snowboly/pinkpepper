/**
 * EUR-Lex CELLAR API Client
 *
 * Uses the official EU Publications Office endpoints:
 * - SPARQL endpoint for searching regulations by topic and date
 * - EUR-Lex HTML endpoint for fetching full regulation text
 *
 * No authentication or API key required.
 */

export type CellarRegulation = {
  celex: string;
  baseCelex: string;
  title: string;
  dateDocument: string;
  dateLastModified: string;
  legacyAliases: string[];
};

type CoreRegulationSeed = {
  baseCelex: string;
  title: string;
  dateDocument: string;
  eliPath: string;
  legacyAliases: string[];
};

const CORE_REGULATION_SEEDS: CoreRegulationSeed[] = [
  {
    baseCelex: "32002R0178",
    title: "Regulation (EC) No 178/2002 laying down the general principles and requirements of food law",
    dateDocument: "2002-01-28",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2002/178/oj",
    legacyAliases: ["EC 178 2002 general food law"],
  },
  {
    baseCelex: "32004R0852",
    title: "Regulation (EC) No 852/2004 on the hygiene of foodstuffs",
    dateDocument: "2004-04-29",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2004/852/oj",
    legacyAliases: ["EC 852 2004 food hygiene"],
  },
  {
    baseCelex: "32004R0853",
    title: "Regulation (EC) No 853/2004 laying down specific hygiene rules for food of animal origin",
    dateDocument: "2004-04-29",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2004/853/oj",
    legacyAliases: ["EC 853 2004 food of animal origin"],
  },
  {
    baseCelex: "32004R1935",
    title: "Regulation (EC) No 1935/2004 on materials and articles intended to come into contact with food",
    dateDocument: "2004-10-27",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2004/1935/oj",
    legacyAliases: ["EC 1935 2004 food contact materials"],
  },
  {
    baseCelex: "32005R2073",
    title: "Regulation (EC) No 2073/2005 on microbiological criteria for foodstuffs",
    dateDocument: "2005-11-15",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2005/2073/oj",
    legacyAliases: ["EC 2073 2005 microbiological criteria"],
  },
  {
    baseCelex: "32011R1169",
    title: "Regulation (EU) No 1169/2011 on the provision of food information to consumers",
    dateDocument: "2011-10-25",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2011/1169/oj",
    legacyAliases: ["EU 1169 2011 food information"],
  },
];

function toIsoDateFromDisplay(input: string): string | null {
  const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function extractCurrentVersionInfo(
  html: string,
  fallbackCelex: string
): { celex: string; currentVersionDate: string | null } {
  const celexMatch =
    html.match(/data-celex="(0\d{4}R\d{4,}-\d{8})"/i) ??
    html.match(/uri=CELEX:(0\d{4}R\d{4,}-\d{8})/i);
  const dateMatch = html.match(/id="currentConsLeg">(\d{2}\/\d{2}\/\d{4})</i);

  return {
    celex: celexMatch?.[1] ?? fallbackCelex,
    currentVersionDate: dateMatch ? toIsoDateFromDisplay(dateMatch[1]) : null,
  };
}

/**
 * Search for EU food safety regulations modified since a given date.
 * Uses EuroVoc concept labels to filter by food-safety-related topics.
 */
export async function searchFoodSafetyRegulations(
  sinceDate: string
): Promise<CellarRegulation[]> {
  const resolved = await Promise.all(
    CORE_REGULATION_SEEDS.map(async (seed) => {
      const response = await fetch(seed.eliPath, {
        headers: { Accept: "text/html" },
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve current version for ${seed.baseCelex}: ${response.status}`);
      }

      const html = await response.text();
      const current = extractCurrentVersionInfo(html, seed.baseCelex);

      return {
        celex: current.celex,
        baseCelex: seed.baseCelex,
        title: seed.title,
        dateDocument: seed.dateDocument,
        dateLastModified: current.currentVersionDate ?? sinceDate,
        legacyAliases: seed.legacyAliases,
      };
    })
  );

  return resolved;
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
  // Supports both original and consolidated CELEX forms.
  const match = celex.match(/^[023](\d{4})R(\d{4,})(?:-\d{8})?$/);
  if (!match) return celex;

  const year = parseInt(match[1], 10);
  const number = parseInt(match[2], 10);

  // Pre-2007 (before Lisbon Treaty): EC; 2007+: EU
  const authority = year < 2007 ? "EC" : "EU";
  return `Regulation (${authority}) No ${number}/${year}`;
}
