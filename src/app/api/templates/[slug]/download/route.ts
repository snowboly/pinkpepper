import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveEffectiveTier } from "@/lib/access";
import { TEMPLATES, isValidTemplateSlug } from "@/lib/templates";
import { BUCKETS } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isValidTemplateSlug(slug)) {
    return Response.json({ error: "Template not found." }, { status: 404 });
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Sign in to download templates." }, { status: 401 });
  }

  // Tier check — Plus and Pro can download
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("tier").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier,status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const tier = resolveEffectiveTier(profile?.tier, subscription);

  if (tier === "free") {
    return Response.json(
      { error: "Upgrade to Plus or Pro to download DOCX templates." },
      { status: 403 }
    );
  }

  // Generate a short-lived signed URL for the file in the templates bucket
  const admin = createAdminClient();
  const template = TEMPLATES.find((t) => t.slug === slug);
  const ext = template?.fileType ?? "docx";
  const storagePath = `${slug}.${ext}`;

  const { data, error: urlError } = await admin.storage
    .from(BUCKETS.templates)
    .createSignedUrl(storagePath, 60); // 60-second expiry

  if (urlError || !data?.signedUrl) {
    return Response.json(
      { error: "Template file not available yet." },
      { status: 404 }
    );
  }

  return Response.redirect(data.signedUrl, 302);
}
