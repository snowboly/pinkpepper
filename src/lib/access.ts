import { normalizeTier, type SubscriptionTier } from "@/lib/tier";

type ProfileAccessRow = {
  tier?: string | null;
  is_admin?: boolean | null;
};

type SubscriptionAccessRow = {
  tier?: string | null;
  status?: string | null;
} | null | undefined;

const _adminEmails: Set<string> = (() => {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(raw.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean));
})();

export function isAdminUser(profileIsAdmin: boolean | null | undefined, email: string | null | undefined) {
  if (profileIsAdmin) return true;
  if (!email) return false;
  return _adminEmails.has(email.toLowerCase());
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 1,
  pro: 2,
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function resolveEffectiveTier(
  profileTier: string | null | undefined,
  subscription: SubscriptionAccessRow
): SubscriptionTier {
  const normalizedProfileTier = normalizeTier(profileTier);
  const normalizedSubscriptionTier =
    subscription?.status && ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)
      ? normalizeTier(subscription.tier)
      : "free";

  return TIER_RANK[normalizedSubscriptionTier] > TIER_RANK[normalizedProfileTier]
    ? normalizedSubscriptionTier
    : normalizedProfileTier;
}

export function resolveUserAccess(profile: ProfileAccessRow | null | undefined, email: string | null | undefined): {
  tier: SubscriptionTier;
  isAdmin: boolean;
};
export function resolveUserAccess(
  profile: ProfileAccessRow | null | undefined,
  email: string | null | undefined,
  subscription: SubscriptionAccessRow
): {
  tier: SubscriptionTier;
  isAdmin: boolean;
};
export function resolveUserAccess(
  profile: ProfileAccessRow | null | undefined,
  email: string | null | undefined,
  subscription?: SubscriptionAccessRow
): {
  tier: SubscriptionTier;
  isAdmin: boolean;
} {
  const isAdmin = isAdminUser(profile?.is_admin, email);
  const tier = isAdmin ? "pro" : resolveEffectiveTier(profile?.tier, subscription);
  return { tier, isAdmin };
}
