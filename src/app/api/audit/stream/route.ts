import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { retrieveContext, formatCitations, type KnowledgeChunk } from "@/lib/rag";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

  if (!isAdmin && tier !== "pro") {
    return Response.json(
      { error: "Virtual Audit mode is available on Pro.", usage: { tier, isAdmin } },
      { status: 402 }
    );
  }

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

  const historyLimit = 20;
  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(historyLimit);

  const history = (historyRows ?? []).map((row: { role: string; content: string }) => ({
    role: row.role,
    content: row.content,
  }));

  let retrievedChunks: KnowledgeChunk[] = [];
  let ragEnabled = false;
  try {
    retrievedChunks = await retrieveContext(message, { topK: 10, threshold: 0.72 });
    ragEnabled = retrievedChunks.length > 0;
  } catch (ragError) {
    console.error("Audit retrieval error:", ragError);
  }

  const contextBlock = ragEnabled
    ? retrievedChunks
        .map((chunk, i) => `[Evidence ${i + 1}: ${chunk.source_name}${chunk.section_ref ? `, ${chunk.section_ref}` : ""}]\n${chunk.content}`)
        .join("\n\n---\n\n")
    : "No retrieved context was found for this request.";

  const systemPrompt =
    "You are PinkPepper Virtual Auditor, acting as a strict senior food safety auditor for EU/UK food management systems.\n\n" +
    "MANDATORY AUDIT BEHAVIOUR:\n" +
    "1. Ask for missing evidence files before concluding compliance.\n" +
    "2. Never mark compliance without evidence.\n" +
    "3. Classify findings only as: Compliant | Minor NC | Major NC | Critical NC.\n" +
    "4. Include clause/reference for every finding where possible.\n" +
    "5. Provide corrective actions with owner and due date suggestions.\n" +
    "6. Keep language concise, professional, and auditor-style.\n\n" +
    "OUTPUT FORMAT (ALWAYS):\n" +
    "## Virtual Audit Report\n" +
    "### Scope\n" +
    "### Evidence Reviewed\n" +
    "### Findings\n" +
    "| Area/Clause | Status | Evidence | Gap | Corrective Action | Due Date |\n" +
    "|---|---|---|---|---|---|\n" +
    "### CAPA Summary\n" +
    "### Overall Audit Verdict\n" +
    "### Evidence Still Required\n\n" +
    "If the user asks for a final report, ensure the response is export-ready as a formal audit report.\n\n" +
    `RETRIEVED CONTEXT:\n${contextBlock}`;

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model,
      temperature: 0.0,
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
    console.error("Groq API error (audit):", details);
    return Response.json({ error: "AI audit service temporarily unavailable." }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "metadata", conversationId, ragEnabled })}\n\n`
        )
      );

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

        await supabase.from("chat_messages").insert([
          { conversation_id: conversationId, user_id: user.id, role: "user", content: message },
          { conversation_id: conversationId, user_id: user.id, role: "assistant", content: fullContent },
        ]);

        await supabase.from("usage_events").insert({
          user_id: user.id,
          event_type: "chat_prompt",
          event_count: 1,
          metadata: { conversation_id: conversationId, model, rag_enabled: ragEnabled, mode: "virtual_audit" },
        });

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
        console.error("Stream processing error (audit):", err);
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
