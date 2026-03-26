import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const SOURCE_FILE = "C:/Users/Joao/websites/ilovehaccp/src/data/articles.ts";
const OUTPUT_DIR = path.join(process.cwd(), "content", "articles");
const REPORT_DIR = path.join(process.cwd(), "docs", "superpowers", "reports");
const REPORT_FILE = path.join(REPORT_DIR, "2026-03-26-ilovehaccp-article-migration-report.md");
const ENCODING_REPLACEMENTS = [
  ["\u00e2\u2030\u00a4", "\u2264"],
  ["\u00e2\u2030\u00a5", "\u2265"],
  ["\u00e2\u2020\u2019", "\u2192"],
  ["\u00e2\u20ac\u2122", "\u2019"],
  ["\u00e2\u20ac\u201d", "\u2014"],
  ["\u00c2", ""],
];

function normalizePublishedAt(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().slice(0, 10);
}

function transformArticle(article) {
  const flags = [];
  const pushFlag = (flag) => {
    if (!flags.includes(flag)) {
      flags.push(flag);
    }
  };
  let body = article.content.replace(/<!--\s*Written by Dr\. Margarida\s*-->/gi, "").trim();

  if (body.includes("https://ilovehaccp.com/builder")) {
    body = body.replaceAll(
      "https://ilovehaccp.com/builder",
      "https://pinkpepper.io/pricing",
    );
    body = body.replaceAll("ilovehaccp.com/builder", "PinkPepper pricing");
    pushFlag("legacy_cta_rewritten");
  }

  if (body.includes('href="/builder"')) {
    body = body.replaceAll('href="/builder"', 'href="/pricing"');
    pushFlag("legacy_cta_rewritten");
  }

  const beforePromoCleanup = body;
  body = body.replace(
    /<h3>Further Reading &amp; Tools<\/h3>[\s\S]*$/i,
    "",
  );
  body = body.replace(
    /<p>For practical implementation, review[\s\S]*?<\/p>/gi,
    "",
  );
  body = body.replace(
    /<p>(?:Generate|Build|Create|Review)[\s\S]*?(?:PinkPepper pricing|<\/a>)[\s\S]*?<\/p>/gi,
    "",
  );
  body = body.replace(
    /<li>\s*<a href="\/pricing">(?:Build|Create|Generate|Review)[\s\S]*?<\/a>\s*<\/li>/gi,
    "",
  );
  body = body.replace(/<ul>\s*<\/ul>/gi, "");

  if (body !== beforePromoCleanup) {
    pushFlag("promo_block_removed");
  }

  let encodingTouched = false;
  for (const [from, to] of ENCODING_REPLACEMENTS) {
    if (body.includes(from)) {
      body = body.replaceAll(from, to);
      encodingTouched = true;
    }
  }

  if (encodingTouched) {
    pushFlag("encoding_normalized");
  }

  return {
    frontmatter: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      publishedAt: normalizePublishedAt(article.publishedAt),
      image: article.image,
      source: "ilovehaccp",
    },
    body,
    flags,
  };
}

function loadSourceArticles() {
  const source = fs.readFileSync(SOURCE_FILE, "utf8");
  const match = source.match(/export const articles: Article\[] = (\[[\s\S]*\]);\s*$/);
  if (!match) {
    throw new Error("Could not locate article array in source file");
  }

  return vm.runInNewContext(match[1], {}, { timeout: 1000 });
}

function toMarkdown(article) {
  const lines = [
    "---",
    `title: ${JSON.stringify(article.frontmatter.title)}`,
    `slug: ${JSON.stringify(article.frontmatter.slug)}`,
    `excerpt: ${JSON.stringify(article.frontmatter.excerpt)}`,
    `category: ${JSON.stringify(article.frontmatter.category)}`,
    `publishedAt: ${JSON.stringify(article.frontmatter.publishedAt)}`,
  ];

  if (article.frontmatter.image) {
    lines.push(`image: ${JSON.stringify(article.frontmatter.image)}`);
  }

  lines.push(`source: ${JSON.stringify(article.frontmatter.source)}`);
  lines.push("---", "", article.body, "");

  return lines.join("\n");
}

function writeReport(total, flagged, duplicates) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const lines = [
    "# iLoveHACCP Article Migration Report",
    "",
    `- Total source articles: ${total}`,
    `- Duplicate slugs: ${duplicates.length}`,
    `- Flagged articles: ${flagged.length}`,
    "",
    "## Flagged Articles",
    "",
  ];

  if (flagged.length === 0) {
    lines.push("None.");
  } else {
    for (const item of flagged) {
      lines.push(`- \`${item.slug}\`: ${item.flags.join(", ")}`);
    }
  }

  lines.push("", "## Duplicate Slugs", "");

  if (duplicates.length === 0) {
    lines.push("None.");
  } else {
    for (const slug of duplicates) {
      lines.push(`- \`${slug}\``);
    }
  }

  fs.writeFileSync(REPORT_FILE, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const sourceArticles = loadSourceArticles();
  const seen = new Set();
  const duplicates = [];
  const flagged = [];

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const sourceArticle of sourceArticles) {
    if (seen.has(sourceArticle.slug)) {
      duplicates.push(sourceArticle.slug);
      continue;
    }
    seen.add(sourceArticle.slug);

    const transformed = transformArticle(sourceArticle);
    if (transformed.flags.length > 0) {
      flagged.push({ slug: transformed.frontmatter.slug, flags: transformed.flags });
    }

    const markdown = toMarkdown(transformed);
    const outputPath = path.join(OUTPUT_DIR, `${transformed.frontmatter.slug}.md`);
    fs.writeFileSync(outputPath, markdown, "utf8");
  }

  writeReport(sourceArticles.length, flagged, duplicates);
  console.log(
    JSON.stringify(
      {
        migrated: sourceArticles.length - duplicates.length,
        duplicates,
        flagged: flagged.length,
        outputDir: OUTPUT_DIR,
        reportFile: REPORT_FILE,
      },
      null,
      2,
    ),
  );
}

main();
