import { promises as fs } from "node:fs";
import path from "node:path";
import { publicLaunchLocales, type PublicLocale } from "@/i18n/public";

export type ArticleRecord = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image?: string;
  source?: string;
  locale?: PublicLocale;
  body: string;
};

export type ArticleSummary = Omit<ArticleRecord, "body">;

type LoaderOptions = {
  contentDir?: string;
  locale?: PublicLocale;
};

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content", "articles");
export const localizedSeoPriorityArticleSlugs = [
  "how-to-create-a-haccp-plan-step-by-step",
  "how-to-perform-a-hazard-analysis-correctly",
  "identifying-critical-control-points-in-food-safety",
  "haccp-ccp-examples-uk-eu",
  "temperature-control-in-haccp-limits-and-monitoring",
  "allergen-management-within-haccp-plans",
  "cooling-and-reheating-haccp-high-risk-steps",
  "haccp-monitoring-record-templates",
  "top-reasons-haccp-plans-fail-during-audits",
  "haccp-vs-brcgs-vs-ifs",
] as const;

const localizedPriorityRank = new Map<string, number>(
  localizedSeoPriorityArticleSlugs.map((slug, index) => [slug, index]),
);

function resolveContentDir(options: LoaderOptions = {}) {
  const baseContentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;
  if (!options.locale || options.locale === "en") {
    return baseContentDir;
  }

  return path.join(baseContentDir, options.locale);
}

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

async function readArticleFile(filePath: string, locale?: PublicLocale): Promise<ArticleRecord> {
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
    locale,
    body,
  };
}

export async function getAllArticles(options: LoaderOptions = {}): Promise<ArticleRecord[]> {
  const contentDir = resolveContentDir(options);
  const summaries = await getArticleManifest(options);

  return Promise.all(
    summaries.map(async (summary) => readArticleFile(path.join(contentDir, `${summary.slug}.md`), options.locale)),
  );
}

async function buildArticleManifest(contentDir: string): Promise<ArticleSummary[]> {
  const fileNames = await fs.readdir(contentDir);
  const articles = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => readArticleFile(path.join(contentDir, fileName))),
  );

  return articles
    .map((article) => ({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      publishedAt: article.publishedAt,
      image: article.image,
      source: article.source,
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function sortArticleSummaries(articles: ArticleSummary[], locale?: PublicLocale) {
  if (locale && locale !== "en") {
    return [...articles].sort((a, b) => {
      const aRank = localizedPriorityRank.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
      const bRank = localizedPriorityRank.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
      return aRank - bRank || b.publishedAt.localeCompare(a.publishedAt);
    });
  }

  return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticleManifest(options: LoaderOptions = {}): Promise<ArticleSummary[]> {
  const contentDir = resolveContentDir(options);
  const manifestFile = path.join(contentDir, "manifest.json");

  try {
    const raw = await fs.readFile(manifestFile, "utf8");
    const parsed = JSON.parse(raw) as ArticleSummary[];
    return sortArticleSummaries(parsed, options.locale);
  } catch {
    return sortArticleSummaries(await buildArticleManifest(contentDir), options.locale);
  }
}

export async function getArticleBySlug(slug: string, options: LoaderOptions = {}): Promise<ArticleRecord | null> {
  const contentDir = resolveContentDir(options);
  const summaries = await getArticleManifest(options);
  const articleSummary = summaries.find((article) => article.slug === slug);

  if (!articleSummary) {
    return null;
  }

  return readArticleFile(path.join(contentDir, `${slug}.md`), options.locale);
}

export async function getLocalizedArticleManifest(locale: Exclude<PublicLocale, "en">) {
  return getArticleManifest({ locale });
}

export async function getAvailableArticleLocales(slug: string): Promise<PublicLocale[]> {
  const availability = await Promise.all(
    publicLaunchLocales.map(async (locale) => {
      const article = await getArticleBySlug(slug, { locale }).catch(() => null);
      return article ? locale : null;
    }),
  );

  return availability.filter((locale): locale is PublicLocale => Boolean(locale));
}
