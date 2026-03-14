import { MetadataRoute } from "next";

const BASE_URL = "https://pinkpepper.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date("2025-06-01"), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date("2025-06-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date("2025-06-01"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/contact`, lastModified: new Date("2025-06-01"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/security`, lastModified: new Date("2025-06-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/legal/terms`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/cookies`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/dpa`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/refund`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/acceptable-use`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
