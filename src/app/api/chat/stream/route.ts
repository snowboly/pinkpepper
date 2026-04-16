import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES, type SubscriptionTier } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import {
  retrieveContext,
  retrieveGuidanceContext,
  retrieveRegulationContext,
  retrieveTemplateContext,
  retrieveUserDocumentContext,
  buildRAGPrompt,
  classifyQAIntent,
  formatCitations,
  type KnowledgeChunk,
  getExportGuidance,
  filterAuthorityFallbackChunks,
  getUncertaintyHandlingInstructions,
  UNTRUSTED_CONTENT_SYSTEM_NOTE,
  buildUntrustedDocumentBlock,
  userChunksToUntrusted,
  type UserDocumentChunk,
} from "@/lib/rag";
import { getVerificationState } from "@/lib/rag/verification";
import { inferQueryJurisdiction, type Jurisdiction } from "@/lib/rag/source-taxonomy";
import { chatLimiter, chatBurstLimiter, checkRateLimit } from "@/lib/ratelimit";
import { detectQueryMode } from "@/lib/query-mode";
import { getPersonaForConversation, type Persona } from "@/lib/personas";

export const dynamic = "force-dynamic";


function shouldPreferAuthoritativeSources(message: string, mode: "qa" | "document" | "audit"): boolean {
  if (mode === "audit") {
    return true;
  }

  if (mode === "document") {
    return false;
  }

  return /\b(law|legal|regulation|regulations|compliance|requirement|requirements|must|shall|approval|register|registration)\b/i.test(
    message
  );
}

const PRIMARY_CHAT_MODEL = "deepseek-chat";
const FALLBACK_CHAT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_STREAM_REQUEST_TIMEOUT_MS = 120_000;
const MAX_STREAM_REQUEST_TIMEOUT_MS = 300_000;

type ChatRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatStreamAttempt = {
  provider: "groq" | "deepseek";
  model: string;
  response: Response;
};

export function resolveChatModels(
  modelOverride?: string | null
) {
  return {
    primary: modelOverride?.trim() || PRIMARY_CHAT_MODEL,
    fallback: FALLBACK_CHAT_MODEL,
  };
}

export function getHistoryWindowLimit(tier: SubscriptionTier, isAdmin: boolean) {
  if (isAdmin) return 40;
  if (tier === "pro") return 32;
  if (tier === "plus") return 24;
  return 18;
}

export function shouldUseRetrievedContextPrompt(ragEnabled: boolean, preferAuthoritativeSources: boolean) {
  return ragEnabled || preferAuthoritativeSources;
}

export function shouldRunKnowledgeRetry(preferAuthoritativeSources: boolean) {
  return !preferAuthoritativeSources;
}

export function buildAuthorityRetryQueries(
  message: string,
  queryJurisdiction: Jurisdiction,
  businessTypeLabel?: string | null
) {
  const qaIntent = classifyQAIntent(message);
  const jurisdictionHints =
    queryJurisdiction === "gb"
      ? ["UK food hygiene law", "England food business regulations", "FSA guidance"]
      : queryJurisdiction === "eu"
      ? [
          "EU food hygiene law",
          "Regulation (EC) No 852/2004",
          "Regulation (EC) No 178/2002",
          "Regulation (EU) No 1169/2011",
          "official guidance",
        ]
      : ["EU and UK food hygiene law", "Regulation (EC) No 852/2004", "FSA guidance"];
  const operationalHints =
    queryJurisdiction === "eu"
      ? [
          "HACCP",
          "traceability",
          "allergen management",
          "food information",
          "microbiological criteria",
          "food contact materials",
        ]
      : ["HACCP", "registration", "allergen management", "temperature control"];
  const intentHints =
    qaIntent === "legal_applicability"
      ? ["registration", "records", "inspection readiness", "local authority", "EHO expectations"]
      : qaIntent === "inspection_readiness"
      ? ["inspection readiness", "records", "EHO expectations", "local authority inspection"]
      : qaIntent === "recordkeeping_requirements"
      ? ["records", "monitoring logs", "training records", "cleaning records", "traceability records", "corrective action records"]
      : [];
  const businessHint = businessTypeLabel ? `for a ${businessTypeLabel}` : "";

  return [
    [message, ...jurisdictionHints, businessHint, ...operationalHints, ...intentHints].filter(Boolean).join(" "),
    [message, ...jurisdictionHints, businessHint, "legal requirements", "food hygiene compliance", ...intentHints]
      .filter(Boolean)
      .join(" "),
  ];
}

