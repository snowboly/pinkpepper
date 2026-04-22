import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/admin/",
        "/api/",
        "/auth/",
        "/login",
        "/signup",
        "/forgot-password",
        "/update-password",
        "/*/login",
        "/*/signup",
      ],
    },
    sitemap: "https://pinkpepper.io/sitemap.xml",
  };
}
