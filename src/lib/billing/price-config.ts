import {
  getConfiguredStripePriceIds,
  getStripePriceIdForPlan as getSubscriptionStripePriceIdForPlan,
  hasStripePriceConfigError as hasSubscriptionStripePriceConfigError,
  isBillingInterval,
  isBillingTier,
} from "@/lib/billing/subscription-price-config";
import type { BillingInterval, BillingTier } from "@/lib/billing/subscription-price-config";

export function normalizeStripePriceId(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized.startsWith("price_")) {
    return null;
  }

  return normalized;
}

export function getStripePriceIdForPlan(
  plan: string | null | undefined,
  interval: string | null | undefined = "monthly"
): string | null {
  return getSubscriptionStripePriceIdForPlan(plan, interval);
}

export function hasStripePriceConfigError(
  plan: string | null | undefined,
  interval: string | null | undefined = "monthly"
): boolean {
  return hasSubscriptionStripePriceConfigError(plan, interval);
}

export { getConfiguredStripePriceIds, isBillingInterval, isBillingTier };
export type { BillingInterval, BillingTier };
