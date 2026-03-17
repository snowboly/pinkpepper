import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { GeneratedDocument } from "./types";
import type { SopDocumentData } from "./sop-schema";

const PAGE_W = 595;  // A4 portrait
const PAGE_H = 842;
const MARGIN = 45;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LIGHT_BLUE = rgb(0.863, 0.933, 1);
const BORDER = rgb(0.796, 0.835, 0.882);
const TEXT = rgb(0.059, 0.09, 0.118);
const MUTED = rgb(0.278, 0.341, 0.404);

export async function renderSopPdf(
  doc: GeneratedDocument,
  sop: SopDocumentData
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function ensureSpace(space: number) {
    if (y - space < MARGIN + 20) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      drawFrame();
    }
  }

  function drawFrame() {
    page.drawText(
      `${sop.metadata.businessName} | ${doc.title} | ${sop.metadata.docNo} | ${sop.metadata.date}`,
      { x: MARGIN, y: PAGE_H - 18, size: 8, font: bold, color: TEXT, maxWidth: CONTENT_W }
    );
    page.drawText(
      `Approved by: ${sop.metadata.approvedBy || "_______________"}`,
      { x: MARGIN, y: 14, size: 8, font: regular, color: MUTED }
    );
  }

  function drawLine(value: string, size = 10, font = regular, color = TEXT, xOffset = 0) {
    const x = MARGIN + xOffset;
    const maxW = CONTENT_W - xOffset;
    const words = value.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        ensureSpace(size + 5);
        page.drawText(line, { x, y, size, font, color });
        y -= size + 5;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ensureSpace(size + 5);
      page.drawText(line, { x, y, size, font, color });
      y -= size + 5;
    }
  }

  function drawSectionHeading(title: string) {
    ensureSpace(22);
    y -= 8;
    // Left accent bar
    page.drawRectangle({ x: MARGIN - 4, y: y - 2, width: 4, height: 16, color: LIGHT_BLUE });
    page.drawText(title, { x: MARGIN + 4, y, size: 12, font: bold, color: TEXT });
    y -= 18;
  }

  function drawSubheading(title: string) {
    ensureSpace(16);
    y -= 4;
    page.drawText(title, { x: MARGIN + 8, y, size: 10, font: bold, color: MUTED });
    y -= 14;
  }

  function drawTable(headers: string[], rows: string[][], colWidths?: number[]) {
    const rowH = 18;
    const widths = colWidths ?? headers.map(() => CONTENT_W / headers.length);

    ensureSpace(rowH + 2);
    let xPos = MARGIN;
    page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, color: LIGHT_BLUE, borderColor: BORDER, borderWidth: 0.5 });
    headers.forEach((h, i) => {
      page.drawText(h, { x: xPos + 3, y: y - 12, size: 9, font: bold, color: TEXT, maxWidth: widths[i] - 6 });
      xPos += widths[i];
    });
    y -= rowH;

    rows.forEach((row) => {
      ensureSpace(rowH);
      xPos = MARGIN;
      page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, borderColor: BORDER, borderWidth: 0.5 });
      row.forEach((value, i) => {
        const display = value.length > 45 ? `${value.slice(0, 42)}…` : value;
        page.drawText(display, { x: xPos + 3, y: y - 12, size: 8, font: regular, color: TEXT, maxWidth: widths[i] - 6 });
        xPos += widths[i];
      });
      y -= rowH;
    });
    y -= 8;
  }

  // ── First page ──────────────────────────────────────────────────────────────
  drawFrame();
  y -= 18;

  // Title
  drawLine(doc.title, 16, bold, TEXT);
  y -= 4;

  // Metadata block
  const metaItems: [string, string][] = [
    ["Document No.", sop.metadata.docNo],
    ["Revision", sop.metadata.revision],
    ["Date", sop.metadata.date],
    ["Approved By", sop.metadata.approvedBy || "_______________"],
  ];
  for (const [label, value] of metaItems) {
    ensureSpace(16);
    page.drawText(`${label}:`, { x: MARGIN, y, size: 9, font: bold, color: MUTED });
    page.drawText(value, { x: MARGIN + 80, y, size: 9, font: regular, color: TEXT });
    y -= 14;
  }
  y -= 4;
  // Separator
  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 1, color: BORDER });
  y -= 10;
  drawLine(`Scope: ${doc.scope}`, 9, regular, MUTED);
  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 1, color: BORDER });
  y -= 10;
  drawLine("AI-assisted draft — review and validate before operational use.", 8, regular, MUTED);
  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 1.5, color: LIGHT_BLUE });
  y -= 16;

  // ── Sections ────────────────────────────────────────────────────────────────
  for (let si = 0; si < doc.sections.length; si++) {
    const section = doc.sections[si];
    drawSectionHeading(`${si + 1}. ${section.heading}`);
    drawLine(section.content, 9);
    y -= 2;

    if (section.subsections) {
      for (let ssi = 0; ssi < section.subsections.length; ssi++) {
        const sub = section.subsections[ssi];
        drawSubheading(`${si + 1}.${ssi + 1} ${sub.heading}`);
        drawLine(sub.content, 9, regular, TEXT, 8);
        y -= 2;
      }
    }
  }

  // ── Tables ──────────────────────────────────────────────────────────────────
  if (doc.tables) {
    for (const table of doc.tables) {
      if (table.caption) {
        ensureSpace(20);
        drawLine(table.caption, 10, bold, TEXT);
        y -= 2;
      }
      const headers = table.columns.map((c) => c.header);
      const rows = table.rows.map((row) => headers.map((h) => row[h] ?? ""));
      drawTable(headers, rows);
    }
  }

  // ── Footer page numbers ──────────────────────────────────────────────────────
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1}`, { x: PAGE_W - MARGIN - 30, y: 14, size: 8, font: regular, color: MUTED });
  });

  return pdf.save();
}
