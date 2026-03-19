import type { TrainingLogRow, TrainingQualificationRow, TrainingRecordData } from "./training-record-schema";

export const DEFAULT_INDUCTION_TOPICS = [
  "Personal hygiene and handwashing",
  "Protective clothing requirements",
  "Illness reporting and exclusion",
  "Cross-contamination prevention",
  "Temperature control",
  "Allergen awareness",
  "Cleaning and sanitation",
  "Pest awareness",
  "Emergency procedures",
  "Site-specific hazards and controls",
];

function blankQualificationRows(count: number): string[][] {
  return Array.from({ length: count }, () => ["", "", "", "", "", ""]);
}

function blankTrainingLogRows(count: number): string[][] {
  return Array.from({ length: count }, () => ["", "", "", "", "", ""]);
}

export function getTrainingInductionCompletedLabel(data: TrainingRecordData): string {
  return data.inductionCompleted ? "Yes" : "No";
}

export function getTrainingInductionTopics(data: TrainingRecordData): string[] {
  return data.inductionTopics.length > 0 ? data.inductionTopics : DEFAULT_INDUCTION_TOPICS;
}

export function getTrainingQualificationRows(data: TrainingRecordData): string[][] {
  if (data.qualifications.length === 0) {
    return blankQualificationRows(4);
  }

  return data.qualifications.map((row: TrainingQualificationRow) => [
    row.qualification,
    row.level,
    row.provider,
    row.dateAchieved,
    row.certificateNumber,
    row.expiryDate,
  ]);
}

export function getTrainingLogRows(data: TrainingRecordData): string[][] {
  if (data.trainingLogRows.length === 0) {
    return blankTrainingLogRows(8);
  }

  return data.trainingLogRows.map((row: TrainingLogRow) => [
    row.date,
    row.topic,
    row.trainer,
    row.duration,
    row.assessment,
    row.signature,
  ]);
}
