export type ArticleIndexCandidate = {
  slug: string;
  source?: string;
};

export const curatedImportedArticleSlugs = [
  "building-a-haccp-process-flow-diagram",
  "allergen-management-within-haccp-plans",
  "cooling-and-reheating-haccp-high-risk-steps",
  "biological-hazards-in-haccp-examples-and-controls",
  "haccp-ccp-examples-uk-eu",
  "haccp-checklist-for-new-food-businesses",
  "haccp-for-artisanal-bakeries-eu",
  "haccp-monitoring-record-templates",
  "haccp-plan-example-restaurant",
  "haccp-vs-brcgs-vs-ifs",
  "how-to-create-a-haccp-plan-step-by-step",
  "how-to-keep-haccp-practical-not-bureaucratic",
  "how-to-perform-a-hazard-analysis-correctly",
  "identifying-critical-control-points-in-food-safety",
  "physical-hazards-in-haccp-and-how-to-control-them",
  "temperature-control-in-haccp-limits-and-monitoring",
  "the-biggest-haccp-mistakes-we-see-in-professional-reviews",
  "top-reasons-haccp-plans-fail-during-audits",
  "what-regulators-really-expect-from-small-food-businesses",
  "when-to-hire-a-haccp-consultant",
] as const;

const curatedImportedSlugSet = new Set<string>(curatedImportedArticleSlugs);
const articleNoindexSlugSet = new Set<string>([
  "haccp-for-chinese-restaurants-and-takeaways-eu",
  "haccp-for-craft-breweries-eu",
  "haccp-for-farm-shops-eu",
  "haccp-for-vegan-and-plant-based-cafes-eu",
  "haccp-for-gelato-and-ice-cream-parlors-eu",
  "haccp-monitoring-record-templates",
  "haccp-plan-example-restaurant",
  "how-to-keep-haccp-practical-not-bureaucratic",
  "the-biggest-haccp-mistakes-we-see-in-professional-reviews",
  "when-to-hire-a-haccp-consultant",
]);
const localizedArticleNoindexSlugSet = new Set<string>([
  "how-to-create-a-haccp-plan-step-by-step",
  "haccp-monitoring-record-templates",
  "haccp-vs-brcgs-vs-ifs",
  "haccp-ccp-examples-uk-eu",
]);

export function isArticlePreferredForIndexing(article: ArticleIndexCandidate) {
  return article.source !== "ilovehaccp" || curatedImportedSlugSet.has(article.slug);
}

export function shouldIndexArticle(
  article: ArticleIndexCandidate,
  locale: "en" | "de" | "fr" | "pt" = "en",
) {
  if (!isArticlePreferredForIndexing(article)) {
    return false;
  }

  if (articleNoindexSlugSet.has(article.slug)) {
    return false;
  }

  if (locale !== "en" && localizedArticleNoindexSlugSet.has(article.slug)) {
    return false;
  }

  return true;
}
