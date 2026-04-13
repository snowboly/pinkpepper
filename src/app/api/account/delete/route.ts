import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isSameOriginRequest } from "@/lib/billing/request-origin";

export const dynamic = "force-dynamic";

/**
 * The exact string the client must send in the request body to authorise
 * deletion. This is deliberately case-sensitive and distinct from any
 * translatable UI string so that a CSRF form submission (which cannot
 * read the current user's session) cannot guess it, and so that a typo
 * in a support script cannot accidentally wipe an account.
 */
const DELETE_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export async function DELETE(request: Request) {
  // 1. CSRF guard: DELETE with credentials is still reachable from malicious
  //    same-site subdomains and from non-browser clients replaying a stolen
  //    cookie. Require a verifiable same-origin browser context before we
  //    even look at the session.
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Typed confirmation: the client must POST a JSON body containing the
  //    literal phrase AND the authenticated user's current email address.
  //    This defeats one-click CSRF variants (the attacker cannot know the
  //    victim's email a priori) and forces any automation to be explicit
  //    about which identity it is destroying.
  let body: { confirm?: unknown; email?: unknown } = {};
  try {
    body = (await request.json()) as { confirm?: unknown; email?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.confirm !== "string" || body.confirm !== DELETE_CONFIRMATION_PHRASE) {
    return NextResponse.json(
      { error: `Type "${DELETE_CONFIRMATION_PHRASE}" to confirm.` },
      { status: 400 }
    );
  }

  const providedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const currentEmail = (user.email ?? "").trim().toLowerCase();
  if (!currentEmail || providedEmail !== currentEmail) {
    return NextResponse.json(
      { error: "Email confirmation does not match the signed-in account." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
