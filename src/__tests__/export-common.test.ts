import { describe, expect, it, vi } from "vitest";
import { recordExportUsage } from "@/lib/export/common";

describe("recordExportUsage", () => {
  it("stores exports under document_export instead of document_generation", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn().mockReturnValue({ insert }),
    } as unknown as {
      from: (table: string) => { insert: typeof insert };
    };

    await recordExportUsage({
      supabase: supabase as never,
      userId: "user-123",
      format: "pdf",
      conversationId: "conv-123",
    });

    expect(supabase.from).toHaveBeenCalledWith("usage_events");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-123",
      event_type: "document_export",
      event_count: 1,
      metadata: { conversation_id: "conv-123", format: "pdf" },
    });
  });
});
