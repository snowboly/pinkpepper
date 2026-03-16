import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { retrieveContext, retrieveUserDocumentContext, formatCitations, type KnowledgeChunk, type UserDocumentChunk } from "@/lib/rag";
import { chatLimiter, checkRateLimit } from "@/lib/ratelimit";

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

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("tier,is_admin")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const { tier, isAdmin } = resolveUserAccess(profile, user.email, subscription);
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
    .order("created_at", { ascending: false })
    .limit(historyLimit);

  const history = (historyRows ?? []).reverse().map((row: { role: string; content: string }) => ({
    role: row.role,
    content: row.content,
  }));

  let retrievedChunks: KnowledgeChunk[] = [];
  let userChunks: UserDocumentChunk[] = [];
  let ragEnabled = false;
  try {
    const [kChunks, uChunks] = await Promise.all([
      retrieveContext(message, { topK: 10, threshold: 0.72 }),
      retrieveUserDocumentContext(message, user.id, { topK: 5, threshold: 0.65 }),
    ]);
    retrievedChunks = kChunks;
    userChunks = uChunks;
    ragEnabled = retrievedChunks.length > 0 || userChunks.length > 0;
  } catch (ragError) {
    console.error("Audit retrieval error:", ragError);
  }

  const regulationBlock = retrievedChunks.length > 0
    ? retrievedChunks
        .map((chunk, i) => `[Evidence ${i + 1}: ${chunk.source_name}${chunk.section_ref ? `, ${chunk.section_ref}` : ""}]\n${chunk.content}`)
        .join("\n\n---\n\n")
    : "No regulation context found.";

  const userDocBlock = userChunks.length > 0
    ? userChunks
        .map((chunk, i) => `[User Document ${i + 1}: ${chunk.file_name}]\n${chunk.content}`)
        .join("\n\n---\n\n")
    : "";

  const contextBlock = userDocBlock
    ? `REGULATION CONTEXT:\n${regulationBlock}\n\nUSER UPLOADED DOCUMENTS:\n${userDocBlock}`
    : regulationBlock;

  const systemPrompt =
    "You are PinkPepper Virtual Auditor, acting as a strict senior food safety auditor conducting an interactive EU/UK food safety management system audit.\n\n" +
    "INTERACTIVE AUDIT BEHAVIOUR (CRITICAL):\n" +
    "- You are conducting a LIVE, step-by-step audit. Do NOT produce a final report unless the user explicitly asks for one.\n" +
    "- Start by greeting the user, asking what type of business they operate, and which standard/scope they want audited (e.g. HACCP, BRCGS, SQF, FSSC 22000, general EU hygiene regs).\n" +
    "- Work through audit areas ONE AT A TIME. For each area:\n" +
    "  1. State the audit area and relevant clause/regulation.\n" +
    "  2. Ask the user to describe their current practice or provide evidence (documents, photos, logs).\n" +
    "  3. Evaluate their response: note compliance, gaps, or request clarification.\n" +
    "  4. Record a preliminary finding (Compliant / Minor NC / Major NC / Critical NC) and explain why.\n" +
    "  5. Move to the next area only after the current one is addressed.\n" +
    "- Typical audit areas (adapt to scope): prerequisite programmes, HACCP plan, CCP monitoring, allergen management, traceability, pest control, cleaning & sanitation, supplier approval, training records, complaint handling, recall procedures.\n" +
    "- If the user has uploaded documents, reference them as evidence when relevant. Cite the document name.\n" +
    "- Always ask for evidence before concluding on any area. If the user says they don't have something, record it as a finding.\n" +
    "- Keep responses concise and auditor-professional. Use bullet points.\n" +
    "- Track which areas have been covered and which remain. Remind the user of progress.\n\n" +
    "FINAL REPORT (only when user asks for it):\n" +
    "When the user requests the final report, produce it in this format:\n" +
    "## Virtual Audit Report\n" +
    "### Scope\n" +
    "### Evidence Reviewed\n" +
    "### Findings\n" +
    "| Area/Clause | Status | Evidence | Gap | Corrective Action | Due Date |\n" +
    "|---|---|---|---|---|---|\n" +
    "### CAPA Summary\n" +
    "### Overall Audit Verdict\n" +
    "### Evidence Still Required\n\n" +
    `RETRIEVED CONTEXT:\n${contextBlock}`;

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const groqPayload = {
    model,
    temperature: 0.0,
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

      if (groqRes.ok || (groqRes.status < 500 && groqRes.status !== 429)) {
        break;
      }

      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    } catch (fetchErr) {
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, backoffMs));
      } else {
        console.error("Groq API fetch failed after retries (audit):", fetchErr);
        return Response.json({ error: "AI audit service temporarily unavailable." }, { status: 502 });
      }
    }
  }

  if (!groqRes || !groqRes.ok) {
    const details = groqRes ? await groqRes.text() : "No response";
    console.error("Groq API error after retries (audit):", details);
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

        // All rows must include the same columns so PostgREST includes metadata in the INSERT
        await supabase.from("chat_messages").insert([
          { conversation_id: conversationId, user_id: user.id, role: "user", content: message, metadata: {} },
          { conversation_id: conversationId, user_id: user.id, role: "assistant", content: fullContent, metadata: {} },
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
