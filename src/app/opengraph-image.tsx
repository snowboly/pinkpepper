import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "PinkPepper - AI Food Safety Compliance Software for EU and UK Businesses";
export const size = { width: 1920, height: 1280 };
export const contentType = "image/jpeg";

export default function Image() {
  const imgData = readFileSync(join(process.cwd(), "public/hero-bg.jpg"));
  const base64 = `data:image/jpeg;base64,${imgData.toString("base64")}`;

  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={base64} width={1920} height={1280} alt="" />,
    { ...size }
  );
}
