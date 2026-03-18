import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { retrieveContext, retrieveRegulationContext, retrieveUserDocumentContext, buildRAGPrompt, formatCitations, type KnowledgeChunk, getExportGuidance } from "@/lib/rag";
import { chatLimiter, chatBurstLimiter, checkRateLimit } from "@/lib/ratelimit";
import { detectQueryMode, detectComplexity } from "@/lib/query-mode";
import { getPersonaForConversation, type Persona } from "@/lib/personas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return Response.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
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
  const historyLimit = isAdmin || tier === "pro" ? 20 : 10;
  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(historyLimit);

  const history = (historyRows ?? []).reverse().map((row: { role: string; content: string }) => ({
    role: row.role,
    content: row.content,
  }));

  // RAG retrieval (knowledge base + user uploaded documents)
  let retrievedChunks: KnowledgeChunk[] = [];
  let userDocContext = "";
  let ragEnabled = false;

  try {
    const [kChunks, uChunks] = await Promise.all([
      retrieveContext(message, { topK: 8, threshold: 0.6 }),
      retrieveUserDocumentContext(message, user.id, { topK: 3, threshold: 0.65 }),
    ]);

    // If few general results, try a regulation-focused search with a lower threshold
    if (kChunks.length < 3) {
      const regChunks = await retrieveRegulationContext(message, { topK: 5, threshold: 0.55 });
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

  const mode = detectQueryMode(message);

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
      `Today's date is ${currentDate}. No context documents were retrieved for this query. Use your food safety expertise to answer the user's question — you may draw on your knowledge of EU and UK food safety regulations, HACCP principles, and industry best practice. Recommend the user verify with the relevant authority (EUR-Lex, FSA, EFSA) for the most up-to-date official text. Do not tell users your training data ends in a specific year.`,
      businessTypeLabel
        ? `The user operates a ${businessTypeLabel}. Tailor your examples and advice to this business type where relevant.`
        : "",
      `The user is on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.`,
    ].filter(Boolean).join("\n") + "\n\n";

    systemPrompt =
      fallbackHeader +
      "You are PinkPepper, an expert AI food safety compliance assistant specialising in EU and UK food law and best practice.\n\n" +
      "ABOUT PINKPEPPER (answer when users ask about you, the product, or their plan):\n" +
      "PinkPepper is a food safety compliance SaaS that helps food businesses with HACCP plans, SOPs, audit preparation, allergen law, and EU/UK food safety compliance.\n" +
      "Subscription tiers:\n" +
      `- Free: ${TIER_CAPABILITIES.free.dailyMessages} messages/day (${used} used today on the current ${tier} plan), ${TIER_CAPABILITIES.free.dailyImageUploads} image upload/day, ${TIER_CAPABILITIES.free.dailyTranscriptions} voice transcriptions/day, ${TIER_CAPABILITIES.free.maxSavedConversations} saved conversations with ${TIER_CAPABILITIES.free.conversationRetentionDays}-day retention, no document generation, no export, no virtual audit, no consultancy.\n` +
      `- Plus: ${TIER_CAPABILITIES.plus.dailyMessages} messages/day, ${TIER_CAPABILITIES.plus.dailyImageUploads} image uploads/day, ${TIER_CAPABILITIES.plus.dailyTranscriptions} voice transcriptions/day, no document generation, unlimited conversations, PDF export for chat conversations, no virtual audit.\n` +
      `- Pro: ${TIER_CAPABILITIES.pro.dailyMessages} messages/day, ${TIER_CAPABILITIES.pro.dailyImageUploads} image uploads/day, ${TIER_CAPABILITIES.pro.dailyTranscriptions} voice transcriptions/day, ${TIER_CAPABILITIES.pro.dailyDocumentGenerations} document generations/day, unlimited conversations, PDF + DOCX export, Virtual Audit mode, 3 hours of food safety consultancy/month (${TIER_CAPABILITIES.pro.reviewTurnaround} response time).\n` +
      "Features: AI chatbot (you), Pro-only document generation (HACCP plans, SOPs, cleaning schedules, temperature logs, and core compliance procedures), virtual audit mode, image analysis for food safety, voice transcription, PDF/DOCX export, and food safety consultancy (Pro only).\n" +
      "If asked about upgrading, direct users to the upgrade option in the sidebar or settings.\n\n" +
      "Your expertise covers:\n" +
      "- HACCP principles (Codex Alimentarius CAC/RCP 1-1969, Rev. 2003)\n" +
      "- Food hygiene law: Regulation (EC) No 852/2004, 853/2004, and their retained UK equivalents\n" +
      "- Allergen labelling: Regulation (EU) No 1169/2011 (Article 21, Annex II), UK Food Information Regulations 2014, Natasha's Law (PPDS foods, from Oct 2021)\n" +
      "- Temperature control: chilled (=8°C), frozen (=-18°C), hot-holding (=63°C), cook temperatures\n" +
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
      `6. ${getExportGuidance(tier)}\n\n` +
      "PERSONA:\n" + persona.promptFragment + "\n\n" +
      modeInstruction + userDocContext;
    temperature = mode === "audit" ? 0.0 : mode === "document" ? 0.2 : 0.1;
  }

  // Model routing: simple Q&A ? 8B, complex/document/audit ? 70B
  const complexity = detectComplexity(message, mode);
  const modelOverride = process.env.GROQ_MODEL;
  const model = modelOverride
    ? modelOverride
    : complexity === "simple"
      ? "llama-3.1-8b-instant"
      : "llama-3.3-70b-versatile";

  const maxTokens = isAdmin ? 8192 : caps.maxResponseTokens;

  // Call Groq with streaming enabled (retry on transient errors)
  const groqPayload = {
    model,
    temperature,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ],
  };

  let groqRes: Response | null = null;
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify(groqPayload),
      });

      // Success or non-retryable error — stop retrying
      if (groqRes.ok || (groqRes.status < 500 && groqRes.status !== 429)) {
        break;
      }

      // Retryable error (429, 5xx) — wait and retry
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    } catch (fetchErr) {
      // Network error or timeout — retry
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, backoffMs));
      } else {
        console.error("Groq API fetch failed after retries:", fetchErr);
        return Response.json({ error: "AI service temporarily unavailable." }, { status: 502 });
      }
    }
  }

  if (!groqRes || !groqRes.ok) {
    const details = groqRes ? await groqRes.text() : "No response";
    console.error("Groq API error after retries:", details);
    return Response.json({ error: "AI service temporarily unavailable." }, { status: 502 });
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

      // Process Groq's SSE stream
      if (!groqRes.body) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "No response body from AI service" })}\n\n`
          )
        );
        controller.close();
        return;
      }
      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

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

        // Save messages to database
        // All rows must include the same columns so PostgREST includes metadata in the INSERT
        await supabase.from("chat_messages").insert([
          { conversation_id: conversationId, user_id: user.id, role: "user", content: message, metadata: {} },
          {
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: fullContent,
            metadata: citations.length > 0 ? { citations } : {},
          },
        ]);

        // Record usage event
        await supabase.from("usage_events").insert({
          user_id: user.id,
          event_type: "chat_prompt",
          event_count: 1,
          metadata: { conversation_id: conversationId, model, complexity, rag_enabled: ragEnabled, mode },
        });

        // Send final event with citations and usage
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              citations,
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
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Stream interrupted" })}\n\n`
          )
        );
      } finally {
        controller.close();
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



