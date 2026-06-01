import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/0029_versioned_knowledge_chunks.sql",
  "utf-8"
);

describe("versioned knowledge chunk SQL", () => {
  it("keeps legacy chunks searchable while excluding archived chunks", () => {
    expect(migration).toContain(
      "coalesce(kc.metadata->>'retrieval_status', 'active') = 'active'"
    );
  });

  it("archives older active chunks only after inserting the new active version", () => {
    const insertIndex = migration.indexOf("INSERT INTO public.knowledge_chunks");
    const archiveIndex = migration.indexOf("UPDATE public.knowledge_chunks");

    expect(insertIndex).toBeGreaterThan(-1);
    expect(archiveIndex).toBeGreaterThan(insertIndex);
    expect(migration).toContain("metadata || jsonb_build_object(");
    expect(migration).toContain("'retrieval_status', 'archived'");
    expect(migration).toContain("'superseded_by_version_key', p_version_key");
  });
});
