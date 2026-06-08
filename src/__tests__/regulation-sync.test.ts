import { describe, expect, it, vi } from "vitest";

vi.mock("pdf-parse", () => ({
  default: vi.fn(async () => ({
    text: "Article 1 ".repeat(600),
  })),
}));
import {
  celexToSourceName,
  discoverEuOfficialJournalRegulations,
  extractCurrentVersionInfo,
  discoverNewRegulations,
  discoverUkRegulations,
  fetchRegulationText,
  fetchUkLegislationText,
  getManualBackfillRegulations,
  MIN_REGULATION_TEXT_CHARS,
  EUROVOC_FOOD_SAFETY_CONCEPTS,
} from "@/lib/rag/cellar-client";
import pdfParse from "pdf-parse";
import {
  DEFAULT_SINCE_DATE,
  buildRegulationChunkMetadata,
  getLastCompletedSyncDate,
  isVersionAlreadyActive,
  shouldAdvanceSyncCursor,
  shouldStopForTimeBudget,
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
      retrieval_status: "active",
      source_key: "eu:celex:32011R1169",
      version_key: "eu:celex:02011R1169-20250401",
    });
  });

  it("adds authoritative metadata for UK regulation sync chunks", () => {
    expect(
      buildRegulationChunkMetadata("The Food Safety and Hygiene (England) Regulations 2013", {
        celex: "uksi/2013/2996",
        baseCelex: "uksi/2013/2996",
        title: "The Food Safety and Hygiene (England) Regulations 2013",
        dateDocument: "2013-12-11",
        dateLastModified: "2026-05-20",
        jurisdiction: "gb",
        sourceKey: "uk:uksi:2013:2996",
        versionKey: "uk:uksi:2013:2996:2026-05-20",
        officialUrl: "https://www.legislation.gov.uk/uksi/2013/2996",
        actType: "statutory_instrument",
      })
    ).toMatchObject({
      jurisdiction: "gb",
      source_class: "primary_law",
      retrieval_status: "active",
      source_key: "uk:uksi:2013:2996",
      version_key: "uk:uksi:2013:2996:2026-05-20",
      act_type: "statutory_instrument",
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

describe("sync cursor and active version checks", () => {
  it("reads the discovery cursor only from completed run markers", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { synced_at: "2026-06-01T08:00:00.000Z" },
      error: null,
    });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const order = vi.fn().mockReturnValue({ limit });
    const secondEq = vi.fn().mockReturnValue({ order });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    const select = vi.fn().mockReturnValue({ eq: firstEq });
    const from = vi.fn().mockReturnValue({ select });

    await expect(getLastCompletedSyncDate({ from } as never)).resolves.toBe("2026-06-01");
    expect(from).toHaveBeenCalledWith("regulation_sync_log");
    expect(firstEq).toHaveBeenCalledWith("celex_number", "RUN_COMPLETE");
    expect(secondEq).toHaveBeenCalledWith("status", "success");
  });

  it("detects an already-active source version without fetching its text", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "chunk-1" },
      error: null,
    });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const contains = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ contains });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    await expect(
      isVersionAlreadyActive(
        { from } as never,
        "eu:celex:32004R0852",
        "eu:celex:02004R0852-20210324"
      )
    ).resolves.toBe(true);
    expect(eq).toHaveBeenCalledWith("source_type", "regulation");
    expect(contains).toHaveBeenCalledWith("metadata", {
      source_key: "eu:celex:32004R0852",
      version_key: "eu:celex:02004R0852-20210324",
      retrieval_status: "active",
    });
  });

  it("stops starting new regulations when the processing budget is exhausted", () => {
    expect(shouldStopForTimeBudget(1_000, 240_999, 240_000)).toBe(false);
    expect(shouldStopForTimeBudget(1_000, 241_000, 240_000)).toBe(true);
  });

  it("advances the cursor only after a complete error-free run", () => {
    expect(shouldAdvanceSyncCursor({ stoppedEarly: false, errors: [] })).toBe(true);
    expect(
      shouldAdvanceSyncCursor({
        stoppedEarly: true,
        errors: [],
      })
    ).toBe(false);
    expect(
      shouldAdvanceSyncCursor({
        stoppedEarly: false,
        errors: [{ celex: "UK_DISCOVERY_FEED", error: "timeout" }],
      })
    ).toBe(false);
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
    expect(url).toContain("publications.europa.eu/webapi/rdf/sparql");
    expect(url).toContain("PREFIX xsd:");
    expect(url).toContain("REGEX(STR(?title)");
    expect(url).toContain("food|feed|hygiene");
    for (const concept of EUROVOC_FOOD_SAFETY_CONCEPTS) {
      expect(url).toContain(`eurovoc.europa.eu/${concept}`);
    }

    vi.unstubAllGlobals();
  });
});