export function buildKnowledgeRetryQueries(
  message: string,
  mode: "qa" | "document" | "audit",
  queryJurisdiction: Jurisdiction,
  businessTypeLabel?: string | null
) {
  const qaIntent = classifyQAIntent(message);
  const businessHint = businessTypeLabel ? `for a ${businessTypeLabel}` : "";
  const jurisdictionHints =
    queryJurisdiction === "gb"
      ? ["UK food safety", "FSA guidance"]
      : queryJurisdiction === "eu"
      ? ["EU food safety", "Regulation (EC) No 852/2004", "Regulation (EU) No 1169/2011"]
      : ["EU and UK food safety", "Regulation (EC) No 852/2004", "official guidance"];

  const labelPattern = /\b(label|labels|labelling|labeling|allergen|ppds|food information)\b/i;
  const retryHints =
    mode === "document"
      ? labelPattern.test(message)
        ? ["food label", "allergen declaration", "template", "product information", "PPDS", "ingredients list emphasis", "recipe change", "release controls", "artwork approval"]
        : ["template", "procedure", "checklist", "policy", "form"]
      : qaIntent === "label_requirements"
      ? ["food label", "mandatory particulars", "allergen declaration", "food information", "PPDS", "ingredients list emphasis", "name of the food", "recipe change", "release controls", "raw material specifications", "QUID", "nutrition recalculation", "shelf life", "artwork approval", "wrong-pack prevention"]
      : qaIntent === "allergen_control"
      ? ["allergen matrix", "ingredient specifications", "cross-contact controls", "gluten-free claim", "recipe change", "PPDS"]
      : qaIntent === "recordkeeping_requirements"
      ? ["records", "monitoring logs", "cleaning records", "training records", "traceability records"]
      : qaIntent === "inspection_readiness"
      ? ["inspection", "EHO", "inspection records", "food safety management system"]
      : ["food safety", "guidance", "compliance"];

  return [
    [message, businessHint, ...jurisdictionHints, ...retryHints].filter(Boolean).join(" "),
    [message, businessHint, ...retryHints].filter(Boolean).join(" "),
  ];
}

export function buildIntroductionInstruction(hasAssistantHistory: boolean) {
  if (hasAssistantHistory) {
    return "This conversation already has prior assistant replies. Do NOT greet, re-introduce yourself, or say 'Hello, I'm ...'. Continue directly with the answer.";
  }

  return "This is the first assistant reply in this conversation. Introduce yourself briefly in the first sentence (e.g. 'Hi, I'm Ana.' or 'I'm Jack.') then move straight into the answer in the same message. Do NOT start with your bare name alone as a heading or standalone line (e.g. never just 'Jack.' or 'Jason.' on its own). Do NOT use chatty filler such as 'Let's walk through', 'I'll guide you', or similar soft openers.";
}

function shouldRetryStatus(status: number) {
  return status === 429 || status >= 500;
}

export function getStreamingRequestTimeoutMs() {
  const raw = process.env.CHAT_STREAM_REQUEST_TIMEOUT_MS?.trim();
  const parsed = raw ? Number(raw) : NaN;

  if (
    Number.isInteger(parsed) &&
    parsed >= 30_000 &&
    parsed <= MAX_STREAM_REQUEST_TIMEOUT_MS
  ) {
    return parsed;
  }

  return DEFAULT_STREAM_REQUEST_TIMEOUT_MS;
}

