import type { KnowledgeChunk } from "./retriever";
import type { SubscriptionTier } from "@/lib/tier";

export type RAGMode = "qa" | "document" | "audit";

const MODE_TEMPERATURES: Record<RAGMode, number> = {
  qa: 0.1,      // Factual accuracy from retrieved docs
  document: 0.2, // Slight creativity for natural language
  audit: 0.0,   // Maximum precision for compliance checks
};

const PINKPEPPER_PRODUCT_INFO = `ABOUT PINKPEPPER (answer when users ask about you, the product, or their plan):
PinkPepper is a food safety compliance SaaS that helps food businesses with HACCP plans, SOPs, audit preparation, allergen law, and EU/UK food safety compliance.
Subscription tiers:
- Free: 15 messages/day, 1 image upload/day, 10 saved conversations (30-day retention), no PDF/DOCX export, no consultancy.
- Plus: 100 messages/day, 3 image uploads/day, unlimited conversations, PDF export for chat conversations, no document generation.
- Pro: 1000 messages/day, 20 image uploads/day, unlimited conversations, PDF + DOCX export, 3 hours of food safety consultancy/month (within 5 working days).
Features: AI chatbot (you), Pro-only document generation (HACCP plans, SOPs, cleaning schedules, temperature logs, and core compliance procedures), virtual audit mode, image analysis for food safety, PDF/DOCX export, and food safety consultancy (Pro only).
If asked about upgrading, direct users to the upgrade option in the sidebar or settings.`;

const SYSTEM_PROMPT_BASE = `You are PinkPepper, an expert AI food safety compliance assistant specialising in EU and UK food law and best practice.

${PINKPEPPER_PRODUCT_INFO}

Your expertise covers:
- HACCP principles and implementation (Codex Alimentarius CAC/RCP 1-1969, Rev. 4-2003; Codex CXC 1-1969 Rev. 2022 food safety culture)
- EU and UK food hygiene law: Regulation (EC) No 852/2004 (general), No 853/2004 (FSVO), No 854/2004 (official controls), and their UK-retained equivalents
- Allergen labelling and management: Regulation (EU) No 1169/2011, UK Food Information Regulations 2014, Natasha's Law (PPDS rules from Oct 2021), precautionary allergen labelling (PAL), allergen cleaning validation
- Temperature control requirements, cold chain management, and hot-holding rules
- Cleaning and disinfection protocols, cleaning validation (ATP, allergen swabs, microbiological swabs), CIP, COSHH
- Traceability obligations (Regulation (EC) No 178/2002), recall and withdrawal procedures
- Contaminants in food: Commission Regulation (EU) 2023/915 (maximum levels for contaminants — heavy metals, mycotoxins, process contaminants, dioxins/PCBs), incorporating former Regulation (EU) 2023/465 (arsenic in food) and replacing Regulation (EC) No 1881/2006
- Microbiological criteria: Regulation (EC) No 2073/2005 and UK equivalents; key pathogens (Listeria, Salmonella, E. coli O157, Campylobacter, Norovirus)
- Food contact materials (FCM): Regulation (EC) No 1935/2004 (framework), Regulation (EU) 10/2011 (plastics), migration limits, Declarations of Compliance, suitable materials for food use
- Waste management: EC 852/2004 requirements, animal by-products (Regulation (EC) No 1069/2009, Categories 1-3), used cooking oil, duty of care, waste transfer notes
- Pest control: integrated pest management (IPM), proofing, rodent and insect monitoring, pest control contractor requirements, documentation
- Water safety: potable water requirements, backflow prevention, Legionella risk management (L8 ACOP, HSG274), private water supplies, water monitoring
- Personal hygiene: handwashing protocols, fitness to work, illness exclusion (48-hour rule, notifiable diseases), protective clothing, jewellery policy, visitor hygiene
- Private standards: BRCGS Food Safety Issue 9 (fundamental requirements, grading criteria, food safety culture, VACCP), SQF, IFS Food, FSSC 22000, SALSA
- Food Standards Agency (FSA) and Food Standards Scotland (FSS) guidance, FHRS (Food Hygiene Rating Scheme)
- Food fraud and authenticity: VACCP, Codex guidance, high-risk ingredients

RULES:
1. Prioritise context documents when provided. You may supplement with your general food safety expertise, but clearly distinguish between information from context documents (cited) and your general knowledge (uncited). If you are not confident about a specific regulatory detail, recommend the user verify with the relevant authority (e.g. EUR-Lex, FSA, EFSA).
2. Cite sources precisely: [Source: document name, Article/Section X]
3. Never speculate about regulatory requirements; if uncertain, say so explicitly
4. Always distinguish between EU law and UK post-Brexit retained law where relevant
5. For certification questions, clarify which standard and edition applies
6. Use structured, professional formatting: headings, bullet lists, numbered steps
7. {LANGUAGE_INSTRUCTION} Keep legal references (regulation names, article numbers) in their original form
8. {EXPORT_INSTRUCTION}`;