describe("getManualBackfillRegulations", () => {
  it("includes reviewed EU and UK food-law gaps from April through June 2026", () => {
    const regulations = getManualBackfillRegulations();

    expect(regulations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          celex: "32026R0765",
          jurisdiction: "eu",
          sourceKey: "eu:celex:32026R0765",
        }),
        expect.objectContaining({
          celex: "32026R1189",
          jurisdiction: "eu",
          sourceKey: "eu:celex:32026R1189",
        }),
        expect.objectContaining({
          celex: "uksi/2026/412",
          jurisdiction: "gb",
          sourceKey: "uk:uksi:2026:412",
        }),
        expect.objectContaining({
          celex: "nisr/2026/103",
          jurisdiction: "gb",
          sourceKey: "uk:nisr:2026:103",
        }),
      ])
    );

    expect(
      regulations.every(
        (regulation) =>
          regulation.dateDocument >= "2026-04-01" &&
          regulation.dateDocument <= "2026-06-08"
      )
    ).toBe(true);
  });
});

describe("discoverEuOfficialJournalRegulations", () => {
  it("discovers relevant regulations from the official L-series daily view", async () => {
    const html = `
      <div class="row daily-view-row-spacing">
        <div class="section-level-3">2026/1189</div>
        <a href="./../../../legal-content/EN/TXT/?uri=OJ:L_202601189">
          Commission Implementing Regulation (EU) 2026/1189 of 4 June 2026
          amending rules on antimicrobial medicinal products for animals and products of animal origin
        </a>
      </div>
      <div class="row daily-view-row-spacing">
        <div class="section-level-3">2026/1190</div>
        <a href="./../../../legal-content/EN/TXT/?uri=OJ:L_202601190">
          Commission Implementing Regulation (EU) 2026/1190 concerning railway interoperability
        </a>
      </div>`;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(html),
      })
    );

    const result = await discoverEuOfficialJournalRegulations(
      "2026-06-05",
      new Date("2026-06-05T12:00:00.000Z")
    );

    expect(result.failures).toEqual([]);
    expect(result.regulations).toHaveLength(1);
    expect(result.regulations[0]).toMatchObject({
      celex: "32026R1189",
      sourceKey: "eu:celex:32026R1189",
      versionKey: "eu:celex:32026R1189",
      dateDocument: "2026-06-05",
      actType: "implementing_regulation",
      discovered: true,
    });

    vi.unstubAllGlobals();
  });
});

