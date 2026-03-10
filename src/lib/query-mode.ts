export type QueryMode = "qa" | "document" | "audit";
export type QueryComplexity = "simple" | "complex";

/**
 * Detect the query mode based on message content keywords.
 * Used by the chat streaming endpoint to select system prompt + temperature.
 */
export function detectQueryMode(message: string): QueryMode {
  const lower = message.toLowerCase();

  const auditKeywords = [
    "audit", "check compliance", "check my compliance", "verify", "gap analysis",
    "non-conformance", "nonconformance", " nc ", "major nc", "minor nc", "critical nc",
    "inspection", "review my", "assess my", "evaluate my",
    "am i compliant", "are we compliant", "is this compliant",
    "do i need to", "do we need to", "what are we missing",
    "corrective action", "capa", "due diligence",
  ];
  if (auditKeywords.some((kw) => lower.includes(kw))) return "audit";

  const documentKeywords = [
    "create", "generate", "draft", "write", "produce", "build", "make me", "give me a",
    "template", "haccp plan", "sop", "standard operating procedure",
    "procedure", "log", "form", "checklist", "policy", "manual",
    "monitoring sheet", "cleaning schedule", "risk assessment",
    "flow diagram", "process flow", "control measure", "critical limit",
    "recall procedure", "traceability system", "supplier questionnaire",
    "staff training record", "induction document", "due diligence record",
    "pest control log", "delivery check", "date labelling", "labelling policy",
    "waste management plan", "water safety plan", "legionella risk assessment",
    "personal hygiene policy", "fitness to work policy", "illness policy",
    "food contact material", "fcm register", "declaration of compliance",
    "allergen matrix", "allergen chart", "cleaning validation",
    "return to work", "visitor hygiene", "visitor declaration",
  ];
  if (documentKeywords.some((kw) => lower.includes(kw))) return "document";

  return "qa";
}

/**
 * Determine complexity of a query for model routing.
 * - "complex" → use 70B model (document generation, audit, long/detailed questions)
 * - "simple"  → use 8B model (short Q&A, greetings, plan questions)
 */
export function detectComplexity(message: string, mode: QueryMode): QueryComplexity {
  // Document generation and audit modes always need the strong model
  if (mode === "document" || mode === "audit") return "complex";

  // Short messages in Q&A mode are simple
  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount <= 12) return "simple";

  // Check for complexity indicators
  const lower = message.toLowerCase();
  const complexIndicators = [
    "compare", "difference between", "explain in detail", "step by step",
    "list all", "comprehensive", "regulation", "article", "annex",
    "brcgs", "sqf", "ifs", "fssc", "haccp", "ccp",
    "cross-contamination", "microbiological", "pathogen",
    "natasha", "1169/2011", "852/2004", "853/2004", "178/2002",
    "2073/2005", "food safety act", "food safety culture",
    "prerequisite", "shelf life", "challenge test",
    "multiple", "several", "all the", "every",
  ];

  if (complexIndicators.some((kw) => lower.includes(kw))) return "complex";

  // Long messages (>30 words) likely need more reasoning
  if (wordCount > 30) return "complex";

  return "simple";
}
