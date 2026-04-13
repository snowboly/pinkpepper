import { describe, it, expect } from "vitest";
import {
  formatContext,
  buildRAGSystemPrompt,
  buildRAGPrompt,
  extractSourceReferences,
  MODE_TEMPERATURES,
  classifyQAIntent,
  isExactReferenceQuestion,
  isRecentChangeQuestion,
  responseMeetsIntentContract,
} from "@/lib/rag/prompt-builder";
import type { KnowledgeChunk } from "@/lib/rag/retriever";

function makeChunk(overrides: Partial<KnowledgeChunk> = {}): KnowledgeChunk {
  return {
    id: "chunk-1",
    content: "Chilled food must be stored at or below 8°C.",
    source_type: "regulation",
    source_name: "EC 852/2004",
    section_ref: "Annex II, Chapter IX",
    metadata: {},
    similarity: 0.85,
    ...overrides,
  };
}

describe("MODE_TEMPERATURES", () => {
  it("qa temperature is 0.1", () => {
    expect(MODE_TEMPERATURES.qa).toBe(0.1);
  });

  it("document temperature is 0.2", () => {
    expect(MODE_TEMPERATURES.document).toBe(0.2);
  });

  it("audit temperature is 0.0", () => {
    expect(MODE_TEMPERATURES.audit).toBe(0.0);
  });
});

describe("formatContext", () => {
  it("formats chunks with headers", () => {
    const result = formatContext([makeChunk()]);
    expect(result).toContain("[Source: EC 852/2004, Annex II, Chapter IX]");
    expect(result).toContain("Chilled food must be stored at or below 8°C.");
  });

  it("includes section ref when present", () => {
    const result = formatContext([makeChunk({ section_ref: "Article 5" })]);
    expect(result).toContain("[Source: EC 852/2004, Article 5]");
  });

  it("omits section ref when null", () => {
    const result = formatContext([makeChunk({ section_ref: null })]);
    expect(result).toContain("[Source: EC 852/2004]");
    expect(result).not.toContain(",]");
  });

  it("separates multiple chunks with dividers", () => {
    const chunks = [
      makeChunk({ id: "1", source_name: "Doc A" }),
      makeChunk({ id: "2", source_name: "Doc B" }),
    ];
    const result = formatContext(chunks);
    expect(result).toContain("---");
    expect(result).toContain("[Source: Doc A");
    expect(result).toContain("[Source: Doc B");
  });

  it("returns fallback message for empty chunks", () => {
    expect(formatContext([])).toBe("No relevant context documents found.");
  });
});

describe("buildRAGSystemPrompt", () => {
  it("includes base system prompt", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()]);
    expect(prompt).toContain("PinkPepper");
    expect(prompt).toContain("HACCP");
  });

  it("includes context documents section", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()]);
    expect(prompt).toContain("CONTEXT DOCUMENTS:");
    expect(prompt).toContain("Chilled food must be stored");
  });

  it("does not mention a training cutoff date", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()], "qa", "English", "2026-03-25", null, "pro");

    expect(prompt).not.toContain("training data ends");
    expect(prompt).not.toContain("training weights alone");
  });

  it("describes conversation export as DOCX-only", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()], "qa", "English", "2026-03-25", null, "pro");

    expect(prompt).toContain("DOCX");
    expect(prompt).not.toContain("PDF");
  });

  it("includes Q&A mode instructions by default", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()]);
    expect(prompt).toContain("Q&A");
  });

  it("includes audit mode instructions when specified", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()], "audit");
    expect(prompt).toContain("COMPLIANCE AUDIT");
    expect(prompt).toContain("Minor NC");
  });

  it("includes document mode instructions when specified", () => {
    const prompt = buildRAGSystemPrompt([makeChunk()], "document");
    expect(prompt).toContain("DOCUMENT GENERATION");
    expect(prompt).toContain("HACCP plans");
  });

  it("instructs the model not to fill legal gaps from memory", () => {
    const prompt = buildRAGSystemPrompt([], "qa", "English", "2026-03-23");
    expect(prompt).toContain("do NOT invent or name any document, publication date, or regulatory text from memory");
  });
});

