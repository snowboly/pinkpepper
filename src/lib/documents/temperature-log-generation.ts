import {
  type TemperatureLogData,
  DEFAULT_TARGET_RANGE,
  DEFAULT_CHECKS_PER_DAY,
  DEFAULT_PROBE_COUNT,
  todayIso,
  currentMonth,
  currentYear,
} from "./temperature-log-schema";

type TemperatureLogBuilderData = {
  businessName?: string;
  createdBy?: string;
  approvedBy?: string;
  logType?: string;
  targetRange?: string;
  unitId?: string;
  checksPerDay?: string;
  probeCount?: string;
  probeLocation?: string;
  month?: string;
  year?: string;
};

function parseBoundedNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), 4);
}

function resolveTemperatureTargetRange(builder: TemperatureLogBuilderData): string {
  if (builder.logType === "Fridge") {
    return "0C to 4C";
  }

  return builder.targetRange?.trim() || DEFAULT_TARGET_RANGE;
}

export function buildTemperatureLogDataFromAnswers(answers: string[]): TemperatureLogData {
  const premises = answers[0]?.trim() ?? "";
  return {
    metadata: {
      premises,
      docNo: "TL-001",
      revision: "1",
      issueDate: todayIso(),
      month: currentMonth(),
      year: currentYear(),
      unitId: "",
      probeLocation: "",
      targetRange: DEFAULT_TARGET_RANGE,
      createdBy: "",
      approvedBy: "",
      checksPerDay: DEFAULT_CHECKS_PER_DAY,
      probeCount: DEFAULT_PROBE_COUNT,
    },
  };
}

export function buildTemperatureLogDataFromBuilder(builder: TemperatureLogBuilderData): TemperatureLogData {
  return {
    metadata: {
      premises: builder.businessName?.trim() ?? "",
      docNo: "TL-001",
      revision: "1",
      issueDate: todayIso(),
      month: builder.month?.trim() || currentMonth(),
      year: builder.year?.trim() || currentYear(),
      unitId: builder.unitId?.trim() ?? "",
      probeLocation: builder.probeLocation?.trim() ?? "",
      targetRange: resolveTemperatureTargetRange(builder),
      createdBy: builder.createdBy?.trim() ?? "",
      approvedBy: builder.approvedBy?.trim() ?? "",
      checksPerDay: parseBoundedNumber(builder.checksPerDay, DEFAULT_CHECKS_PER_DAY),
      probeCount: parseBoundedNumber(builder.probeCount, DEFAULT_PROBE_COUNT),
    },
  };
}

export function buildTemperatureLogModelPrompt(data: TemperatureLogData): string {
  return `Generate a JSON object for a Temperature Monitoring Log document for the premises "${data.metadata.premises}".
Document number: ${data.metadata.docNo}. Month: ${data.metadata.month} ${data.metadata.year}.
The document is a blank monitoring form - provide only the standard sections (purpose, corrective action guidance, responsibilities, record retention).
Return a GeneratedDocument JSON with title, documentNumber, version, date, approvedBy, scope, and sections.`;
}
