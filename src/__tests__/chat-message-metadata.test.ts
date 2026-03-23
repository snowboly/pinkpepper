import { describe, expect, it } from "vitest";
import {
  formatVerificationLabel,
  parseMessageVerificationState,
} from "@/components/dashboard/chat-message-metadata";

describe("chat metadata parsing", () => {
  it("reads verification state from assistant metadata", () => {
    expect(parseMessageVerificationState({ verificationState: "verified" })).toBe("verified");
  });

  it("defaults unknown verification metadata to null", () => {
    expect(parseMessageVerificationState({})).toBeNull();
  });
});

describe("verification labels", () => {
  it("maps partial to a readable label", () => {
    expect(formatVerificationLabel("partial")).toBe("Partially verified");
  });
});
