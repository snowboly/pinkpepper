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
});
