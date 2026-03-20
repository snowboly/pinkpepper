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
  /** True when auto-discovered via SPARQL rather than from the curated seed list. */
  discovered?: boolean;
};

type CoreRegulationSeed = {
  baseCelex: string;
  title: string;
  dateDocument: string;
  eliPath: string;
  legacyAliases: string[];
};

const CORE_REGULATION_SEEDS: CoreRegulationSeed[] = [
  // === General Food Law ===
  {
    baseCelex: "32002R0178",
    title: "Regulation (EC) No 178/2002 laying down the general principles and requirements of food law",
    dateDocument: "2002-01-28",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2002/178/oj",
    legacyAliases: ["EC 178 2002 general food law"],
  },

  // === Food Hygiene Package ===
  {
    baseCelex: "32004R0852",
    title: "Regulation (EC) No 852/2004 on the hygiene of foodstuffs",
    dateDocument: "2004-04-29",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2004/852/oj",
    legacyAliases: ["EC 852 2004 food hygiene", "hygiene package"],
  },
  {
    baseCelex: "32004R0853",
    title: "Regulation (EC) No 853/2004 laying down specific hygiene rules for food of animal origin",
    dateDocument: "2004-04-29",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2004/853/oj",
    legacyAliases: ["EC 853 2004 food of animal origin"],
  },
  {
    baseCelex: "32004R0854",
    title: "Regulation (EC) No 854/2004 laying down specific rules for official controls on products of animal origin",
    dateDocument: "2004-04-29",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2004/854/oj",
    legacyAliases: ["EC 854 2004 official controls animal origin"],
  },
  {
    baseCelex: "32005R2073",
    title: "Regulation (EC) No 2073/2005 on microbiological criteria for foodstuffs",
    dateDocument: "2005-11-15",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2005/2073/oj",
    legacyAliases: ["EC 2073 2005 microbiological criteria"],
  },
  {
    baseCelex: "32005R2074",
    title: "Commission Regulation (EC) No 2074/2005 laying down implementing measures for certain products under hygiene regulations",
    dateDocument: "2005-12-05",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2005/2074/oj",
    legacyAliases: ["EC 2074 2005 implementing hygiene"],
  },

  // === Official Controls ===
  {
    baseCelex: "32017R0625",
    title: "Regulation (EU) 2017/625 on official controls and other official activities to ensure the application of food and feed law",
    dateDocument: "2017-03-15",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2017/625/oj",
    legacyAliases: ["EU 2017 625 official controls", "OCR"],
  },

  // === Food Contact Materials ===
  {
    baseCelex: "32004R1935",
    title: "Regulation (EC) No 1935/2004 on materials and articles intended to come into contact with food",
    dateDocument: "2004-10-27",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2004/1935/oj",
    legacyAliases: ["EC 1935 2004 food contact materials"],
  },
  {
    baseCelex: "32011R0010",
    title: "Commission Regulation (EU) No 10/2011 on plastic materials and articles intended to come into contact with food",
    dateDocument: "2011-01-14",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2011/10/oj",
    legacyAliases: ["EU 10 2011 plastic food contact"],
  },

  // === Food Information / Labelling ===
  {
    baseCelex: "32011R1169",
    title: "Regulation (EU) No 1169/2011 on the provision of food information to consumers",
    dateDocument: "2011-10-25",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2011/1169/oj",
    legacyAliases: ["EU 1169 2011 food information", "FIC"],
  },
  {
    baseCelex: "32006R1924",
    title: "Regulation (EC) No 1924/2006 on nutrition and health claims made on foods",
    dateDocument: "2006-12-20",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2006/1924/oj",
    legacyAliases: ["EC 1924 2006 nutrition health claims"],
  },
  {
    baseCelex: "32006R1925",
    title: "Regulation (EC) No 1925/2006 on the addition of vitamins and minerals and certain other substances to foods",
    dateDocument: "2006-12-20",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2006/1925/oj",
    legacyAliases: ["EC 1925 2006 vitamins minerals fortification"],
  },

  // === Food Additives, Flavourings, Enzymes ===
  {
    baseCelex: "32008R1333",
    title: "Regulation (EC) No 1333/2008 on food additives",
    dateDocument: "2008-12-16",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2008/1333/oj",
    legacyAliases: ["EC 1333 2008 food additives"],
  },
  {
    baseCelex: "32008R1334",
    title: "Regulation (EC) No 1334/2008 on flavourings and certain food ingredients with flavouring properties for use in and on foods",
    dateDocument: "2008-12-16",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2008/1334/oj",
    legacyAliases: ["EC 1334 2008 flavourings"],
  },
  {
    baseCelex: "32008R1332",
    title: "Regulation (EC) No 1332/2008 on food enzymes",
    dateDocument: "2008-12-16",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2008/1332/oj",
    legacyAliases: ["EC 1332 2008 food enzymes"],
  },

  // === Contaminants & Residues ===
  {
    baseCelex: "32023R0915",
    title: "Commission Regulation (EU) 2023/915 on maximum levels for certain contaminants in food",
    dateDocument: "2023-04-25",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2023/915/oj",
    legacyAliases: [
      "EU 2023 915 contaminants",
      "EU 2023 465 arsenic",
      "EC 1881 2006 contaminants",
    ],
  },
  {
    baseCelex: "32005R0396",
    title: "Regulation (EC) No 396/2005 on maximum residue levels of pesticides in or on food and feed",
    dateDocument: "2005-02-23",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2005/396/oj",
    legacyAliases: ["EC 396 2005 pesticide MRLs"],
  },
  {
    baseCelex: "32010R0037",
    title: "Commission Regulation (EU) No 37/2010 on pharmacologically active substances and their classification regarding maximum residue limits in foodstuffs of animal origin",
    dateDocument: "2009-12-22",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2010/37/oj",
    legacyAliases: ["EU 37 2010 veterinary MRLs"],
  },

  // === Novel Foods ===
  {
    baseCelex: "32015R2283",
    title: "Regulation (EU) 2015/2283 on novel foods",
    dateDocument: "2015-11-25",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2015/2283/oj",
    legacyAliases: ["EU 2015 2283 novel foods"],
  },

  // === GMOs ===
  {
    baseCelex: "32003R1829",
    title: "Regulation (EC) No 1829/2003 on genetically modified food and feed",
    dateDocument: "2003-09-22",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2003/1829/oj",
    legacyAliases: ["EC 1829 2003 GMO food feed"],
  },
  {
    baseCelex: "32003R1830",
    title: "Regulation (EC) No 1830/2003 concerning the traceability and labelling of GMOs and food/feed products produced from GMOs",
    dateDocument: "2003-09-22",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2003/1830/oj",
    legacyAliases: ["EC 1830 2003 GMO traceability labelling"],
  },

  // === Organic Production ===
  {
    baseCelex: "32018R0848",
    title: "Regulation (EU) 2018/848 on organic production and labelling of organic products",
    dateDocument: "2018-05-30",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2018/848/oj",
    legacyAliases: ["EU 2018 848 organic production"],
  },

  // === Food for Specific Groups (FSG) ===
  {
    baseCelex: "32013R0609",
    title: "Regulation (EU) No 609/2013 on food intended for infants and young children, food for special medical purposes, and total diet replacement for weight control",
    dateDocument: "2013-06-12",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2013/609/oj",
    legacyAliases: ["EU 609 2013 FSG infant food", "food for specific groups"],
  },

  // === Food Supplements ===
  {
    baseCelex: "32002L0046",
    title: "Directive 2002/46/EC on the approximation of the laws of Member States relating to food supplements",
    dateDocument: "2002-06-10",
    eliPath: "https://eur-lex.europa.eu/eli/dir/2002/46/oj",
    legacyAliases: ["EC 2002 46 food supplements directive"],
  },

  // === Allergens & Specific Substances ===
  {
    baseCelex: "32006R2065",
    title: "Regulation (EC) No 2065/2003 on smoke flavourings used or intended for use in or on foods",
    dateDocument: "2003-11-10",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2003/2065/oj",
    legacyAliases: ["EC 2065 2003 smoke flavourings"],
  },

  // === Animal Feed ===
  {
    baseCelex: "32009R0767",
    title: "Regulation (EC) No 767/2009 on the placing on the market and use of feed",
    dateDocument: "2009-07-13",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2009/767/oj",
    legacyAliases: ["EC 767 2009 feed marketing"],
  },
  {
    baseCelex: "32003R1831",
    title: "Regulation (EC) No 1831/2003 on additives for use in animal nutrition",
    dateDocument: "2003-09-22",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2003/1831/oj",
    legacyAliases: ["EC 1831 2003 feed additives"],
  },

  // === Food Safety Authority ===
  {
    baseCelex: "32019R1381",
    title: "Regulation (EU) 2019/1381 on the transparency and sustainability of the EU risk assessment in the food chain",
    dateDocument: "2019-06-20",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2019/1381/oj",
    legacyAliases: ["EU 2019 1381 transparency risk assessment"],
  },

  // === Import Controls ===
  {
    baseCelex: "32019R1793",
    title: "Commission Implementing Regulation (EU) 2019/1793 on the temporary increase of official controls and emergency measures governing the entry into the Union of certain goods from certain third countries",
    dateDocument: "2019-10-22",
    eliPath: "https://eur-lex.europa.eu/eli/reg_impl/2019/1793/oj",
    legacyAliases: ["EU 2019 1793 import controls third countries"],
  },

  // === Contaminants – 2024 Amendments ===
  {
    baseCelex: "32024R1022",
    title: "Commission Regulation (EU) 2024/1022 amending Regulation (EU) 2023/915 as regards maximum levels of deoxynivalenol in food",
    dateDocument: "2024-04-08",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2024/1022/oj",
    legacyAliases: ["EU 2024 1022 deoxynivalenol", "DON mycotoxin limits"],
  },
  {
    baseCelex: "32024R1756",
    title: "Commission Regulation (EU) 2024/1756 amending and correcting Regulation (EU) 2023/915 on maximum levels for certain contaminants in food",
    dateDocument: "2024-06-25",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2024/1756/oj",
    legacyAliases: ["EU 2024 1756 contaminants amendment"],
  },

  // === Microbiological Criteria – 2024 Amendment ===
  {
    baseCelex: "32024R2895",
    title: "Commission Regulation (EU) 2024/2895 amending Regulation (EC) No 2073/2005 on microbiological criteria for foodstuffs as regards Listeria monocytogenes",
    dateDocument: "2024-11-20",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2024/2895/oj",
    legacyAliases: ["EU 2024 2895 listeria RTE", "microbiological criteria listeria"],
  },

  // === Food Contact Materials – 2024/2025 ===
  {
    baseCelex: "32024R3190",
    title: "Commission Regulation (EU) 2024/3190 on the use of bisphenol A and other bisphenols in materials and articles intended to come into contact with food",
    dateDocument: "2024-12-19",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2024/3190/oj",
    legacyAliases: ["EU 2024 3190 BPA ban", "bisphenol food contact"],
  },
  {
    baseCelex: "32025R0351",
    title: "Commission Regulation (EU) 2025/351 amending Regulation (EU) No 10/2011 on plastic materials intended to come into contact with food and Regulation (EU) 2022/1616 on recycled plastic food contact materials",
    dateDocument: "2025-02-21",
    eliPath: "https://eur-lex.europa.eu/eli/reg/2025/351/oj",
    legacyAliases: ["EU 2025 351 plastic FCM reform", "plastic food contact 2025"],
  },

  // === Pesticide Controls – 2024 ===
  {
    baseCelex: "32024R0989",
    title: "Commission Implementing Regulation (EU) 2024/989 concerning a coordinated multiannual control programme for 2025, 2026 and 2027 for pesticide residues in food",
    dateDocument: "2024-04-02",
    eliPath: "https://eur-lex.europa.eu/eli/reg_impl/2024/989/oj",
    legacyAliases: ["EU 2024 989 pesticide control programme"],
  },

  // === Extraction Solvents ===
  {
    baseCelex: "32009L0032",
    title: "Directive 2009/32/EC on the approximation of the laws of Member States on extraction solvents used in the production of foodstuffs",
    dateDocument: "2009-04-23",
    eliPath: "https://eur-lex.europa.eu/eli/dir/2009/32/oj",
    legacyAliases: ["EC 2009 32 extraction solvents"],
  },

  // === Irradiated Foods ===
  {
    baseCelex: "31999L0002",
    title: "Directive 1999/2/EC on the approximation of the laws of Member States concerning foods and food ingredients treated with ionising radiation",
    dateDocument: "1999-02-22",
    eliPath: "https://eur-lex.europa.eu/eli/dir/1999/2/oj",
    legacyAliases: ["EC 1999 2 food irradiation"],
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
    html.match(/data-celex="(0\d{4}[RL]\d{4,}-\d{8})"/i) ??
    html.match(/uri=CELEX:(0\d{4}[RL]\d{4,}-\d{8})/i);
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

/* ──────────────────────────────────────────────────────────────────────────
   Auto-discovery via EUR-Lex SPARQL
   ────────────────────────────────────────────────────────────────────────── */

/** EuroVoc concept IDs used to filter food-safety-related regulations. */
export const EUROVOC_FOOD_SAFETY_CONCEPTS = [
  "2735",  // food safety
  "1893",  // food hygiene
  "2477",  // food contamination
  "5765",  // foodstuff
  "3730",  // food additive
  "3135",  // food inspection
] as const;

const SPARQL_ENDPOINT = "https://eur-lex.europa.eu/EURLex-WS/sparql";

function buildDiscoverySparql(sinceDate: string): string {
  const values = EUROVOC_FOOD_SAFETY_CONCEPTS
    .map((id) => `<http://eurovoc.europa.eu/${id}>`)
    .join(" ");

  return `
PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>

SELECT DISTINCT ?celex ?title ?dateDocument WHERE {
  ?work cdm:resource_legal_id_celex ?celex .
  ?work cdm:work_date_document ?dateDocument .
  ?work cdm:is_about ?concept .
  ?exp cdm:expression_belongs_to_work ?work .
  ?exp cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> .
  ?exp cdm:expression_title ?title .
  VALUES ?concept { ${values} }
  FILTER(?dateDocument >= "${sinceDate}"^^xsd:date)
}
ORDER BY DESC(?dateDocument)
LIMIT 200`.trim();
}

/**
 * Query the EUR-Lex SPARQL endpoint for EU food safety regulations
 * published since `sinceDate`, excluding any already present in CORE_REGULATION_SEEDS.
 *
 * Failures are non-fatal — the caller should catch and log.
 */
export async function discoverNewRegulations(
  sinceDate: string
): Promise<CellarRegulation[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sinceDate)) {
    throw new Error(`Invalid sinceDate format: ${sinceDate}`);
  }

  const query = buildDiscoverySparql(sinceDate);
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: { Accept: "application/sparql-results+json" },
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`SPARQL endpoint returned ${response.status}`);
  }

  const json = (await response.json()) as {
    results: {
      bindings: Array<{
        celex: { value: string };
        title: { value: string };
        dateDocument: { value: string };
      }>;
    };
  };

  const seedCelexSet = new Set(CORE_REGULATION_SEEDS.map((s) => s.baseCelex));

  return json.results.bindings
    .filter((b) => !seedCelexSet.has(b.celex.value))
    .map((b) => ({
      celex: b.celex.value,
      baseCelex: b.celex.value,
      title: b.title.value,
      dateDocument: b.dateDocument.value,
      dateLastModified: b.dateDocument.value,
      legacyAliases: [],
      discovered: true,
    }));
}

/**
 * Convert a CELEX number to a human-readable source name.
 * e.g. "32004R0852" → "Regulation (EC) No 852/2004"
 */
export function celexToSourceName(celex: string): string {
  // Supports both original and consolidated CELEX forms for Regulations (R) and Directives (L).
  const match = celex.match(/^[023](\d{4})([RL])(\d{4,})(?:-\d{8})?$/);
  if (!match) return celex;

  const year = parseInt(match[1], 10);
  const type = match[2];
  const number = parseInt(match[3], 10);

  // Pre-2007 (before Lisbon Treaty): EC; 2007+: EU
  const authority = year < 2007 ? "EC" : "EU";
  const label = type === "L" ? "Directive" : "Regulation";
  return `${label} (${authority}) No ${number}/${year}`;
}
