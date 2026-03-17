import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { HygienePolicyData } from "./hygiene-schema";

const PAGE_WIDTH = 595;  // A4 portrait
const PAGE_HEIGHT = 842;
const MARGIN = 40;
const LIGHT_BLUE = rgb(0.863, 0.933, 1);
const BORDER = rgb(0.796, 0.835, 0.882);
const TEXT = rgb(0.059, 0.09, 0.118);
const MUTED = rgb(0.278, 0.341, 0.404);
const CONTENT_W = PAGE_WIDTH - MARGIN * 2;

export async function renderHygienePdf(data: HygienePolicyData): Promise<Uint8Array> {
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
      `${data.metadata.businessName} — Personal Hygiene Policy | ${data.metadata.docNo} | ${data.metadata.date}`,
      { x: MARGIN, y: PAGE_HEIGHT - 18, size: 8, font: bold, color: TEXT }
    );
    page.drawText(
      `Approved by: ${data.metadata.approvedBy || "_______________"}`,
      { x: MARGIN, y: 14, size: 8, font: regular, color: MUTED }
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
    drawLine(`• ${value}`, 9, regular, TEXT, 6);
  }

  function drawNumbered(index: number, value: string) {
    drawLine(`${index + 1}. ${value}`, 9, regular, TEXT, 6);
  }

  function drawTable(headers: string[], rows: string[][], colWidths?: number[]) {
    const rowH = 18;
    const tableWidth = CONTENT_W;
    const widths = colWidths ?? headers.map(() => tableWidth / headers.length);

    // Header row
    ensureSpace(rowH + 2);
    let xPos = MARGIN;
    page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: tableWidth, height: rowH, color: LIGHT_BLUE, borderColor: BORDER, borderWidth: 0.5 });
    headers.forEach((h, i) => {
      page.drawText(h, { x: xPos + 3, y: y - 12, size: 9, font: bold, color: TEXT, maxWidth: widths[i] - 6 });
      xPos += widths[i];
    });
    y -= rowH;

    rows.forEach((row) => {
      const cellHeight = rowH;
      ensureSpace(cellHeight);
      xPos = MARGIN;
      page.drawRectangle({ x: MARGIN, y: y - cellHeight + 4, width: tableWidth, height: cellHeight, borderColor: BORDER, borderWidth: 0.5 });
      row.forEach((value, i) => {
        page.drawText(value.slice(0, 60), { x: xPos + 3, y: y - 12, size: 8, font: regular, color: TEXT, maxWidth: widths[i] - 6 });
        xPos += widths[i];
      });
      y -= cellHeight;
    });

    y -= 8;
  }

  drawFrame();
  y -= 20;

  // Metadata block
  page.drawText(`Document No.: ${data.metadata.docNo}   Revision: ${data.metadata.revision}   Date: ${data.metadata.date}`, { x: MARGIN, y, size: 9, font: regular, color: MUTED });
  y -= 14;

  // 1. Policy Statement
  drawSectionTitle("1. Policy Statement");
  drawLine(
    `${data.metadata.businessName || "This business"} requires all staff involved in food handling to maintain the highest standards of personal hygiene at all times. This policy ensures compliance with Regulation (EC) 852/2004, Annex II, Chapter VIII.`,
    9
  );

  // 2. Scope
  drawSectionTitle("2. Scope");
  drawLine(data.scope, 9);

  // 3. Handwashing
  drawSectionTitle("3. Handwashing Procedure");
  drawSubsectionTitle("3.1 When to Wash Hands");
  data.handwashingWhen.forEach((item) => drawBullet(item));

  drawSubsectionTitle("3.2 How to Wash Hands");
  data.handwashingHow.forEach((step, i) => drawNumbered(i, step));

  drawSubsectionTitle("3.3 Handwash Facilities");
  data.handwashingFacilities.forEach((item) => drawBullet(item));

  // 4. Protective Clothing
  drawSectionTitle("4. Protective Clothing");
  drawCaption("Table 1. Protective Clothing Requirements");
  drawTable(["Item", "Requirement"], data.protectiveClothing.map((r) => [r.item, r.requirement]), [120, CONTENT_W - 120]);

  // 5. Jewellery
  drawSectionTitle("5. Jewellery and Personal Items");
  drawCaption("Table 2. Jewellery and Personal Items Rules");
  drawTable(["Item", "Rule"], data.jewellery.map((r) => [r.item, r.rule]), [120, CONTENT_W - 120]);

  // 6. Illness Reporting
  drawSectionTitle("6. Illness Reporting and Fitness to Work");
  drawSubsectionTitle("6.1 Reporting Requirements");
  drawCaption("Table 3. Symptoms and Required Actions");
  drawTable(
    ["Symptom / Condition", "Action"],
    data.illnessReporting.map((r) => [r.symptomCondition, r.action]),
    [170, CONTENT_W - 170]
  );

  drawSubsectionTitle("6.2 Return to Work");
  drawLine("Staff excluded due to GI illness must be symptom-free for 48 hours minimum before returning. Obtain GP/medical clearance if required.", 9);

  // 7. Cuts and Wounds
  drawSectionTitle("7. Cuts and Wounds Procedure");
  data.cutsAndWounds.forEach((step, i) => drawNumbered(i, step));

  // 8. Visitor Rules
  drawSectionTitle("8. Visitor and Contractor Hygiene Rules");
  data.visitorRules.forEach((item) => drawBullet(item));

  // 9. Monitoring
  drawSectionTitle("9. Monitoring and Enforcement");
  drawCaption("Table 4. Monitoring Schedule");
  drawTable(
    ["Check", "Frequency", "Responsible"],
    data.monitoring.map((r) => [r.check, r.frequency, r.responsible]),
    [180, 100, CONTENT_W - 280]
  );

  // 10. Return-to-Work Form
  drawSectionTitle("10. Return-to-Work Fitness Assessment Form");
  drawCaption("Table 5. Return-to-Work Fitness Assessment");
  drawTable(["Field", "Detail"], data.returnToWorkForm.map((r) => [r.field, r.detail]), [160, CONTENT_W - 160]);

  // 11. Records
  drawSectionTitle("11. Records");
  drawCaption("Table 6. Record-Keeping Requirements");
  drawTable(
    ["Record", "Location", "Retention"],
    data.records.map((r) => [r.record, r.location, r.retention]),
    [160, 130, CONTENT_W - 290]
  );

  // Footer page numbers
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1}`, { x: PAGE_WIDTH - MARGIN - 30, y: 14, size: 8, font: regular, color: MUTED });
  });

  return pdf.save();
}
