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

function getNonBlankEnvValue(value: string | undefined): string | undefined {
  return value?.trim() ? value : undefined;
}

function getMonthlyPriceEnvValue(preferredValue: string | undefined, legacyValue: string | undefined): string | undefined {
  const preferredPriceId = normalizeStripePriceId(preferredValue);
  if (preferredPriceId) {
    return preferredPriceId;
  }

  return legacyValue;
}

function getLegacyMonthlyPriceEnvValue(plan: BillingTier): string | undefined {
  return plan === "plus" ? process.env.STRIPE_PLUS_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;
}

function getConfiguredPriceEnvValue(plan: BillingTier, interval: BillingInterval): string | undefined {
  if (plan === "plus" && interval === "monthly") {
    return getMonthlyPriceEnvValue(process.env.STRIPE_PLUS_MONTHLY_PRICE_ID, process.env.STRIPE_PLUS_PRICE_ID);
  }
  if (plan === "plus" && interval === "annual") {
    return process.env.STRIPE_PLUS_ANNUAL_PRICE_ID;
  }
  if (plan === "pro" && interval === "monthly") {
    return getMonthlyPriceEnvValue(process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_PRICE_ID);
  }
  return process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
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
  const configs: Array<{ tier: BillingTier; interval: BillingInterval; values: Array<string | undefined> }> = [
    {
      tier: "plus",
      interval: "monthly",
      values: [process.env.STRIPE_PLUS_MONTHLY_PRICE_ID, getLegacyMonthlyPriceEnvValue("plus")],
    },
    { tier: "plus", interval: "annual", values: [process.env.STRIPE_PLUS_ANNUAL_PRICE_ID] },
    {
      tier: "pro",
      interval: "monthly",
      values: [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, getLegacyMonthlyPriceEnvValue("pro")],
    },
    { tier: "pro", interval: "annual", values: [process.env.STRIPE_PRO_ANNUAL_PRICE_ID] },
  ];
  const seenPriceIds = new Set<string>();

  return configs.flatMap(({ tier, interval, values }) => {
    return values.flatMap((value) => {
      const priceId = normalizeStripePriceId(value);
      if (!priceId || seenPriceIds.has(priceId)) {
        return [];
      }

      seenPriceIds.add(priceId);
      return [{ tier, interval, priceId }];
    });
  });
}

export function hasStripePriceConfigError(
  plan: string | null | undefined,
  interval: string | null | undefined = "monthly"
): boolean {
  if (!isBillingTier(plan) || !isBillingInterval(interval)) {
    return false;
  }

  const envValue = getConfiguredPriceEnvValue(plan, interval);
  if (envValue && !normalizeStripePriceId(envValue)) {
    return true;
  }

  if (interval !== "monthly") {
    return false;
  }

  const preferredEnvValue =
    plan === "plus" ? getNonBlankEnvValue(process.env.STRIPE_PLUS_MONTHLY_PRICE_ID) : getNonBlankEnvValue(process.env.STRIPE_PRO_MONTHLY_PRICE_ID);
  return Boolean(preferredEnvValue && !normalizeStripePriceId(preferredEnvValue) && !normalizeStripePriceId(getLegacyMonthlyPriceEnvValue(plan)));
}
