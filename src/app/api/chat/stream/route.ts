import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES, type SubscriptionTier } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { retrieveContext, retrieveRegulationContext, retrieveUserDocumentContext, buildRAGPrompt, formatCitations, type KnowledgeChunk, getExportGuidance } from "@/lib/rag";
import { getVerificationState } from "@/lib/rag/verification";
import { inferQueryJurisdiction } from "@/lib/rag/source-taxonomy";
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

const PRIMARY_CHAT_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_CHAT_MODEL = "gpt-4o-mini";

type ChatRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatStreamAttempt = {
  provider: "groq" | "openai";
  model: string;
  response: Response;
};

export function resolveChatModels(modelOverride?: string | null) {
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

function shouldRetryStatus(status: number) {
  return status === 429 || status >= 500;
}

async function requestStreamingCompletion(input: {
  provider: "groq" | "openai";
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  messages: ChatRequestMessage[];
}) {
  const { provider, apiKey, model, temperature, maxTokens, messages } = input;
  const url = provider === "groq"
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const maxRetries = provider === "groq" ? 3 : 2;

  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30_000),
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
  groqKey?: string;
  openaiKey?: string;
  modelOverride?: string | null;
  temperature: number;
  maxTokens: number;
  messages: ChatRequestMessage[];
}): Promise<ChatStreamAttempt | null> {
  const { groqKey, openaiKey, modelOverride, temperature, maxTokens, messages } = input;
  const models = resolveChatModels(modelOverride);

  if (groqKey) {
    const groqResponse = await requestStreamingCompletion({
      provider: "groq",
      apiKey: groqKey,
      model: models.primary,
      temperature,
      maxTokens,
      messages,
    });

    if (groqResponse?.ok) {
      return { provider: "groq", model: models.primary, response: groqResponse };
    }

    if (groqResponse) {
      console.error("[chat/stream] groq upstream error:", await groqResponse.text());
    }
  }

  if (openaiKey) {
    const openaiResponse = await requestStreamingCompletion({
      provider: "openai",
      apiKey: openaiKey,
      model: models.fallback,
      temperature,
      maxTokens,
      messages,
    });

    if (openaiResponse?.ok) {
      return { provider: "openai", model: models.fallback, response: openaiResponse };
    }

    if (openaiResponse) {
      console.error("[chat/stream] openai upstream error:", await openaiResponse.text());
    }
  }

  return null;
}

