import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { CleaningScheduleData } from "./cleaning-schedule-schema";

const PAGE_WIDTH = 842;   // A4 landscape
const PAGE_HEIGHT = 595;
const MARGIN = 30;
const LIGHT_BLUE = rgb(0.863, 0.933, 1);
const BORDER = rgb(0.796, 0.835, 0.882);
const TEXT = rgb(0.059, 0.09, 0.118);
const MUTED = rgb(0.278, 0.341, 0.404);
const CONTENT_W = PAGE_WIDTH - MARGIN * 2;

export async function renderCleaningSchedulePdf(data: CleaningScheduleData): Promise<Uint8Array> {
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
      `${data.metadata.premises || "Premises"} — Cleaning and Disinfection Schedule | ${data.metadata.docNo} | ${data.metadata.date}`,
      { x: MARGIN, y: PAGE_HEIGHT - 16, size: 8, font: bold, color: TEXT }
    );
    page.drawText(
      `Approved by: ${data.metadata.approvedBy || "_______________"}`,
      { x: MARGIN, y: 12, size: 8, font: regular, color: MUTED }
    );
  }

  function drawLine(value: string, size = 9, font = regular, color = TEXT, xOffset = 0) {
    const x = MARGIN + xOffset;
    const maxW = CONTENT_W - xOffset;
    const words = value.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        ensureSpace(size + 4);
        page.drawText(line, { x, y, size, font, color });
        y -= size + 4;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ensureSpace(size + 4);
      page.drawText(line, { x, y, size, font, color });
      y -= size + 4;
    }
  }

  function drawSectionTitle(title: string) {
    ensureSpace(20);
    y -= 6;
    page.drawText(title, { x: MARGIN, y, size: 12, font: bold, color: TEXT });
    y -= 16;
  }

  function drawCaption(value: string) {
    ensureSpace(12);
    page.drawText(value, { x: MARGIN, y, size: 8, font: regular, color: MUTED });
    y -= 12;
  }

  function drawTable(headers: string[], rows: string[][], colWidths?: number[]) {
    const rowH = 16;
    const widths = colWidths ?? headers.map(() => CONTENT_W / headers.length);

    ensureSpace(rowH + 2);
    let xPos = MARGIN;
    page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, color: LIGHT_BLUE, borderColor: BORDER, borderWidth: 0.5 });
    headers.forEach((h, i) => {
      page.drawText(h, { x: xPos + 2, y: y - 11, size: 8, font: bold, color: TEXT, maxWidth: widths[i] - 4 });
      xPos += widths[i];
    });
    y -= rowH;

    rows.forEach((row) => {
      ensureSpace(rowH);
      xPos = MARGIN;
      page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, borderColor: BORDER, borderWidth: 0.5 });
      row.forEach((value, i) => {
        const display = value.length > 40 ? `${value.slice(0, 37)}…` : value;
        page.drawText(display, { x: xPos + 2, y: y - 11, size: 7, font: regular, color: TEXT, maxWidth: widths[i] - 4 });
        xPos += widths[i];
      });
      y -= rowH;
    });
    y -= 6;
  }

  drawFrame();
  y -= 20;

  // Metadata block
  page.drawText(`Premises: ${data.metadata.premises || "_______________"}   Doc No.: ${data.metadata.docNo}   Rev: ${data.metadata.revision}   Date: ${data.metadata.date}`, { x: MARGIN, y, size: 8, font: regular, color: MUTED });
  y -= 14;

  // Method Key
  drawSectionTitle("Cleaning Method Key");
  drawTable(
    ["Code", "Method"],
    [
      ["M1", "Manual wash: hot water (≥60°C) + detergent; rinse; apply disinfectant; contact time; rinse if required"],
      ["M2", "Foam application: detergent dwell time; rinse; apply disinfectant; contact time; rinse if required"],
      ["M3", "Dishwasher: minimum 60°C wash cycle"],
      ["M4", "CIP (Clean in Place): automated detergent + rinse + disinfectant cycle"],
      ["M5", "Dry clean only: brush off debris; wipe with damp sanitiser-impregnated cloth"],
      ["M6", "External surfaces: damp wipe with all-purpose cleaner or disinfectant"],
    ],
    [40, CONTENT_W - 40]
  );

  // Chemical Reference
  drawSectionTitle("Cleaning Chemical Reference");
  drawCaption("Table 1. Approved Cleaning Chemicals");
  drawTable(
    ["Chemical Name", "Product", "Dilution", "Contact Time", "Active Ingredient", "COSHH Sheet"],
    data.chemicalReference.map((r) => [r.chemicalName, r.product, r.dilution, r.contactTime, r.activeIngredient, r.coshhLocation]),
    [110, 90, 60, 65, 110, CONTENT_W - 435]
  );

  // Daily Tasks
  drawSectionTitle("Daily Cleaning Tasks");
  drawCaption("Table 2. Daily Cleaning Schedule — Item | Method | Chemical | Dilution | Contact Time | Frequency | Responsible | Verification");
  drawTable(
    ["Item", "Method", "Chemical", "Dilution", "Contact Time", "Frequency", "Responsible", "Verification"],
    data.dailyTasks.map((r) => [r.item, r.method, r.chemical, r.dilution, r.contactTime, r.frequency, r.responsible, r.verification]),
    [130, 30, 80, 50, 55, 90, 90, CONTENT_W - 525]
  );

  // Weekly Tasks
  drawSectionTitle("Weekly Cleaning Tasks");
  drawCaption("Table 3. Weekly Cleaning Schedule — Item | Method | Chemical | Dilution | Contact Time | Responsible | Verification");
  drawTable(
    ["Item", "Method", "Chemical", "Dilution", "Contact Time", "Responsible", "Verification"],
    data.weeklyTasks.map((r) => [r.item, r.method, r.chemical, r.dilution, r.contactTime, r.responsible, r.verification]),
    [160, 35, 95, 55, 65, 110, CONTENT_W - 520]
  );

  // Monthly Tasks
  drawSectionTitle("Monthly Cleaning Tasks");
  drawCaption("Table 4. Monthly Cleaning Schedule — Item | Method | Chemical | Responsible | Verification");
  drawTable(
    ["Item", "Method", "Chemical", "Responsible", "Verification"],
    data.monthlyTasks.map((r) => [r.item, r.method, r.chemical, r.responsible, r.verification]),
    [200, 40, 110, 160, CONTENT_W - 510]
  );

  // ATP Targets
  drawSectionTitle("Verification — ATP Cleaning Pass/Fail Targets");
  drawCaption("Table 5. ATP Bioluminescence Targets");
  const atpW = CONTENT_W / 4;
  drawTable(
    ["Surface Category", "Pass", "Borderline", "Fail"],
    data.atpTargets.map((r) => [r.surfaceCategory, r.pass, r.borderline, r.fail]),
    [200, atpW - 50, atpW - 50, CONTENT_W - 200 - (atpW - 50) * 2]
  );

  // Records Log
  drawSectionTitle("Cleaning Records Log");
  drawCaption("Table 6. Daily Cleaning Log — Date | Task | Time Completed | Operative | Supervisor Check | Issues / Corrective Action");
  drawTable(
    ["Date", "Task", "Time Completed", "Operative (initials)", "Supervisor Check", "Issues / Corrective Action"],
    Array.from({ length: 8 }, () => ["", "", "", "", "", ""]),
    [55, 150, 80, 90, 85, CONTENT_W - 460]
  );

  // Footer page numbers
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1}`, { x: PAGE_WIDTH - MARGIN - 30, y: 12, size: 7, font: regular, color: MUTED });
  });

  return pdf.save();
}
