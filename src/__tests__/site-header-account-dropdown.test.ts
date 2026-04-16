import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("site header account dropdown", () => {
  it("uses a dedicated account dropdown component instead of a native details menu", () => {
    const chromeSource = readFileSync(
      path.join(process.cwd(), "src/components/site/chrome.tsx"),
      "utf8"
    );

    expect(chromeSource).toContain("AccountDropdown");
    expect(chromeSource).not.toContain('aria-label="Open account menu"');
    expect(chromeSource).not.toContain('<details className="group relative">');
  });

  it("resets on route change without closing itself from an effect", () => {
    const accountDropdownSource = readFileSync(
      path.join(process.cwd(), "src/components/site/AccountDropdown.tsx"),
      "utf8"
    );

    expect(accountDropdownSource).toContain("return <AccountDropdownMenu key={pathname}");
    expect(accountDropdownSource).not.toContain("useEffect(() => {\n    setOpen(false);");
  });
});
