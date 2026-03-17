import type {
  AtpTargetRow,
  CleaningChemicalRef,
  CleaningScheduleData,
  DailyCleaningRow,
  MonthlyCleaningRow,
  WeeklyCleaningRow,
} from "@/lib/documents/cleaning-schedule-schema";
import {
  DEFAULT_ATP_TARGETS,
  DEFAULT_CHEMICAL_REFERENCE,
  DEFAULT_DAILY_TASKS,
  DEFAULT_MONTHLY_TASKS,
  DEFAULT_WEEKLY_TASKS,
} from "@/lib/documents/cleaning-schedule-schema";

type CleaningScheduleBuilderData = {
  businessName?: string;
  approvedBy?: string;
  reviewDate?: string;
  chemicalReference?: CleaningChemicalRef[];
  dailyTasks?: DailyCleaningRow[];
  weeklyTasks?: WeeklyCleaningRow[];
  monthlyTasks?: MonthlyCleaningRow[];
  atpTargets?: AtpTargetRow[];
};

function todayIso(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function fallbackRows<T>(rows: T[] | undefined, defaults: T[]): T[] {
  return rows && rows.length > 0 ? rows : defaults;
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

export function buildCleaningScheduleDataFromBuilder(
  builder: CleaningScheduleBuilderData,
): CleaningScheduleData {
  return {
    metadata: {
      premises: builder.businessName?.trim() ?? "",
      docNo: "CL-001",
      revision: "1",
      date: todayIso(),
      approvedBy: builder.approvedBy?.trim() ?? "",
      reviewDate: builder.reviewDate?.trim() ?? "",
    },
    chemicalReference: fallbackRows(builder.chemicalReference, DEFAULT_CHEMICAL_REFERENCE),
    dailyTasks: fallbackRows(builder.dailyTasks, DEFAULT_DAILY_TASKS),
    weeklyTasks: fallbackRows(builder.weeklyTasks, DEFAULT_WEEKLY_TASKS),
    monthlyTasks: fallbackRows(builder.monthlyTasks, DEFAULT_MONTHLY_TASKS),
    atpTargets: fallbackRows(builder.atpTargets, DEFAULT_ATP_TARGETS),
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
