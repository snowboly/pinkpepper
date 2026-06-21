import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { transformIloveHaccpArticle } from "../../scripts/lib/ilovehaccp-article-transform";
import { getAllArticles, getArticleBySlug, getArticleManifest } from "@/lib/articles";
import { processArticleContent } from "@/lib/article-content";

describe("iLoveHACCP article transform", () => {
  it("normalizes metadata, strips legacy markers, and flags migration issues", () => {
    const result = transformIloveHaccpArticle({
      slug: "test-article",
      title: "Test Article",
      category: "Industry Guides",
      readTime: "8 min read",
      excerpt: "Short summary",
      image: "https://example.com/image.jpg",
      publishedAt: "Feb 21, 2026",
      content:
        "<!-- Written by Dr. Margarida --><p>Hello</p><p>Bad \u00e2\u2030\u00a4 text and you\\'ll fix it</p><p>The FDA also requires food establishments to implement a HACCP plan as part of their food safety regulations.</p><p>Generate your free plan at <a href=\"https://ilovehaccp.com/builder\">ilovehaccp.com/builder</a></p><h3>Further Reading &amp; Tools</h3><p>Use these resources.</p><ul><li><a href=\"/builder\">Free HACCP Builder Tool</a></li></ul>",
    });

    expect(result.frontmatter.slug).toBe("test-article");
    expect(result.frontmatter.publishedAt).toBe("2026-02-21");
    expect(result.body).not.toContain("Written by Dr. Margarida");
    expect(result.body).not.toContain("https://ilovehaccp.com/builder");
    expect(result.body).not.toContain("ilovehaccp.com/builder");
    expect(result.body).not.toContain("Generate your free plan");
    expect(result.body).not.toContain("Further Reading &amp; Tools");
    expect(result.body).not.toContain("/builder");
    expect(result.body).not.toContain("FDA");
    expect(result.body).not.toContain("\u00e2\u2030\u00a4");
    expect(result.body).not.toContain("\\'");
    expect(result.body).not.toContain("How this HACCP topic applies in real-world operations");
    expect(result.body).toContain("you'll fix it");
    expect(result.body).toContain("\u2264");
    expect(result.migrationFlags).toContain("legacy_cta_rewritten");
    expect(result.migrationFlags).toContain("promo_block_removed");
    expect(result.migrationFlags).toContain("escape_normalized");
    expect(result.migrationFlags).toContain("scope_reference_rewritten");
  });
});

describe("local article loader", () => {
  let contentDir: string;

  afterEach(() => {
    if (contentDir) {
      rmSync(contentDir, { recursive: true, force: true });
    }
  });

  it("loads article metadata and article bodies from local markdown files", async () => {
    contentDir = mkdtempSync(path.join(tmpdir(), "pinkpepper-articles-"));

    writeFileSync(
      path.join(contentDir, "first-article.md"),
      `---
title: "First Article"
slug: "first-article"
excerpt: "First summary"
category: "Guides"
publishedAt: "2026-01-05"
image: "https://example.com/one.jpg"
source: "ilovehaccp"
---
<h2>First body</h2><p>Hello world</p>
`,
      "utf8",
    );

    writeFileSync(
      path.join(contentDir, "second-article.md"),
      `---
title: "Second Article"
slug: "second-article"
excerpt: "Second summary"
category: "Compliance"
publishedAt: "2026-02-10"
---
<h2>Second body</h2>
`,
      "utf8",
    );

    const articles = await getAllArticles({ contentDir });
    const article = await getArticleBySlug("first-article", { contentDir });
    const manifest = await getArticleManifest({ contentDir });

    expect(articles.map((item) => item.slug)).toEqual(["second-article", "first-article"]);
    expect(manifest.map((item) => item.slug)).toEqual(["second-article", "first-article"]);
    expect(article?.title).toBe("First Article");
    expect(article?.body).toContain("<h2>First body</h2>");
    expect(article?.source).toBe("ilovehaccp");
    expect(await getArticleBySlug("missing", { contentDir })).toBeNull();
  });
});

describe("Great Britain food import guide", () => {
  it("publishes a scoped, illustrated guide without known route-classification errors", async () => {
    const slug = "how-to-import-food-into-great-britain-from-non-eu-countries";
    const manifest = await getArticleManifest();
    const article = await getArticleBySlug(slug);

    expect(manifest.some((item) => item.slug === slug)).toBe(true);
    expect(article).not.toBeNull();
    expect(article?.category).toBe("Import & Export");
    expect(article?.publishedAt).toBe("2026-06-15");
    expect(article?.image).toContain("images.pexels.com");
    expect(article?.body).toContain("England, Scotland and Wales");
    expect(article?.body).toContain("Northern Ireland");
    expect(article?.body).toContain("/articles/gb-food-import-workflow.svg");
    expect(article?.body).toContain("/articles/gb-food-import-decision-tree.svg");
    expect(article?.body).toContain("Canned tuna is a processed fishery product and POAO, not a composite product");
    expect(article?.body).not.toContain("canned tuna from Thailand is a shelf-stable composite product");
    expect(article?.body).not.toContain("Low risk can enter through any point");
    expect(article?.body).toContain("only apply to non-EU countries that Defra has risk assessed");
    expect(article?.body).toContain(
      "https://www.gov.uk/government/publications/risk-categories-for-animal-and-animal-product-imports-from-non-eu-countries-to-great-britain",
    );
    expect(article?.body).not.toContain(
      "https://www.gov.uk/government/publications/risk-categories-for-animal-and-animal-product-imports-to-great-britain",
    );
    expect(article?.body.match(/https:\/\/www\.food\.gov\.uk\/business-guidance\/importing-high-risk-food-and-feed-of-non-animal-origin-hrfnao-into-great-britain/g)?.length).toBe(2);
  });
});

