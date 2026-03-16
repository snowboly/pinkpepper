import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { HaccpDocumentData } from "./haccp-schema";

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 36;
const LIGHT_BLUE = rgb(0.863, 0.933, 1);
const BORDER = rgb(0.796, 0.835, 0.882);
const TEXT = rgb(0.059, 0.09, 0.118);
const MUTED = rgb(0.278, 0.341, 0.404);

export async function renderHaccpPdf(data: HaccpDocumentData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(space: number) {
    if (y - space < MARGIN) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      drawFrame();
    }
  }

  function drawFrame() {
    page.drawText(`${data.metadata.companyName} | Version ${data.metadata.version} | ${data.metadata.date}`, {
      x: MARGIN,
      y: PAGE_HEIGHT - 22,
      size: 10,
      font: bold,
      color: TEXT,
    });

    page.drawText(`Created by: ${data.metadata.createdBy}   Approved by: ${data.metadata.approvedBy}`, {
      x: MARGIN,
      y: 18,
      size: 10,
      font: regular,
      color: MUTED,
    });
  }

  function drawLine(text: string, size = 10, font = regular, color = TEXT) {
    ensureSpace(size + 6);
    page.drawText(text, { x: MARGIN, y, size, font, color });
    y -= size + 6;
  }

  function drawSectionTitle(title: string) {
    ensureSpace(24);
    page.drawText(title, { x: MARGIN, y, size: 14, font: bold, color: TEXT });
    y -= 20;
  }

  function drawCaption(textValue: string) {
    ensureSpace(16);
    page.drawText(textValue, { x: MARGIN, y, size: 10, font: regular, color: MUTED });
    y -= 14;
  }

  function drawTable(headers: string[], rows: string[][]) {
    const tableWidth = PAGE_WIDTH - MARGIN * 2;
    const colWidth = tableWidth / headers.length;
    const rowHeight = 20;

    ensureSpace(rowHeight * (rows.length + 1) + 12);
    page.drawRectangle({
      x: MARGIN,
      y: y - rowHeight + 4,
      width: tableWidth,
      height: rowHeight,
      color: LIGHT_BLUE,
      borderColor: BORDER,
      borderWidth: 1,
    });

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: MARGIN + index * colWidth + 4,
        y: y - 12,
        size: 11,
        font: bold,
        color: TEXT,
        maxWidth: colWidth - 8,
      });
    });
    y -= rowHeight;

    rows.forEach((row) => {
      page.drawRectangle({
        x: MARGIN,
        y: y - rowHeight + 4,
        width: tableWidth,
        height: rowHeight,
        borderColor: BORDER,
        borderWidth: 1,
      });
      row.forEach((value, index) => {
        page.drawText(value, {
          x: MARGIN + index * colWidth + 4,
          y: y - 12,
          size: 10,
          font: regular,
          color: TEXT,
          maxWidth: colWidth - 8,
        });
      });
      y -= rowHeight;
    });

    y -= 12;
  }

  drawFrame();
  drawSectionTitle("Process Flow");
  const processFlow = data.processFlow.length > 0
    ? data.processFlow.map((step, index) => `${index + 1}. ${step}`)
    : ["No process flow provided."];
  processFlow.forEach((line) => drawLine(line));
  y -= 6;

  drawSectionTitle("Process Steps Table");
  drawCaption("Table 1. Process Steps");
  drawTable(
    ["Step No.", "Step Name", "Full Step Description"],
    data.steps.map((step) => [String(step.stepNo), step.stepName, step.fullStepDescription]),
  );

  drawSectionTitle("Hazard Analysis Table");
  drawCaption("Table 2. Hazard Analysis");
  drawTable(
    ["Step No.", "Step Name", "Hazard Type", "Hazard Description", "Control Measure", "Is CCP?"],
    data.hazards.map((hazard) => [
      String(hazard.stepNo),
      hazard.stepName,
      hazard.hazardType,
      hazard.hazardDescription,
      hazard.controlMeasure,
      hazard.isCcp,
    ]),
  );

  if (data.ccps.length > 0) {
    drawSectionTitle("CCP Table");
    drawCaption("Table 3. Critical Control Points");
    drawTable(
      ["CCP No.", "Step Name", "Hazard", "Critical Limit", "Monitoring", "Corrective Action"],
      data.ccps.map((ccp) => [
        String(ccp.ccpNo),
        ccp.stepName,
        ccp.hazard,
        ccp.criticalLimit,
        ccp.monitoring,
        ccp.correctiveAction,
      ]),
    );
  }

  const pages = pdf.getPages();
  pages.forEach((currentPage, index) => {
    currentPage.drawText(`Page ${index + 1}`, {
      x: PAGE_WIDTH - MARGIN - 40,
      y: 18,
      size: 10,
      font: regular,
      color: MUTED,
    });
  });

  return pdf.save();
}
