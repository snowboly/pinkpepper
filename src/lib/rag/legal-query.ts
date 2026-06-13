export type LegalRelationship =
  | "amends"
  | "amended_by"
  | "replaces"
  | "corrects"
  | "implements"
  | null;

export type LegalRequestedDetail =
  | "article"
  | "annex"
  | "date"
  | "control_frequency"
  | "certificate"
  | "analysis_report"
  | "authority"
  | "jurisdiction";

export type LegalQueryPlan = {
  precisionRequired: boolean;
  recencyRequired: boolean;
  exactReferences: string[];
  celexReferences: string[];
  targetInstrumentReferences: string[];
  relationship: LegalRelationship;
  requestedDetails: LegalRequestedDetail[];
};

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function documentNumberFromCelex(celex: string): string | null {
  const match = celex.match(/^[023](\d{4})[RLD](\d{4})$/i);
  if (!match) return null;
  return `${match[1]}/${Number(match[2])}`;
}

export function buildLegalQueryPlan(message: string): LegalQueryPlan {
  const celexReferences = unique(
    [...message.matchAll(/\b[023]\d{4}[RLD]\d{4}\b/gi)].map((match) =>
      match[0].toUpperCase()
    )
  );
  const documentReferences = [
    ...message.matchAll(/\b(19|20)\d{2}\s*\/\s*\d{1,4}\b/g),
  ].map((match) => match[0].replace(/\s+/g, ""));
  const exactReferences = unique([
    ...documentReferences,
    ...celexReferences
      .map(documentNumberFromCelex)
      .filter((value): value is string => Boolean(value)),
  ]);

  const relationship: LegalRelationship =
    /\bamended by\b/i.test(message)
      ? "amended_by"
      : /\bamend(?:s|ing|ment)?\b/i.test(message)
        ? "amends"
        : /\breplac(?:es|ing|ed)\b/i.test(message)
          ? "replaces"
          : /\bcorrect(?:s|ing|ed|ion)\b/i.test(message)
            ? "corrects"
            : /\bimplement(?:s|ing|ed)\b/i.test(message)
              ? "implements"
              : null;

  const requestedDetails: LegalRequestedDetail[] = [];
  if (/\barticle\b/i.test(message)) requestedDetails.push("article");
  if (/\bannex\b/i.test(message)) requestedDetails.push("annex");
  if (/\b(date|adopted|publication|published|entry into force|applies from)\b/i.test(message)) {
    requestedDetails.push("date");
  }
  if (/\b(control|check|sampling)\s+frequenc/i.test(message)) {
    requestedDetails.push("control_frequency");
  }
  if (/\bcertificate\b/i.test(message)) requestedDetails.push("certificate");
  if (/\banalysis report\b/i.test(message)) requestedDetails.push("analysis_report");
  if (/\b(authority|competent authority|enforce|responsible)\b/i.test(message)) {
    requestedDetails.push("authority");
  }
  if (/\b(jurisdiction|great britain|northern ireland|england|eu|uk)\b/i.test(message)) {
    requestedDetails.push("jurisdiction");
  }

  const precisionRequired = Boolean(
    exactReferences.length ||
      celexReferences.length ||
      relationship ||
      requestedDetails.length ||
      /\b(latest|most recent|current(?:ly)?|what changed)\b/i.test(message)
  );

  return {
    precisionRequired,
    recencyRequired: /\b(latest|most recent|current(?:ly)?|what changed)\b/i.test(message),
    exactReferences,
    celexReferences,
    targetInstrumentReferences: relationship ? exactReferences : [],
    relationship,
    requestedDetails: unique(requestedDetails),
  };
}
