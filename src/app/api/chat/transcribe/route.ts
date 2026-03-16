import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { checkRateLimit, transcribeLimiter } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const ALLOWED_AUDIO_MIME_TYPES = new Set(["audio/webm", "audio/mp4", "audio/wav"]);
const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;
const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

type ErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_CONTENT_TYPE"
  | "INVALID_FORM_DATA"
  | "MISSING_AUDIO"
  | "UNSUPPORTED_FORMAT"
  | "AUDIO_TOO_LARGE"
  | "PLAN_UPGRADE_REQUIRED"
  | "NOT_CONFIGURED"
  | "USAGE_READ_FAILED"
  | "USAGE_WRITE_FAILED"
  | "PROVIDER_FAILURE";

function errorResponse(status: number, code: ErrorCode, message: string, details?: string, usage?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      ...(usage ? { usage } : {}),
    },
    { status }
  );
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse(401, "UNAUTHORIZED", "Unauthorized");
  }

  const rateLimitRes = await checkRateLimit(transcribeLimiter, user.id);
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

  const dailyTranscriptionLimit = isAdmin ? Number.MAX_SAFE_INTEGER : caps.dailyTranscriptions;
  if (dailyTranscriptionLimit <= 0) {
    return errorResponse(
      402,
      "PLAN_UPGRADE_REQUIRED",
      "Audio transcription is not available on your current plan. Upgrade to Plus or Pro.",
      undefined,
      { used: 0, limit: dailyTranscriptionLimit, tier }
    );
  }

  let transcriptionsUsed = 0;
  if (!isAdmin) {
    try {
      transcriptionsUsed = await countUsageSince({
        supabase,
        userId: user.id,
        eventType: "audio_transcription",
        sinceIso: utcDayStartIso(),
      });
    } catch {
      return errorResponse(500, "USAGE_READ_FAILED", "Unable to read usage.");
    }

    if (transcriptionsUsed >= dailyTranscriptionLimit) {
      return errorResponse(
        402,
        "PLAN_UPGRADE_REQUIRED",
        `Daily transcription limit reached (${dailyTranscriptionLimit}/day on ${tier} plan). Upgrade to continue.`,
        undefined,
        { used: transcriptionsUsed, limit: dailyTranscriptionLimit, tier }
      );
    }
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return errorResponse(400, "INVALID_CONTENT_TYPE", "Expected multipart/form-data request body.");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(400, "INVALID_FORM_DATA", "Invalid multipart form data.");
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File)) {
    return errorResponse(400, "MISSING_AUDIO", "Missing audio file in `audio` field.");
  }

  if (!ALLOWED_AUDIO_MIME_TYPES.has(audio.type)) {
    return errorResponse(
      415,
      "UNSUPPORTED_FORMAT",
      "Unsupported audio format. Allowed: audio/webm, audio/mp4, audio/wav."
    );
  }

  if (audio.size > MAX_AUDIO_SIZE_BYTES) {
    return errorResponse(413, "AUDIO_TOO_LARGE", "Audio file exceeds the 25MB size limit.");
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return errorResponse(500, "NOT_CONFIGURED", "Transcription provider is not configured.");
  }

  const model = process.env.OPENAI_TRANSCRIPTION_MODEL ?? DEFAULT_TRANSCRIPTION_MODEL;
  const durationMsRaw = formData.get("durationMs");
  const durationMs =
    typeof durationMsRaw === "string" && Number.isFinite(Number(durationMsRaw)) ? Number(durationMsRaw) : null;

  console.info("[chat.transcribe] request", {
    userId: user.id,
    sizeBytes: audio.size,
    durationMs,
  });

  const upstreamFormData = new FormData();
  upstreamFormData.append("file", audio, audio.name || "audio.webm");
  upstreamFormData.append("model", model);

  const language = formData.get("language");
  if (typeof language === "string" && language.trim()) {
    upstreamFormData.append("language", language.trim());
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: upstreamFormData,
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    return errorResponse(502, "PROVIDER_FAILURE", "Transcription provider request failed.");
  }

  if (!upstreamResponse.ok) {
    await upstreamResponse.text();
    console.error("[chat.transcribe] provider failure", {
      userId: user.id,
      sizeBytes: audio.size,
      durationMs,
      status: upstreamResponse.status,
    });

    return errorResponse(502, "PROVIDER_FAILURE", "Transcription provider returned an error.");
  }

  const payload = (await upstreamResponse.json()) as { text?: unknown };
  const text = typeof payload.text === "string" ? payload.text : "";

  const { error: usageInsertError } = await supabase.from("usage_events").insert({
    user_id: user.id,
    event_type: "audio_transcription",
    event_count: 1,
    metadata: {
      model,
      duration_ms: durationMs,
      size_bytes: audio.size,
      language: typeof language === "string" ? language.trim() || null : null,
    },
  });

  if (usageInsertError) {
    return errorResponse(500, "USAGE_WRITE_FAILED", "Failed to record usage.");
  }

  return NextResponse.json({
    text,
    usage: {
      used: isAdmin ? null : transcriptionsUsed + 1,
      limit: isAdmin ? null : dailyTranscriptionLimit,
      tier,
      isAdmin,
    },
  });
}
