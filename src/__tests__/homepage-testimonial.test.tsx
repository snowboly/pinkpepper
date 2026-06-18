import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const readPage = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

describe("homepage testimonial section", () => {
  it("renders the customer quote, logo attribution, and external link", async () => {
    vi.resetModules();
    vi.doMock("next/image", () => ({
      default: (props: Record<string, unknown>) => createElement("img", props),
    }));
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState: <T,>(initialState: T) => [initialState, vi.fn()],
      };
    });

    let componentModule: typeof import("@/components/homepage/HomepageTestimonial") | null = null;
    try {
      componentModule = await import("@/components/homepage/HomepageTestimonial");
    } catch {
      componentModule = null;
    }

    expect(componentModule).toBeTruthy();

    if (!componentModule) return;

    const markup = renderToStaticMarkup(
      createElement(componentModule.HomepageTestimonial, {
        eyebrow: "Avis client",
        testimonials: [
          {
            quote: "The app is working great and has been a massive help",
            companyName: "McDermott's Foods Ltd",
            companyUrl: "https://mcdermottsfoods.co.uk/",
            logoSrc: "/testimonials/mcdermotts-foods.png",
            logoAlt: "McDermott's Foods Ltd logo",
            supportingLine: "Used by food businesses managing HACCP and food safety documentation.",
          },
          {
            quote: "Another testimonial",
            companyName: "Second Company",
            companyUrl: "https://example.com/",
            logoSrc: "/testimonials/second-company.png",
            logoAlt: "Second Company logo",
          },
        ],
      }),
    );

    expect(markup).toContain("The app is working great and has been a massive help");
    expect(markup).toContain("Avis client");
    expect(markup).toContain("McDermott&#x27;s Foods Ltd");
    expect(markup).toContain('href="https://mcdermottsfoods.co.uk/"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).toContain('alt="McDermott&#x27;s Foods Ltd logo"');
    expect(markup).toContain("Used by food businesses managing HACCP and food safety documentation.");
    expect(markup).toContain("Previous testimonial");
    expect(markup).toContain("Next testimonial");
  });

  it("integrates the testimonial section into both homepage variants", () => {
    const homepage = readPage("src/app/page.tsx");
    const localizedHomepage = readPage("src/components/homepage/LocalizedHomePage.tsx");

    expect(homepage).toContain("HomepageTestimonial");
    expect(localizedHomepage).toContain("HomepageTestimonial");
    expect(homepage).toContain("mcdermottsfoods.co.uk/");
    expect(localizedHomepage).toContain("mcdermottsfoods.co.uk/");
    expect(homepage).toContain("testimonials={[");
    expect(localizedHomepage).toContain("testimonials={[");
    expect(localizedHomepage).toContain("testimonialEyebrowByLocale");
  });
});
