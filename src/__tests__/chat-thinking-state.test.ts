import { describe, expect, it } from "vitest";
import { shouldShowGlobalThinkingRow } from "@/components/dashboard/chat-thinking-state";

describe("shouldShowGlobalThinkingRow", () => {
  it("shows the global thinking row when loading starts before any assistant stream placeholder exists", () => {
    expect(shouldShowGlobalThinkingRow([], true)).toBe(true);
  });

  it("does not show the global thinking row while the latest assistant message is streaming", () => {
    expect(
      shouldShowGlobalThinkingRow(
        [{ role: "assistant", content: "", isStreaming: true }],
        true
      )
    ).toBe(false);
  });

  it("does not show the global thinking row after the final assistant message finished streaming but loading has not cleared yet", () => {
    expect(
      shouldShowGlobalThinkingRow(
        [{ role: "assistant", content: "Answer complete", isStreaming: false }],
        true
      )
    ).toBe(false);
  });
});
