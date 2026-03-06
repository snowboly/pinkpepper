import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id,name,emoji,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load projects." }, { status: 500 });
  }

  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string; emoji?: string };
  const name = body.name?.trim();

  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: "Project name is required and must be at most 100 characters." },
      { status: 400 }
    );
  }

  const emoji = body.emoji?.trim() || "📁";

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, emoji })
    .select("id,name,emoji,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
