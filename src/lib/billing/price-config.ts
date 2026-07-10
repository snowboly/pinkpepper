export type BillingTier = "plus" | "pro";
export type BillingInterval = "monthly" | "annual";

type PriceConfig = { tier: BillingTier; interval: BillingInterval; priceId: string };

export function normalizeStripePriceId(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized || !normalized.startsWith("price_")) {
    return null;
  }

  return normalized;
}

function hasNonBlankValue(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function getMonthlyEnvValues(tier: BillingTier): [preferred: string | undefined, legacy: string | undefined] {
  return tier === "plus"
    ? [process.env.STRIPE_PLUS_MONTHLY_PRICE_ID, process.env.STRIPE_PLUS_PRICE_ID]
    : [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_PRICE_ID];
}

function getAnnualEnvValue(tier: BillingTier): string | undefined {
  return tier === "plus" ? process.env.STRIPE_PLUS_ANNUAL_PRICE_ID : process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
}

function getConfiguredPriceId(plan: BillingTier, interval: BillingInterval): string | null {
  if (interval === "annual") {
    return normalizeStripePriceId(getAnnualEnvValue(plan));
  }

  const [preferred, legacy] = getMonthlyEnvValues(plan);
  return normalizeStripePriceId(preferred) ?? normalizeStripePriceId(legacy);
}

function getConfiguredPriceIdsForMapping(tier: BillingTier, interval: BillingInterval): string[] {
  if (interval === "annual") {
    const priceId = normalizeStripePriceId(getAnnualEnvValue(tier));
    return priceId ? [priceId] : [];
  }

  return getMonthlyEnvValues(tier).flatMap((envValue) => {
    const priceId = normalizeStripePriceId(envValue);
    return priceId ? [priceId] : [];
  });
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

  return getConfiguredPriceId(plan, interval);
}

export function getConfiguredStripePriceIds(): PriceConfig[] {
  const configs: Array<{ tier: BillingTier; interval: BillingInterval }> = [
    { tier: "plus", interval: "monthly" },
    { tier: "plus", interval: "annual" },
    { tier: "pro", interval: "monthly" },
    { tier: "pro", interval: "annual" },
  ];
  const seen = new Set<string>();

  return configs.flatMap(({ tier, interval }) =>
    getConfiguredPriceIdsForMapping(tier, interval).flatMap((priceId) => {
      if (seen.has(priceId)) {
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

  if (interval === "annual") {
    const annualEnvValue = getAnnualEnvValue(plan);
    return hasNonBlankValue(annualEnvValue) && !normalizeStripePriceId(annualEnvValue);
  }

  const [preferred, legacy] = getMonthlyEnvValues(plan);
  const hasValidMonthlyPrice = Boolean(normalizeStripePriceId(preferred) ?? normalizeStripePriceId(legacy));
  if (hasValidMonthlyPrice) {
    return false;
  }

  return [preferred, legacy].some((envValue) => hasNonBlankValue(envValue) && !normalizeStripePriceId(envValue));
}
