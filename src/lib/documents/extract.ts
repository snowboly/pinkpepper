export type DocumentExtractionResult = {
  text: string;
  strategy: "plain-text" | "unsupported";
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
    return {
      text: normalizeWhitespace(raw),
      strategy: "plain-text",
    };
  }

  if (mimeType === PDF_MIME_TYPE || mimeType === DOCX_MIME_TYPE) {
    return {
      text: "",
      strategy: "unsupported",
      warning:
        "This file type is accepted but text extraction is temporarily disabled in server builds to avoid browser-only runtime dependencies.",
    };
  }

  return {
    text: "",
    strategy: "unsupported",
    warning: `Unsupported file type: ${file.type || "unknown"}.`,
  };
}
