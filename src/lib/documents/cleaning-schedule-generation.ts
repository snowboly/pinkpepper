import type { CleaningScheduleData } from "@/lib/documents/cleaning-schedule-schema";
import {
  DEFAULT_ATP_TARGETS,
  DEFAULT_CHEMICAL_REFERENCE,
  DEFAULT_DAILY_TASKS,
  DEFAULT_MONTHLY_TASKS,
  DEFAULT_WEEKLY_TASKS,
} from "@/lib/documents/cleaning-schedule-schema";

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function buildCleaningScheduleDataFromAnswers(answers: string[]): CleaningScheduleData {
  const premises = answers[0]?.trim() ?? "";

  return {
    metadata: {
      premises,
      docNo: "CL-001",
      revision: "1",
      date: todayIso(),
      approvedBy: "",
      reviewDate: "",
    },
    chemicalReference: DEFAULT_CHEMICAL_REFERENCE,
    dailyTasks: DEFAULT_DAILY_TASKS,
    weeklyTasks: DEFAULT_WEEKLY_TASKS,
    monthlyTasks: DEFAULT_MONTHLY_TASKS,
    atpTargets: DEFAULT_ATP_TARGETS,
  };
}

export function buildCleaningScheduleModelPrompt(data: CleaningScheduleData): string {
  return [
    "Create a complete Cleaning and Disinfection Schedule document.",
    "Include all required sections: cleaning method key, chemical reference, daily tasks, weekly tasks, monthly tasks, verification methods, ATP targets, and cleaning records.",
    "Reference Regulation (EC) 852/2004, Annex II.",
    "Keep the schedule operational, audit-ready, and specific to the premises.",
    JSON.stringify(data),
  ].join("\n\n");
}
