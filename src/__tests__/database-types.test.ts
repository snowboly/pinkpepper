import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function readWorkspaceFile(relativePath: string) {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("generated database types", () => {
  it("include the Stripe webhook sync RPC and processed-events table", () => {
    const databaseTypes = readWorkspaceFile("src/types/database.types.ts");

    expect(databaseTypes).toContain("webhook_events_processed:");
    expect(databaseTypes).toContain("sync_subscription_and_profile:");
    expect(databaseTypes).toContain('p_user_id: string');
    expect(databaseTypes).toContain('p_stripe_customer_id: string');
    expect(databaseTypes).toContain('p_stripe_subscription_id: string');
  });

  it("includes profile identity and marketing preference fields", () => {
    const databaseTypes = readWorkspaceFile("src/types/database.types.ts");

    expect(databaseTypes).toContain("first_name: string | null");
    expect(databaseTypes).toContain("company_name: string | null");
    expect(databaseTypes).toContain("marketing_email_opt_in: boolean");
    expect(databaseTypes).toContain("marketing_email_opted_at: string | null");
    expect(databaseTypes).toContain("marketing_email_unsubscribed_at: string | null");
    expect(databaseTypes).toContain("last_name: string | null");
    expect(databaseTypes).toContain("welcome_email_sent_at: string | null");
  });
});
