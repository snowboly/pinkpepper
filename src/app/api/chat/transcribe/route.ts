import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: {
        code: "UNAVAILABLE_ON_WEB",
        message: "Audio transcription is not available in the web app.",
      },
    },
    { status: 410 }
  );
}
