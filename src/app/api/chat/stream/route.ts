import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { retrieveContext, buildRAGPrompt, formatCitations, type KnowledgeChunk } from "@/lib/rag";

export const dynamic = "force-dynamic";

function detectQueryMode(message: string): "qa" | "document" | "audit" {
  const lower = message.toLowerCase();
  const auditKeywords = ["audit", "check compliance", "verify", "gap analysis", "non-conformance", "nc", "inspection", "review my", "assess my", "evaluate my", "am i compliant", "are we compliant"];
  if (auditKeywords.some((kw) => lower.includes(kw))) return "audit";
  const documentKeywords = ["create", "generate", "draft", "write", "produce", "build", "template", "haccp plan", "sop", "procedure", "log", "form", "checklist", "policy", "manual", "monitoring sheet", "cleaning schedule", "risk assessment"];
  if (documentKeywords.some((kw) => lower.includes(kw))) return "document";
  return "qa";
}

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

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

  // Load conversation history
  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(10);

  const history = (historyRows ?? []).map((row: { role: string; content: string }) => ({
    role: row.role,
    content: row.content,
  }));

  // RAG retrieval
  let retrievedChunks: KnowledgeChunk[] = [];
  let ragEnabled = false;

  try {
    retrievedChunks = await retrieveContext(message, { topK: 5, threshold: 0.65 });
    ragEnabled = retrievedChunks.length > 0;
  } catch (ragError) {
    console.error("RAG retrieval error:", ragError);
  }

  const mode = detectQueryMode(message);

  let systemPrompt: string;
  let temperature: number;

  if (ragEnabled) {
    const ragPrompt = buildRAGPrompt(message, retrievedChunks, mode);
    systemPrompt = ragPrompt.systemPrompt;
    temperature = ragPrompt.temperature;
  } else {
    systemPrompt =
      "You are PinkPepper, an expert AI food safety compliance assistant specialising in EU and UK food law and best practice.\n\n" +
      "Your expertise covers HACCP (Codex CAC/RCP 1-1969), food hygiene law (EC 852/2004, 853/2004 and UK equivalents), " +
      "allergen labelling (EU 1169/2011, UK Food Information Regulations 2014, Natasha's Law), temperature control, " +
      "traceability (EC 178/2002), microbiological criteria (EC 2073/2005), and private standards (BRCGS, SQF, IFS, FSSC 22000).\n\n" +
      (mode === "audit"
        ? "You are in AUDIT mode. Structure findings as: ✅ Compliant | ⚠️ Minor NC | 🔴 Major NC | 🚫 Critical NC. " +
          "Reference exact regulation and article for each finding. Recommend corrective/preventive actions (CAPA)."
        : mode === "document"
        ? "You are in DOCUMENT GENERATION mode. Produce complete, ready-to-use documentation with numbered sections, tables, " +
          "specific measurable criteria (temperatures in °C, times in minutes/hours), and version control fields."
        : "You are in Q&A mode. Provide clear, structured answers with practical guidance. " +
          "Lead with the direct answer, then provide regulatory context. " +
          "Where EU and UK rules differ post-Brexit, call it out explicitly.") +
      "\n\nAlways end substantive responses with: ⚠️ AI-generated — verify with a qualified food safety professional before implementing.";
    temperature = mode === "audit" ? 0.0 : mode === "document" ? 0.2 : 0.1;
  }

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  // Call Groq with streaming enabled
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model,
      temperature,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    }),
  });

  if (!groqRes.ok) {
    const details = await groqRes.text();
    console.error("Groq API error:", details);
    return Response.json({ error: "AI service temporarily unavailable." }, { status: 502 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send metadata event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "metadata", conversationId, ragEnabled })}\n\n`
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

        // Save messages to database
        await supabase.from("chat_messages").insert([
          { conversation_id: conversationId, user_id: user.id, role: "user", content: message },
          { conversation_id: conversationId, user_id: user.id, role: "assistant", content: fullContent },
        ]);

        // Record usage event
        await supabase.from("usage_events").insert({
          user_id: user.id,
          event_type: "chat_prompt",
          event_count: 1,
          metadata: { conversation_id: conversationId, model, rag_enabled: ragEnabled, mode },
        });

        // Send final event with citations and usage
        const citations = ragEnabled ? formatCitations(retrievedChunks) : [];
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
