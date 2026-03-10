export type DocumentExtractionResult = {
  text: string;
  strategy: "plain-text" | "pdf" | "docx" | "unsupported";
  warning?: string;
};

const UTF8_TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
]);

const PDF_MIME_TYPE = "application/pdf";
const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function normalizeWhitespace(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractDocumentText(file: File): Promise<DocumentExtractionResult> {
  const mimeType = file.type.toLowerCase();

  if (UTF8_TEXT_MIME_TYPES.has(mimeType)) {
    const raw = await file.text();
    return { text: normalizeWhitespace(raw), strategy: "plain-text" };
  }

  if (mimeType === PDF_MIME_TYPE) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Dynamic import avoids bundler issues with pdf-parse test fixtures
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
        buf: Buffer
      ) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      return { text: normalizeWhitespace(result.text), strategy: "pdf" };
    } catch (e) {
      console.error("PDF extraction failed:", e);
      return { text: "", strategy: "unsupported", warning: "Failed to extract text from PDF." };
    }
  }

  if (mimeType === DOCX_MIME_TYPE) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { text: normalizeWhitespace(result.value), strategy: "docx" };
    } catch (e) {
      console.error("DOCX extraction failed:", e);
      return { text: "", strategy: "unsupported", warning: "Failed to extract text from DOCX." };
    }
  }

  return {
    text: "",
    strategy: "unsupported",
    warning: `Unsupported file type: ${file.type || "unknown"}.`,
  };
}
