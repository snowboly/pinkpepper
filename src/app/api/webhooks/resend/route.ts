import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const body = await request.text();
  const resend = new Resend(process.env.RESEND_API_KEY);

  let event;
  try {
    event = resend.webhooks.verify({
      payload: body,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    (event.type === "contact.updated" || event.type === "contact.created") &&
    event.data.unsubscribed &&
    event.data.email
  ) {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        marketing_email_opt_in: false,
        marketing_email_unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", event.data.email);

    if (error) {
      console.error("Resend webhook profile sync failed:", error);
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
