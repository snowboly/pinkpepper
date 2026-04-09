import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // Always redirect back to the current deployment origin. Using the request
  // URL avoids cross-origin jumps when NEXT_PUBLIC_SITE_URL points at a
  // different environment (for example production while testing preview/local).
  const target = new URL("/", request.url).toString();
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.signOut();

  // Defensive cookie cleanup: if Supabase cannot revoke the session server-side,
  // still clear any auth cookies so the browser exits the logged-in state.
  for (const { name } of cookieStore.getAll()) {
    if (name.includes("auth-token") && name.includes("sb-")) {
      response.cookies.delete(name);
    }
  }

  return response;
}
