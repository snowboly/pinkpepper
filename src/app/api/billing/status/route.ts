import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("tier,is_admin").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status,tier,current_period_end,stripe_price_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const { tier, isAdmin } = resolveUserAccess(profile, user.email);

  return NextResponse.json({
    tier,
    isAdmin,
    subscription: subscription ?? null,
  });
}