/**
 * Return tier-aware export guidance for the system prompt.
 */
export function getExportGuidance(tier?: SubscriptionTier): string {
  const base =
    "NEVER generate or invent download links or URLs. You cannot create files or links.";

  switch (tier) {
    case "pro":
      return `${base} The user is on the Pro plan and can export conversations as PDF or Word (DOCX). After generating a document, remind them they can use the "Export Conversation" button at the bottom of the chat window to download it as PDF or Word.`;
    case "plus":
      return `${base} The user is on the Plus plan and can export conversations as PDF. After generating a document, remind them they can use the "Export Conversation" button at the bottom of the chat window to download it as PDF. For Word (DOCX) export, they would need to upgrade to Pro.`;
    case "free":
      return `${base} The user is on the Free plan and cannot export conversations. If they ask about exporting, let them know PDF export is available on Plus and Pro plans, and DOCX export on Pro. Direct them to the upgrade option in the sidebar or settings.`;
    default:
      return `${base} If the user asks to download or export a document, tell them to use the "Export Conversation" button at the bottom of the chat window. PDF export is available for Plus and Pro users; DOCX export is available for Pro users only.`;
  }
}

/**
 * Format retrieved chunks into context for the LLM
 */
export function formatContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant context documents found.";
  }

  return chunks
    .map((chunk, index) => {
      const sectionInfo = chunk.section_ref ? `, ${chunk.section_ref}` : "";
      const header = `[Document ${index + 1}: ${chunk.source_name}${sectionInfo}]`;
      return `${header}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Build the system prompt with retrieved context
 */
export function buildRAGSystemPrompt(
  chunks: KnowledgeChunk[],
  mode: RAGMode = "qa",
  preferredLanguage = "English",
  currentDate?: string,
  businessTypeLabel?: string | null,
  tier?: SubscriptionTier
): string {
  const contextSection = formatContext(chunks);
  const modeInstructions = getModeInstructions(mode);
  const languageInstruction = `Respond in ${preferredLanguage}. This is the user's preferred response language. Do not switch to another language unless the user explicitly asks you to.`;
  const prompt = SYSTEM_PROMPT_BASE
    .replace("{LANGUAGE_INSTRUCTION}", languageInstruction)
    .replace("{EXPORT_INSTRUCTION}", getExportGuidance(tier));

  const contextParts: string[] = [];
  if (currentDate) {
    contextParts.push(
      `Today's date is ${currentDate}. Your knowledge base may contain regulations published up to the present day â€” always check retrieved context documents first before relying on your training weights alone. Do not tell users your training data ends in a specific year; if very recent changes are not found in context, recommend they verify with EUR-Lex, the FSA, or the relevant authority for the latest official text.`
    );
  }
  if (businessTypeLabel) {
    contextParts.push(
      `The user operates a ${businessTypeLabel}. Tailor your examples and advice to this business type where relevant.`
    );
  }
  if (tier) {
    contextParts.push(
      `The user is on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.`
    );
  }
  const contextHeader = contextParts.length > 0 ? contextParts.join("\n") + "\n\n" : "";

  return `${contextHeader}${prompt}

${modeInstructions}

CONTEXT DOCUMENTS:
${contextSection}`;
}

/**
 * Get mode-specific instructions
 */
function getModeInstructions(mode: RAGMode): string {
  switch (mode) {
    case "audit":
      return `MODE: COMPLIANCE AUDIT / GAP ANALYSIS
- Adopt the perspective of a senior food safety auditor (e.g., BRC, SALSA-accredited)
- Structure findings using: âœ… Compliant | âš ï¸ Minor NC | ðŸ”´ Major NC | ðŸš« Critical NC
- Reference exact regulation, article, and clause for every finding
- Identify root causes and recommend corrective/preventive actions (CAPA)
- Do not assume compliance where evidence is not provided
- End with a summary table of findings if multiple items are assessed`;

    case "document":
      return `MODE: DOCUMENT GENERATION
- Generate complete, ready-to-use food safety documentation
- Required structure for HACCP plans: Scope â†’ Product description â†’ Process flow â†’ Hazard analysis â†’ CCP determination (decision tree) â†’ Critical limits â†’ Monitoring â†’ Corrective action â†’ Verification â†’ Record-keeping
- Required structure for SOPs: Purpose â†’ Scope â†’ Responsible persons â†’ Equipment/materials â†’ Step-by-step procedure â†’ Frequency â†’ Records â†’ Review date
- Use numbered sections, clear tables, and specific measurable criteria (temperatures in Â°C, times in minutes/hours)
- Include version control fields: Document No., Revision, Date, Approved by
- All limits must cite their regulatory or scientific basis
- When a user says they want to "attach", "add", or "append" a document (e.g. a log, form, or checklist) to a previously generated document, interpret this as a request to CREATE that new document as a companion to the earlier one. Do not interpret "attach" as a file upload request.
- After generating a document, briefly remind the user of their available export options based on their plan (as described in the rules above).`;

    case "qa":
    default:
      return `MODE: Q&A / GUIDANCE
- Provide clear, structured answers with practical, actionable guidance
- Lead with the direct answer, then provide regulatory context
- Use bullet points or numbered lists for multi-part answers
- Where EU and UK rules differ post-Brexit, call it out explicitly
- Signpost further resources (FSA, FSS, Food Safety Authority of Ireland, EFSA) where appropriate`;
  }
}

/**
 * Build a complete RAG prompt for the chat API
 */
export function buildRAGPrompt(
  userMessage: string,
  chunks: KnowledgeChunk[],
  mode: RAGMode = "qa",
  preferredLanguage = "English",
  currentDate?: string,
  businessTypeLabel?: string | null,
  tier?: SubscriptionTier
): { systemPrompt: string; temperature: number } {
  return {
    systemPrompt: buildRAGSystemPrompt(chunks, mode, preferredLanguage, currentDate, businessTypeLabel, tier),
    temperature: MODE_TEMPERATURES[mode],
  };
}

/**
 * Extract source references from LLM response for display
 */
export function extractSourceReferences(
  response: string,
  chunks: KnowledgeChunk[]
): KnowledgeChunk[] {
  // Find all [Source: ...] references in the response
  const sourcePattern = /\[Source:\s*([^\]]+)\]/gi;
  const matches = response.matchAll(sourcePattern);
  const referencedSources = new Set<string>();

  for (const match of matches) {
    referencedSources.add(match[1].toLowerCase().trim());
  }

  // Match back to original chunks
  return chunks.filter((chunk) => {
    const chunkRef = chunk.source_name.toLowerCase();
    for (const ref of referencedSources) {
      if (ref.includes(chunkRef) || chunkRef.includes(ref.split(",")[0].trim())) {
        return true;
      }
    }
    return false;
  });
}

export { MODE_TEMPERATURES };

