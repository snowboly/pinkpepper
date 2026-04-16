import { sanitizeArticleHtml } from "@/lib/articles/sanitize";

export type ArticleHeading = {
  id: string;
  text: string;
  level: number;
};

export type ProcessedArticleContent = {
  headings: ArticleHeading[];
  processedContent: string;
  normalizedContent: string;
};

function stripLegacyInsightAttribution(html: string) {
  // Legacy iLoveHACCP article bodies often end leadership-insight callouts
  // with attributions like "- Dr. Margarida". Remove those tail attributions
  // so callouts stay editorially neutral.
  return html.replace(/\s[-–—]\s*Dr\.?\s+[A-Za-z][^<\n\r]*/gi, "");
}

function mergeClassAttribute(attrs: string, className: string) {
  if (/class="/.test(attrs)) {
    return attrs.replace(/class="([^"]*)"/, (_match, existing: string) => {
      const merged = `${className} ${existing}`.trim();
      return `class="${merged}"`;
    });
  }

  return `${attrs} class="${className}"`;
}

function slugifyHeading(text: string) {
  return text
    .replace(/<[^>]*>?/gm, "")
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function normalizeArticleContent(html: string) {
  return html
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');
}

export function getArticleHeadings(html: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const regex = /<(h[23])>(.*?)<\/h[23]>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const [, tag, text] = match;
    headings.push({
      id: slugifyHeading(text),
      text: text.replace(/<[^>]*>?/gm, ""),
      level: tag === "h2" ? 2 : 3,
    });
  }

  return headings;
}

export function processArticleContent(rawContent: string): ProcessedArticleContent {
  // Defense-in-depth: scrub dangerous tags/attributes before any further
  // transformation, so the downstream regex passes (and ultimately the
  // `dangerouslySetInnerHTML` sink on the article detail page) can never
  // see a <script>, inline event handler, javascript: URL, or <iframe>.
  // CSP + nonces already block script execution at the browser layer;
  // this sanitiser closes the remaining non-script vectors and keeps the
  // article body to an editorial tag vocabulary.
  const sanitizedRaw = sanitizeArticleHtml(rawContent);
  const normalizedContent = stripLegacyInsightAttribution(normalizeArticleContent(sanitizedRaw));
  const headings = getArticleHeadings(normalizedContent);

  let processedContent = normalizedContent.replace(
    /<(h[23])>(.*?)<\/h[23]>/g,
    (_match, tag: string, text: string) => `<${tag} id="${slugifyHeading(text)}">${text}</${tag}>`,
  );

  processedContent = processedContent.replace(
    /<blockquote>([\s\S]*?)<\/blockquote>/g,
    (_match, content: string) => `<div class="pp-article-callout">${content.trim()}</div>`,
  );

  processedContent = processedContent.replace(
    /<figure([^>]*)>/g,
    (_match, attrs: string) => `<figure${mergeClassAttribute(attrs, "pp-article-figure")}>`,
  );

  processedContent = processedContent.replace(
    /<img([^>]*?)\/?>/g,
    (_match, attrs: string) => `<img${mergeClassAttribute(attrs, "pp-article-inline-image")} />`,
  );

  return {
    headings,
    processedContent,
    normalizedContent,
  };
}
