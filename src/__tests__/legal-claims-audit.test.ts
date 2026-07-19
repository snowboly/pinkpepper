import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const required = ["Supabase", "Vercel hosting", "Vercel Analytics", "Vercel Speed Insights", "Groq", "OpenAI", "Stripe", "Resend", "Upstash", "Google Analytics", "Google sign-in"];
const fields = ["data categories", "storage/region", "purpose/role", "retention/deletion path", "international transfer mechanism", "encryption", "access control", "logging", "backups", "certifications", "training use", "repository evidence", "official source", "verified on", "status", "policy wording"];

describe("vendor and policy claims audit", () => {
  it("documents required vendors and evidence fields", () => {
    const audit = readFileSync("docs/legal/vendor-and-policy-claims-audit.md", "utf8");
    for (const service of required) expect(audit).toContain(service);
    for (const field of fields) expect(audit).toContain(field);
    for (const section of ["Retention", "Deletion", "Security", "Transfers", "Training use", "Cookies"]) expect(audit).toContain("## " + section);
    expect(audit).toContain("qualified");
  });
});
