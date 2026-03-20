import { describe, expect, it, vi } from "vitest";
import {
  celexToSourceName,
  extractCurrentVersionInfo,
  discoverNewRegulations,
  EUROVOC_FOOD_SAFETY_CONCEPTS,
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

describe("discoverNewRegulations", () => {
  const SPARQL_RESPONSE = {
    results: {
      bindings: [
        {
          celex: { value: "32025R0500" },
          title: { value: "Some new 2025 regulation on food safety" },
          dateDocument: { value: "2025-03-01" },
        },
        {
          // Already in seeds — should be filtered out
          celex: { value: "32002R0178" },
          title: { value: "Regulation (EC) No 178/2002 general food law" },
          dateDocument: { value: "2002-01-28" },
        },
      ],
    },
  };

  it("returns discovered regulations excluding seeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(SPARQL_RESPONSE),
      })
    );

    const results = await discoverNewRegulations("2024-01-01");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      celex: "32025R0500",
      baseCelex: "32025R0500",
      title: "Some new 2025 regulation on food safety",
      dateDocument: "2025-03-01",
      legacyAliases: [],
      discovered: true,
    });

    vi.unstubAllGlobals();
  });

  it("throws on non-200 SPARQL response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 })
    );

    await expect(discoverNewRegulations("2024-01-01")).rejects.toThrow(
      "SPARQL endpoint returned 503"
    );

    vi.unstubAllGlobals();
  });

  it("throws on invalid sinceDate format", async () => {
    await expect(discoverNewRegulations("not-a-date")).rejects.toThrow(
      "Invalid sinceDate format"
    );
  });

  it("includes all EuroVoc food safety concepts in the query", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: { bindings: [] } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await discoverNewRegulations("2024-01-01");

    const url = decodeURIComponent(mockFetch.mock.calls[0][0] as string);
    for (const concept of EUROVOC_FOOD_SAFETY_CONCEPTS) {
      expect(url).toContain(`eurovoc.europa.eu/${concept}`);
    }

    vi.unstubAllGlobals();
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
