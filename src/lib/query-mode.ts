/**
 * Detect the query mode based on message content keywords.
 * Used by the chat streaming endpoint to select system prompt + temperature.
 */
export function detectQueryMode(message: string): "qa" | "document" | "audit" {
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