async function requestStreamingCompletion(input: {
  provider: "groq" | "deepseek";
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  messages: ChatRequestMessage[];
}) {
  const { provider, apiKey, model, temperature, maxTokens, messages } = input;
  const url =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.deepseek.com/chat/completions";
  const maxRetries = provider === "groq" ? 3 : 2;
  const timeoutMs = getStreamingRequestTimeoutMs();

  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: maxTokens,
          stream: true,
          messages,
        }),
      });

      if (response.ok || !shouldRetryStatus(response.status)) {
        return response;
      }

      lastResponse = response;
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    } catch (error) {
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      } else {
        console.error(`[chat/stream] ${provider} request failed after retries:`, error);
      }
    }
  }

  return lastResponse;
}

async function requestChatStream(input: {
  deepseekKey?: string;
  groqKey?: string;
  modelOverride?: string | null;
  temperature: number;
  maxTokens: number;
  messages: ChatRequestMessage[];
}): Promise<ChatStreamAttempt | null> {
  const { deepseekKey, groqKey, modelOverride, temperature, maxTokens, messages } = input;
  const models = resolveChatModels(modelOverride);

  if (deepseekKey) {
    const deepseekResponse = await requestStreamingCompletion({
      provider: "deepseek",
      apiKey: deepseekKey,
      model: models.primary,
      temperature,
      maxTokens,
      messages,
    });

    if (deepseekResponse?.ok) {
      return {
        provider: "deepseek",
        model: models.primary,
        response: deepseekResponse,
      };
    }

    if (deepseekResponse) {
      console.error("[chat/stream] deepseek upstream error:", await deepseekResponse.text());
    }
  }

  if (groqKey) {
    const groqResponse = await requestStreamingCompletion({
      provider: "groq",
      apiKey: groqKey,
      model: models.fallback,
      temperature,
      maxTokens,
      messages,
    });

    if (groqResponse?.ok) {
      return {
        provider: "groq",
        model: models.fallback,
        response: groqResponse,
      };
    }

    if (groqResponse) {
      console.error("[chat/stream] groq upstream error:", await groqResponse.text());
    }
  }

  return null;
}

