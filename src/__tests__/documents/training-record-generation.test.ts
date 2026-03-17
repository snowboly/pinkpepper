import { describe, expect, it } from "vitest";

import { buildTrainingRecordDataFromBuilder } from "@/lib/documents/training-record-generation";

describe("buildTrainingRecordDataFromBuilder", () => {
  it("maps the approved structured employee and induction fields", () => {
    const data = buildTrainingRecordDataFromBuilder({
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
      employeeName: "Ana Costa",
      jobRole: "Chef de Partie",
      department: "Kitchen",
      startDate: "2026-03-01",
      inductionCompleted: "Yes",
      inductionDate: "2026-03-02",
      trainerName: "Joao Silva",
      inductionTopics: [
        "personal hygiene",
        "temperature control",
        "allergen awareness",
      ],
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
    });

    expect(data.metadata.businessName).toBe("PinkPepper Foods");
    expect(data.metadata.approvedBy).toBe("Operations Manager");
    expect(data.employeeName).toBe("Ana Costa");
    expect(data.jobRole).toBe("Chef de Partie");
    expect(data.department).toBe("Kitchen");
    expect(data.startDate).toBe("2026-03-01");
    expect(data.inductionCompleted).toBe(true);
    expect(data.inductionDate).toBe("2026-03-02");
    expect(data.trainerName).toBe("Joao Silva");
    expect(data.inductionTopics).toEqual([
      "personal hygiene",
      "temperature control",
      "allergen awareness",
    ]);
    expect(data.inductionAssessment).toBe("Competent");
    expect(data.qualifications).toHaveLength(1);
    expect(data.trainingLogRows).toHaveLength(1);
  });

  it("keeps optional qualifications and training rows empty when omitted", () => {
    const data = buildTrainingRecordDataFromBuilder({
      businessName: "PinkPepper Foods",
      approvedBy: "Operations Manager",
      employeeName: "Ana Costa",
      jobRole: "Chef de Partie",
      department: "Kitchen",
      startDate: "2026-03-01",
      inductionCompleted: "No",
      inductionDate: "",
      trainerName: "",
      inductionTopics: [],
      inductionAssessment: "Further training required",
      qualifications: [],
      trainingLogRows: [],
    });

    expect(data.inductionCompleted).toBe(false);
    expect(data.qualifications).toEqual([]);
    expect(data.trainingLogRows).toEqual([]);
  });
});
