import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("profile sql surface", () => {
  it("syncs signup metadata into the profile trigger", () => {
    const migration = readPage("supabase/migrations/0031_sync_new_user_profile_metadata.sql");
    const oauthMigration = readPage("supabase/migrations/0032_google_oauth_profile_completion.sql");

    expect(migration).toContain("create or replace function public.handle_new_user()");
    expect(migration).toContain("first_name");
    expect(migration).toContain("last_name");
    expect(migration).toContain("company_name");
    expect(migration).toContain("marketing_email_opt_in");
    expect(migration).toContain("marketing_email_opted_at");
    expect(migration).toContain("raw_user_meta_data");
    expect(oauthMigration).toContain("welcome_email_sent_at");
  });
});
