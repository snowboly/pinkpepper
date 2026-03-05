import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { resolveUserAccess } from "@/lib/access";
import AdminReviewQueue from "@/components/admin/AdminReviewQueue";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/reviews");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier,is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { isAdmin } = resolveUserAccess(profile, user.email);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <AdminReviewQueue />;
}
