import { legalAcceptanceRequiredResponse, hasCurrentLegalAcceptance, type SupabaseLegalClient } from "./requirements";
import type { LegalCapability } from "./types";

export const PROTECTED_LEGAL_API_ROUTES = [
  "POST /api/chat",
  "POST /api/chat/stream",
  "POST /api/chat/transcribe",
  "POST /api/audit/stream",
  "POST /api/documents/upload",
  "POST /api/export/docx",
  "POST /api/export/pdf",
  "POST /api/reviews",
  "POST /api/review-contact",
  "GET /api/templates/[slug]/download",
  "POST /api/billing/checkout",
] as const;

export async function requireLegalCapability(args: { admin: SupabaseLegalClient; userId: string; capability?: LegalCapability }) {
  const capability = args.capability ?? "general";
  const accepted = await hasCurrentLegalAcceptance(args.admin, args.userId, capability);
  return accepted ? null : legalAcceptanceRequiredResponse(capability === "checkout" ? "/legal/acceptance?capability=checkout" : "/legal/acceptance");
}