describe("buildRAGPrompt", () => {
  it("returns system prompt and qa temperature", () => {
    const result = buildRAGPrompt("question", [makeChunk()], "qa");
    expect(result.temperature).toBe(0.1);
    expect(result.systemPrompt).toContain("PinkPepper");
  });

  it("adds a stricter structure for regulation-applicability questions", () => {
    const result = buildRAGPrompt(
      "I run a restaurant in London. What food safety regulations apply to me?",
      [makeChunk({ source_name: "UK food hygiene regulations 2006" })],
      "qa",
      "English",
      "2026-04-03",
      "restaurant or café",
      "pro"
    );

    expect(result.systemPrompt).toContain("When the user asks what regulations apply to their business");
    expect(result.systemPrompt).toContain("Start with a short bottom-line summary tailored to their location and business type");
    expect(result.systemPrompt).toContain("Core laws and official guidance that apply");
    expect(result.systemPrompt).toContain("Immediate actions the business should take now");
    expect(result.systemPrompt).toContain("do NOT answer with a generic list");
  });

  it("does not apply the legal-applicability Q&A format to audit prompts", () => {
    const result = buildRAGPrompt(
      "Which food safety regulations apply to this London restaurant?",
      [makeChunk({ source_name: "UK food hygiene regulations 2006" })],
      "audit",
      "English",
      "2026-04-03",
      "restaurant or café",
      "pro"
    );

    expect(result.systemPrompt).toContain("COMPLIANCE AUDIT");
    expect(result.systemPrompt).not.toContain("LEGAL APPLICABILITY FORMAT:");
    expect(result.systemPrompt).not.toContain("Core laws and official guidance that apply");
  });

  it("returns audit temperature", () => {
    const result = buildRAGPrompt("audit this", [makeChunk()], "audit");
    expect(result.temperature).toBe(0.0);
  });

  it("returns document temperature", () => {
    const result = buildRAGPrompt("create a plan", [makeChunk()], "document");
    expect(result.temperature).toBe(0.2);
  });

  it("defaults to qa mode", () => {
    const result = buildRAGPrompt("question", [makeChunk()]);
    expect(result.temperature).toBe(0.1);
  });

  it("adds a stricter structure for label-requirements questions", () => {
    const result = buildRAGPrompt(
      "I'm a food manufacturer in Germany creating a label for a soup with celery, milk, and wheat. What must appear on the label?",
      [makeChunk({ source_name: "Regulation (EU) No 1169/2011" })],
      "qa",
      "English",
      "2026-04-04",
      "food manufacturer",
      "pro"
    );

    expect(result.systemPrompt).toContain("LABEL REQUIREMENTS FORMAT:");
    expect(result.systemPrompt).toContain("What type of product and label situation this is");
    expect(result.systemPrompt).toContain("Mandatory particulars that must appear");
    expect(result.systemPrompt).toContain("Missing facts needed before finalising the label");
    expect(result.systemPrompt).toContain("Do NOT turn intentional allergens into generic \"allergen warning\" filler");
    expect(result.systemPrompt).toContain("Distinguish clearly between prepacked retail, PPDS, and loose or foodservice sale");
    expect(result.systemPrompt).toContain("do NOT describe a separate \"Contains\" statement as interchangeable with ingredients-list allergen emphasis");
  });

  it("adds a stricter structure for allergen-control questions", () => {
    const result = buildRAGPrompt(
      "I run a small cafe in England. A customer asks whether one of our sandwiches is gluten-free. What should my staff do before answering, and when should we refuse to make that claim?",
      [makeChunk({ source_name: "FSA allergen guidance" })],
      "qa",
      "English",
      "2026-04-04",
      "cafe",
      "pro"
    );

    expect(result.systemPrompt).toContain("ALLERGEN CONTROL FORMAT:");
    expect(result.systemPrompt).toContain("Immediate decision or response");
    expect(result.systemPrompt).toContain("When the business must refuse to make the claim or stop the sale");
    expect(result.systemPrompt).toContain("Do NOT suggest \"may contain\" wording for an ingredient that is intentionally present");
  });

  it("treats manufacturer recipe-change label checks as label-and-release-control questions", () => {
    const result = buildRAGPrompt(
      "I run a small food manufacturing business in Germany. We changed a soup recipe and it now includes celery and milk. What label checks, allergen updates, and release controls should we complete before the new batch goes on sale?",
      [makeChunk({ source_name: "Regulation (EU) No 1169/2011" })],
      "qa",
      "English",
      "2026-04-04",
      "food manufacturer",
      "pro"
    );

    expect(result.systemPrompt).toContain("LABEL REQUIREMENTS FORMAT:");
    expect(result.systemPrompt).toContain("label-and-release-control question");
    expect(result.systemPrompt).toContain("updated raw material specifications");
    expect(result.systemPrompt).toContain("artwork approval");
    expect(result.systemPrompt).toContain("wrong-pack prevention");
  });

  it("adds a stricter structure for recordkeeping questions", () => {
    const result = buildRAGPrompt(
      "What records should I keep for my restaurant in London?",
      [makeChunk({ source_name: "Food Safety Act 1990" })],
      "qa",
      "English",
      "2026-04-04",
      "restaurant",
      "pro"
    );

    expect(result.systemPrompt).toContain("RECORDKEEPING REQUIREMENTS FORMAT:");
    expect(result.systemPrompt).toContain("Core records the business should keep");
    expect(result.systemPrompt).toContain("Which records matter most in inspection or incident situations");
  });

  it("adds a stricter structure for inspection-readiness questions", () => {
    const result = buildRAGPrompt(
      "What will an inspector expect to see first at my small restaurant in London?",
      [makeChunk({ source_name: "Food Hygiene (England) Regulations 2013" })],
      "qa",
      "English",
      "2026-04-04",
      "restaurant",
      "pro"
    );

    expect(result.systemPrompt).toContain("INSPECTION READINESS FORMAT:");
    expect(result.systemPrompt).toContain("What an inspector will usually ask for first");
    expect(result.systemPrompt).toContain("What the business should check before inspection");
  });

  it("adds anti-speculation guardrails for very recent change questions", () => {
    const result = buildRAGPrompt(
      "What changed in food safety law last week for my type of business?",
      [],
      "qa",
      "English",
      "2026-04-04",
      "restaurant",
      "pro"
    );

    expect(result.systemPrompt).toContain("UNCERTAINTY HANDLING:");
    expect(result.systemPrompt).toContain("Do NOT say you are a general AI");
    expect(result.systemPrompt).toContain("latest change is not verified from the current support");
  });

  it("adds anti-speculation guardrails for exact article lookup questions", () => {
    const result = buildRAGPrompt(
      "Which article number says I must review my SOP every 90 days?",
      [],
      "qa",
      "English",
      "2026-04-04",
      "food manufacturer",
      "pro"
    );

    expect(result.systemPrompt).toContain("exact article, clause, section, or review frequency");
    expect(result.systemPrompt).toContain("Do NOT offer nearby regulations, certification standards, or guessed review frequencies");
    expect(result.systemPrompt).toContain("ask one short narrowing follow-up");
  });
});

