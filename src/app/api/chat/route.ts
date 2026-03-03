import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { retrieveContext, buildRAGPrompt, formatCitations, type KnowledgeChunk } from "@/lib/rag";

export const dynamic = "force-dynamic";

// Detect query mode based on message content
function detectQueryMode(message: string): "qa" | "document" | "audit" {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("audit") || lowerMessage.includes("check compliance") || lowerMessage.includes("verify")) {
    return "audit";
  }

  if (
    lowerMessage.includes("create") ||
    lowerMessage.includes("generate") ||
    lowerMessage.includes("draft") ||
    lowerMessage.includes("write") ||
    lowerMessage.includes("haccp plan") ||
    lowerMessage.includes("sop")
  ) {
    return "document";
  }

  return "qa";
}

export async function POST(request: Request) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { message?: string; conversationId?: string | null };
  const message = body.message?.trim() ?? "";
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

  let used = 0;
  try {
    used = await countUsageSince({
      supabase,
      userId: user.id,
      eventType: "chat_prompt",
      sinceIso: utcDayStartIso(),
    });
  } catch {
    return NextResponse.json({ error: "Unable to read usage." }, { status: 500 });
  }

  if (!isAdmin && used >= caps.dailyMessages) {
    return NextResponse.json(
      {
        error: "Daily message limit reached for your plan. Upgrade to continue today.",
        usage: { used, limit: caps.dailyMessages, tier },
      },
      { status: 402 }
    );
  }

  let conversationId = body.conversationId ?? null;

  if (conversationId) {
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingConv) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
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
        return NextResponse.json({ error: "Unable to read conversations." }, { status: 500 });
      }

      const maxConversations = caps.maxSavedConversations ?? Number.MAX_SAFE_INTEGER;
      if ((convCount ?? 0) >= maxConversations) {
        return NextResponse.json(
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
      return NextResponse.json({ error: "Failed to create conversation." }, { status: 500 });
    }

    conversationId = newConv.id;
  }

  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(10);

  const history = (historyRows ?? []).map((row) => ({ role: row.role, content: row.content }));

  // RAG: Retrieve relevant context from knowledge base
  let retrievedChunks: KnowledgeChunk[] = [];
  let ragEnabled = false;

  try {
    retrievedChunks = await retrieveContext(message, { topK: 5, threshold: 0.65 });
    ragEnabled = retrievedChunks.length > 0;
  } catch (ragError) {
    // RAG retrieval failed, fall back to non-RAG mode
    console.error("RAG retrieval error:", ragError);
  }

  // Detect query mode and build prompt
  const mode = detectQueryMode(message);

  let systemPrompt: string;
  let temperature: number;

  if (ragEnabled) {
    const ragPrompt = buildRAGPrompt(message, retrievedChunks, mode);
    systemPrompt = ragPrompt.systemPrompt;
    temperature = ragPrompt.temperature;
  } else {
    // Fallback system prompt when no RAG context available
    systemPrompt =
      "You are PinkPepper, an AI food safety assistant for EU and UK businesses. " +
      "Provide structured, practical outputs for HACCP, SOPs, monitoring logs, allergen controls, and traceability. " +
      "Be clear, concise, and compliance-focused. Avoid legal guarantees or inspection outcome guarantees. " +
      "When citing regulations, be specific but note that users should verify current requirements.";
    temperature = mode === "audit" ? 0.0 : mode === "document" ? 0.2 : 0.1;
  }

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    }),
  });

  if (!groqRes.ok) {
    const details = await groqRes.text();
    return NextResponse.json({ error: `Groq request failed: ${details}` }, { status: 502 });
  }

  const groqJson = (await groqRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const assistantMessage = groqJson.choices?.[0]?.message?.content?.trim();
  if (!assistantMessage) {
    return NextResponse.json({ error: "No model output returned." }, { status: 502 });
  }

  // Format citations for the response
  const citations = ragEnabled ? formatCitations(retrievedChunks) : [];

  const { error: insertMsgError } = await supabase.from("chat_messages").insert([
    { conversation_id: conversationId, user_id: user.id, role: "user", content: message },
    { conversation_id: conversationId, user_id: user.id, role: "assistant", content: assistantMessage },
  ]);

  if (insertMsgError) {
    return NextResponse.json({ error: "Failed to save chat messages." }, { status: 500 });
  }

  const { error: usageInsertError } = await supabase.from("usage_events").insert({
    user_id: user.id,
    event_type: "chat_prompt",
    event_count: 1,
    metadata: { conversation_id: conversationId, model, rag_enabled: ragEnabled, mode },
  });

  if (usageInsertError) {
    return NextResponse.json({ error: "Failed to record usage." }, { status: 500 });
  }

  return NextResponse.json({
    conversationId,
    assistantMessage,
    citations,
    ragEnabled,
    usage: {
      used: used + 1,
      limit: isAdmin ? null : caps.dailyMessages,
      tier,
      isAdmin,
    },
  });
}
