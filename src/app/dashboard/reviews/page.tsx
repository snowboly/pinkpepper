import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import UserReviewList from "@/components/dashboard/UserReviewList";

export const dynamic = "force-dynamic";

export default async function UserReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/reviews");
  }

  return <UserReviewList />;
}
