import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { TIER_CAPABILITIES, type SubscriptionTier } from "@/lib/tier";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { FOOD_SAFETY_VISION_SYSTEM_PROMPT } from "@/lib/rag/vision-prompt";
import { visionLimiter, checkRateLimit } from "@/lib/ratelimit";
import { getPersonaForConversation } from "@/lib/personas";

export const dynamic = "force-dynamic";

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
  // All rows must include the same columns so PostgREST includes metadata in the INSERT
  const { error: insertMsgError } = await supabase.from("chat_messages").insert([
    { conversation_id: conversationId, user_id: userId, role: "user", content: userContent, metadata: {} },
    { conversation_id: conversationId, user_id: userId, role: "assistant", content: assistantMessage, metadata: {} },
  ]);

  if (insertMsgError) {
    // Log for debugging but do not block the response — the analysis succeeded.
    console.error("[chat/image] Failed to save messages to DB:", insertMsgError);
  }

  const { error: usageInsertError } = await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: "image_upload",
    event_count: 1,
    metadata: { conversation_id: conversationId, model: visionModel },
  });

  if (usageInsertError) {
    console.error("Failed to record image upload usage:", usageInsertError);
  }

  const persona = getPersonaForConversation(conversationId);

  return NextResponse.json({
    conversationId,
    assistantMessage,
    citations: [],
    ragEnabled: false,
    imageAnalysis: true,
    persona: { id: persona.id, name: persona.name, avatar: persona.avatar },
    usage: {
      used: usage.used,
      limit: usage.limit,
      tier,
      isAdmin,
    },
  });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // This endpoint only handles image uploads (multipart/form-data).
  // Text chat is handled by /api/chat/stream.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "Use /api/chat/stream for text messages." }, { status: 400 });
  }

  const rateLimitRes = await checkRateLimit(visionLimiter, user.id);
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
