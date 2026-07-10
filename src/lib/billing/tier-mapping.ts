import type { SubscriptionTier } from "@/lib/tier";
import { getConfiguredStripePriceIds, normalizeStripePriceId } from "@/lib/billing/price-config";

export type StripeSubscriptionSnapshot = {
  status: string;
  tier: SubscriptionTier;
  planTier: SubscriptionTier;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
};

export function resolveTierFromPrice(priceId: string | null | undefined): SubscriptionTier {
  const normalizedPriceId = normalizeStripePriceId(priceId);
  if (!normalizedPriceId) return "free";

  const match = getConfiguredStripePriceIds().find((config) => config.priceId === normalizedPriceId);
  return match?.tier ?? "free";
}

export function mapStripeStatusToTier(status: string, inferredTier: SubscriptionTier): SubscriptionTier {
  const activeStates = new Set(["active", "trialing"]);
  return activeStates.has(status) ? inferredTier : "free";
}

export function parseStripeSubscription(input: {
  status: string;
  priceId: string | null;
  currentPeriodEndUnix: number | null;
}): StripeSubscriptionSnapshot {
  const inferredTier = resolveTierFromPrice(input.priceId);
  const effectiveTier = mapStripeStatusToTier(input.status, inferredTier);

  return {
    status: input.status,
    tier: effectiveTier,
    planTier: inferredTier,
    stripePriceId: input.priceId,
    currentPeriodEnd: input.currentPeriodEndUnix
      ? new Date(input.currentPeriodEndUnix * 1000).toISOString()
      : null,
  };
}
