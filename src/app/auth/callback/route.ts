import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side auth callback handler.
 *
 * Supabase redirects here after email verification with either:
 *   - ?code=<pkce_code>  (PKCE flow — needs code_verifier from cookies)
 *   - ?token_hash=<hash>&type=<type>  (implicit / token-hash flow)
 *
 * Using a Route Handler (instead of a client page) lets us read/write
 * cookies server-side, which is required for PKCE code exchange.
 *
 * Cross-device limitation: if the user opens the link on a different
 * device than where they signed up, the PKCE code_verifier cookie
 * won't exist. In that case we fall back to token-hash verification,
 * and if that also fails we redirect to /login with a descriptive error.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const flow = searchParams.get("flow");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let verified = false;

  // 1. Try PKCE flow (code + code_verifier from cookies)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  }

  // 2. Fallback: token-hash flow (works cross-device)
  if (!verified && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "magiclink" | "email",
    });
    verified = !error;
  }

  if (!verified) {
    const origin = request.nextUrl.origin;
    const errorParam = code
      ? "cross_device_link"
      : "invalid_or_expired_link";
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`);
  }

  // Fire welcome email for signups (via internal API)
  const isSignup = flow === "signup" || type === "signup";
  if (isSignup) {
    const origin = request.nextUrl.origin;
    fetch(`${origin}/api/auth/welcome`, { method: "POST" }).catch(() => {});
  }

  // Redirect to the intended destination
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = next;
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
