type SourceArticle = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image?: string;
  content: string;
  publishedAt: string;
};

type MigratedFrontmatter = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image?: string;
  source: "ilovehaccp";
};

export type MigratedArticle = {
  frontmatter: MigratedFrontmatter;
  body: string;
  migrationFlags: string[];
};

const ENCODING_REPLACEMENTS: Array<[string, string]> = [
  ["\u00e2\u2030\u00a4", "\u2264"],
  ["\u00e2\u2030\u00a5", "\u2265"],
  ["\u00e2\u2020\u2019", "\u2192"],
  ["\u00e2\u20ac\u2122", "\u2019"],
  ["\u00e2\u20ac\u201d", "\u2014"],
  ["\u00c2", ""],
];

function normalizePublishedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
}

export function transformIloveHaccpArticle(article: SourceArticle): MigratedArticle {
  const migrationFlags: string[] = [];
  const pushFlag = (flag: string) => {
    if (!migrationFlags.includes(flag)) {
      migrationFlags.push(flag);
    }
  };

  let body = article.content.replace(/<!--\s*Written by Dr\. Margarida\s*-->/gi, "").trim();

  if (body.includes("https://ilovehaccp.com/builder")) {
    body = body.replaceAll("https://ilovehaccp.com/builder", "/pricing");
    body = body.replaceAll("ilovehaccp.com/builder", "PinkPepper pricing");
    pushFlag("legacy_cta_rewritten");
  }

  if (body.includes('href="/builder"')) {
    body = body.replaceAll('href="/builder"', 'href="/pricing"');
    pushFlag("legacy_cta_rewritten");
  }

  if (body.includes("\\'")) {
    body = body.replaceAll("\\'", "'");
    pushFlag("escape_normalized");
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
  body = body.replace(
    /<h4>What you'll learn<\/h4>\s*<ul>\s*<li>How this HACCP topic applies in real-world operations<\/li>\s*<li>Common hazards and practical controls to reduce risk<\/li>\s*<li>Records and monitoring that auditors expect to see<\/li>\s*<\/ul>/gi,
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
    migrationFlags,
  };
}
