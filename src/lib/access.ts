import { normalizeTier, type SubscriptionTier } from "@/lib/tier";

type ProfileAccessRow = {
  tier?: string | null;
  is_admin?: boolean | null;
};

function adminEmailsSet() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const items = raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return new Set(items);
}

export function isAdminUser(profileIsAdmin: boolean | null | undefined, email: string | null | undefined) {
  if (profileIsAdmin) return true;
  if (!email) return false;
  return adminEmailsSet().has(email.toLowerCase());
}

export function resolveUserAccess(profile: ProfileAccessRow | null | undefined, email: string | null | undefined): {
  tier: SubscriptionTier;
  isAdmin: boolean;
} {
  const tier = normalizeTier(profile?.tier);
  const isAdmin = isAdminUser(profile?.is_admin, email);
  return { tier, isAdmin };
}
