import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PinkPepper - AI Food Safety Assistant for EU and UK food businesses";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OgImage() {
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
          <div style={{ display: "flex", flexDirection: "column", gap: "22px", maxWidth: "880px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#be123c", fontSize: 28, fontWeight: 700 }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "999px", background: "#e11d48" }} />
              PinkPepper
            </div>
            <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.04em" }}>
              AI food safety compliance for EU and UK food businesses
            </div>
            <div style={{ fontSize: 32, lineHeight: 1.3, color: "#475569" }}>
              Generate HACCP plans, SOPs, allergen documents, audit checklists, and export-ready compliance records.
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {["HACCP plans", "Allergen docs", "SOP generation", "Audit prep"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "14px 24px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
