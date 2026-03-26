import { promises as fs } from "node:fs";
import path from "node:path";

export type ArticleRecord = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image?: string;
  source?: string;
  body: string;
};

type LoaderOptions = {
  contentDir?: string;
};

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content", "articles");

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid article frontmatter");
  }

  const [, frontmatterBlock, body] = match;
  const frontmatter: Record<string, string> = {};

  for (const line of frontmatterBlock.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^"(.*)"$/, "$1");
    frontmatter[key] = value;
  }

  return { frontmatter, body: body.trim() };
}

async function readArticleFile(filePath: string): Promise<ArticleRecord> {
  const raw = await fs.readFile(filePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);

  return {
    title: frontmatter.title,
    slug: frontmatter.slug,
    excerpt: frontmatter.excerpt,
    category: frontmatter.category,
    publishedAt: frontmatter.publishedAt,
    image: frontmatter.image,
    source: frontmatter.source,
    body,
  };
}

export async function getAllArticles(options: LoaderOptions = {}): Promise<ArticleRecord[]> {
  const contentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;
  const fileNames = await fs.readdir(contentDir);

  const articles = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => readArticleFile(path.join(contentDir, fileName))),
  );

  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticleBySlug(
  slug: string,
  options: LoaderOptions = {},
): Promise<ArticleRecord | null> {
  const articles = await getAllArticles(options);
  return articles.find((article) => article.slug === slug) ?? null;
}
