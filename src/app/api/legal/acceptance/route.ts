import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { recordLegalAcceptance, type SupabaseLegalClient } from "@/lib/legal/requirements";
import { isLegalLocale } from "@/lib/legal/routes";
import type { AcceptanceSource } from "@/lib/legal/types";

function safeReturnTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { accepted?: unknown; locale?: unknown; source?: unknown; returnTo?: unknown };
  if (body.accepted !== true) return NextResponse.json({ error: "Legal acceptance is required." }, { status: 400 });
  const locale = typeof body.locale === "string" && isLegalLocale(body.locale) ? body.locale : "en";
  const source: AcceptanceSource = body.source === "checkout" ? "checkout" : "policy_update";
  await recordLegalAcceptance(createAdminClient() as unknown as SupabaseLegalClient, { userId: user.id, locale, source, request });
  return NextResponse.json({ ok: true, returnTo: safeReturnTo(body.returnTo) });
}
