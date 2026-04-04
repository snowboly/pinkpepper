export function getStripePriceIdForPlan(plan: string | null | undefined): string | null {
  if (plan !== "plus" && plan !== "pro") {
    return null;
  }

  const envValue =
    plan === "plus" ? process.env.STRIPE_PLUS_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;

  if (!envValue) {
    return null;
  }

  const normalized = envValue.trim();
  if (!normalized.startsWith("price_")) {
    return null;
  }

  return normalized;
}

export function hasStripePriceConfigError(plan: string | null | undefined): boolean {
  if (plan !== "plus" && plan !== "pro") {
    return false;
  }

  const envValue =
    plan === "plus" ? process.env.STRIPE_PLUS_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;

  return Boolean(envValue && !envValue.trim().startsWith("price_"));
}
