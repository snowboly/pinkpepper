import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveEffectiveTier } from "@/lib/access";
import { TEMPLATES, isValidTemplateSlug } from "@/lib/templates";
import { BUCKETS } from "@/lib/storage";

export const dynamic = "force-dynamic";

function splitStoragePath(storagePath: string): { folder: string; fileName: string } {
  const lastSlash = storagePath.lastIndexOf("/");
  if (lastSlash === -1) {
    return { folder: "", fileName: storagePath };
  }

  return {
    folder: storagePath.slice(0, lastSlash),
    fileName: storagePath.slice(lastSlash + 1),
  };
}

async function objectExistsInTemplatesBucket(
  admin: ReturnType<typeof createAdminClient>,
  storagePath: string
): Promise<boolean> {
  const { folder, fileName } = splitStoragePath(storagePath);
  const { data, error } = await admin.storage
    .from(BUCKETS.templates)
    .list(folder, { search: fileName, limit: 100 });

  if (error || !data) {
    return false;
  }

  return data.some((entry) => entry.name === fileName);
}

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
  const baseName = template?.storageName ?? slug;
  const storagePaths = [`${baseName}.${ext}`, `Templates/${baseName}.${ext}`];

  let signedUrl: string | null = null;
  for (const storagePath of storagePaths) {
    const objectExists = await objectExistsInTemplatesBucket(admin, storagePath);
    if (!objectExists) {
      continue;
    }

    const { data } = await admin.storage
      .from(BUCKETS.templates)
      .createSignedUrl(storagePath, 60); // 60-second expiry

    if (data?.signedUrl) {
      signedUrl = data.signedUrl;
      break;
    }
  }

  if (!signedUrl) {
    return Response.json(
      { error: "Template file not available yet." },
      { status: 404 }
    );
  }

  return Response.redirect(signedUrl, 302);
}
