declare module "pdf-parse" {
  export default function pdfParse(
    dataBuffer: Buffer
  ): Promise<{
    text: string;
    numpages?: number;
    info?: Record<string, unknown>;
    metadata?: unknown;
    version?: string;
  }>;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  export { default } from "pdf-parse";
}
