import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { resolveEffectiveTier } from "@/lib/access";

type Props = {
  slug: string;
  title: string;
};

export async function TemplateDownloadCard({ slug, title }: Props) {
  // Read auth + tier server-side — no round trip from client
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tier: "free" | "plus" | "pro" = "free";
  if (user) {
    const [{ data: profile }, { data: subscription }] = await Promise.all([
      supabase.from("profiles").select("tier").eq("id", user.id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("tier,status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    tier = resolveEffectiveTier(profile?.tier, subscription);
  }

  // ── Plus / Pro: show download button ────────────────────────────
  if (user && (tier === "plus" || tier === "pro")) {
    return (
      <div className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A]">
          Available for download
        </p>
        <p className="mt-3 text-base font-semibold text-[#0F172A]">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#475569]">
          Download the DOCX file and adapt it directly for your site.
        </p>
        <a
          href={`/api/templates/${slug}/download`}
          download
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C] self-start"
        >
          <DownloadIcon />
          Download DOCX
        </a>
        <p className="mt-3 text-xs text-[#94A3B8]">
          Editable Microsoft Word format
        </p>
      </div>
    );
  }

  // ── Logged-in free user: upgrade prompt ─────────────────────────
  if (user && tier === "free") {
    return (
      <div className="flex flex-col rounded-2xl border border-[#FBCFE8] bg-[#FFF1F2] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#BE123C]">
          Plus &amp; Pro
        </p>
        <p className="mt-3 text-base font-semibold text-[#0F172A]">
          Download this template as DOCX
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#475569]">
          Upgrade to Plus or Pro to download all 15 food safety templates as
          editable Word documents.
        </p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C] self-start"
        >
          View plans
        </Link>
        <p className="mt-3 text-xs text-[#94A3B8]">
          Cancel any time &middot; No setup fee
        </p>
      </div>
    );
  }

  // ── Unauthenticated: sign up prompt ─────────────────────────────
  return (
    <div className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E11D48]">
        Free template
      </p>
      <p className="mt-3 text-base font-semibold text-[#0F172A]">
        Download this template as DOCX
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[#475569]">
        Create a free account to access PinkPepper, then upgrade to Plus or Pro
        to download all 15 templates as editable Word documents.
      </p>
      <Link
        href="/signup"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C] self-start"
      >
        Sign up free
      </Link>
      <p className="mt-3 text-xs text-[#94A3B8]">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-2 hover:text-[#475569]">
          Log in
        </Link>
      </p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
