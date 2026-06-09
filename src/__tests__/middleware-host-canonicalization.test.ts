import { beforeEach, describe, expect, it, vi } from "vitest";

const cspValue = "default-src 'self'";

vi.mock("@/lib/security/csp", () => ({
  NONCE_HEADER: "x-csp-nonce",
  buildContentSecurityPolicy: () => cspValue,
  generateCspNonce: () => "test-nonce",
}));

vi.mock("next/server", () => {
  class MockNextResponse {
    status: number;
    headers: Headers;
    forwardedRequestHeaders?: Headers;
    cookies: { set: () => void };

    constructor(status: number, headers?: HeadersInit) {
      this.status = status;
      this.headers = new Headers(headers);
      this.cookies = { set: () => undefined };
    }

    static next(input?: { request?: { headers?: Headers } }) {
      const response = new MockNextResponse(200);
      response.forwardedRequestHeaders = input?.request?.headers;
      return response;
    }

    static redirect(input: string | URL, status = 307) {
      return new MockNextResponse(status, { location: String(input) });
    }
  }

  return { NextResponse: MockNextResponse };
});

describe("proxy host canonicalization", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  function makeRequest(url: string) {
    const parsed = new URL(url);
    return {
      headers: new Headers(),
      cookies: {
        get: () => undefined,
        getAll: () => [],
      },
      nextUrl: {
        hostname: parsed.hostname,
        pathname: parsed.pathname,
        clone: () => new URL(url),
      },
    };
  }

  it("permanently redirects the www host to the apex on public pages", async () => {
    const { proxy } = await import("../proxy");

    const response = await proxy(makeRequest("https://www.pinkpepper.io/pricing") as never);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://pinkpepper.io/pricing");
    expect(response.headers.get("Content-Security-Policy")).toBe(cspValue);
    expect(response.headers.get("x-csp-nonce")).toBe("test-nonce");
  });

  it("leaves the apex host untouched for public pages", async () => {
    const { proxy } = await import("../proxy");

    const response = await proxy(makeRequest("https://pinkpepper.io/resources") as never);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("forwards the German route locale to downstream layouts", async () => {
    const { proxy } = await import("../proxy");

    const response = await proxy(
      makeRequest("https://pinkpepper.io/de/articles/haccp-plan") as never,
    );

    expect(
      (response as unknown as { forwardedRequestHeaders?: Headers })
        .forwardedRequestHeaders?.get("x-next-intl-locale"),
    ).toBe("de");
  });

  it("permanently redirects legacy english-prefixed URLs to the root english routes", async () => {
    const { proxy } = await import("../proxy");

    const response = await proxy(makeRequest("https://pinkpepper.io/en/pricing") as never);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://pinkpepper.io/pricing");
    expect(response.headers.get("Content-Security-Policy")).toBe(cspValue);
    expect(response.headers.get("x-csp-nonce")).toBe("test-nonce");
  });
});