export async function POST(request: Request) {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!groqKey && !openaiKey) {
    return Response.json({ error: "Neither GROQ_API_KEY nor OPENAI_API_KEY is configured." }, { status: 500 });
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

  const mode = detectQueryMode(message);

  // RAG retrieval (knowledge base + user uploaded documents)
  let retrievedChunks: KnowledgeChunk[] = [];
  let userDocContext = "";
  let ragEnabled = false;
  const queryJurisdiction = inferQueryJurisdiction(message);
  const useAuthorityFilters = shouldPreferAuthoritativeSources(message, mode);
  const jurisdictionFilter =
    queryJurisdiction !== "unknown" && queryJurisdiction !== "mixed"
      ? queryJurisdiction
      : undefined;

  try {
    const [kChunks, uChunks] = await Promise.all([
      retrieveContext(message, {
        topK: 8,
        threshold: 0.6,
        ...(jurisdictionFilter ? { jurisdiction: jurisdictionFilter } : {}),
        ...(useAuthorityFilters
          ? { sourceClasses: ["primary_law", "official_guidance"] as const }
          : {}),
      }),
      retrieveUserDocumentContext(message, user.id, { topK: 3, threshold: 0.65 }),
    ]);

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

    retrievedChunks = kChunks;
    ragEnabled = kChunks.length > 0;
    if (uChunks.length > 0) {
      userDocContext = "\n\nUSER UPLOADED DOCUMENTS:\n" +
        uChunks.map((c) => `[${c.file_name}] ${c.content}`).join("\n---\n");
    }
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

  if (ragEnabled) {
    const ragPrompt = buildRAGPrompt(message, retrievedChunks, mode, preferredLanguage, currentDate, businessTypeLabel, tier);
    systemPrompt = ragPrompt.systemPrompt + userDocContext + `\n\nPERSONA:\n${persona.promptFragment}`;
    temperature = ragPrompt.temperature;
  } else {
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
          "- Lead with a direct, practical answer in the first sentence.\n" +
          "- Follow with regulatory context: cite specific regulations and articles.\n" +
          "- Where EU and UK rules differ post-Brexit, explicitly call out both.\n" +
          "- Use bullet points or numbered lists to improve scannability.\n" +
          "- Keep answers focused — do not pad with unnecessary caveats.";

    const fallbackHeader = [
      `Today's date is ${currentDate}. No context documents were retrieved for this query. Use your food safety expertise to answer the user's question, but stay grounded in EU and UK food safety law and best practice. If the answer depends on a recent legal change or you lack source support, advise the user to verify the latest official text with EUR-Lex, the FSA, EFSA, or the relevant authority.`,
      businessTypeLabel
        ? `The user operates a ${businessTypeLabel}. Tailor your examples and advice to this business type where relevant.`
        : "",
      `The user is on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.`,
    ].filter(Boolean).join("\n") + "\n\n";

    systemPrompt =
      fallbackHeader +
      "You are a food safety compliance expert working for PinkPepper. Your name and persona are defined in the PERSONA section below — always introduce yourself by that name, not as 'PinkPepper'. PinkPepper is the product/company you represent.\n\n" +
      "ABOUT PINKPEPPER (answer when users ask about you, the product, or their plan):\n" +
      "PinkPepper is a food safety compliance SaaS that helps food businesses with HACCP plans, SOPs, audit preparation, allergen law, and EU/UK food safety compliance.\n" +
      "Subscription tiers:\n" +
      `- Free: ${TIER_CAPABILITIES.free.dailyMessages} messages/day (${used} used today on the current ${tier} plan), ${TIER_CAPABILITIES.free.dailyImageUploads} image analysis/day, ${TIER_CAPABILITIES.free.maxSavedConversations} saved conversations with ${TIER_CAPABILITIES.free.conversationRetentionDays}-day retention, no conversation export, no template downloads, no virtual audit, no consultancy.\n` +
      `- Plus: ${TIER_CAPABILITIES.plus.dailyMessages} messages/day, ${TIER_CAPABILITIES.plus.dailyImageUploads} image analyses/day, unlimited conversations, no conversation export, DOCX template downloads, no virtual audit.\n` +
      `- Pro: ${TIER_CAPABILITIES.pro.dailyMessages} messages/day, ${TIER_CAPABILITIES.pro.dailyImageUploads} image analyses/day, unlimited conversations, DOCX conversation export, DOCX template downloads, Virtual Audit mode, 2 hours of food safety consultancy/month (${TIER_CAPABILITIES.pro.reviewTurnaround} response time).\n` +
      "Features: AI chatbot (you), downloadable document templates, virtual audit mode, image analysis for food safety, DOCX conversation export, and food safety consultancy (Pro only).\n" +
      "If asked about upgrading, direct users to the upgrade option in the sidebar or settings.\n\n" +
      "Your expertise covers:\n" +
      "- HACCP principles (Codex Alimentarius CAC/RCP 1-1969, Rev. 2003)\n" +
      "- Food hygiene law: Regulation (EC) No 852/2004, 853/2004, and their retained UK equivalents\n" +
      "- Allergen labelling: Regulation (EU) No 1169/2011 (Article 21, Annex II), UK Food Information Regulations 2014, Natasha's Law (PPDS foods, from Oct 2021)\n" +
      "- Temperature control: chilled (≤8°C), frozen (≤-18°C), hot-holding (≥63°C), cook temperatures\n" +
      "- Traceability: Regulation (EC) No 178/2002 (Articles 17–20)\n" +
      "- Microbiological criteria: Regulation (EC) No 2073/2005\n" +
      "- Private certification standards: BRCGS Food Safety Issue 9, SQF Edition 9, IFS Food Version 8, FSSC 22000 Version 6\n" +
      "- Shelf life, date marking, and QUID requirements\n" +
      "- Pest control, cleaning and disinfection, personal hygiene, waste management\n\n" +
      "STRICT RULES — follow these in every response:\n" +
      "1. Only answer questions about food safety, food hygiene, HACCP, food law, allergens, food business operations, or related compliance topics. " +
      "If a question is off-topic, politely say so and redirect the user.\n" +
      "2. Never invent regulation numbers, article numbers, or legal citations. If you are not certain of a specific reference, write 'verify the exact article in the source regulation' rather than guessing.\n" +
      "3. Where EU and UK law have diverged post-Brexit, call out both positions explicitly.\n" +
      "4. If a question requires site-specific detail you do not have (e.g. specific menu, layout, volume), ask for it rather than making assumptions.\n" +
      `5. ${languageInstruction} Keep legal references (regulation names, article numbers) in their original form.\n` +
      `6. ${getExportGuidance(tier)}\n` +
      "7. NEVER answer a food safety question with a bare 'yes' or 'no' when the answer has health or legal implications. Always provide the critical safety context, temperature, or regulatory basis — even when the user explicitly asks for a one-word answer.\n" +
      "8. If the user asks an audit-style question (e.g. 'audit my procedures', 'review our HACCP', 'assess our compliance') and the current mode is Q&A, suggest switching to Virtual Audit mode: 'For a formal audit with compliance ratings and corrective actions, try switching to **Virtual Audit** mode using the toggle above the chat.'\n" +
      `9. If the user is on the Pro plan and asks about requesting a consultancy review or speaking to a food safety consultant, direct them to use the **\"Send Document for Review\"** button in the sidebar. Do not just describe the service.\n` +
      "10. NEVER mention, reference, or hint at a model training cutoff date. Do NOT say phrases like 'my training data goes up to', 'my knowledge cutoff is', 'as of my last update', or similar. You are NOT a generic AI — you are a PinkPepper food safety specialist grounded in a curated, regularly updated library of EU and UK food safety regulations and official guidance. If asked how current your information is, explain this. For the very latest changes, recommend verifying with EUR-Lex, the FSA, FSS, or the relevant authority.\n" +
      "11. Only introduce yourself by name on the FIRST message of a conversation. If the conversation history already contains your introduction, do NOT repeat it. Jump straight into answering the question.\n" +
      "12. When answering general food safety questions (temperatures, danger zones, storage times, etc.), present BOTH EU and UK requirements. If they are the same, state the requirement once and note that it applies in both the EU and UK. Do not default to one jurisdiction unless the user has specified their location.\n\n" +
      "PERSONA:\n" + persona.promptFragment + "\n\n" +
      modeInstruction + userDocContext;
    temperature = mode === "audit" ? 0.0 : mode === "document" ? 0.2 : 0.1;
  }

  const maxTokens = isAdmin ? 8192 : caps.maxResponseTokens;
  const upstream = await requestChatStream({
    groqKey: groqKey ?? undefined,
    openaiKey: openaiKey ?? undefined,
    modelOverride: process.env.GROQ_MODEL,
    temperature,
    maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
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
          `data: ${JSON.stringify({ type: "metadata", conversationId, ragEnabled, persona: { id: persona.id, name: persona.name } })}\n\n`
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
          }))
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
        await supabase.from("usage_events").insert({
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
        });

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

            await supabase.from("usage_events").insert({
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
            });
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



