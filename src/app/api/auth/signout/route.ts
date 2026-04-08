import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getTrustedSiteOrigin } from "@/lib/billing/request-origin";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Use the env-pinned site origin so a spoofed Host header cannot turn
  // sign-out into an open redirect to attacker.com. getTrustedSiteOrigin
  // prefers NEXT_PUBLIC_SITE_URL; only in its absence (dev) does it fall
  // back to request-derived values.
  const origin = getTrustedSiteOrigin(request);
  const target = origin ? `${origin}/` : new URL("/", request.url).toString();
  return NextResponse.redirect(target, { status: 303 });
}
