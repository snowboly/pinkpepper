import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("audit resource surface", () => {
  it("removes the audit category from the public resources index and filter tabs", () => {
    const resourcesPage = readPage("src/app/resources/page.tsx");
    const resourcesGrid = readPage("src/components/site/ResourcesGrid.tsx");
    const templates = readPage("src/lib/templates.ts");

    expect(resourcesGrid).not.toContain('{ key: "audit",        label: "Audit" }');
    expect(resourcesPage).not.toContain('category: "audit"');
    expect(templates).not.toContain('category: "Audit"');
  });

  it("suppresses template downloads and signup CTA on the audit resource pages", () => {
    const resourceTemplate = readPage("src/components/site/ResourceTemplate.tsx");
    const auditChecklist = readPage("src/app/resources/food-safety-audit-checklist/page.tsx");
    const fsmsTemplate = readPage("src/app/resources/food-safety-management-system-template/page.tsx");

    expect(resourceTemplate).toContain("showBottomCta");
    expect(auditChecklist).not.toContain('templateSlug="food-safety-audit-checklist"');
    expect(fsmsTemplate).not.toContain('templateSlug="food-safety-management-system-template"');
    expect(auditChecklist).toContain("showBottomCta={false}");
    expect(fsmsTemplate).toContain("showBottomCta={false}");
  });
});
