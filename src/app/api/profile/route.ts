import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/types/database.types";
import { syncMarketingContact } from "@/lib/resend/contacts";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    business_type?: string;
    company_name?: string | null;
    first_name?: string;
    last_name?: string | null;
    marketing_email_opt_in?: boolean;
    onboarding_completed?: boolean;
  };

  const update: Database["public"]["Tables"]["profiles"]["Update"] = {};
  let currentProfile:
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "first_name" | "last_name">
    | null
    | undefined;
  if (body.business_type !== undefined) update.business_type = body.business_type;
  if (body.company_name !== undefined) update.company_name = body.company_name?.trim() ? body.company_name.trim() : null;
  if (body.first_name !== undefined) {
    const firstName = body.first_name.trim();
    if (!firstName) {
      return NextResponse.json({ error: "First name is required." }, { status: 400 });
    }
    update.first_name = firstName;
  }
  if (body.last_name !== undefined) update.last_name = body.last_name?.trim() ? body.last_name.trim() : null;
  if (body.marketing_email_opt_in !== undefined) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name,last_name")
      .eq("id", user.id)
      .maybeSingle();
    currentProfile = data;

    await syncMarketingContact({
      email: user.email ?? "",
      firstName: update.first_name ?? currentProfile?.first_name ?? null,
      lastName: update.last_name ?? currentProfile?.last_name ?? null,
      subscribed: body.marketing_email_opt_in,
    });

    if (body.marketing_email_opt_in) {
      update.marketing_email_opt_in = true;
      update.marketing_email_opted_at = new Date().toISOString();
      update.marketing_email_unsubscribed_at = null;
    } else {
      update.marketing_email_opt_in = false;
      update.marketing_email_opted_at = null;
      update.marketing_email_unsubscribed_at = new Date().toISOString();
    }
  }
  if (body.onboarding_completed !== undefined) update.onboarding_completed = body.onboarding_completed;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
