import { describe, expect, it } from "vitest";
import { applyStreamError } from "@/components/dashboard/chat-stream-state";
import type { Message } from "@/components/dashboard/types";

describe("applyStreamError", () => {
  it("finalizes a streaming assistant message and restores the prompt", () => {
    const messages: Message[] = [
      { role: "user", content: "How do I store chilled food?" },
      { role: "assistant", content: "", isStreaming: true },
    ];

    const result = applyStreamError({
      messages,
      promptValue: "How do I store chilled food?",
      errorMessage: "Stream interrupted",
    });

    expect(result.error).toBe("Stream interrupted");
    expect(result.prompt).toBe("How do I store chilled food?");
    expect(result.messages.at(-1)).toEqual({
      role: "assistant",
      content: "",
      isStreaming: false,
    });
  });

  it("keeps partial assistant content visible", () => {
    const messages: Message[] = [
      { role: "user", content: "What temperature is compliant?" },
      { role: "assistant", content: "Keep chilled food at ", isStreaming: true },
    ];

    const result = applyStreamError({
      messages,
      promptValue: "What temperature is compliant?",
      errorMessage: "AI service temporarily unavailable.",
    });

    expect(result.messages.at(-1)?.content).toBe("Keep chilled food at ");
    expect(result.messages.at(-1)?.isStreaming).toBe(false);
  });
});
