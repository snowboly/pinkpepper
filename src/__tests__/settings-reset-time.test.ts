import { describe, expect, it } from "vitest";
import {
  formatDailyResetLabel,
  getNextUtcMidnight,
} from "@/components/dashboard/reset-time";

describe("getNextUtcMidnight", () => {
  it("returns the next UTC midnight boundary", () => {
    const now = new Date("2026-04-16T22:15:00.000Z");

    expect(getNextUtcMidnight(now).toISOString()).toBe("2026-04-17T00:00:00.000Z");
  });
});

describe("formatDailyResetLabel", () => {
  it("formats the next UTC reset in local-time wording", () => {
    const label = formatDailyResetLabel(new Date("2026-04-16T22:15:00.000Z"), {
      locale: "en-GB",
      timeZone: "Europe/Lisbon",
    });

    expect(label).toBe("Resets daily at 01:00 your time");
  });

  it("falls back to the generic reset label on formatter failure", () => {
    const original = Intl.DateTimeFormat;

    Intl.DateTimeFormat = class BrokenDateTimeFormat {
      constructor() {
        throw new Error("formatter unavailable");
      }
    } as unknown as typeof Intl.DateTimeFormat;

    try {
      expect(formatDailyResetLabel(new Date("2026-04-16T22:15:00.000Z"))).toBe("Resets daily");
    } finally {
      Intl.DateTimeFormat = original;
    }
  });
});
