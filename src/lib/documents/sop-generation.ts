import type { DocumentType } from "@/lib/documents/types";
import type { SopDocumentData } from "@/lib/documents/sop-schema";
import { getDefaultDocNo } from "@/lib/documents/sop-schema";

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Builds the SOP metadata from wizard answers.
 * The first wizard question for all SOP types asks for the business name and type,
 * so answers[0] is used to extract the business name.
 */
export function buildSopDataFromAnswers(
  documentType: DocumentType,
  answers: string[]
): SopDocumentData {
  const businessName = answers[0]?.split(/[,\n]/)[0]?.trim() ?? "";

  return {
    metadata: {
      businessName,
      docNo: getDefaultDocNo(documentType),
      revision: "1",
      date: todayIso(),
      approvedBy: "",
    },
    documentType,
  };
}