describe("consultant-grade qa intent detection", () => {
  it("classifies regulation applicability questions separately from generic qa", () => {
    expect(
      classifyQAIntent("I run a restaurant in London. What food safety regulations apply to me?")
    ).toBe("legal_applicability");
  });

  it("classifies label questions separately from generic qa", () => {
    expect(
      classifyQAIntent("What must appear on the label for a soup containing celery, milk, and wheat?")
    ).toBe("label_requirements");
  });

  it("classifies label requirements phrasing as label requirements", () => {
    expect(
      classifyQAIntent("What are the label requirements for a soup containing celery, milk, and wheat?")
    ).toBe("label_requirements");
  });

  it("classifies gluten-free customer-answer questions as allergen control", () => {
    expect(
      classifyQAIntent("A customer asks whether one of our sandwiches is gluten-free. What should my staff do before answering?")
    ).toBe("allergen_control");
  });

  it("classifies recipe-change release-control label questions as label requirements", () => {
    expect(
      classifyQAIntent("We changed a soup recipe. What label checks and release controls should we complete before the new batch goes on sale?")
    ).toBe("label_requirements");
  });

  it("classifies recipe-change allergen questions as allergen control", () => {
    expect(
      classifyQAIntent("We changed our brownie recipe and it now contains walnuts. What must we update before selling it again?")
    ).toBe("allergen_control");
  });

  it("classifies recordkeeping questions separately from generic qa", () => {
    expect(
      classifyQAIntent("What records should I keep for my restaurant in London?")
    ).toBe("recordkeeping_requirements");
  });

  it("classifies inspection-readiness questions separately from generic qa", () => {
    expect(
      classifyQAIntent("What will an inspector expect to see first at my small restaurant in London?")
    ).toBe("inspection_readiness");
  });

  it("detects recent-change questions", () => {
    expect(isRecentChangeQuestion("What changed in food safety law last week?")).toBe(true);
  });

  it("detects exact-reference questions", () => {
    expect(isExactReferenceQuestion("Which article number says I must review my SOP every 90 days?")).toBe(true);
  });
});

