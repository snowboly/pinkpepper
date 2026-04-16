type ResetTimeFormatOptions = {
  locale?: string;
  timeZone?: string;
};

export function getNextUtcMidnight(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

export function formatDailyResetLabel(
  now = new Date(),
  options: ResetTimeFormatOptions = {}
) {
  try {
    const nextReset = getNextUtcMidnight(now);
    const formattedTime = new Intl.DateTimeFormat(options.locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      ...(options.timeZone ? { timeZone: options.timeZone } : {}),
    }).format(nextReset);

    return `Resets daily at ${formattedTime} your time`;
  } catch {
    return "Resets daily";
  }
}
