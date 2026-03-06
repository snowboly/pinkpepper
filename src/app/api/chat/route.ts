import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES, type SubscriptionTier } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { retrieveContext, buildRAGPrompt, formatCitations, type KnowledgeChunk } from "@/lib/rag";
import { FOOD_SAFETY_VISION_SYSTEM_PROMPT } from "@/lib/rag/vision-prompt";

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

// Handle image analysis requests via OpenAI vision model
async function handleImageAnalysis(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string,
  conversationId: string,
  imageBase64: string,
  imageMimeType: string,
  message: string,
  isAdmin: boolean,
  tier: SubscriptionTier,
  usage: { used: number; limit: number | null }
) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: "Image analysis is not configured." }, { status: 500 });
  }

  const visionModel = process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini";
  const dataUrl = `data:${imageMimeType};base64,${imageBase64}`;
  const userText = message.trim() || "Analyse this image for food safety concerns.";

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model: visionModel,
      max_tokens: 1500,
      messages: [
        { role: "system", content: FOOD_SAFETY_VISION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            { type: "text", text: userText },
          ],
        },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const details = await openaiRes.text();
    console.error("OpenAI Vision API error:", details);
    return NextResponse.json({ error: "Image analysis service temporarily unavailable." }, { status: 502 });
  }

  const openaiJson = (await openaiRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const assistantMessage = openaiJson.choices?.[0]?.message?.content?.trim();
  if (!assistantMessage) {
    return NextResponse.json({ error: "No analysis returned from vision model." }, { status: 502 });
  }

  // Save messages — store a note that this was an image message
  const userContent = `[Photo attached] ${userText}`;
  const { error: insertMsgError } = await supabase.from("chat_messages").insert([
    { conversation_id: conversationId, user_id: userId, role: "user", content: userContent },
    { conversation_id: conversationId, user_id: userId, role: "assistant", content: assistantMessage },
  ]);

  if (insertMsgError) {
    return NextResponse.json({ error: "Failed to save messages." }, { status: 500 });
  }

  const { error: usageInsertError } = await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: "image_upload",
    event_count: 1,
    metadata: { conversation_id: conversationId, model: visionModel },
  });

  if (usageInsertError) {
    return NextResponse.json({ error: "Failed to record usage." }, { status: 500 });
  }

  return NextResponse.json({
    conversationId,
    assistantMessage,
    citations: [],
    ragEnabled: false,
    imageAnalysis: true,
    usage: {
      used: usage.used,
      limit: usage.limit,
      tier,
      isAdmin,
    },
  });
}

export async function POST(request: Request) {
  const groqKey = process.env.GROQ_API_KEY;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

  // --- Detect if this is an image upload (multipart/form-data) ---
  const contentType = request.headers.get("content-type") ?? "";
  const isImageRequest = contentType.startsWith("multipart/form-data");

  if (isImageRequest) {
    // Image analysis path
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: "Image analysis is not available." }, { status: 500 });
    }

    // Check daily image upload limit
    const dailyImageLimit = isAdmin ? Number.MAX_SAFE_INTEGER : caps.dailyImageUploads;
    if (dailyImageLimit <= 0) {
      return NextResponse.json(
        { error: "Photo analysis is not available on your current plan. Upgrade to Plus or Pro." },
        { status: 402 }
      );
    }

    let imageUsed = 0;
    if (!isAdmin) {
      try {
        imageUsed = await countUsageSince({
          supabase,
          userId: user.id,
          eventType: "image_upload",
          sinceIso: utcDayStartIso(),
        });
      } catch {
        return NextResponse.json({ error: "Unable to read usage." }, { status: 500 });
      }

      if (imageUsed >= dailyImageLimit) {
        return NextResponse.json(
          {
            error: `Daily photo limit reached (${dailyImageLimit}/day on ${tier} plan). Upgrade to continue.`,
            usage: { used: imageUsed, limit: dailyImageLimit, tier },
          },
          { status: 402 }
        );
      }
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }

    const imageFile = formData.get("image") as File | null;
    const message = (formData.get("message") as string | null) ?? "";
    const conversationIdRaw = (formData.get("conversationId") as string | null) ?? null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Validate image type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are supported." }, { status: 400 });
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Resolve conversation
    let conversationId = conversationIdRaw;
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
      const title = message.trim() || "Photo analysis";
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

    if (!conversationId) {
      return NextResponse.json({ error: "Failed to resolve conversation." }, { status: 500 });
    }
    return handleImageAnalysis(
      supabase,
      user.id,
      conversationId,
      base64,
      imageFile.type,
      message,
      isAdmin,
      tier,
      {
        used: isAdmin ? 0 : imageUsed + 1,
        limit: isAdmin ? null : dailyImageLimit,
      }
    );
  }

  // --- Text chat path ---
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as { message?: string; conversationId?: string | null };
  const message = body.message?.trim() ?? "";
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
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

  const history = (historyRows ?? []).map((row: { role: string; content: string }) => ({ role: row.role, content: row.content }));

  // RAG: Retrieve relevant context from knowledge base
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
    signal: AbortSignal.timeout(30_000),
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
    console.error("Groq API error:", details);
    return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 502 });
  }

  const groqJson = (await groqRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const assistantMessage = groqJson.choices?.[0]?.message?.content?.trim();
  if (!assistantMessage) {
    return NextResponse.json({ error: "No model output returned." }, { status: 502 });
  }

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
