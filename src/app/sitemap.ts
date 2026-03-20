import { MetadataRoute } from "next";

const BASE_URL = "https://pinkpepper.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date("2026-03-18"), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/features/haccp-plan-generator`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features/allergen-documentation`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features/food-safety-sop-generator`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features/food-safety-audit-prep`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/use-cases/restaurants`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases/cafes`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases/catering`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases/food-manufacturing`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/compare`, lastModified: new Date("2026-03-19"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/compare/pinkpepper-vs-consultant`, lastModified: new Date("2026-03-19"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/compare/haccp-software-alternatives`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: new Date("2026-03-14"), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/resources/haccp-plan-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/allergen-matrix-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/food-safety-audit-checklist`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/cleaning-and-disinfection-sop`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/temperature-monitoring-log-template`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/supplier-approval-questionnaire`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources/food-safety-document-checklist`, lastModified: new Date("2026-03-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/articles`, lastModified: new Date("2026-03-20"), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/faqs`, lastModified: new Date("2026-03-20"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/security`, lastModified: new Date("2026-03-18"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/legal/terms`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
