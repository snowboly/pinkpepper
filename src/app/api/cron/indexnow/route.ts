import { getArticleManifest, isArticlePreferredForIndexing } from "@/lib/articles";
import { publicContentRoutePaths, publicLaunchLocales } from "@/i18n/public";
import { localizePublicPath } from "@/lib/public-routes";
import { resourceEntries } from "@/lib/resources";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE_URL = "https://pinkpepper.io";
const INDEXNOW_KEY = "181c6ef4ee9b418590ef0828aa795a1f";
const INDEXNOW_KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

const STATIC_PATHS = [
  "/about",
  "/resources",
  "/security",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/legal/dpa",
  "/legal/acceptable-use",
  "/legal/refund",
];

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/indexnow] CRON_SECRET is not configured");
    return Response.json({ error: "Service misconfigured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await getArticleManifest().catch(() => []);

  const englishRoutes = publicContentRoutePaths.map((path) => `${BASE_URL}${path}`);
  const localizedRoutes = publicContentRoutePaths.flatMap((path) =>
    publicLaunchLocales
      .filter((locale) => locale !== "en")
      .map((locale) => `${BASE_URL}${localizePublicPath(locale, path)}`),
  );
  const articleUrls = articles
    .filter(isArticlePreferredForIndexing)
    .map((article) => `${BASE_URL}/articles/${article.slug}`);
  const staticUrls = [...STATIC_PATHS, ...resourceEntries.map((resource) => resource.href)].map(
    (path) => `${BASE_URL}${path}`,
  );

  const urlList = [...englishRoutes, ...localizedRoutes, ...articleUrls, ...staticUrls];

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: "pinkpepper.io",
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[cron/indexnow] IndexNow API error:", res.status, text);
    return Response.json({ error: `IndexNow returned ${res.status}`, detail: text }, { status: 502 });
  }

  console.log(`[cron/indexnow] Submitted ${urlList.length} URLs to IndexNow`);
  return Response.json({ submitted: urlList.length });
}
