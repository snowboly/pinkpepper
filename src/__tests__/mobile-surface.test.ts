import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("mobile surface regressions", () => {
  it("keeps the dashboard sidebar closed by default on small screens and uses an off-canvas mobile pattern", () => {
    const workspace = readPage("src/components/dashboard/ChatWorkspace.tsx");
    const sidebar = readPage("src/components/dashboard/ChatSidebar.tsx");

    expect(workspace).toContain("useState(false)");
    expect(sidebar).toContain("fixed inset-y-0 left-0");
    expect(sidebar).toContain("translate-x-0");
    expect(sidebar).toContain("-translate-x-full");
  });

  it("uses a mobile-friendly two-row chat input layout instead of forcing all controls into one row", () => {
    const chatInput = readPage("src/components/dashboard/ChatInput.tsx");

    expect(chatInput).toContain("flex flex-col gap-2");
    expect(chatInput).toContain("sm:flex-row");
  });

  it("keeps touch-only actions accessible and avoids cramped fixed-width mobile popovers", () => {
    const messages = readPage("src/components/dashboard/MessageItem.tsx");
    const sidebar = readPage("src/components/dashboard/ChatSidebar.tsx");
    const chatInput = readPage("src/components/dashboard/ChatInput.tsx");
    const chrome = readPage("src/components/site/chrome.tsx");

    expect(messages).toContain("opacity-100 sm:opacity-0");
    expect(messages).toContain("sm:group-hover:opacity-100");
    expect(chatInput).toContain("max-w-[calc(100vw-2rem)]");
    expect(chatInput).toContain('document.addEventListener("pointerdown"');
    expect(chatInput).not.toContain('document.addEventListener("mousedown"');
    expect(sidebar).toContain("max-w-[calc(100vw-1.5rem)]");
    expect(chrome).toContain("lg:grid-cols-[2fr_1fr_1fr_1.5fr]");
  });
});