describe("allergen documentation article", () => {
  it("publishes a practical EU and UK allergen records guide with the planned trust and resource links", async () => {
    const slug = "allergen-documentation-requirements-for-eu-and-uk-food-businesses";
    const manifest = await getArticleManifest();
    const article = await getArticleBySlug(slug);

    expect(manifest.some((item) => item.slug === slug)).toBe(true);
    expect(article).not.toBeNull();
    expect(article?.category).toBe("Compliance");
    expect(article?.publishedAt).toBe("2026-06-21");
    expect(article?.image).toContain("images.pexels.com");
    expect(article?.body).toContain("EU and UK food businesses");
    expect(article?.body).toContain("/resources/allergen-matrix-template");
    expect(article?.body).toContain("/resources/food-safety-document-checklist");
    expect(article?.body).toContain("/resources/employee-food-safety-training-record");
    expect(article?.body).toContain("/resources/cleaning-and-disinfection-sop");
    expect(article?.body).toContain("/methodology");
    expect(article?.body).toContain("/regulations-covered");
    expect(article?.body).toContain("/pricing");
    expect(article?.body).toContain("/signup");
    expect(article?.body).toContain("/articles/natasha-law-haccp-ppds-allergen-obligations");
    expect(article?.body).not.toContain("the chef knows what's in everything");
  });
});

describe("article content processing", () => {
  it("normalizes rich article html for editorial rendering", () => {
    const result = processArticleContent(
      "<blockquote><strong>Audit Tip:</strong> Keep records ready.</blockquote><h2>Critical Control Points</h2><p>What you\\'ll check each day.</p><figure><img src=\"https://example.com/hero.jpg\" alt=\"Hero\" /></figure>",
    );

    expect(result.normalizedContent).toContain("What you'll check each day.");
    expect(result.headings).toEqual([
      { id: "critical-control-points", text: "Critical Control Points", level: 2 },
    ]);
    expect(result.processedContent).toContain('id="critical-control-points"');
    expect(result.processedContent).toContain("pp-article-callout");
    expect(result.processedContent).toContain("pp-article-figure");
  });

  it("removes legacy doctor attributions from leadership insight callouts", () => {
    const result = processArticleContent(
      "<blockquote><strong>Leadership Insight:</strong> \"Keep standards practical.\" - Dr. Margarida, Lead Auditor</blockquote>",
    );

    expect(result.processedContent).toContain("Leadership Insight:");
    expect(result.processedContent).not.toContain("Dr. Margarida");
    expect(result.processedContent).not.toContain("Lead Auditor");
  });

  it("scrubs dangerous tags, event handlers, and javascript: urls from article bodies", () => {
    const raw = [
      "<h2>Intro</h2>",
      "<script>alert('xss')</script>",
      "<style>body{display:none}</style>",
      "<iframe src=\"https://evil.example\"></iframe>",
      "<p onclick=\"alert(1)\">Click me</p>",
      "<a href=\"javascript:alert(2)\">bad</a>",
      "<a href=\"vbscript:msgbox\">worse</a>",
      "<img src=\"data:text/html,<script>alert(3)</script>\" />",
      "<form action=\"https://evil.example\"><input name=\"x\" /></form>",
      "<p style=\"background:url(javascript:alert(4))\">styled</p>",
      "<p>Legitimate text with <strong>emphasis</strong>.</p>",
    ].join("");

    const result = processArticleContent(raw);

    // Structurally dangerous tags are removed whole:
    expect(result.processedContent).not.toContain("<script");
    expect(result.processedContent).not.toContain("</script>");
    expect(result.processedContent).not.toContain("<style");
    expect(result.processedContent).not.toContain("<iframe");
    expect(result.processedContent).not.toContain("<form");
    expect(result.processedContent).not.toContain("<input");

    // Event handlers stripped from surviving tags:
    expect(result.processedContent).not.toMatch(/\sonclick\s*=/i);

    // Dangerous URL schemes neutralised:
    expect(result.processedContent).not.toContain("javascript:");
    expect(result.processedContent).not.toContain("vbscript:");
    expect(result.processedContent).not.toMatch(/src\s*=\s*"data:/i);

    // Inline style attributes stripped:
    expect(result.processedContent).not.toMatch(/\sstyle\s*=/i);

    // Legitimate editorial content preserved:
    expect(result.processedContent).toContain("<h2");
    expect(result.processedContent).toContain("Intro");
    expect(result.processedContent).toContain("<strong>emphasis</strong>");
    expect(result.processedContent).toContain("Legitimate text");
  });

  it("neutralises unquoted dangerous href/src attributes from article bodies", () => {
    const raw = [
      "<p>Safe intro</p>",
      "<a href=javascript:alert(1)>bad link</a>",
      "<img src=data:text/html,<script>alert(2)</script> alt=test>",
      "<a href=https://example.com>good link</a>",
    ].join("");

    const result = processArticleContent(raw);

    expect(result.processedContent).not.toContain("javascript:");
    expect(result.processedContent).not.toContain("data:text/html");
    expect(result.processedContent).toContain('href="#"');
    expect(result.processedContent).toContain('src="#"');
    expect(result.processedContent).toContain("https://example.com");
  });
});
