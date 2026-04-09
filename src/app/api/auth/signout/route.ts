import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getTrustedSiteOrigin } from "@/lib/billing/request-origin";

export async function POST(request: Request) {
  // Build the redirect response first so Supabase can write cookie
  // deletions directly onto it. Mutations via cookies() from next/headers
  // do not propagate onto a NextResponse.redirect(), so the session would
  // never actually clear in the browser without this pattern.
  const origin = getTrustedSiteOrigin(request);
  const target = origin ? `${origin}/` : new URL("/", request.url).toString();
  const response = NextResponse.redirect(target, { status: 303 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.signOut();
  return response;
}
