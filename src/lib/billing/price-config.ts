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

export function getStripePriceIdForPlan(plan: string | null | undefined): string | null {
  if (plan !== "plus" && plan !== "pro") {
    return null;
  }

  const envValue =
    plan === "plus" ? process.env.STRIPE_PLUS_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;

  return normalizeStripePriceId(envValue);
}

export function hasStripePriceConfigError(plan: string | null | undefined): boolean {
  if (plan !== "plus" && plan !== "pro") {
    return false;
  }

  const envValue =
    plan === "plus" ? process.env.STRIPE_PLUS_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;

  return Boolean(envValue && !normalizeStripePriceId(envValue));
}
