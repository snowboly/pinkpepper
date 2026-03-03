import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const { error } = await supabase.from("conversations").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete conversation." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}