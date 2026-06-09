import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] ??= value;
  }
}

function normalizeLegislationTitle(value) {
  const englishTitle = value.match(
    /<span\b[^>]*xml:lang=["']en["'][^>]*>([\s\S]*?)<\/span>/i
  )?.[1];
  const selected = englishTitle ?? value;

  return selected
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPlan(rows) {
  const archives = [];
  const titleUpdates = [];

  for (const row of rows) {
    const metadata = row.metadata ?? {};
    if (row.source_type !== "regulation") continue;
    if ((metadata.retrieval_status ?? "active") !== "active") continue;

    if (!metadata.source_key || /\brevoked\b/i.test(row.source_name)) {
      archives.push({
        id: row.id,
        sourceName: row.source_name,
        reason: !metadata.source_key
          ? "unversioned_regulation_source"
          : "explicitly_revoked_instrument",
        metadata,
      });
      continue;
    }

    if (/^\s*<div\b/i.test(row.source_name)) {
      const sourceName = normalizeLegislationTitle(row.source_name);
      if (sourceName && sourceName !== row.source_name) {
        titleUpdates.push({ id: row.id, sourceName });
      }
    }
  }

  return { archives, titleUpdates };
}

async function fetchAll(client) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client
      .from("knowledge_chunks")
      .select("id,source_type,source_name,metadata")
      .range(from, from + 999);

    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

async function main() {
  loadEnv(".env.local");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing Supabase admin environment variables");
  }

  const apply = process.argv.includes("--apply");
  const client = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const rows = await fetchAll(client);
  const plan = buildPlan(rows);
  const activeRows = rows.filter(
    (row) => (row.metadata?.retrieval_status ?? "active") === "active"
  );
  const archivedRows = rows.filter(
    (row) => row.metadata?.retrieval_status === "archived"
  );
  const activeRegulations = activeRows.filter(
    (row) => row.source_type === "regulation"
  );

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        audit: {
          total: rows.length,
          active: activeRows.length,
          archived: archivedRows.length,
          activeRegulations: activeRegulations.length,
          activeRegulationsMissingSourceKey: activeRegulations.filter(
            (row) => !row.metadata?.source_key
          ).length,
          activeRevokedTitles: activeRegulations.filter((row) =>
            /\brevoked\b/i.test(row.source_name)
          ).length,
          activeMalformedXhtmlTitles: activeRegulations.filter((row) =>
            /^\s*<div\b/i.test(row.source_name)
          ).length,
        },
        archiveCount: plan.archives.length,
        titleUpdateCount: plan.titleUpdates.length,
        archiveSources: plan.archives.reduce((counts, row) => {
          counts[row.sourceName] = (counts[row.sourceName] ?? 0) + 1;
          return counts;
        }, {}),
        normalizedTitles: [
          ...new Set(plan.titleUpdates.map((row) => row.sourceName)),
        ].sort(),
      },
      null,
      2
    )
  );

  if (!apply) return;

  const archivedAt = new Date().toISOString();
  for (const row of plan.archives) {
    const { error } = await client
      .from("knowledge_chunks")
      .update({
        metadata: {
          ...row.metadata,
          retrieval_status: "archived",
          archived_at: archivedAt,
          archive_reason: row.reason,
        },
      })
      .eq("id", row.id);
    if (error) throw new Error(`Failed to archive ${row.id}: ${error.message}`);
  }

  for (const row of plan.titleUpdates) {
    const { error } = await client
      .from("knowledge_chunks")
      .update({ source_name: row.sourceName })
      .eq("id", row.id);
    if (error) throw new Error(`Failed to normalize ${row.id}: ${error.message}`);
  }

  console.log(
    `Applied: archived ${plan.archives.length}, normalized ${plan.titleUpdates.length}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
