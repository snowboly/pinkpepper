import { redirect } from "next/navigation";
import { LegalAcceptanceForm } from "@/components/legal/LegalAcceptanceForm";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Legal Acceptance | PinkPepper", robots: { index: false, follow: true } };

export default async function LegalAcceptancePage({ searchParams }: { searchParams: Promise<{ next?: string; locale?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/legal/acceptance");
  const params = await searchParams;
  return <main className="pp-container max-w-2xl py-16"><h1 className="text-3xl font-semibold text-[#0F172A]">Accept updated legal terms</h1><p className="mt-3 text-[#475569]">Please accept the current Terms and acknowledge the Privacy and Refund policies before continuing.</p><div className="mt-8"><LegalAcceptanceForm returnTo={params.next ?? "/dashboard"} locale={params.locale ?? "en"} /></div></main>;
}
