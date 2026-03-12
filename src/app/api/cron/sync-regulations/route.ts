import { syncRegulations } from "@/lib/rag/regulation-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes (Vercel Pro limit)

/**
 * Monthly cron endpoint to sync EU food safety regulations from EUR-Lex.
 * Protected by CRON_SECRET — only Vercel Cron should call this.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncRegulations();
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/sync-regulations] Fatal error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
