import { describe, expect, it } from "vitest";

import {
  getTrainingInductionCompletedLabel,
  getTrainingInductionTopics,
  getTrainingLogRows,
  getTrainingQualificationRows,
} from "@/lib/documents/training-record-render-helpers";
import type { TrainingRecordData } from "@/lib/documents/training-record-schema";

const sample: TrainingRecordData = {
  metadata: {
    businessName: "PinkPepper Foods",
    docNo: "TR-REC-001",
    version: "1",
    date: "19 March 2026",
    approvedBy: "Operations Manager",
  },
  employeeName: "Ana Costa",
  jobRole: "Chef",
  department: "Kitchen",
  startDate: "2026-03-01",
  inductionCompleted: true,
  inductionDate: "2026-03-02",
  trainerName: "Joao Silva",
  inductionTopics: ["personal hygiene", "temperature control"],
  inductionAssessment: "Competent",
  qualifications: [
    {
      qualification: "Level 2 Food Safety",
      level: "2",
      provider: "Highfield",
      dateAchieved: "2025-01-10",
      certificateNumber: "HF-123",
      expiryDate: "2028-01-10",
    },
  ],
  trainingLogRows: [
    {
      date: "2026-03-05",
      topic: "Cold chain checks",
      trainer: "Maria Costa",
      duration: "30 min",
      assessment: "Competent",
      signature: "AC",
    },
  ],
};

describe("training record render helpers", () => {
  it("uses structured induction, qualification, and training log data when provided", () => {
    expect(getTrainingInductionCompletedLabel(sample)).toBe("Yes");
    expect(getTrainingInductionTopics(sample)).toEqual([
      "personal hygiene",
      "temperature control",
    ]);
    expect(getTrainingQualificationRows(sample)).toEqual([
      ["Level 2 Food Safety", "2", "Highfield", "2025-01-10", "HF-123", "2028-01-10"],
    ]);
    expect(getTrainingLogRows(sample)).toEqual([
      ["2026-03-05", "Cold chain checks", "Maria Costa", "30 min", "Competent", "AC"],
    ]);
  });

  it("falls back to blank qualification and training log rows when omitted", () => {
    const empty = {
      ...sample,
      inductionCompleted: false,
      inductionTopics: [],
      qualifications: [],
      trainingLogRows: [],
    };

    expect(getTrainingInductionCompletedLabel(empty)).toBe("No");
    expect(getTrainingInductionTopics(empty)).toHaveLength(10);
    expect(getTrainingQualificationRows(empty)).toHaveLength(4);
    expect(getTrainingLogRows(empty)).toHaveLength(8);
  });
});