export async function POST(request: Request) {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!deepseekKey && !groqKey) {
    return Response.json({ error: "Neither DEEPSEEK_API_KEY nor GROQ_API_KEY is configured." }, { status: 500 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitRes = await checkRateLimit(chatLimiter, user.id);
  if (rateLimitRes) return rateLimitRes;

  // Burst protection: max 3 messages per 30 seconds
  const burstLimitRes = await checkRateLimit(chatBurstLimiter, user.id);
  if (burstLimitRes) return burstLimitRes;

  type ProfileRow = { tier?: string | null; is_admin?: boolean | null; chat_language?: string | null; business_type?: string | null };
  const [{ data: profileData }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("tier,is_admin,chat_language,business_type")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const profile = profileData as ProfileRow | null;

  const { tier, isAdmin } = resolveUserAccess(profile, user.email, subscription);
  const chatLanguage = profile?.chat_language ?? "en";
  const caps = TIER_CAPABILITIES[tier];

  const currentDate = new Date().toISOString().split("T")[0];

  const BUSINESS_TYPE_LABELS: Record<string, string> = {
    restaurant_cafe: "restaurant or café",
    food_manufacturer: "food manufacturing business",
    retailer_deli: "food retailer or delicatessen",
    catering: "catering business",
    street_food: "street food business",
    wholesaler: "food wholesaler",
    consultant: "food safety consultant",
  };
  const businessTypeLabel = profile?.business_type
    ? (BUSINESS_TYPE_LABELS[profile.business_type] ?? "food business")
    : null;

  const body = (await request.json()) as { message?: string; conversationId?: string | null };
  const message = body.message?.trim() ?? "";
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const mode = detectQueryMode(message);

  let used = 0;
  try {
    used = await countUsageSince({
      supabase,
      userId: user.id,
      eventType: "chat_prompt",
      sinceIso: utcDayStartIso(),
    });
  } catch {
    return Response.json({ error: "Unable to read usage." }, { status: 500 });
  }

  if (!isAdmin && used >= caps.dailyMessages) {
    return Response.json(
      {
        error: "Daily message limit reached for your plan. Upgrade to continue today.",
        usage: { used, limit: caps.dailyMessages, tier },
      },
      { status: 402 }
    );
  }

  // Resolve or create conversation
  let conversationId = body.conversationId ?? null;

  if (conversationId) {
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingConv) {
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    }
  } else {
    if (!isAdmin && tier === "free") {
      const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: convCount, error: convCountError } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", sinceIso);

      if (convCountError) {
        return Response.json({ error: "Unable to read conversations." }, { status: 500 });
      }

      const maxConversations = caps.maxSavedConversations ?? Number.MAX_SAFE_INTEGER;
      if ((convCount ?? 0) >= maxConversations) {
        return Response.json(
          { error: "Free tier allows up to 10 saved conversations. Delete one or upgrade to Plus/Pro." },
          { status: 402 }
        );
      }
    }

    const title = message.length > 80 ? `${message.slice(0, 77)}...` : message;
    const { data: newConv, error: newConvError } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();

    if (newConvError || !newConv) {
      return Response.json({ error: "Failed to create conversation." }, { status: 500 });
    }

    conversationId = newConv.id;
  }

  // Assign persona based on conversation ID
  const persona: Persona = getPersonaForConversation(conversationId!);

  // Load conversation history
  const historyLimit = getHistoryWindowLimit(tier, isAdmin);
  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(historyLimit);

  const history = (historyRows ?? []).reverse().map((row: { role: string; content: string }) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
  }));
  const hasAssistantHistory = history.some((row) => row.role === "assistant");

  // RAG retrieval (knowledge base + user uploaded documents)
  let retrievedChunks: KnowledgeChunk[] = [];
  let userDocChunks: UserDocumentChunk[] = [];
  let ragEnabled = false;
  const queryJurisdiction = inferQueryJurisdiction(message);
  const useAuthorityFilters = shouldPreferAuthoritativeSources(message, mode);
  const jurisdictionFilter =
    queryJurisdiction !== "unknown" && queryJurisdiction !== "mixed"
      ? queryJurisdiction
      : undefined;

  try {
    const [kChunks, rawUChunks] = await Promise.all([
      retrieveContext(message, {
        topK: 8,
        threshold: 0.6,
        ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
        ...(useAuthorityFilters
          ? { sourceClasses: ["primary_law", "official_guidance"] as const }
          : {}),
      }),
      retrieveUserDocumentContext(message, user.id, {
        topK: 3,
        threshold: 0.65,
        conversationId: conversationId ?? undefined,
      }),
    ]);

    // Exclude conversation exports re-uploaded as documents — they are bot-generated
    // output, not authoritative reference material.
    const uChunks = rawUChunks.filter(
      (c) => !c.file_name.toLowerCase().startsWith("pinkpepper-export")
    );

    // If few general results, try a regulation-focused search with a lower threshold
    if (kChunks.length < 3) {
      const regChunks = await retrieveRegulationContext(message, {
        topK: 5,
        threshold: 0.55,
        ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
      });
      const existingIds = new Set(kChunks.map((c) => c.id));
      for (const chunk of regChunks) {
        if (!existingIds.has(chunk.id)) kChunks.push(chunk);
      }
    }

    if (useAuthorityFilters && kChunks.length === 0) {
      const retryQueries = buildAuthorityRetryQueries(message, queryJurisdiction, businessTypeLabel);

      for (const retryQuery of retryQueries) {
        const [retryAuthorityChunks, retryRegChunks] = await Promise.all([
          retrieveContext(retryQuery, {
            topK: 8,
            threshold: 0.52,
            ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
            sourceClasses: ["primary_law", "official_guidance"],
          }),
          retrieveRegulationContext(retryQuery, {
            topK: 5,
            threshold: 0.5,
            ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
          }),
        ]);

        const existingIds = new Set(kChunks.map((chunk) => chunk.id));
        for (const chunk of [...retryAuthorityChunks, ...retryRegChunks]) {
          if (!existingIds.has(chunk.id)) {
            existingIds.add(chunk.id);
            kChunks.push(chunk);
          }
        }

        if (kChunks.length > 0) {
          break;
        }
      }

      if (kChunks.length === 0) {
        for (const retryQuery of retryQueries) {
          const [unfilteredChunks, unfilteredRegChunks] = await Promise.all([
            retrieveContext(retryQuery, {
              topK: 8,
              threshold: 0.52,
            }),
            retrieveRegulationContext(retryQuery, {
              topK: 5,
              threshold: 0.5,
            }),
          ]);

          const filteredFallbackChunks = filterAuthorityFallbackChunks(
            [...unfilteredChunks, ...unfilteredRegChunks],
            {
              jurisdiction: jurisdictionFilter,
              sourceClasses: ["primary_law", "official_guidance"],
            }
          );

          const existingIds = new Set(kChunks.map((chunk) => chunk.id));
          for (const chunk of filteredFallbackChunks) {
            if (!existingIds.has(chunk.id)) {
              existingIds.add(chunk.id);
              kChunks.push(chunk);
            }
          }

          if (kChunks.length > 0) {
            break;
          }
        }
      }
    }

    if (kChunks.length === 0 && shouldRunKnowledgeRetry(useAuthorityFilters)) {
      const retryQueries = buildKnowledgeRetryQueries(message, mode, queryJurisdiction, businessTypeLabel);

      for (const retryQuery of retryQueries) {
        const [retryChunks, retryGuidanceChunks, retryTemplateChunks, retryRegChunks] = await Promise.all([
          retrieveContext(retryQuery, {
            topK: 8,
            threshold: 0.52,
            ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
          }),
          retrieveGuidanceContext(retryQuery, {
            topK: 5,
            threshold: 0.5,
            ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
          }),
          retrieveTemplateContext(retryQuery, {
            topK: 5,
            threshold: 0.5,
            ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
          }),
          retrieveRegulationContext(retryQuery, {
            topK: 5,
            threshold: 0.5,
            ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
          }),
        ]);

        const existingIds = new Set(kChunks.map((chunk) => chunk.id));
        for (const chunk of [...retryChunks, ...retryGuidanceChunks, ...retryTemplateChunks, ...retryRegChunks]) {
          if (!existingIds.has(chunk.id)) {
            existingIds.add(chunk.id);
            kChunks.push(chunk);
          }
        }

        if (kChunks.length > 0) {
          break;
        }
      }
    }

    retrievedChunks = kChunks;
    ragEnabled = kChunks.length > 0;
    // User-uploaded chunks are UNTRUSTED. They are NOT concatenated into the
    // system prompt. They are wrapped in <untrusted_document> tags and placed
    // into a separate user-role turn below (see `untrustedUserMessage`).
    userDocChunks = uChunks;
  } catch (ragError) {
    console.error("RAG retrieval error:", ragError);
  }

  let systemPrompt: string;
  let temperature: number;

  const CHAT_LANGUAGE_NAMES: Record<string, string> = {
    en: "English",
    fr: "French",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
  };
  const preferredLanguage = CHAT_LANGUAGE_NAMES[chatLanguage] ?? "English";
  const languageInstruction = `Respond in ${preferredLanguage}. This is the user's preferred response language. Do not switch to another language unless the user explicitly asks you to.`;

  if (shouldUseRetrievedContextPrompt(ragEnabled, useAuthorityFilters)) {
    const ragPrompt = buildRAGPrompt(message, retrievedChunks, mode, preferredLanguage, currentDate, businessTypeLabel, tier);
    systemPrompt =
      UNTRUSTED_CONTENT_SYSTEM_NOTE +
      "\n\n" +
      ragPrompt.systemPrompt +
      `\n\nINTRODUCTION RULE:\n${buildIntroductionInstruction(hasAssistantHistory)}` +
      `\n\nPERSONA:\n${persona.promptFragment}`;
    temperature = ragPrompt.temperature;
  } else {
    const uncertaintyHandlingInstructions = getUncertaintyHandlingInstructions(message, mode);
    const modeInstruction =
      mode === "audit"
        ? "You are in AUDIT MODE.\n" +
          "- Structure every finding using this rating system: ? Compliant | ?? Minor NC | ?? Major NC | ?? Critical NC\n" +
          "- Cite the exact regulation and article number for each finding (e.g. Regulation (EC) No 852/2004, Annex II, Chapter IX).\n" +
          "- For each non-conformance, provide a specific corrective action and, where appropriate, a preventive action (CAPA).\n" +
          "- If you cannot assess a particular area from the information given, explicitly state what additional information is needed.\n" +
          "- Do not assign ratings when you are uncertain — flag the gap instead."
        : mode === "document"
        ? "You are in DOCUMENT GENERATION MODE.\n" +
          "- Produce complete, ready-to-use documents with numbered sections and subsections.\n" +
          "- Use tables where appropriate (e.g. monitoring logs, temperature records, supplier lists).\n" +
          "- All measurable criteria must be specific: temperatures in °C, times in minutes or hours, frequencies as 'daily/weekly/monthly'.\n" +
          "- Include a version control block at the top: Document No., Version, Date, Approved by.\n" +
          "- Do not truncate — if the document is long, complete it fully.\n" +
          '- When a user says they want to "attach", "add", or "append" a document (e.g. a log, form, or checklist) to a previously generated document, interpret this as a request to CREATE that new document as a companion to the earlier one. Do not interpret "attach" as a file upload request.\n' +
          "- After generating a document, briefly remind the user of their available export options based on their plan."
        : "You are in Q&A MODE.\n" +
          "- Lead with the practical answer first and keep the tone operator-facing.\n" +
          "- For everyday operational questions, answer like an experienced food safety consultant helping staff make the next good decision, not like an auditor, non-conformance report, compliance report, or enforcement notice.\n" +
          "- Start with the minimum practical steps or checks needed. Only add legal context when it materially changes the advice, clarifies a claim, or reduces risk.\n" +
          "- Use legal references as support, not as the spine of every paragraph. If no context was retrieved, do not dress general guidance up like a formally sourced legal memo.\n" +
          "- Do not default to demanding supplier declarations, version-controlled records, validation studies, written SOPs, or advanced verification unless the question genuinely requires that level of control.\n" +
          "- Do not default to tables unless the user asked for one or the comparison is clearly easier to follow in table form.\n" +
          "- Do not routinely end answers with product suggestions, upgrade nudges, or mode-switch guidance unless the user asked for that path or the escalation rule clearly applies.\n" +
          "- Prefer natural, concise wording. Use bullets only when they improve clarity.\n" +
          "- If the user asks for a simple checklist or staff procedure, give the checklist directly without adding document-control headers, version blocks, or export reminders unless they asked for a formal document.";

    const fallbackHeader = [
      `Today's date is ${currentDate}. No context documents were retrieved for this query. Answer from food safety expertise, but stay grounded in EU and UK food safety law and best practice. If the answer depends on a recent legal change or you lack source support, tell the user to verify the latest official text with EUR-Lex, the FSA, EFSA, or the relevant authority.`,
      businessTypeLabel
        ? `The user operates a ${businessTypeLabel}. Tailor your examples and advice to this business type where relevant.`
        : "",
    ].filter(Boolean).join("\n") + "\n\n";

    systemPrompt =
      UNTRUSTED_CONTENT_SYSTEM_NOTE +
      "\n\n" +
      fallbackHeader +
      "You are a food safety compliance expert working for PinkPepper. Your name and persona are defined in the PERSONA section below — always introduce yourself by that name, not as 'PinkPepper'. PinkPepper is the product/company you represent.\n\n" +
      `ABOUT PINKPEPPER (only when users ask about the product or their plan): PinkPepper helps food businesses with HACCP plans, SOPs, audit preparation, allergen law, and EU/UK food safety compliance. The user is on the ${tier} plan; if they ask about limits, answer from the configured plan capabilities and direct them to the sidebar or settings to upgrade.\n\n` +
      "STRICT RULES — follow these in every response:\n" +
      "1. Only answer questions about food safety, food hygiene, HACCP, food law, allergens, food business operations, or related compliance topics. " +
      "If a question is off-topic, politely say so and redirect the user.\n" +
      "2. Never invent regulation numbers, article numbers, or legal citations. If you are not certain of a specific reference, write 'verify the exact article in the source regulation' rather than guessing.\n" +
      "3. Where EU and UK law have diverged post-Brexit, call out both positions explicitly.\n" +
      "4. If a question requires site-specific detail you do not have (e.g. specific menu, layout, volume), ask for it rather than making assumptions.\n" +
      `5. ${languageInstruction} Keep legal references (regulation names, article numbers) in their original form.\n` +
      `6. ${mode === "document" ? getExportGuidance(tier) : "Do not mention export options, plan perks, or paid services unless the user asks about them or you have just generated a document."}\n` +
      "7. NEVER answer a food safety question with a bare 'yes' or 'no' when the answer has health or legal implications. Always provide the critical safety context, temperature, or regulatory basis — even when the user explicitly asks for a one-word answer.\n" +
      "8. If the user asks an audit-style question (e.g. 'audit my procedures', 'review our HACCP', 'assess our compliance') and the current mode is Q&A, suggest switching to Auditor mode: 'For a formal audit with compliance ratings and corrective actions, try switching to **Auditor** mode using the toggle above the chat.'\n" +
      `9. If the user is on the Pro plan and asks about requesting a consultancy review or speaking to a food safety consultant, direct them to use the **\"Send Document for Review\"** button in the sidebar. Do not just describe the service.\n` +
      "10. NEVER mention, reference, or hint at a model training cutoff date. Do NOT say phrases like 'my training data goes up to', 'my knowledge cutoff is', 'as of my last update', or similar. You are NOT a generic AI — you are a PinkPepper food safety specialist grounded in a curated, regularly updated library of EU and UK food safety regulations and official guidance. If asked how current your information is, explain this. For the very latest changes, recommend verifying with EUR-Lex, the FSA, FSS, or the relevant authority.\n" +
      "11. Only introduce yourself by name on the FIRST message of a conversation. If the conversation history already contains your introduction, do NOT repeat it. Jump straight into answering the question.\n" +
      "12. When answering general food safety questions (temperatures, danger zones, storage times, etc.), present BOTH EU and UK requirements. If they are the same, state the requirement once and note that it applies in both the EU and UK. Do not default to one jurisdiction unless the user has specified their location.\n" +
      "13. Do NOT describe yourself as a generic AI or say that you lack real-time access. If the user asks about a very recent change, explain that the latest change is not verified from the current support and direct them to the relevant official source.\n" +
      "14. If the user asks for an exact article, clause, section, or review frequency and you cannot verify it, say that the exact reference is not verified from the available support. Do NOT fill the gap with nearby regulations, standards, or guessed review frequencies.\n\n" +
      (uncertaintyHandlingInstructions ? uncertaintyHandlingInstructions + "\n\n" : "") +
      "INTRODUCTION RULE:\n" + buildIntroductionInstruction(hasAssistantHistory) + "\n\n" +
      "PERSONA:\n" + persona.promptFragment + "\n\n" +
      modeInstruction;
    temperature = mode === "audit" ? 0.0 : 1.0;
  }

  const maxTokens = isAdmin ? 8192 : caps.maxResponseTokens;

  // User-uploaded document content is UNTRUSTED. Wrap it in <untrusted_document>
  // tags and forward it as a separate user-role turn so the model's instruction
  // hierarchy treats it as data, not as system instructions. Sanitisation strips
  // chat-template control tokens and caps length — see lib/rag/untrusted-content.ts.
  const untrustedBlock = buildUntrustedDocumentBlock(userChunksToUntrusted(userDocChunks));
  const untrustedTurn: ChatRequestMessage[] = untrustedBlock
    ? [{ role: "user", content: untrustedBlock }]
    : [];

  const upstream = await requestChatStream({
    deepseekKey: deepseekKey ?? undefined,
    groqKey: groqKey ?? undefined,
    modelOverride: process.env.DEEPSEEK_MODEL,
    temperature,
    maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      ...untrustedTurn,
      { role: "user", content: message },
    ],
  });

  if (!upstream) {
    return Response.json({ error: "AI service temporarily unavailable." }, { status: 502 });
  }

  // Save user message to DB immediately so it persists even if the stream is interrupted
  const { error: userMsgError } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: "user",
    content: message,
    metadata: {},
  });

  if (userMsgError) {
    console.error("[chat/stream] Failed to save user message to DB:", userMsgError);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send metadata event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "metadata", conversationId, ragEnabled, persona: { id: persona.id, name: persona.name, avatar: persona.avatar } })}\n\n`
        )
      );

      // Process the upstream SSE stream
      if (!upstream.response.body) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "No response body from AI service" })}\n\n`
          )
        );
        controller.close();
        return;
      }
      const reader = upstream.response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      let streamCompleted = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;

            let parsed: { choices?: Array<{ delta?: { content?: string } }> };
            try {
              parsed = JSON.parse(payload);
            } catch {
              continue;
            }

            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "content", delta })}\n\n`
                )
              );
            }
          }
        }

        const citations = ragEnabled ? formatCitations(retrievedChunks) : [];
        const verificationState = getVerificationState(
          retrievedChunks.map((chunk) => ({
            source_class:
              typeof chunk.metadata?.source_class === "string"
                ? chunk.metadata.source_class
                : undefined,
            source_type: chunk.source_type,
            source_name: chunk.source_name,
          })),
          {
            mode,
            userMessage: message,
          }
        );

        // Save assistant message to database
        const { error: insertMsgError } = await supabase.from("chat_messages").insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: "assistant",
          content: fullContent,
          metadata: {
            ...(citations.length > 0 ? { citations } : {}),
            verificationState,
          },
        });

        if (insertMsgError) {
          console.error("[chat/stream] Failed to save assistant message to DB:", insertMsgError);
        }

        // Record usage event
        const usageEvents: Array<{
          user_id: string;
          event_type: "chat_prompt";
          event_count: number;
          metadata: Record<string, string | boolean | null>;
        }> = [
          {
            user_id: user.id,
            event_type: "chat_prompt",
            event_count: 1,
            metadata: {
              conversation_id: conversationId,
              model: upstream.model,
              provider: upstream.provider,
              rag_enabled: ragEnabled,
              mode,
            },
          },
        ];

        await supabase.from("usage_events").insert(usageEvents);

        // Mark as completed only after DB persistence succeeds
        streamCompleted = true;

        // Send final event with citations and usage
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              citations,
              verificationState,
              usage: {
                used: used + 1,
                limit: isAdmin ? null : caps.dailyMessages,
                tier,
                isAdmin,
              },
            })}\n\n`
          )
        );
      } catch (err) {
        console.error("Stream processing error:", err);
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Stream interrupted" })}\n\n`
            )
          );
        } catch {
          // Controller already closed (client disconnected) — ignore
        }
      } finally {
        // Save assistant message if stream was interrupted before the normal save
        if (!streamCompleted && fullContent.length > 0) {
          try {
            await supabase.from("chat_messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "assistant",
              content: fullContent,
              metadata: { interrupted: true },
            });

            const interruptedEvents: Array<{
              user_id: string;
              event_type: "chat_prompt";
              event_count: number;
              metadata: Record<string, string | boolean | null>;
            }> = [
              {
                user_id: user.id,
                event_type: "chat_prompt",
                event_count: 1,
                metadata: {
                  conversation_id: conversationId,
                  model: upstream.model,
                  provider: upstream.provider,
                  rag_enabled: ragEnabled,
                  mode,
                  interrupted: true,
                },
              },
            ];

            await supabase.from("usage_events").insert(interruptedEvents);
          } catch (saveErr) {
            console.error("[chat/stream] Failed to save interrupted message:", saveErr);
          }
        }
        try {
          controller.close();
        } catch {
          // Already closed — ignore
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}



