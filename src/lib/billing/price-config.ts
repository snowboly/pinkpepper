export type BillingTier = "plus" | "pro";
export type BillingInterval = "monthly" | "annual";

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

function getConfiguredPriceEnvValue(plan: BillingTier, interval: BillingInterval): string | undefined {
  if (plan === "plus" && interval === "monthly") {
    return process.env.STRIPE_PLUS_MONTHLY_PRICE_ID ?? process.env.STRIPE_PLUS_PRICE_ID;
  }
  if (plan === "plus" && interval === "annual") {
    return process.env.STRIPE_PLUS_ANNUAL_PRICE_ID;
  }
  if (plan === "pro" && interval === "monthly") {
    return process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? process.env.STRIPE_PRO_PRICE_ID;
  }
  return process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
}

function getConfiguredPriceEnvValuesForMapping(tier: BillingTier, interval: BillingInterval): Array<string | undefined> {
  if (tier === "plus" && interval === "monthly") {
    return [process.env.STRIPE_PLUS_MONTHLY_PRICE_ID, process.env.STRIPE_PLUS_PRICE_ID];
  }
  if (tier === "pro" && interval === "monthly") {
    return [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_PRICE_ID];
  }
  return [getConfiguredPriceEnvValue(tier, interval)];
}

export function isBillingTier(value: unknown): value is BillingTier {
  return value === "plus" || value === "pro";
}

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "monthly" || value === "annual";
}

export function getStripePriceIdForPlan(
  plan: string | null | undefined,
  interval: string | null | undefined = "monthly"
): string | null {
  if (!isBillingTier(plan) || !isBillingInterval(interval)) {
    return null;
  }

  return normalizeStripePriceId(getConfiguredPriceEnvValue(plan, interval));
}

export function getConfiguredStripePriceIds(): Array<{ tier: BillingTier; interval: BillingInterval; priceId: string }> {
  const configs: Array<{ tier: BillingTier; interval: BillingInterval }> = [
    { tier: "plus", interval: "monthly" },
    { tier: "plus", interval: "annual" },
    { tier: "pro", interval: "monthly" },
    { tier: "pro", interval: "annual" },
  ];

  const seen = new Set<string>();

  return configs.flatMap(({ tier, interval }) =>
    getConfiguredPriceEnvValuesForMapping(tier, interval).flatMap((envValue) => {
      const priceId = normalizeStripePriceId(envValue);
      if (!priceId || seen.has(priceId)) {
        return [];
      }
      seen.add(priceId);
      return [{ tier, interval, priceId }];
    })
  );
}

export function hasStripePriceConfigError(
  plan: string | null | undefined,
  interval: string | null | undefined = "monthly"
): boolean {
  if (!isBillingTier(plan) || !isBillingInterval(interval)) {
    return false;
  }

  const envValue = getConfiguredPriceEnvValue(plan, interval);
  return Boolean(envValue && !normalizeStripePriceId(envValue));
}
