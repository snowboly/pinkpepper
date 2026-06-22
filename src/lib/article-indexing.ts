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

export function isArticlePreferredForIndexing(article: ArticleIndexCandidate) {
  return article.source !== "ilovehaccp" || curatedImportedSlugSet.has(article.slug);
}
