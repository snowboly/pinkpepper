import type { DocumentType } from "@/lib/documents/types";
import type { SopDocumentData } from "@/lib/documents/sop-schema";
import { getDefaultDocNo } from "@/lib/documents/sop-schema";

type SopBuilderData = {
  businessName?: string;
  approvedBy?: string;
  operationType?: string;
  siteScope?: string;
  productCategories?: string;
  supplierInputs?: string;
  identificationSystem?: string;
  incomingRecords?: string;
  internalTraceability?: string;
  outgoingRecords?: string;
  premisesAndSurroundings?: string;
  pestRisks?: string;
  externalContractor?: string;
  monitoringMethods?: string;
  internalChecks?: string;
  escalationFlow?: string;
  preventionControls?: string;
  wasteStreams?: string;
  segregationMethod?: string;
  handlingOwner?: string;
  cleaningVerification?: string;
  contractors?: string;
  legalRequirements?: string;
  usedOilHandling?: string;
  animalByProducts?: string;
  correctiveAction?: string;
  foodSafetyLead?: string;
  dayToDayOwner?: string;
  coreCommitments?: string;
  reviewFrequency?: string;
  standards?: string;
  managementStatement?: string;
  traceabilityOwner?: string;
  recallLead?: string;
  recallContacts?: string;
  retentionPeriod?: string;
  mockRecallFrequency?: string;
};

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function buildSopDataFromAnswers(
  documentType: DocumentType,
  answers: string[],
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

export function buildSopDataFromBuilder(
  documentType: DocumentType,
  builder: SopBuilderData,
): SopDocumentData {
  return {
    metadata: {
      businessName: builder.businessName?.trim() ?? "",
      docNo: getDefaultDocNo(documentType),
      revision: "1",
      date: todayIso(),
      approvedBy: builder.approvedBy?.trim() ?? "",
    },
    documentType,
  };
}

export function buildSopModelPrompt(
  documentType: DocumentType,
  data: SopDocumentData,
  builder: SopBuilderData,
): string {
  if (documentType === "traceability_procedure") {
    return [
      "Create a complete Traceability Procedure from the structured business inputs below.",
      "Use the provided traceability record flow, recall ownership, and retention details as the factual basis of the document.",
      `Business: ${data.metadata.businessName}`,
      `Operation type: ${builder.operationType ?? ""}`,
      `Products or categories covered: ${builder.productCategories ?? ""}`,
      `Supplier inputs to trace: ${builder.supplierInputs ?? ""}`,
      `Identification system: ${builder.identificationSystem ?? ""}`,
      `Incoming records: ${builder.incomingRecords ?? ""}`,
      `Internal traceability: ${builder.internalTraceability ?? ""}`,
      `Outgoing records: ${builder.outgoingRecords ?? ""}`,
      `Traceability owner: ${builder.traceabilityOwner ?? ""}`,
      `Recall lead: ${builder.recallLead ?? ""}`,
      `Recall contacts: ${builder.recallContacts ?? ""}`,
      `Retention period: ${builder.retentionPeriod ?? ""}`,
      `Mock recall frequency: ${builder.mockRecallFrequency ?? ""}`,
    ].join("\n");
  }

  return [
    `Create a complete ${documentType.replace(/_/g, " ")} document from the structured business inputs below.`,
    JSON.stringify({
      metadata: data.metadata,
      builder,
    }),
  ].join("\n\n");
}
