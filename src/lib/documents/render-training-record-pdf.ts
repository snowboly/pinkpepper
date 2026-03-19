import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { TrainingRecordData } from "./training-record-schema";
import {
  getTrainingInductionCompletedLabel,
  getTrainingInductionTopics,
  getTrainingLogRows,
  getTrainingQualificationRows,
} from "./training-record-render-helpers";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 45;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LIGHT_BLUE = rgb(0.863, 0.933, 1);
const BORDER = rgb(0.796, 0.835, 0.882);
const TEXT = rgb(0.059, 0.09, 0.118);
const MUTED = rgb(0.278, 0.341, 0.404);

export async function renderTrainingRecordPdf(data: TrainingRecordData): Promise<Uint8Array> {
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
      `${data.metadata.businessName} | Training Record | ${data.metadata.docNo} | ${data.metadata.date}`,
      { x: MARGIN, y: PAGE_H - 18, size: 8, font: bold, color: TEXT, maxWidth: CONTENT_W },
    );
    page.drawText(
      `Approved by: ${data.metadata.approvedBy || "_______________"}`,
      { x: MARGIN, y: 14, size: 8, font: regular, color: MUTED },
    );
  }

  function drawLabel(label: string, value = "_______________") {
    ensureSpace(16);
    page.drawText(`${label}:`, { x: MARGIN, y, size: 9, font: bold, color: MUTED });
    page.drawText(value, { x: MARGIN + 100, y, size: 9, font: regular, color: TEXT, maxWidth: CONTENT_W - 100 });
    y -= 14;
  }

  function drawSectionHeading(title: string) {
    ensureSpace(22);
    y -= 6;
    page.drawRectangle({ x: MARGIN - 4, y: y - 2, width: 4, height: 16, color: LIGHT_BLUE });
    page.drawText(title, { x: MARGIN + 4, y, size: 12, font: bold, color: TEXT });
    y -= 20;
  }

  function drawBullet(label: string) {
    ensureSpace(14);
    page.drawText(`- ${label}`, { x: MARGIN + 8, y, size: 9, font: regular, color: TEXT, maxWidth: CONTENT_W - 8 });
    y -= 13;
  }

  function drawTable(headers: string[], rows: string[][], colWidths?: number[]) {
    const rowH = 18;
    const widths = colWidths ?? headers.map(() => CONTENT_W / headers.length);

    ensureSpace(rowH + 2);
    let xPos = MARGIN;
    page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, color: LIGHT_BLUE, borderColor: BORDER, borderWidth: 0.5 });
    headers.forEach((h, i) => {
      page.drawText(h, { x: xPos + 3, y: y - 12, size: 8, font: bold, color: TEXT, maxWidth: widths[i] - 6 });
      xPos += widths[i];
    });
    y -= rowH;

    for (const row of rows) {
      ensureSpace(rowH);
      page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, borderColor: BORDER, borderWidth: 0.5 });
      xPos = MARGIN;
      row.forEach((value, i) => {
        page.drawText(value, { x: xPos + 3, y: y - 12, size: 8, font: regular, color: TEXT, maxWidth: widths[i] - 6 });
        xPos += widths[i];
      });
      y -= rowH;
    }
    y -= 8;
  }

  drawFrame();
  y -= 18;

  page.drawText("Individual Training Record", { x: MARGIN, y, size: 16, font: bold, color: TEXT });
  y -= 22;

  drawLabel("Employee Name", data.employeeName || "_______________");
  drawLabel("Job Role", data.jobRole || "_______________");
  drawLabel("Department", data.department || "_______________");
  drawLabel("Start Date", data.startDate || "_______________");
  y -= 4;
  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 1, color: BORDER });
  y -= 12;

  drawSectionHeading("Induction Training");
  drawLabel("Induction Completed", getTrainingInductionCompletedLabel(data));
  drawLabel("Date", data.inductionDate || "_______________");
  drawLabel("Trainer", data.trainerName || "_______________");
  y -= 4;
  page.drawText("Topics Covered:", { x: MARGIN, y, size: 9, font: bold, color: TEXT });
  y -= 14;

  for (const topic of getTrainingInductionTopics(data)) {
    drawBullet(topic);
  }

  y -= 4;
  drawLabel("Assessment", data.inductionAssessment || "_______________");
  drawLabel("Employee Signature");
  drawLabel("Trainer Signature");
  y -= 4;
  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 1, color: BORDER });
  y -= 12;

  drawSectionHeading("Formal Food Safety Qualifications");
  drawTable(["Qualification", "Level", "Provider", "Date Achieved", "Cert No.", "Expiry"], getTrainingQualificationRows(data));

  drawSectionHeading("On-the-Job Training Log");
  const trainColW = [50, 110, 80, 55, 80, 65].map((w) => (w / 440) * CONTENT_W);
  drawTable(["Date", "Task / Topic", "Trainer", "Duration", "Assessment", "Signature"], getTrainingLogRows(data), trainColW);

  drawSectionHeading("Annual Refresher Training");
  drawTable(["Date", "Topics Covered", "Duration", "Trainer", "Employee Signature"], Array.from({ length: 4 }, () => ["", "", "", "", ""]));

  drawSectionHeading("Competency Assessments");
  drawTable(["Date", "Task Assessed", "Assessor", "Outcome", "Comments"], Array.from({ length: 4 }, () => ["", "", "", "", ""]));

  ensureSpace(14);
  page.drawText("Record Retention: Duration of employment + 3 years", { x: MARGIN, y, size: 8, font: regular, color: MUTED });

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1}`, { x: PAGE_W - MARGIN - 30, y: 14, size: 8, font: regular, color: MUTED });
  });

  return pdf.save();
}
