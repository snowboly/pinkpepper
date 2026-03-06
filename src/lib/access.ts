import { normalizeTier, type SubscriptionTier } from "@/lib/tier";

type ProfileAccessRow = {
  tier?: string | null;
  is_admin?: boolean | null;
};

const _adminEmails: Set<string> = (() => {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(raw.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean));
})();

export function isAdminUser(profileIsAdmin: boolean | null | undefined, email: string | null | undefined) {
  if (profileIsAdmin) return true;
  if (!email) return false;
  return _adminEmails.has(email.toLowerCase());
}

export function resolveUserAccess(profile: ProfileAccessRow | null | undefined, email: string | null | undefined): {
  tier: SubscriptionTier;
  isAdmin: boolean;
} {
  const isAdmin = isAdminUser(profile?.is_admin, email);
  const tier = isAdmin ? "pro" : normalizeTier(profile?.tier);
  return { tier, isAdmin };
}
