import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { TemperatureLogData } from "./temperature-log-schema";

const PAGE_WIDTH = 842;   // A4 landscape (pts)
const PAGE_HEIGHT = 595;
const MARGIN_X = 30;
const MARGIN_Y = 28;
const CONTENT_W = PAGE_WIDTH - MARGIN_X * 2;

const LIGHT_BLUE = rgb(0.863, 0.933, 1);     // #DCEEFF
const DAY_SHADE  = rgb(0.945, 0.957, 0.976); // #F1F5F9
const BORDER     = rgb(0.796, 0.835, 0.882); // #CBD5E1
const TEXT       = rgb(0.059, 0.09, 0.118);
const MUTED      = rgb(0.278, 0.341, 0.404);

const ROW_H  = 14;  // data row height (pts)
const HEAD_H = 15;  // header row height (pts)
const DOC_HEADER_H = 26; // space reserved for document header at top
const DOC_FOOTER_H = 14; // space reserved for footer at bottom

const DAYS_IN_MONTH = 31;

export async function renderTemperatureLogPdf(data: TemperatureLogData): Promise<Uint8Array> {
  const { metadata: m } = data;
  const checksPerDay = Math.min(Math.max(m.checksPerDay ?? 2, 1), 4);
  const probeCount   = Math.min(Math.max(m.probeCount   ?? 2, 1), 4);

  const pdf     = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold    = await pdf.embedFont(StandardFonts.HelveticaBold);

  // ── Column widths (pts) ────────────────────────────────────────────────────
  const DAY_W      = 22;
  const TIME_W     = 48;
  const PROBE_W    = 44;
  const INITIALS_W = 38;
  const checkBlockW = TIME_W + probeCount * PROBE_W;
  const ACTION_W = Math.max(
    48,
    CONTENT_W - DAY_W - checksPerDay * checkBlockW - INITIALS_W,
  );

  // x-position of each column
  const colXs: number[] = [];
  {
    let x = MARGIN_X;
    colXs.push(x); x += DAY_W;
    for (let c = 0; c < checksPerDay; c++) {
      colXs.push(x); x += TIME_W;
      for (let p = 0; p < probeCount; p++) { colXs.push(x); x += PROBE_W; }
    }
    colXs.push(x); x += ACTION_W;
    colXs.push(x);           // initials start
  }
  const totalCols = colXs.length;

  // ── Page state ─────────────────────────────────────────────────────────────
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN_Y;
  let pageNum = 1;

  function txt(value: string, x: number, yPos: number, size: number, f = regular, color = TEXT, maxW?: number) {
    if (!value) return;
    page.drawText(value, { x: x + 2, y: yPos, size, font: f, color, ...(maxW ? { maxWidth: maxW - 4 } : {}) });
  }

  function drawDocHeader() {
    txt("TEMPERATURE MONITORING LOG", MARGIN_X, PAGE_HEIGHT - 14, 10, bold, TEXT);
    txt(`${m.docNo}  |  Rev. ${m.revision}  |  ${m.issueDate}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 14, 8, regular, MUTED);
  }

  function drawDocFooter() {
    txt(`Page ${pageNum}  |  ${m.docNo}`, MARGIN_X, 8, 7, regular, MUTED);
  }

  function drawRow(yTop: number, h: number, shade?: typeof LIGHT_BLUE) {
    if (shade) {
      page.drawRectangle({ x: MARGIN_X, y: yTop - h, width: CONTENT_W, height: h, color: shade, borderColor: BORDER, borderWidth: 0.4 });
    } else {
      page.drawRectangle({ x: MARGIN_X, y: yTop - h, width: CONTENT_W, height: h, borderColor: BORDER, borderWidth: 0.4 });
    }
    for (let i = 1; i < totalCols; i++) {
      page.drawLine({ start: { x: colXs[i], y: yTop }, end: { x: colXs[i], y: yTop - h }, thickness: 0.4, color: BORDER });
    }
  }

  /** Draw two-row table header, advance y. */
  function drawTableHeaders() {
    // Row 1: Day | Check N span | Corrective Action | Initials
    drawRow(y, HEAD_H, LIGHT_BLUE);
    txt("Day", colXs[0], y - HEAD_H + 5, 7, bold);
    let xi = 1;
    for (let c = 0; c < checksPerDay; c++) {
      const label = checksPerDay === 1 ? "Check" : `Check ${c + 1}`;
      txt(label, colXs[xi], y - HEAD_H + 5, 7, bold, TEXT, checkBlockW);
      xi += 1 + probeCount;
    }
    txt("Corrective Action", colXs[xi], y - HEAD_H + 5, 7, bold, TEXT, ACTION_W);
    xi++;
    txt("Initials", colXs[xi], y - HEAD_H + 5, 7, bold, TEXT, INITIALS_W);
    y -= HEAD_H;

    // Row 2: Time | Probe N per check
    drawRow(y, HEAD_H, LIGHT_BLUE);
    xi = 1;
    for (let c = 0; c < checksPerDay; c++) {
      txt("Time", colXs[xi], y - HEAD_H + 5, 6, bold, TEXT, TIME_W);
      xi++;
      for (let p = 0; p < probeCount; p++) {
        const label = probeCount === 1 ? "Temp (°C)" : `Probe ${p + 1} (°C)`;
        txt(label, colXs[xi], y - HEAD_H + 5, 6, bold, TEXT, PROBE_W);
        xi++;
      }
    }
    y -= HEAD_H;
  }

  /** If not enough vertical space, flush current page and open a new one with header + table headers. */
  function ensureRowSpace() {
    if (y - ROW_H < MARGIN_Y + DOC_FOOTER_H) {
      drawDocFooter();
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNum++;
      y = PAGE_HEIGHT - MARGIN_Y;
      drawDocHeader();
      y -= DOC_HEADER_H;
      drawTableHeaders();
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  drawDocHeader();
  y -= DOC_HEADER_H;

  // Metadata bar
  txt(`Premises: ${m.premises || "___________________________"}`, MARGIN_X, y, 8, bold);
  txt(`Month: ${m.month}   Year: ${m.year}`, MARGIN_X + 260, y, 8, regular);
  txt("Unit / Chamber No.: _________", MARGIN_X + 500, y, 8, regular);
  y -= 11;
  txt(`Target: ${m.targetRange}`, MARGIN_X, y, 7, regular, MUTED);
  y -= 10;

  drawTableHeaders();

  // 31 data rows
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    ensureRowSpace();
    drawRow(y, ROW_H);
    // shaded day number cell
    page.drawRectangle({ x: MARGIN_X, y: y - ROW_H, width: DAY_W, height: ROW_H, color: DAY_SHADE });
    txt(String(d), colXs[0], y - ROW_H + 4, 7, bold);
    y -= ROW_H;
  }

  // Footer notes
  y -= 8;
  if (y - 20 < MARGIN_Y + DOC_FOOTER_H) {
    drawDocFooter();
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum++;
    y = PAGE_HEIGHT - MARGIN_Y;
    drawDocHeader();
    y -= DOC_HEADER_H;
  }
  txt("(*) Probe location: ___________________________", MARGIN_X, y, 7, regular, MUTED);
  y -= 12;
  txt("Cold chain supervisor: ___________________________   Date: ___________", MARGIN_X, y, 7, regular);
  txt("HACCP responsible: ___________________________   Date: ___________", MARGIN_X + 390, y, 7, regular);
  drawDocFooter();

  return pdf.save();
}
