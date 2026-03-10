import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";
import { countUsageSince, utcDayStartIso } from "@/lib/policy";
import { TIER_CAPABILITIES } from "@/lib/tier";
import { buildGenerateSystemPrompt, buildGenerateUserPrompt } from "@/lib/documents/generate-prompt";
import { renderDocx } from "@/lib/documents/render-docx";
import { renderPdf } from "@/lib/documents/render-pdf";
import type { DocumentType, GeneratedDocument } from "@/lib/documents/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TYPES: DocumentType[] = [
  "haccp_plan",
  "cleaning_sop",
  "temperature_log",
  "supplier_approval",
  "allergen_policy",
];

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { tier, isAdmin } = resolveUserAccess(profile, user.email);
  const caps = TIER_CAPABILITIES[tier];

  if (!isAdmin && caps.dailyDocumentGenerations === 0) {
    return NextResponse.json(
      { error: "Document generation is not available on the Free plan. Upgrade to Plus or Pro." },
      { status: 402 }
    );
  }

  let used = 0;
  try {
    used = await countUsageSince({
      supabase,
      userId: user.id,
      eventType: "document_generation",
      sinceIso: utcDayStartIso(),
    });
  } catch {
    return NextResponse.json({ error: "Unable to read usage." }, { status: 500 });
  }

  if (!isAdmin && used >= caps.dailyDocumentGenerations) {
    return NextResponse.json(
      {
        error: `Daily document generation limit (${caps.dailyDocumentGenerations}) reached. Upgrade or try again tomorrow.`,
        usage: { used, limit: caps.dailyDocumentGenerations, tier },
      },
      { status: 402 }
    );
  }

  let body: { documentType?: string; answers?: string[]; format?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { documentType, answers = [], format = "json" } = body;

  if (!documentType || !VALID_TYPES.includes(documentType as DocumentType)) {
    return NextResponse.json(
      { error: `documentType must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!["json", "pdf", "docx"].includes(format)) {
    return NextResponse.json({ error: "format must be json, pdf, or docx" }, { status: 400 });
  }

  const systemPrompt = buildGenerateSystemPrompt(documentType as DocumentType);
  const userPrompt = buildGenerateUserPrompt(documentType as DocumentType, answers);

  const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  let rawJson: string;
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "LLM generation failed." }, { status: 502 });
    }

    const groqData = await groqRes.json() as { choices?: [{ message: { content: string } }] };
    rawJson = groqData.choices?.[0]?.message?.content ?? "";
  } catch (e) {
    console.error("Groq fetch error:", e);
    return NextResponse.json({ error: "LLM request failed." }, { status: 502 });
  }

  let doc: GeneratedDocument;
  try {
    doc = JSON.parse(rawJson) as GeneratedDocument;
  } catch {
    console.error("Failed to parse LLM JSON:", rawJson.slice(0, 200));
    return NextResponse.json({ error: "LLM returned invalid JSON." }, { status: 502 });
  }

  // Track usage
  await supabase.from("usage_events").insert({
    user_id: user.id,
    event_type: "document_generation",
    metadata: { documentType, format },
  });

  if (format === "json") {
    return NextResponse.json({ document: doc, usage: { used: used + 1, limit: caps.dailyDocumentGenerations, tier } });
  }

  if (format === "docx") {
    const buffer = await renderDocx(doc);
    const fileName = `${doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.docx`;
    return new Response(new Blob([buffer]), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  }

  // format === 'pdf'
  const pdfBytes = await renderPdf(doc);
  const fileName = `${doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
  return new Response(new Blob([pdfBytes]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
