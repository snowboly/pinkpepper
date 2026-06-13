import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/0030_legal_lexical_retrieval.sql"),
  "utf8",
);

describe("legal lexical retrieval migration", () => {
  it("limits retrieval to active primary-law regulations", () => {
    expect(migration).toContain("kc.source_type = 'regulation'");
    expect(migration).toContain("metadata->>'retrieval_status', 'active'");
    expect(migration).toContain("metadata->>'source_class', 'primary_law'");
  });

  it("scores exact legal identifiers before document recency", () => {
    expect(migration).toContain("exact_score");
    expect(migration).toContain("metadata->>'celexNumber'");
    expect(migration).toContain("metadata->>'baseCelexNumber'");
    expect(migration).toContain("metadata->>'originalTitle'");
    expect(migration).toMatch(/order by\s+scored\.exact_score desc/i);
  });
});
