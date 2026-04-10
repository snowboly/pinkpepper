import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// Accept canonical UUIDs (v1-v5) — strict enough to reject SQL/path-style
// payloads, loose enough that the DB remains the source of truth.
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { title?: string; project_id?: string | null; archived_at?: string | null };
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title || title.length > 100) {
      return NextResponse.json({ error: "Title must be 1–100 characters." }, { status: 400 });
    }
    updates.title = title;
  }

  // First, confirm the conversation belongs to the caller. We do this BEFORE
  // any project-ownership check so an attacker probing for another user's
  // project UUID can't use the 200/4xx split as an oracle.
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  if ("project_id" in body) {
    // IDOR guard: a caller could previously PATCH `project_id` to any UUID
    // they knew or guessed, re-parenting their own conversation into another
    // tenant's project. Verify ownership of the target project against the
    // authenticated user's row in `projects` before trusting the value.
    const rawProjectId = body.project_id;
    if (rawProjectId === null || rawProjectId === undefined) {
      updates.project_id = null;
    } else if (typeof rawProjectId !== "string" || !UUID_V4_RE.test(rawProjectId)) {
      return NextResponse.json({ error: "Invalid project id." }, { status: 400 });
    } else {
      const { data: project, error: projectLookupError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", rawProjectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (projectLookupError) {
        return NextResponse.json({ error: "Failed to verify project." }, { status: 500 });
      }
      if (!project) {
        // Return the same 404 shape as a non-existent project so we do not
        // leak whether the target UUID exists in another tenant's rows.
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      updates.project_id = rawProjectId;
    }
  }

  if ("archived_at" in body) {
    // Don't trust the client-supplied timestamp — stamp it server-side.
    // The only meaningful signal from the client is archive (truthy) vs
    // unarchive (null).
    updates.archived_at = body.archived_at ? new Date().toISOString() : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update conversation." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}