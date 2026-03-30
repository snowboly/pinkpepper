import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { CleaningSopData } from "./cleaning-sop-schema";

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 36;
const LIGHT_BLUE = rgb(0.863, 0.933, 1);
const BORDER = rgb(0.796, 0.835, 0.882);
const TEXT = rgb(0.059, 0.09, 0.118);
const MUTED = rgb(0.278, 0.341, 0.404);
const CONTENT_W = PAGE_WIDTH - MARGIN * 2;

export async function renderCleaningSopPdf(data: CleaningSopData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(space: number) {
    if (y - space < MARGIN + 20) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      drawFrame();
    }
  }

  function drawFrame() {
    page.drawText(
      `${data.metadata.businessName} - Cleaning and Disinfection SOP | ${data.metadata.docNo} | ${data.metadata.date}`,
      { x: MARGIN, y: PAGE_HEIGHT - 18, size: 8, font: bold, color: TEXT },
    );
    page.drawText(
      `Approved by: ${data.metadata.approvedBy || "_______________"}`,
      { x: MARGIN, y: 14, size: 8, font: regular, color: MUTED },
    );
  }

  function drawLine(value: string, size = 10, font = regular, color = TEXT, xOffset = 0) {
    const x = MARGIN + xOffset;
    const maxWidth = CONTENT_W - xOffset;
    const words = value.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
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

  function drawSectionTitle(title: string) {
    ensureSpace(22);
    y -= 8;
    page.drawText(title, { x: MARGIN, y, size: 13, font: bold, color: TEXT });
    y -= 18;
  }

  function drawSubsectionTitle(title: string) {
    ensureSpace(18);
    y -= 4;
    page.drawText(title, { x: MARGIN, y, size: 11, font: bold, color: MUTED });
    y -= 16;
  }

  function drawCaption(value: string) {
    ensureSpace(14);
    page.drawText(value, { x: MARGIN, y, size: 9, font: regular, color: MUTED });
    y -= 13;
  }

  function drawBullet(value: string) {
    drawLine(`- ${value}`, 9, regular, TEXT, 6);
  }

  function drawNumbered(index: number, value: string) {
    drawLine(`${index + 1}. ${value}`, 9, regular, TEXT, 6);
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
        page.drawText(value.slice(0, 50), { x: xPos + 3, y: y - 12, size: 8, font: regular, color: TEXT, maxWidth: widths[i] - 6 });
        xPos += widths[i];
      });
      y -= rowH;
    });

    y -= 8;
  }

  drawFrame();
  y -= 20;

  page.drawText(`Document No.: ${data.metadata.docNo}   Revision: ${data.metadata.revision}   Date: ${data.metadata.date}`, { x: MARGIN, y, size: 9, font: regular, color: MUTED });
  y -= 14;

  drawSectionTitle("1. Purpose");
  drawLine("This SOP defines the cleaning and disinfection procedures required to maintain food safety and hygiene standards. It ensures compliance with Regulation (EC) 852/2004, Annex II, Chapter I.", 9);

  drawSectionTitle("2. Scope");
  drawLine(data.scope, 9);

  drawSectionTitle("3. Responsibilities");
  drawCaption("Table 1. Roles and Responsibilities");
  drawTable(["Role", "Responsibility"], data.responsibilities.map((r) => [r.role, r.responsibility]), [160, CONTENT_W - 160]);

  drawSectionTitle("4. Definitions");
  drawCaption("Table 2. Key Definitions");
  drawTable(["Term", "Definition"], data.definitions.map((r) => [r.term, r.definition]), [110, CONTENT_W - 110]);

  drawSectionTitle("5. Materials and Chemicals");
  drawCaption("Table 3. Cleaning Chemicals Reference");
  drawTable(
    ["Chemical / Product", "Purpose", "Dilution", "Contact Time", "Active Ingredient"],
    data.chemicals.map((r) => [r.chemical, r.purpose, r.dilution, r.contactTime, r.activeIngredient]),
    [155, 120, 90, 90, CONTENT_W - 455],
  );

  drawSectionTitle("6. Step-by-Step Cleaning Procedure");
  drawSubsectionTitle("6.1 Standard Two-Stage Clean (Food-Contact Surfaces)");
  data.standardProcedure.forEach((step, i) => drawNumbered(i, step));

  drawSubsectionTitle("6.2 Non-Food-Contact Surfaces");
  data.nonFoodContactProcedure.forEach((step, i) => drawNumbered(i, step));

  drawSectionTitle("7. Cleaning Frequency Schedule");
  drawCaption("Table 4. Cleaning Frequency Schedule");
  drawTable(
    ["Item / Area", "Method", "Frequency", "Responsible"],
    data.frequencySchedule.map((r) => [r.itemArea, r.method, r.frequency, r.responsible]),
    [160, 160, 110, CONTENT_W - 430],
  );

  drawSectionTitle("8. Verification");
  drawSubsectionTitle("8.1 Visual Inspection");
  data.verificationVisual.forEach((item) => drawBullet(item));

  drawSubsectionTitle("8.2 ATP Bioluminescence Testing");
  drawCaption("Table 5. ATP Verification Limits");
  drawTable(
    ["Surface Category", "Pass (RLU)", "Borderline (RLU)", "Fail (RLU)"],
    data.verificationAtp.map((r) => [r.surfaceCategory, r.pass, r.borderline, r.fail]),
    [180, CONTENT_W / 4, CONTENT_W / 4, CONTENT_W - 180 - CONTENT_W / 2],
  );

  drawSectionTitle("9. Corrective Actions");
  data.corrective.forEach((step, i) => drawNumbered(i, step));

  drawSectionTitle("10. Records");
  drawCaption("Table 6. Record-Keeping Requirements");
  drawTable(
    ["Record", "Location", "Retention"],
    data.records.map((r) => [r.record, r.location, r.retention]),
    [200, 160, CONTENT_W - 360],
  );

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1}`, { x: PAGE_WIDTH - MARGIN - 30, y: 14, size: 8, font: regular, color: MUTED });
  });

  return pdf.save();
}
