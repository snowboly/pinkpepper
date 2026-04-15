import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("audit usage policy", () => {
  it("tracks dedicated auditor usage events", () => {
    const routeSource = readFileSync(
      path.join(process.cwd(), "src/app/api/audit/stream/route.ts"),
      "utf8"
    );

    expect(routeSource).toContain('eventType: "auditor_message"');
    expect(routeSource).toContain('event_type: "auditor_message"');
  });

  it("enforces the pro auditor quota in addition to normal daily messages", () => {
    const routeSource = readFileSync(
      path.join(process.cwd(), "src/app/api/audit/stream/route.ts"),
      "utf8"
    );

    expect(routeSource).toContain("caps.dailyAuditorMessages");
    expect(routeSource).toContain("Daily Auditor limit reached for your plan");
  });
});