describe("response intent contracts", () => {
  it("rejects a legal applicability answer that omits operational records and inspection expectations", () => {
    const answer = `You must comply with food safety law in England.

Core laws and official guidance that apply
- Food Safety Act 1990
- Regulation (EC) No 852/2004

What those laws mean for this business in practice
- You need a food safety management system.`;

    expect(
      responseMeetsIntentContract(
        "legal_applicability",
        answer,
        "I run a restaurant in London. What food safety laws apply to me?"
      )
    ).toBe(false);
  });

  it("accepts a label answer only when it covers mandatory particulars and missing information", () => {
    const answer = `What type of product and label situation this is
This is a prepacked retail food label for an EU food manufacturer.

Laws and guidance that apply
- Regulation (EU) No 1169/2011

Mandatory particulars that must appear
- Name of the food
- Ingredients list
- Allergens emphasised

Allergen, emphasis, language, and field-of-vision issues
- Celery, milk, and wheat must be emphasised in the ingredients list.

Missing facts needed before finalising the label
- Net quantity
- Durability date

Practical next actions
- Confirm pack size and shelf life.`;

    expect(
      responseMeetsIntentContract(
        "label_requirements",
        answer,
        "What must appear on the label for a soup with celery, milk, and wheat?"
      )
    ).toBe(true);
  });

  it("rejects an allergen-control answer that does not set refusal rules", () => {
    const answer = `Immediate decision or response
- Check the ingredients.

Checks the business must complete before answering or selling
- Review the recipe and prep method.

Records and controls that should already be in place
- Allergen matrix and training records.`;

    expect(
      responseMeetsIntentContract(
        "allergen_control",
        answer,
        "A customer asks whether one of our sandwiches is gluten-free. What should my staff do before answering?"
      )
    ).toBe(false);
  });

  it("rejects a recordkeeping answer that does not distinguish critical inspection records", () => {
    const answer = `Core records the business should keep
- Cleaning records
- Training records

Why each record matters operationally
- They help maintain control.`;

    expect(
      responseMeetsIntentContract(
        "recordkeeping_requirements",
        answer,
        "What records should I keep for my restaurant in London?"
      )
    ).toBe(false);
  });

  it("accepts an inspection-readiness answer only when it identifies first-check evidence and practical gaps", () => {
    const answer = `What an inspector will usually ask for first
- Food safety management system
- Recent monitoring records

What the inspector is trying to confirm
- That controls are in place and being followed

What the business should check before inspection
- Records are current and corrective actions are closed

Common weak points inspectors pick up quickly
- Incomplete records and poor allergen controls

Immediate pre-inspection actions
- Review the latest records and verify cleaning and temperature checks`;

    expect(
      responseMeetsIntentContract(
        "inspection_readiness",
        answer,
        "What will an inspector expect to see first at my small restaurant in London?"
      )
    ).toBe(true);
  });
});

describe("extractSourceReferences", () => {
  it("extracts matching chunks from response", () => {
    const chunks = [
      makeChunk({ source_name: "EC 852/2004" }),
      makeChunk({ id: "2", source_name: "EC 178/2002" }),
    ];

    const response = "According to [Source: EC 852/2004, Annex II] the requirement is...";
    const matched = extractSourceReferences(response, chunks);

    expect(matched).toHaveLength(1);
    expect(matched[0].source_name).toBe("EC 852/2004");
  });

  it("returns empty array when no references found", () => {
    const chunks = [makeChunk()];
    const response = "There are no source references in this text.";
    expect(extractSourceReferences(response, chunks)).toHaveLength(0);
  });

  it("matches multiple references", () => {
    const chunks = [
      makeChunk({ id: "1", source_name: "EC 852/2004" }),
      makeChunk({ id: "2", source_name: "EC 178/2002" }),
    ];

    const response =
      "See [Source: EC 852/2004, Chapter IX] and [Source: EC 178/2002, Article 18].";
    const matched = extractSourceReferences(response, chunks);
    expect(matched).toHaveLength(2);
  });

  it("is case insensitive", () => {
    const chunks = [makeChunk({ source_name: "EC 852/2004" })];
    const response = "[source: ec 852/2004] mentions...";
    const matched = extractSourceReferences(response, chunks);
    expect(matched).toHaveLength(1);
  });
});
