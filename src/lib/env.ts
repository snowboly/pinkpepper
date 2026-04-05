/**
 * Validates that critical environment variables are present at runtime.
 * Call once during app startup (e.g. root layout).
 */

const REQUIRED_SERVER_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const OPTIONAL_SERVER_VARS = [
  "GROQ_API_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CRON_SECRET",
] as const;

let _validated = false;

export function validateEnv() {
  if (_validated) return;
  _validated = true;

  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Check your .env file or deployment configuration."
    );
  }

  const warnings: string[] = [];
  for (const key of OPTIONAL_SERVER_VARS) {
    if (!process.env[key]) warnings.push(key);
  }

  if (warnings.length > 0) {
    console.warn(`[env] Optional vars not set: ${warnings.join(", ")}`);
  }
}
