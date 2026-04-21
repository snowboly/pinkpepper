import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/articles";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ArticleOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article?.title ?? "Food Safety Article";
  const category = article?.category ?? "PinkPepper";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "64px",
          background: "linear-gradient(135deg, #fff7ed 0%, #fff1f2 55%, #ffffff 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px",
            borderRadius: "32px",
            border: "1px solid rgba(225, 29, 72, 0.12)",
            background: "rgba(255,255,255,0.86)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#be123c", fontSize: 26, fontWeight: 700 }}>
            <span style={{ width: "16px", height: "16px", borderRadius: "999px", background: "#e11d48" }} />
            PinkPepper
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "960px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e11d48" }}>
              {category}
            </div>
            <div style={{ fontSize: 62, lineHeight: 1.07, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a" }}>
              {title}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 24px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.35)",
              background: "#ffffff",
              color: "#475569",
              fontSize: 22,
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            pinkpepper.io/articles
          </div>
        </div>
      </div>
    ),
    size,
  );
}
