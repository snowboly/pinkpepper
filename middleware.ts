import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/access";
import {
  NONCE_HEADER,
  buildContentSecurityPolicy,
  generateCspNonce,
} from "@/lib/security/csp";

/**
 * Middleware is responsible for two things:
 *
 *  1. Setting a per-request `Content-Security-Policy` header with a fresh
 *     nonce. This is the only place a nonce can be generated early enough
 *     that server components (which render later) can read it from the
 *     incoming request headers and attach it to their `<script>` tags.
 *  2. Gating access to authenticated pages (/dashboard, /admin, auth pages).
 *
 * Every return path MUST route through `finalize(response)` so the CSP and
 * nonce headers are applied uniformly, even on redirect responses.
 */

export async function middleware(request: NextRequest) {
  const nonce = generateCspNonce();
  const csp = buildContentSecurityPolicy(nonce);

  // Forward the nonce to downstream server components via a request
  // header. `NextResponse.next({ request: { headers: ... } })` rewrites
  // the incoming headers that the RSC render pipeline sees.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set(NONCE_HEADER, nonce);

  /** Attach CSP + nonce headers to any response we return. */
  const finalize = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set(NONCE_HEADER, nonce);
    return response;
  };

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtected = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");
  const needsSession = isAuthPage || isProtected || isAdminPage;

  // Fast path: pages that do not touch auth skip the Supabase round-trip
  // entirely. CSP headers still get applied.
  if (!needsSession) {
    return finalize(NextResponse.next({ request: { headers: forwardedHeaders } }));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return finalize(NextResponse.next({ request: { headers: forwardedHeaders } }));
  }

  let response = NextResponse.next({ request: { headers: forwardedHeaders } });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: forwardedHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((isProtected || isAdminPage) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return finalize(NextResponse.redirect(redirectUrl));
  }

  // Block unconfirmed users from protected pages
  if ((isProtected || isAdminPage) && user && !user.email_confirmed_at) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/signup";
    redirectUrl.searchParams.set("error", "confirm_email");
    return finalize(NextResponse.redirect(redirectUrl));
  }

  if (isAdminPage && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    const allowed = isAdminUser(profile?.is_admin, user.email);
    if (!allowed) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.search = "";
      return finalize(NextResponse.redirect(redirectUrl));
    }
  }

  if (isAuthPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return finalize(NextResponse.redirect(redirectUrl));
  }

  // Sync locale cookie from profile if missing
  if (user && !request.cookies.get("locale")?.value) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("locale")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.locale) {
      response.cookies.set("locale", profile.locale, {
        path: "/",
        maxAge: 31536000,
      });
    }
  }

  return finalize(response);
}

export const config = {
  // Run on every request EXCEPT static assets and API routes. CSP does
  // not apply to JSON/API responses, and running middleware on static
  // assets wastes edge CPU.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$).*)",
  ],
};
