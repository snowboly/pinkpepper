import { describe, expect, it, vi } from "vitest";
import {
  celexToSourceName,
  extractCurrentVersionInfo,
} from "@/lib/rag/cellar-client";
import {
  DEFAULT_SINCE_DATE,
  summarizeRegulationSyncHealth,
  writeSyncLogEntry,
} from "@/lib/rag/regulation-sync";

describe("extractCurrentVersionInfo", () => {
  it("extracts the current consolidated CELEX from EUR-Lex HTML", () => {
    const html = `
      <p class="accessCurrent" style="display:none">
        <a
          href="./../../../../legal-content/EN/AUTO/?uri=CELEX:02011R1169-20250401"
          data-celex="02011R1169-20250401"
        >Access current version (01/04/2025)</a>
        <span class="hidden" id="currentConsLeg">01/04/2025</span>
      </p>
    `;

    expect(extractCurrentVersionInfo(html, "32011R1169")).toEqual({
      celex: "02011R1169-20250401",
      currentVersionDate: "2025-04-01",
    });
  });

  it("falls back to the original CELEX when no consolidated version link is present", () => {
    expect(extractCurrentVersionInfo("<html></html>", "32004R0852")).toEqual({
      celex: "32004R0852",
      currentVersionDate: null,
    });
  });
});

describe("celexToSourceName", () => {
  it("formats consolidated regulation CELEX numbers into canonical source names", () => {
    expect(celexToSourceName("02004R0852-20210324")).toBe("Regulation (EC) No 852/2004");
    expect(celexToSourceName("02011R1169-20250401")).toBe("Regulation (EU) No 1169/2011");
  });
});

describe("writeSyncLogEntry", () => {
  it("treats a missing regulation_sync_log table as non-fatal", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          error: {
            code: "PGRST205",
            message: "Could not find the table 'public.regulation_sync_log' in the schema cache",
          },
        }),
      }),
    };

    await expect(
      writeSyncLogEntry(supabase as never, {
        celex_number: "32004R0852",
        title: "Regulation (EC) No 852/2004",
        source_name: "Regulation (EC) No 852/2004",
        last_modified: "2021-03-24",
        chunks_ingested: 10,
        synced_at: "2026-03-15T12:00:00.000Z",
        status: "success",
      })
    ).resolves.toBe(false);
  });

  it("throws for non-schema log write failures", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          error: {
            code: "23505",
            message: "duplicate key value violates unique constraint",
          },
        }),
      }),
    };

    await expect(
      writeSyncLogEntry(supabase as never, {
        celex_number: "32004R0852",
        title: "Regulation (EC) No 852/2004",
        source_name: "Regulation (EC) No 852/2004",
        last_modified: "2021-03-24",
        chunks_ingested: 10,
        synced_at: "2026-03-15T12:00:00.000Z",
        status: "success",
      })
    ).rejects.toThrow("duplicate key value violates unique constraint");
  });
});

describe("summarizeRegulationSyncHealth", () => {
  it("summarizes regulation sync state from chunk metadata when logs are unavailable", () => {
    const summary = summarizeRegulationSyncHealth(
      [
        {
          source_name: "Regulation (EC) No 852/2004",
          updated_at: "2026-03-15T11:00:00.000Z",
          metadata: {
            celexNumber: "02004R0852-20210324",
            baseCelexNumber: "32004R0852",
            syncedAt: "2026-03-15T10:59:59.000Z",
          },
        },
        {
          source_name: "UK food hygiene regulations 2006",
          updated_at: "2026-03-06T22:15:33.743668+00:00",
          metadata: {
            originalFile: "UK-food-hygiene-regulations-2006.md",
            processedAt: "2026-03-06T22:15:32.721Z",
          },
        },
      ],
      false
    );

    expect(summary).toMatchObject({
      regulationChunkCount: 2,
      logTableAvailable: false,
      latestSyncedAt: "2026-03-15T10:59:59.000Z",
      canonicalSourceCount: 1,
      legacySourceCount: 1,
      distinctSources: ["Regulation (EC) No 852/2004", "UK food hygiene regulations 2006"],
      defaultSinceDate: DEFAULT_SINCE_DATE,
    });
  });
});
