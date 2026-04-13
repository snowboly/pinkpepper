import { describe, expect, it, vi } from "vitest";
import {
  celexToSourceName,
  extractCurrentVersionInfo,
  discoverNewRegulations,
  fetchRegulationText,
  MIN_REGULATION_TEXT_CHARS,
  EUROVOC_FOOD_SAFETY_CONCEPTS,
} from "@/lib/rag/cellar-client";
import {
  DEFAULT_SINCE_DATE,
  buildRegulationChunkMetadata,
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

describe("buildRegulationChunkMetadata", () => {
  it("adds authoritative metadata for EU regulation sync chunks", () => {
    expect(
      buildRegulationChunkMetadata("Regulation (EU) No 1169/2011", {
        celex: "02011R1169-20250401",
        baseCelex: "32011R1169",
        title: "Food information to consumers",
        dateDocument: "2011-10-25",
        dateLastModified: "2025-04-01",
      })
    ).toMatchObject({
      jurisdiction: "eu",
      source_class: "primary_law",
      celexNumber: "02011R1169-20250401",
      baseCelexNumber: "32011R1169",
    });
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

describe("fetchRegulationText", () => {
  const FULL_TEXT = "Article 1 ".repeat(600); // 6 000+ chars — exceeds MIN_REGULATION_TEXT_CHARS

  it("returns text when the primary URL yields sufficient content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(`<html><body><p>${FULL_TEXT}</p></body></html>`),
      })
    );

    const text = await fetchRegulationText("32002R0178");
    expect(text.length).toBeGreaterThanOrEqual(MIN_REGULATION_TEXT_CHARS);
    expect(text).toContain("Article 1");

    vi.unstubAllGlobals();
  });

  it("falls back to the secondary URL when the primary returns a short page", async () => {
    const shortHtml = "<html><body><p>Please accept cookies to continue.</p></body></html>";
    let callCount = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Primary URL — short cookie/nav page
          return Promise.resolve({ ok: true, text: () => Promise.resolve(shortHtml) });
        }
        // Secondary URL — full regulation text
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(`<html><body><p>${FULL_TEXT}</p></body></html>`),
        });
      })
    );

    const text = await fetchRegulationText("32002R0178");
    expect(callCount).toBe(2);
    expect(text.length).toBeGreaterThanOrEqual(MIN_REGULATION_TEXT_CHARS);

    vi.unstubAllGlobals();
  });

  it("falls back to the LexUriServ URL when both primary and secondary return short pages", async () => {
    const shortHtml = "<html><body><p>Select a version to view.</p></body></html>";
    let callCount = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve(shortHtml) });
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(`<html><body><p>${FULL_TEXT}</p></body></html>`),
        });
      })
    );

    const text = await fetchRegulationText("32002R0178");
    expect(callCount).toBe(3);
    expect(text.length).toBeGreaterThanOrEqual(MIN_REGULATION_TEXT_CHARS);

    vi.unstubAllGlobals();
  });

  it("throws when all three URLs fail to return sufficient text", async () => {
    const shortHtml = "<html><body><p>Cookie consent required.</p></body></html>";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(shortHtml) })
    );

    await expect(fetchRegulationText("32002R0178")).rejects.toThrow(
      "Failed to fetch adequate regulation text for 32002R0178"
    );

    vi.unstubAllGlobals();
  });

  it("throws when all URLs return non-OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 })
    );

    await expect(fetchRegulationText("32002R0178")).rejects.toThrow(
      "Failed to fetch adequate regulation text for 32002R0178"
    );

    vi.unstubAllGlobals();
  });

  it("uses browser-like headers on all fetch attempts", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<html><body><p>${FULL_TEXT}</p></body></html>`),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchRegulationText("32002R0178");

    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["User-Agent"]).toContain("Mozilla");
    expect(headers["Accept"]).toContain("text/html");
    expect(headers["Accept-Language"]).toBeDefined();

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
