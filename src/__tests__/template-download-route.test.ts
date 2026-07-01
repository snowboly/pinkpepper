import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  templateDownloadState,
  createSignedUrlMock,
} = vi.hoisted(() => ({
  templateDownloadState: {
    user: { id: "user_123" } as { id: string } | null,
    profile: { tier: "plus" } as { tier: string } | null,
    subscription: null as { tier?: string | null; status?: string | null } | null,
  },
  createSignedUrlMock: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: templateDownloadState.user }, error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (_column: string, value: string) => ({
          maybeSingle: async () => {
            if (table === "profiles") {
              return { data: templateDownloadState.profile, error: null };
            }

            if (table === "subscriptions") {
              return { data: templateDownloadState.subscription, error: null };
            }

            throw new Error(`Unexpected table ${table} for user ${value}`);
          },
        }),
      }),
    }),
  }),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: () => ({
    storage: {
      from: () => ({
        createSignedUrl: createSignedUrlMock,
      }),
    },
  }),
}));

import { GET as downloadTemplateGet } from "@/app/api/templates/[slug]/download/route";

describe("template download route", () => {
  beforeEach(() => {
    templateDownloadState.user = { id: "user_123" };
    templateDownloadState.profile = { tier: "plus" };
    templateDownloadState.subscription = null;
    createSignedUrlMock.mockReset();
  });

  it("falls back to the Templates/ prefix when the root object is not present", async () => {
    createSignedUrlMock
      .mockResolvedValueOnce({ data: null, error: { message: "not found" } })
      .mockResolvedValueOnce({ data: { signedUrl: "https://signed.test/template.xlsx" }, error: null });

    const response = await downloadTemplateGet(
      new Request("https://pinkpepper.io/api/templates/food-safety-opening-and-closing-checklist/download"),
      { params: Promise.resolve({ slug: "food-safety-opening-and-closing-checklist" }) },
    );

    expect(createSignedUrlMock).toHaveBeenNthCalledWith(1, "Food Safety Opening and Closing Checklist.xlsx", 60);
    expect(createSignedUrlMock).toHaveBeenNthCalledWith(2, "Templates/Food Safety Opening and Closing Checklist.xlsx", 60);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://signed.test/template.xlsx");
  });

  it("returns 404 only after both root and Templates/ lookups fail", async () => {
    createSignedUrlMock
      .mockResolvedValueOnce({ data: null, error: { message: "not found" } })
      .mockResolvedValueOnce({ data: null, error: { message: "not found" } });

    const response = await downloadTemplateGet(
      new Request("https://pinkpepper.io/api/templates/food-safety-opening-and-closing-checklist/download"),
      { params: Promise.resolve({ slug: "food-safety-opening-and-closing-checklist" }) },
    );

    expect(createSignedUrlMock).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Template file not available yet." });
  });
});
