import { MetadataRoute } from "next";
import { getArticleManifest } from "@/lib/articles";

const BASE_URL = "https://www.pinkpepper.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticleManifest().catch(() => []);

  return [
    { url: BASE_URL, lastModified: new Date("2026-03-18"), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features/haccp-plan-generator`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features/allergen-documentation`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features/food-safety-sop-generator`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: new Date("2026-03-14"), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/resources/haccp-plan-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/allergen-matrix-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/food-safety-audit-checklist`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/cleaning-and-disinfection-sop`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/temperature-monitoring-log-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/supplier-approval-questionnaire`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/food-safety-document-checklist`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/resources/corrective-action-log-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/product-recall-procedure-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/employee-food-safety-training-record`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/personal-hygiene-policy-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/pest-control-log-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/waste-management-log-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/waste-management-sop-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/traceability-log-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/food-safety-management-system-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/articles`, lastModified: new Date("2026-03-20"), changeFrequency: "weekly", priority: 0.7 },
    ...articles.map((article) => ({
      url: `${BASE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${BASE_URL}/faqs`, lastModified: new Date("2026-03-20"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/security`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/legal/terms`, lastModified: new Date("2026-04-15"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: new Date("2026-04-15"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