describe("discoverUkRegulations", () => {
  it("parses the real feed link order and normalizes legislation /id/ URLs", async () => {
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>The Nutrition (Amendment etc.) (EU Exit) (Amendment) Regulations 2026</title>
          <id>http://www.legislation.gov.uk/id/uksi/2026/412</id>
          <link rel="self" href="http://www.legislation.gov.uk/id/uksi/2026/412" />
          <link href="http://www.legislation.gov.uk/uksi/2026/412/made" />
          <link rel="alternate" type="application/xml"
            href="http://www.legislation.gov.uk/uksi/2026/412/made/data.xml" />
          <updated>2026-04-22T11:53:13+01:00</updated>
          <published>2026-04-21T17:00:34+01:00</published>
        </entry>
      </feed>`;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(feed),
      })
    );

    const result = await discoverUkRegulations("2026-04-01");

    expect(result.failures).toEqual([]);
    expect(result.regulations).toHaveLength(1);
    expect(result.regulations[0]).toMatchObject({
      celex: "uksi/2026/412",
      sourceKey: "uk:uksi:2026:412",
      officialUrl: "https://www.legislation.gov.uk/uksi/2026/412/made",
      textUrl: "https://www.legislation.gov.uk/uksi/2026/412/made/data.xml",
    });

    vi.unstubAllGlobals();
  });

  it("discovers relevant UK food law and import control candidates from legislation feeds", async () => {
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>The Food Safety and Hygiene (England) Regulations 2013</title>
          <id>https://www.legislation.gov.uk/uksi/2013/2996</id>
          <updated>2026-05-20T10:00:00Z</updated>
          <published>2026-05-20T10:00:00Z</published>
          <link rel="alternate" href="https://www.legislation.gov.uk/uksi/2013/2996" />
        </entry>
        <entry>
          <title>The Road Traffic Regulations 2026</title>
          <id>https://www.legislation.gov.uk/uksi/2026/101</id>
          <updated>2026-05-20T10:00:00Z</updated>
          <link rel="alternate" href="https://www.legislation.gov.uk/uksi/2026/101" />
        </entry>
      </feed>`;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(feed),
      })
    );

    const results = await discoverUkRegulations("2026-05-01");

    expect(results.failures).toEqual([]);
    expect(results.regulations).toHaveLength(1);
    expect(results.regulations[0]).toMatchObject({
      jurisdiction: "gb",
      celex: "uksi/2013/2996",
      baseCelex: "uksi/2013/2996",
      sourceKey: "uk:uksi:2013:2996",
      versionKey: "uk:uksi:2013:2996:2026-05-20",
      actType: "statutory_instrument",
      discovered: true,
    });

    vi.unstubAllGlobals();
  });

  it("keeps successful UK candidates when another feed times out", async () => {
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>The Food Safety Regulations 2026</title>
          <id>https://www.legislation.gov.uk/uksi/2026/500</id>
          <updated>2026-06-05T10:00:00Z</updated>
          <published>2026-06-05T10:00:00Z</published>
          <link rel="alternate" href="https://www.legislation.gov.uk/uksi/2026/500" />
        </entry>
      </feed>`;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("text=food")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(feed),
          });
        }
        return Promise.reject(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
      })
    );

    const result = await discoverUkRegulations("2026-06-01");

    expect(result.regulations).toHaveLength(1);
    expect(result.regulations[0].sourceKey).toBe("uk:uksi:2026:500");
    expect(result.failures.length).toBeGreaterThan(10);
    expect(result.failures[0].error).toContain("timeout");

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
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32002R0178"
    );

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

  it("falls back when the PDF endpoint returns HTML that cannot be parsed as PDF", async () => {
    const htmlResponse = "<!DOCTYPE html><html><body><p>Select a version to view.</p></body></html>";
    vi.mocked(pdfParse).mockRejectedValueOnce(new Error("Invalid PDF structure"));

    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
            arrayBuffer: () => Promise.resolve(Buffer.from(htmlResponse).buffer),
            text: () => Promise.resolve(htmlResponse),
          });
        }

        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/xml" }),
          text: () => Promise.resolve(`<root><p>${FULL_TEXT}</p></root>`),
        });
      })
    );

    const text = await fetchRegulationText("32002R0178");

    expect(text.length).toBeGreaterThanOrEqual(MIN_REGULATION_TEXT_CHARS);
    expect(text).toContain("Article 1");
    expect(callCount).toBe(2);

    vi.unstubAllGlobals();
  });

  it("falls back to the LexUriServ URL when both primary and secondary return short pages", async () => {
    const shortHtml = "<html><body><p>Select a version to view.</p></body></html>";
    let callCount = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 5) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve(shortHtml) });
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(`<html><body><p>${FULL_TEXT}</p></body></html>`),
        });
      })
    );

    const text = await fetchRegulationText("32002R0178");
    expect(callCount).toBe(5);
    expect(text.length).toBeGreaterThanOrEqual(MIN_REGULATION_TEXT_CHARS);

    vi.unstubAllGlobals();
  });

  it("throws when all three URLs fail to return sufficient text", async () => {
    const shortHtml = "<html><body><p>Cookie consent required.</p></body></html>";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(shortHtml) })
    );

    const error: unknown = await fetchRegulationText("32002R0178").catch((err: unknown) => err);
    expect(error).toBeInstanceOf(Error);
    if (!(error instanceof Error)) {
      throw new Error("Expected fetchRegulationText to reject with an Error");
    }
    expect(error.message).toContain("cookie/consent page");
    expect(error.message).toContain('snippet: "Cookie consent required."');

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

  it("classifies document-selection placeholder pages explicitly", async () => {
    const shortHtml = "<html><body><p>Select a version to view.</p></body></html>";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, headers: new Headers(), text: () => Promise.resolve(shortHtml) })
    );

    await expect(fetchRegulationText("32002R0178")).rejects.toThrow(
      "document-selection/navigation page"
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

describe("fetchUkLegislationText", () => {
  it("fetches UK legislation XML through the legislation.gov.uk API", async () => {
    const fullText = "The Food Safety and Hygiene Regulations ".repeat(200);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(`<Legislation><Body>${fullText}</Body></Legislation>`),
      })
    );

    const text = await fetchUkLegislationText({
      celex: "uksi/2013/2996",
      baseCelex: "uksi/2013/2996",
      title: "The Food Safety and Hygiene (England) Regulations 2013",
      dateDocument: "2013-12-11",
      dateLastModified: "2026-05-20",
      legacyAliases: [],
      jurisdiction: "gb",
      sourceKey: "uk:uksi:2013:2996",
      versionKey: "uk:uksi:2013:2996:2026-05-20",
      officialUrl: "https://www.legislation.gov.uk/uksi/2013/2996",
      textUrl: "https://www.legislation.gov.uk/uksi/2013/2996/data.xml",
      actType: "statutory_instrument",
    });

    expect(text).toContain("Food Safety and Hygiene Regulations");
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      "https://www.legislation.gov.uk/uksi/2013/2996/data.xml"
    );

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
