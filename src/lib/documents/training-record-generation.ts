import type { TrainingLogRow, TrainingQualificationRow, TrainingRecordData } from "./training-record-schema";

type TrainingRecordBuilderData = {
  businessName?: string;
  approvedBy?: string;
  employeeName?: string;
  jobRole?: string;
  department?: string;
  startDate?: string;
  inductionCompleted?: string;
  inductionDate?: string;
  trainerName?: string;
  inductionTopics?: string[];
  inductionAssessment?: string;
  qualifications?: TrainingQualificationRow[];
  trainingLogRows?: TrainingLogRow[];
};

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
    inductionCompleted: false,
    inductionDate: "",
    trainerName: "",
    inductionTopics: [],
    inductionAssessment: "",
    qualifications: [],
    trainingLogRows: [],
  };
}

export function buildTrainingRecordDataFromBuilder(
  builder: TrainingRecordBuilderData,
): TrainingRecordData {
  return {
    metadata: {
      businessName: builder.businessName?.trim() ?? "",
      docNo: "TR-REC-001",
      version: "1",
      date: todayIso(),
      approvedBy: builder.approvedBy?.trim() ?? "",
    },
    employeeName: builder.employeeName?.trim() ?? "",
    jobRole: builder.jobRole?.trim() ?? "",
    department: builder.department?.trim() ?? "",
    startDate: builder.startDate?.trim() ?? "",
    inductionCompleted: builder.inductionCompleted === "Yes",
    inductionDate: builder.inductionDate?.trim() ?? "",
    trainerName: builder.trainerName?.trim() ?? "",
    inductionTopics: builder.inductionTopics ?? [],
    inductionAssessment: builder.inductionAssessment?.trim() ?? "",
    qualifications: builder.qualifications ?? [],
    trainingLogRows: builder.trainingLogRows ?? [],
  };
}

export function buildTrainingRecordModelPrompt(data: TrainingRecordData): string {
  return [
    "Create a Staff Training Record document from the structured data below.",
    "Preserve the employee metadata, induction details, qualification rows, and training log rows exactly where supplied.",
    "Only draft the surrounding professional structure and operational wording.",
    JSON.stringify(data),
  ].join("\n\n");
}
