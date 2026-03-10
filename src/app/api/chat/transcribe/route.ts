import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";

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
  | "NOT_CONFIGURED"
  | "PROVIDER_FAILURE";

function errorResponse(status: number, code: ErrorCode, message: string, details?: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
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
      status: upstreamResponse.status
    });

    return errorResponse(502, "PROVIDER_FAILURE", "Transcription provider returned an error.");
  }

  const payload = (await upstreamResponse.json()) as { text?: unknown };
  const text = typeof payload.text === "string" ? payload.text : "";

  return NextResponse.json({ text });
}
