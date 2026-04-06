import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "PinkPepper | AI HACCP & Food Safety Software for EU & UK Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoData = readFileSync(join(process.cwd(), "public/logo/LogoV3.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1a0a14 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative accent */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(225,29,72,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="PinkPepper"
          width={340}
          height={85}
          style={{ marginBottom: 32 }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#CBD5E1",
            textAlign: "center",
            maxWidth: 760,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          AI HACCP &amp; Food Safety Software for EU &amp; UK Businesses
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {["HACCP Plans", "Allergen Records", "SOPs", "Audit-Ready Docs"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                borderRadius: 24,
                background: "rgba(225,29,72,0.15)",
                border: "1px solid rgba(225,29,72,0.4)",
                color: "#FDA4AF",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
