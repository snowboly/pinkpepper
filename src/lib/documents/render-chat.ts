import type { DocumentSection, DocumentTable, GeneratedDocument } from "./types";

function renderSection(section: DocumentSection, depth = 2): string {
  const headingPrefix = "#".repeat(depth);
  const lines = [`${headingPrefix} ${section.heading}`, section.content.trim()];

  for (const subsection of section.subsections ?? []) {
    lines.push(renderSection(subsection, Math.min(depth + 1, 6)));
  }

  return lines.filter(Boolean).join("\n\n");
}

function renderTable(table: DocumentTable): string {
  const headers = table.columns.map((column) => column.header);
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
  const dataRows = table.rows.map((row) => `| ${headers.map((header) => row[header] ?? "").join(" | ")} |`);

  return [table.caption ? `### ${table.caption}` : "", headerRow, separatorRow, ...dataRows]
    .filter(Boolean)
    .join("\n");
}

export function renderDocumentForChat(doc: GeneratedDocument): string {
  const parts = [
    `# ${doc.title}`,
    `Document No.: ${doc.documentNumber}`,
    `Version: ${doc.version}`,
    `Date: ${doc.date}`,
    `Approved By: ${doc.approvedBy}`,
    `Scope: ${doc.scope}`,
    ...doc.sections.map((section) => renderSection(section)),
    ...(doc.tables ?? []).map((table) => renderTable(table)),
  ];

  return parts.filter(Boolean).join("\n\n");
}
