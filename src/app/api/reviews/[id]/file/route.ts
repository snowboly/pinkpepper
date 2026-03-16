import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveUserAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

const SIGNED_URL_EXPIRY = 60; // seconds

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch review — verify user owns it or is admin
  const { data: review, error: fetchError } = await admin
    .from("review_requests")
    .select("id,user_id,reviewer_file_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  // Check authorization: must own the review or be admin
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("tier,is_admin")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const { isAdmin } = resolveUserAccess(profile, user.email, subscription);

  if (review.user_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!review.reviewer_file_id) {
    return NextResponse.json({ error: "No file attached to this review." }, { status: 404 });
  }

  // Get file metadata
  const { data: file, error: fileError } = await admin
    .from("files")
    .select("storage_path,bucket,deleted_at,file_name")
    .eq("id", review.reviewer_file_id)
    .maybeSingle();

  if (fileError || !file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  if (file.deleted_at) {
    return NextResponse.json({ error: "File has been deleted." }, { status: 410 });
  }

  // Generate signed URL
  const { data: urlData, error: urlError } = await admin.storage
    .from(file.bucket)
    .createSignedUrl(file.storage_path, SIGNED_URL_EXPIRY, {
      download: file.file_name,
    });

  if (urlError || !urlData?.signedUrl) {
    return NextResponse.json({ error: "Failed to generate download URL." }, { status: 500 });
  }

  return NextResponse.redirect(urlData.signedUrl);
}
