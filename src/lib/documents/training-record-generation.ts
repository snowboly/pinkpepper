import type { TrainingRecordData } from "./training-record-schema";

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function buildTrainingRecordDataFromAnswers(answers: string[]): TrainingRecordData {
  const businessName = answers[0]?.split(/[,\n]/)[0]?.trim() ?? "";
  const staffInfo = answers[1]?.trim() ?? "";
  const jobRole = staffInfo.split(/[,\n]/)[0]?.trim() ?? "";

  return {
    metadata: {
      businessName,
      docNo: "TR-REC-001",
      version: "1",
      date: todayIso(),
      approvedBy: "",
    },
    employeeName: "",
    jobRole,
    department: "",
    startDate: "",
  };
}
