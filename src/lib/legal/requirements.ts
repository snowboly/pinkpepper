import { NextResponse } from "next/server";
import { LEGAL_POLICY_VERSIONS, LEGAL_TIMELINE } from "./config";
import type { AcceptanceSource, LegalCapability, LegalLocale } from "./types";

export const CURRENT_ACCEPTANCE_VERSIONS = {
  terms: LEGAL_POLICY_VERSIONS.terms,
  privacy: LEGAL_POLICY_VERSIONS.privacy,
  refund: LEGAL_POLICY_VERSIONS.refund,
} as const;

type LegalAcceptanceError = { code?: string; message?: string };
type LegalAcceptanceRow = { id: string };

type LegalAcceptanceInsert = {
  user_id: string;
  terms_version: string;
  privacy_version: string;
  refund_version: string;
  locale: LegalLocale;
  source: AcceptanceSource;
  ip_address: string | null;
  user_agent: string | null;
};

type LegalAcceptanceLimitQuery = {
  limit(count: number): Promise<{ data: LegalAcceptanceRow[] | null; error: LegalAcceptanceError | null }>;
};

type LegalAcceptanceFilterQuery = LegalAcceptanceLimitQuery & {
  eq(column: string, value: string): LegalAcceptanceFilterQuery;
  in(column: string, values: string[]): LegalAcceptanceLimitQuery;
};

type LegalAcceptanceTable = {
  select(columns: string): LegalAcceptanceFilterQuery;
  insert(row: LegalAcceptanceInsert): Promise<{ error: LegalAcceptanceError | null }>;
};

export type SupabaseLegalClient = {
  from(table: "legal_policy_acceptances"): LegalAcceptanceTable;
};

export function resolveLegalRequirements(args: { createdAt?: string | null; now?: Date; hasCurrentGeneralAcceptance: boolean; hasCurrentCheckoutAcceptance: boolean; capability?: LegalCapability }) {
  const nowMs = (args.now ?? new Date()).getTime();
  const createdMs = args.createdAt ? Date.parse(args.createdAt) : Number.NaN;
  const newUserStart = Date.parse(LEGAL_TIMELINE.newUserEffectiveAt);
  const existingEffective = Date.parse(LEGAL_TIMELINE.existingUserEffectiveAt);
  const cohort = Number.isFinite(createdMs) && createdMs >= newUserStart ? "new" : "existing";
  const needsCheckout = args.capability === "checkout";
  const accepted = args.hasCurrentGeneralAcceptance && (!needsCheckout || args.hasCurrentCheckoutAcceptance);
  const phase = accepted ? "accepted" : cohort === "new" ? "new_user_gate" : nowMs >= existingEffective ? "existing_gate" : "existing_notice";
  return { cohort, phase, requiredVersions: CURRENT_ACCEPTANCE_VERSIONS, publishedAt: LEGAL_TIMELINE.publishedAt, existingEffectiveAt: LEGAL_TIMELINE.existingUserEffectiveAt, hasCurrentGeneralAcceptance: args.hasCurrentGeneralAcceptance, hasCurrentCheckoutAcceptance: args.hasCurrentCheckoutAcceptance, mustBlock: phase === "new_user_gate" || phase === "existing_gate" || (needsCheckout && !args.hasCurrentCheckoutAcceptance) };
}

export async function hasCurrentLegalAcceptance(admin: SupabaseLegalClient, userId: string, capability: LegalCapability = "general") {
  const sources = capability === "checkout" ? ["checkout"] : ["signup", "policy_update", "checkout"];
  const { data, error } = await admin
    .from("legal_policy_acceptances")
    .select("id")
    .eq("user_id", userId)
    .eq("terms_version", CURRENT_ACCEPTANCE_VERSIONS.terms)
    .eq("privacy_version", CURRENT_ACCEPTANCE_VERSIONS.privacy)
    .eq("refund_version", CURRENT_ACCEPTANCE_VERSIONS.refund)
    .in("source", sources)
    .limit(1);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

export async function recordLegalAcceptance(admin: SupabaseLegalClient, args: { userId: string; locale: LegalLocale; source: AcceptanceSource; request?: Request }) {
  const { error } = await admin.from("legal_policy_acceptances").insert({
    user_id: args.userId,
    terms_version: CURRENT_ACCEPTANCE_VERSIONS.terms,
    privacy_version: CURRENT_ACCEPTANCE_VERSIONS.privacy,
    refund_version: CURRENT_ACCEPTANCE_VERSIONS.refund,
    locale: args.locale,
    source: args.source,
    ip_address: args.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: args.request?.headers.get("user-agent") ?? null,
  });
  if (error && error.code !== "23505") throw error;
}

export function legalAcceptanceRequiredResponse(acceptanceUrl = "/legal/acceptance") {
  return NextResponse.json({ code: "LEGAL_ACCEPTANCE_REQUIRED", acceptanceUrl }, { status: 428 });
}
