import {
  type TemperatureLogData,
  DEFAULT_TARGET_RANGE,
  DEFAULT_CHECKS_PER_DAY,
  DEFAULT_PROBE_COUNT,
  todayIso,
  currentMonth,
  currentYear,
} from "./temperature-log-schema";

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
      checksPerDay: DEFAULT_CHECKS_PER_DAY,
      probeCount: DEFAULT_PROBE_COUNT,
    },
  };
}

export function buildTemperatureLogModelPrompt(data: TemperatureLogData): string {
  return `Generate a JSON object for a Temperature Monitoring Log document for the premises "${data.metadata.premises}".
Document number: ${data.metadata.docNo}. Month: ${data.metadata.month} ${data.metadata.year}.
The document is a blank monitoring form — provide only the standard sections (purpose, corrective action guidance, responsibilities, record retention).
Return a GeneratedDocument JSON with title, documentNumber, version, date, approvedBy, scope, and sections.`;
}
